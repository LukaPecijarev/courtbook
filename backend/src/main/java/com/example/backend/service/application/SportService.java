package com.example.backend.service.application;

import com.example.backend.dto.SportResponse;
import com.example.backend.repository.SportRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SportService {

    private final SportRepository sportRepository;

    @Transactional(readOnly = true)
    public List<SportResponse> listSports() {
        return sportRepository.findAllByOrderByNameAsc().stream()
                .map(SportResponse::from)
                .toList();
    }
}
