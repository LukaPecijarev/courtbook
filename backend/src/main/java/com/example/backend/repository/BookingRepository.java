package com.example.backend.repository;

import com.example.backend.exception.NotFoundException;
import com.example.backend.model.Booking;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    boolean existsByVenueIdAndStartAt(Long venueId, LocalDateTime startAt);

    @Query("""
            select b.startAt from Booking b
            where b.venue.id = :venueId and b.startAt >= :from and b.startAt < :to""")
    List<LocalDateTime> findStartTimes(@Param("venueId") Long venueId,
                                       @Param("from") LocalDateTime from,
                                       @Param("to") LocalDateTime to);

    @Query("""
            select b from Booking b join fetch b.venue left join fetch b.sport
            where b.venue.id = :venueId and b.startAt >= :from and b.startAt < :to
            order by b.startAt""")
    List<Booking> findAllForVenue(@Param("venueId") Long venueId,
                                  @Param("from") LocalDateTime from,
                                  @Param("to") LocalDateTime to);

    default Booking findByIdOrThrow(Long id) {
        return findById(id).orElseThrow(() -> new NotFoundException("Booking not found: " + id));
    }
}
