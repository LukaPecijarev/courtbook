package com.example.backend.service.application.impl;

import com.example.backend.dto.FreeSlotResponse;
import com.example.backend.repository.VenueSlotRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Limit;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
class FreeSlotFinder {

    static final int SEARCH_DAYS = 30;

    private final VenueSlotRepository venueSlotRepository;
    private final EntityLookup entityLookup;

    List<FreeSlotResponse> next(Long sportId, int limit) {
        LocalDateTime now = LocalDateTime.now();
        return find(sportId, now, now.plusDays(SEARCH_DAYS), limit);
    }

    List<FreeSlotResponse> on(LocalDate date, Long sportId, int limit) {
        return on(date, LocalTime.MIDNIGHT, sportId, limit);
    }

    List<FreeSlotResponse> on(LocalDate date, LocalTime fromTime, Long sportId, int limit) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime requested = date.atTime(fromTime);
        LocalDateTime from = requested.isAfter(now) ? requested : now;
        return find(sportId, from, date.plusDays(1).atStartOfDay(), limit);
    }

    private List<FreeSlotResponse> find(Long sportId, LocalDateTime from, LocalDateTime to, int limit) {
        if (sportId != null) {
            entityLookup.sport(sportId);
        }
        return venueSlotRepository.findFree(from, to, sportId, Limit.of(limit)).stream()
                .map(FreeSlotResponse::from)
                .toList();
    }
}
