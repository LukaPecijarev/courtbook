package com.example.backend.service.application.impl;

import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import com.anthropic.core.JsonValue;
import com.anthropic.errors.AnthropicException;
import com.anthropic.models.messages.ContentBlock;
import com.anthropic.models.messages.ContentBlockParam;
import com.anthropic.models.messages.Message;
import com.anthropic.models.messages.MessageCreateParams;
import com.anthropic.models.messages.MessageParam;
import com.anthropic.models.messages.OutputConfig;
import com.anthropic.models.messages.StopReason;
import com.anthropic.models.messages.TextBlock;
import com.anthropic.models.messages.Tool;
import com.anthropic.models.messages.ToolResultBlockParam;
import com.anthropic.models.messages.ToolUseBlock;
import com.example.backend.exception.AssistantExceptions.AssistantUnavailableException;
import com.fasterxml.jackson.core.type.TypeReference;
import jakarta.annotation.PreDestroy;
import java.time.Duration;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Answers one customer message with Claude, running the tool loop over the given {@link Tools}. */
@Slf4j
@Component
public class ClaudeAssistantClient {

    static final String MODEL = "claude-haiku-5-5";
    static final long MAX_TOKENS = 400;
    private static final int MAX_TOOL_ROUNDS = 4;
    private static final String FALLBACK_REPLY = "Извинете, не можам да одговорам во моментов. Обидете се повторно.";
    private static final String SYSTEM_PROMPT = """
            You are the courtbook assistant. courtbook lists sports courts in Skopje (tennis, basketball, \
            football, padel) that are booked in fixed 60-minute slots between 08:00 and 23:00.
            Help customers find free slots, sports and days. Use the tools for every question about \
            availability and never invent slots, venues or prices. You cannot make bookings: tell the customer \
            to open the venue on courtbook to book.
            Reply in the customer's language; when unsure, reply in Macedonian. Keep answers short and plain, \
            without markdown. Show times in 24-hour format and prices in MKD.
            Today is %s.""";

    /** The tools the model may call while answering. */
    public interface Tools {

        List<Tool> definitions();

        /** Runs a tool and returns its result as text. */
        String execute(String name, Map<String, Object> input);
    }

    private final AnthropicClient client;

    public ClaudeAssistantClient(@Value("${courtbook.anthropic-api-key:}") String apiKey) {
        this.client = apiKey.isBlank() ? null : AnthropicOkHttpClient.builder()
                .apiKey(apiKey)
                .timeout(Duration.ofSeconds(30))
                .build();
    }

    public String reply(String message, Tools tools) {
        if (client == null) {
            throw new AssistantUnavailableException("The assistant is not configured.");
        }
        try {
            return converse(message, tools);
        } catch (AnthropicException e) {
            log.warn("Assistant request failed: {}", e.getClass().getSimpleName());
            throw new AssistantUnavailableException("The assistant is unavailable right now.");
        }
    }

    private String converse(String message, Tools tools) {
        List<MessageParam> messages = new ArrayList<>();
        messages.add(MessageParam.builder().role(MessageParam.Role.USER).content(message).build());
        for (int round = 0; round < MAX_TOOL_ROUNDS; round++) {
            Message response = client.messages().create(params(messages, tools));
            if (!response.stopReason().map(StopReason.TOOL_USE::equals).orElse(false)) {
                return textOf(response);
            }
            messages.add(response.toParam());
            messages.add(toolResults(response, tools));
        }
        return FALLBACK_REPLY;
    }

    private MessageCreateParams params(List<MessageParam> messages, Tools tools) {
        MessageCreateParams.Builder builder = MessageCreateParams.builder()
                .model(MODEL)
                .maxTokens(MAX_TOKENS)
                .system(SYSTEM_PROMPT.formatted(LocalDate.now()))
                .outputConfig(OutputConfig.builder().effort(OutputConfig.Effort.LOW).build())
                .messages(messages);
        tools.definitions().forEach(builder::addTool);
        return builder.build();
    }

    private MessageParam toolResults(Message response, Tools tools) {
        List<ContentBlockParam> results = response.content().stream()
                .flatMap(block -> block.toolUse().stream())
                .map(toolUse -> runTool(toolUse, tools))
                .map(ContentBlockParam::ofToolResult)
                .toList();
        return MessageParam.builder().role(MessageParam.Role.USER).contentOfBlockParams(results).build();
    }

    private ToolResultBlockParam runTool(ToolUseBlock toolUse, Tools tools) {
        ToolResultBlockParam.Builder result = ToolResultBlockParam.builder().toolUseId(toolUse.id());
        try {
            return result.content(tools.execute(toolUse.name(), inputOf(toolUse._input()))).build();
        } catch (RuntimeException e) {
            return result.content(e.getMessage()).isError(true).build();
        }
    }

    private static Map<String, Object> inputOf(JsonValue input) {
        Map<String, Object> values = input.convert(new TypeReference<Map<String, Object>>() {
        });
        return values == null ? Map.of() : values;
    }

    private static String textOf(Message response) {
        String text = response.content().stream()
                .flatMap(block -> block.text().stream())
                .map(TextBlock::text)
                .collect(Collectors.joining("\n"))
                .strip();
        return text.isEmpty() || response.stopReason().map(StopReason.REFUSAL::equals).orElse(false)
                ? FALLBACK_REPLY
                : text;
    }

    @PreDestroy
    void close() {
        if (client != null) {
            client.close();
        }
    }
}
