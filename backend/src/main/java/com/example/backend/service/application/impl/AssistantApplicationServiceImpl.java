package com.example.backend.service.application.impl;

import com.anthropic.core.JsonValue;
import com.anthropic.models.messages.Tool;
import com.example.backend.dto.AssistantDtos.AssistantReplyResponse;
import com.example.backend.dto.AssistantDtos.FreeSlotResponse;
import com.example.backend.dto.AssistantDtos.QuickQuestion;
import com.example.backend.dto.SportResponse;
import com.example.backend.exception.AssistantExceptions.TooManyRequestsException;
import com.example.backend.repository.VenueSlotRepository;
import com.example.backend.service.application.AssistantApplicationService;
import com.example.backend.service.application.SportApplicationService;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.data.domain.Limit;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

@Service
public class AssistantApplicationServiceImpl implements AssistantApplicationService {

    private static final int MAX_SLOTS_ON_DATE = 50;
    private static final int SEARCH_DAYS = 30;

    private final VenueSlotRepository venueSlotRepository;
    private final EntityLookup entityLookup;
    private final SportApplicationService sportApplicationService;
    private final ClaudeAssistantClient claudeAssistantClient;
    private final TransactionTemplate readOnlyTransaction;
    private final AssistantRateLimiter rateLimiter = new AssistantRateLimiter();
    private final AssistantTools tools = new AssistantTools();

    public AssistantApplicationServiceImpl(VenueSlotRepository venueSlotRepository, EntityLookup entityLookup,
                                           SportApplicationService sportApplicationService,
                                           ClaudeAssistantClient claudeAssistantClient,
                                           PlatformTransactionManager transactionManager) {
        this.venueSlotRepository = venueSlotRepository;
        this.entityLookup = entityLookup;
        this.sportApplicationService = sportApplicationService;
        this.claudeAssistantClient = claudeAssistantClient;
        this.readOnlyTransaction = new TransactionTemplate(transactionManager);
        this.readOnlyTransaction.setReadOnly(true);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FreeSlotResponse> quickAnswer(QuickQuestion question, Long sportId, LocalDate date) {
        return switch (question) {
            case NEXT_FREE -> nextFreeSlots(sportId, 1);
            case FREE_ON_DATE -> freeSlotsOn(requireDate(date), LocalTime.MIDNIGHT, sportId, MAX_SLOTS_ON_DATE);
        };
    }

    @Override
    public AssistantReplyResponse reply(String clientIp, String message) {
        rateLimiter.acquire(clientIp);
        return new AssistantReplyResponse(claudeAssistantClient.reply(message.strip(), tools));
    }

    private static LocalDate requireDate(LocalDate date) {
        if (date == null) {
            throw new IllegalArgumentException("A date is required for free-on-date");
        }
        return date;
    }

    private List<FreeSlotResponse> nextFreeSlots(Long sportId, int limit) {
        LocalDateTime now = LocalDateTime.now();
        return findFreeSlots(sportId, now, now.plusDays(SEARCH_DAYS), limit);
    }

    /** Free slots on a day from the given time, never in the past. */
    private List<FreeSlotResponse> freeSlotsOn(LocalDate date, LocalTime fromTime, Long sportId, int limit) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime requested = date.atTime(fromTime);
        LocalDateTime from = requested.isAfter(now) ? requested : now;
        return findFreeSlots(sportId, from, date.plusDays(1).atStartOfDay(), limit);
    }

    private List<FreeSlotResponse> findFreeSlots(Long sportId, LocalDateTime from, LocalDateTime to, int limit) {
        if (sportId != null) {
            entityLookup.sport(sportId);
        }
        return venueSlotRepository.findFree(from, to, sportId, Limit.of(limit)).stream()
                .map(FreeSlotResponse::from)
                .toList();
    }

    /** Sliding one-hour window of assistant messages per client IP, kept in memory. */
    private static class AssistantRateLimiter {

        private static final int MAX_MESSAGES = 10;
        private static final Duration WINDOW = Duration.ofHours(1);

        private final Map<String, Deque<Instant>> messagesByIp = new HashMap<>();

