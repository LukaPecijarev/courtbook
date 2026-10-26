package com.example.backend.web;

import com.example.backend.dto.AddVenueRequest;
import com.example.backend.dto.BookingResponse;
import com.example.backend.dto.CreateBlockRequest;
import com.example.backend.dto.CreatedVenueResponse;
import com.example.backend.dto.ManagedSlotResponse;
import com.example.backend.dto.PublishSlotsRequest;
import com.example.backend.dto.UpdateVenueRequest;
import com.example.backend.dto.VenueResponse;
import com.example.backend.service.application.VenueOwnerApplicationService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/venues")
@RequiredArgsConstructor
public class VenueOwnerController {

    public static final String MANAGEMENT_KEY_HEADER = "X-Management-Key";

    private final VenueOwnerApplicationService venueOwnerApplicationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CreatedVenueResponse addVenue(@Valid @RequestBody AddVenueRequest request) {
        return venueOwnerApplicationService.addVenue(request);
    }

    @PostMapping("/{id}/manage/verify")
    public void verifyManagementKey(
            @PathVariable Long id,
            @RequestHeader(name = MANAGEMENT_KEY_HEADER, required = false) String managementKey) {
        venueOwnerApplicationService.verifyManagementKey(id, managementKey);
    }

    @PutMapping("/{id}")
    public VenueResponse updateVenue(@PathVariable Long id,
                                     @RequestHeader(name = MANAGEMENT_KEY_HEADER, required = false) String managementKey,
                                     @Valid @RequestBody UpdateVenueRequest request) {
        return venueOwnerApplicationService.updateVenue(id, managementKey, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteVenue(@PathVariable Long id,
                            @RequestHeader(name = MANAGEMENT_KEY_HEADER, required = false) String managementKey) {
        venueOwnerApplicationService.deleteVenue(id, managementKey);
    }

    @GetMapping("/{id}/slots")
    public List<ManagedSlotResponse> listSlots(
            @PathVariable Long id,
            @RequestHeader(name = MANAGEMENT_KEY_HEADER, required = false) String managementKey) {
        return venueOwnerApplicationService.listSlots(id, managementKey);
    }

    @PostMapping("/{id}/slots")
    @ResponseStatus(HttpStatus.CREATED)
    public List<ManagedSlotResponse> publishSlots(
            @PathVariable Long id,
            @RequestHeader(name = MANAGEMENT_KEY_HEADER, required = false) String managementKey,
            @Valid @RequestBody PublishSlotsRequest request) {
        return venueOwnerApplicationService.publishSlots(id, managementKey, request);
    }

    @DeleteMapping("/{id}/slots/{slotId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeSlot(@PathVariable Long id, @PathVariable Long slotId,
                           @RequestHeader(name = MANAGEMENT_KEY_HEADER, required = false) String managementKey) {
        venueOwnerApplicationService.removeSlot(id, slotId, managementKey);
    }

    @PostMapping("/{id}/manage/blocks")
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse blockSlot(@PathVariable Long id,
                                     @RequestHeader(name = MANAGEMENT_KEY_HEADER, required = false) String managementKey,
                                     @Valid @RequestBody CreateBlockRequest request) {
        return venueOwnerApplicationService.blockSlot(id, managementKey, request);
    }
}
