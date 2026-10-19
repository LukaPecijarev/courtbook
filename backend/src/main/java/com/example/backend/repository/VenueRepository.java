package com.example.backend.repository;

import com.example.backend.model.Venue;
import com.example.backend.model.exception.NotFoundException;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VenueRepository extends JpaRepository<Venue, Long> {

    // Fetches sports in the same query to avoid N+1 lazy loads when listing venues.
    @EntityGraph(attributePaths = "sports")
    List<Venue> findAllByOrderByNameAsc();

    // Filters in a subquery so the fetched sports collection stays complete, not just the matching sport.
    @Query("""
            select distinct v from Venue v left join fetch v.sports
            where exists (select s from v.sports s where s.id = :sportId)
            order by v.name""")
    List<Venue> findAllOfferingSport(@Param("sportId") Long sportId);

    default Venue findByIdOrThrow(Long id) {
        return findById(id).orElseThrow(() -> new NotFoundException("Venue not found: " + id));
    }
}
