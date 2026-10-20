package com.example.backend.web;

import com.example.backend.dto.SportResponse;
import com.example.backend.service.application.SportApplicationService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sports")
@RequiredArgsConstructor
public class SportController {

    private final SportApplicationService sportApplicationService;

    @GetMapping
    public List<SportResponse> listSports() {
        return sportApplicationService.listSports();
    }
}
