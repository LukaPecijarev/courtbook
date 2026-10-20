package com.example.backend.repository;

import com.example.backend.exception.NotFoundException;
import com.example.backend.model.Sport;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SportRepository extends JpaRepository<Sport, Long> {

    List<Sport> findAllByOrderByNameAsc();

    Optional<Sport> findByName(String name);

    default Sport findByIdOrThrow(Long id) {
        return findById(id).orElseThrow(() -> new NotFoundException("Sport not found: " + id));
    }
}