        synchronized void acquire(String clientIp) {
            Instant windowStart = Instant.now().minus(WINDOW);
            messagesByIp.values().forEach(sent -> dropBefore(sent, windowStart));
            messagesByIp.values().removeIf(Deque::isEmpty);

            Deque<Instant> sent = messagesByIp.computeIfAbsent(clientIp, ip -> new ArrayDeque<>());
            if (sent.size() >= MAX_MESSAGES) {
                throw new TooManyRequestsException("Too many messages. Try again in an hour.");
            }
            sent.addLast(Instant.now());
        }

        private static void dropBefore(Deque<Instant> sent, Instant windowStart) {
            while (!sent.isEmpty() && !sent.peekFirst().isAfter(windowStart)) {
                sent.pollFirst();
            }
        }
    }

    /** The read-only tools the assistant model may call, backed by the database. */
    private class AssistantTools implements ClaudeAssistantClient.Tools {

        private static final String LIST_SPORTS = "list_sports";
        private static final String FIND_FREE_SLOTS = "find_free_slots";
        private static final int MAX_SLOTS = 10;

        @Override
        public List<Tool> definitions() {
            return List.of(
                    Tool.builder()
                            .name(LIST_SPORTS)
                            .description("Lists the sports offered on courtbook with their ids.")
                            .inputSchema(schema(Map.of()))
                            .build(),
                    Tool.builder()
                            .name(FIND_FREE_SLOTS)
                            .description("Finds free 60-minute court slots that can be booked, earliest first. "
                                    + "Without a date it returns the next free slots from now.")
                            .inputSchema(schema(Map.of(
                                    "sport_id", Map.of("type", "integer",
                                            "description", "Sport id from list_sports. Omit for all sports."),
                                    "date", Map.of("type", "string",
                                            "description", "Day to search, as YYYY-MM-DD."),
                                    "from_time", Map.of("type", "string",
                                            "description", "Earliest start time on that day, as HH:MM, "
                                                    + "for example 17:00 for the evening."))))
                            .build());
        }

        /** Runs a tool in a read-only transaction; invalid input throws IllegalArgumentException. */
        @Override
        public String execute(String name, Map<String, Object> input) {
            return readOnlyTransaction.execute(status -> switch (name) {
                case LIST_SPORTS -> describeSports(sportApplicationService.listSports());
                case FIND_FREE_SLOTS -> describeSlots(findFreeSlots(input));
                default -> throw new IllegalArgumentException("Unknown tool: " + name);
            });
        }

        private List<FreeSlotResponse> findFreeSlots(Map<String, Object> input) {
            Long sportId = input.get("sport_id") instanceof Number number ? number.longValue() : null;
            LocalTime fromTime = parse(input.get("from_time"), LocalTime::parse, LocalTime.MIDNIGHT);
            LocalDate date = parse(input.get("date"), LocalDate::parse, null);
            if (date == null) {
                return nextFreeSlots(sportId, MAX_SLOTS);
            }
            return freeSlotsOn(date, fromTime, sportId, MAX_SLOTS);
        }

        private static <T> T parse(Object value, Function<String, T> parser, T fallback) {
            if (!(value instanceof String text) || text.isBlank()) {
                return fallback;
            }
            try {
                return parser.apply(text.strip());
            } catch (DateTimeParseException e) {
                throw new IllegalArgumentException("Invalid date or time: " + text);
            }
        }

        private static String describeSports(List<SportResponse> sports) {
            return sports.stream()
                    .map(sport -> "id " + sport.id() + ": " + sport.name())
                    .collect(Collectors.joining("\n"));
        }

        private static String describeSlots(List<FreeSlotResponse> slots) {
            if (slots.isEmpty()) {
                return "No free slots found.";
            }
            return slots.stream()
                    .map(slot -> "%s | %s | %s | %s MKD per hour".formatted(slot.startAt(), slot.venueName(),
                            String.join(", ", slot.sports()),
                            slot.pricePerHour().stripTrailingZeros().toPlainString()))
                    .collect(Collectors.joining("\n"));
        }

        private static Tool.InputSchema schema(Map<String, Object> properties) {
            Tool.InputSchema.Properties.Builder props = Tool.InputSchema.Properties.builder();
            properties.forEach((key, value) -> props.putAdditionalProperty(key, JsonValue.from(value)));
            return Tool.InputSchema.builder()
                    .properties(props.build())
                    .build();
        }
    }
}
