package com.example.backend.repository;

import com.example.backend.model.Venue;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VenueRepository extends JpaRepository<Venue, Long> {

    @EntityGraph(attributePaths = "sports")
    List<Venue> findAllByOrderByNameAsc();

    @Query("""
            select distinct v from Venue v left join fetch v.sports
            where exists (select s from v.sports s where s.id = :sportId)
            order by v.name""")
    List<Venue> findAllOfferingSport(@Param("sportId") Long sportId);

    Optional<Venue> findFirstByName(String name);
}
