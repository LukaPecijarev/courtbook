package com.example.backend.service.application;

import com.example.backend.dto.AddVenueRequest;
import com.example.backend.dto.BookingResponse;
import com.example.backend.dto.CreateBlockRequest;
import com.example.backend.dto.CreatedVenueResponse;
import com.example.backend.dto.ManagedSlotResponse;
import com.example.backend.dto.PublishSlotsRequest;
import com.example.backend.dto.UpdateVenueRequest;
import com.example.backend.dto.VenueResponse;
import java.util.List;

public interface VenueOwnerApplicationService {

    CreatedVenueResponse addVenue(AddVenueRequest request);

    void verifyManagementKey(Long venueId, String managementKey);

    VenueResponse updateVenue(Long venueId, String managementKey, UpdateVenueRequest request);

    void deleteVenue(Long venueId, String managementKey);

    List<ManagedSlotResponse> listSlots(Long venueId, String managementKey);

    List<ManagedSlotResponse> publishSlots(Long venueId, String managementKey, PublishSlotsRequest request);

    void removeSlot(Long venueId, Long slotId, String managementKey);

    BookingResponse blockSlot(Long venueId, String managementKey, CreateBlockRequest request);
}
