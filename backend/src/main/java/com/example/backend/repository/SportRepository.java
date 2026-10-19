package com.example.backend.repository;

import com.example.backend.model.Sport;
import com.example.backend.model.exception.NotFoundException;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SportRepository extends JpaRepository<Sport, Long> {

    List<Sport> findAllByOrderByNameAsc();

    default Sport findByIdOrThrow(Long id) {
        return findById(id).orElseThrow(() -> new NotFoundException("Sport not found: " + id));
    }
}
