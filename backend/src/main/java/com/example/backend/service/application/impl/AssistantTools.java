package com.example.backend.service.application.impl;

import com.anthropic.core.JsonValue;
import com.anthropic.models.messages.Tool;
import com.example.backend.dto.FreeSlotResponse;
import com.example.backend.dto.SportResponse;
import com.example.backend.service.application.SportApplicationService;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** The read-only tools the assistant model may call, backed by the database. */
@Component
@RequiredArgsConstructor
class AssistantTools {

    static final String LIST_SPORTS = "list_sports";
    static final String FIND_FREE_SLOTS = "find_free_slots";
    private static final int MAX_SLOTS = 10;

    private final SportApplicationService sportApplicationService;
    private final FreeSlotFinder freeSlotFinder;

    List<Tool> definitions() {
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

    /** Runs a tool and returns its result as text; invalid input throws IllegalArgumentException. */
    @Transactional(readOnly = true)
    String execute(String name, Map<String, Object> input) {
        return switch (name) {
            case LIST_SPORTS -> describeSports(sportApplicationService.listSports());
            case FIND_FREE_SLOTS -> describeSlots(findFreeSlots(input));
            default -> throw new IllegalArgumentException("Unknown tool: " + name);
        };
    }

    private List<FreeSlotResponse> findFreeSlots(Map<String, Object> input) {
        Long sportId = input.get("sport_id") instanceof Number number ? number.longValue() : null;
        LocalTime fromTime = parse(input.get("from_time"), LocalTime::parse, LocalTime.MIDNIGHT);
        LocalDate date = parse(input.get("date"), LocalDate::parse, null);
        if (date == null) {
            return freeSlotFinder.next(sportId, MAX_SLOTS);
        }
        return freeSlotFinder.on(date, fromTime, sportId, MAX_SLOTS);
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
                        String.join(", ", slot.sports()), slot.pricePerHour().stripTrailingZeros().toPlainString()))
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
