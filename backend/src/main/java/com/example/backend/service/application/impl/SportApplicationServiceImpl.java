package com.example.backend.service.application.impl;

import com.example.backend.dto.SportResponse;
import com.example.backend.repository.SportRepository;
import com.example.backend.service.application.SportApplicationService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SportApplicationServiceImpl implements SportApplicationService {

    private final SportRepository sportRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SportResponse> listSports() {
        return sportRepository.findAllByOrderByNameAsc().stream()
                .map(SportResponse::from)
                .toList();
    }
}
