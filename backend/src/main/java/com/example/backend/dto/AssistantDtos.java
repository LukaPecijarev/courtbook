package com.example.backend.dto;

import com.example.backend.model.Sport;
import com.example.backend.model.VenueSlot;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/** Requests and responses of the courtbook assistant. */
public final class AssistantDtos {

    private AssistantDtos() {
    }

    public record AssistantMessageRequest(
            @NotBlank @Size(max = 500) String message) {
    }

    public record AssistantReplyResponse(String reply) {
    }

    public record FreeSlotResponse(
            Long venueId,
            String venueName,
            LocalDateTime startAt,
            BigDecimal pricePerHour,
            List<String> sports) {

        public static FreeSlotResponse from(VenueSlot slot) {
            List<String> sports = slot.getVenue().getSports().stream()
                    .map(Sport::getName)
                    .sorted()
                    .toList();
            return new FreeSlotResponse(slot.getVenue().getId(), slot.getVenue().getName(), slot.getStartAt(),
                    slot.getVenue().getPricePerHour(), sports);
        }
    }

    public enum QuickQuestion {
        NEXT_FREE("next-free"),
        FREE_ON_DATE("free-on-date");

        private final String param;

        QuickQuestion(String param) {
            this.param = param;
        }

        public static QuickQuestion fromParam(String param) {
            return Arrays.stream(values())
                    .filter(question -> question.param.equals(param))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Unknown question type: " + param));
        }
    }
}
