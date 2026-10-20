package com.example.backend.repository;

import com.example.backend.model.VenueSlot;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VenueSlotRepository extends JpaRepository<VenueSlot, Long> {

    boolean existsByVenueIdAndStartAt(Long venueId, LocalDateTime startAt);

    Optional<VenueSlot> findByIdAndVenueId(Long id, Long venueId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from VenueSlot s where s.venue.id = :venueId")
    void deleteAllByVenueId(@Param("venueId") Long venueId);

    List<VenueSlot> findByVenueIdAndStartAtGreaterThanEqualOrderByStartAt(Long venueId, LocalDateTime from);

    @Query("""
            select s.startAt from VenueSlot s
            where s.venue.id = :venueId and s.startAt >= :from and s.startAt < :to
            order by s.startAt""")
    List<LocalDateTime> findStartTimes(@Param("venueId") Long venueId,
                                       @Param("from") LocalDateTime from,
                                       @Param("to") LocalDateTime to);

    default List<LocalDateTime> findStartTimesOn(Long venueId, LocalDate date) {
        return findStartTimes(venueId, date.atStartOfDay(), date.plusDays(1).atStartOfDay());
    }
}
