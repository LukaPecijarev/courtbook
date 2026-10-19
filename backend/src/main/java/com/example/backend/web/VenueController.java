package com.example.backend.web;

import com.example.backend.dto.SlotResponse;
import com.example.backend.dto.VenueResponse;
import com.example.backend.service.application.VenueService;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/venues")
@RequiredArgsConstructor
public class VenueController {

    private final VenueService venueService;

    @GetMapping
    public List<VenueResponse> listVenues(@RequestParam(required = false) Long sportId) {
        return venueService.listVenues(sportId);
    }

    @GetMapping("/{id}/availability")
    public List<SlotResponse> getAvailability(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam Long sportId) {
        return venueService.getAvailability(id, date, sportId);
    }
}
