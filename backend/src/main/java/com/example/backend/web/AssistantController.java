package com.example.backend.web;

import com.example.backend.dto.AssistantMessageRequest;
import com.example.backend.dto.AssistantReplyResponse;
import com.example.backend.dto.FreeSlotResponse;
import com.example.backend.dto.QuickQuestion;
import com.example.backend.service.application.AssistantApplicationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/assistant")
@RequiredArgsConstructor
public class AssistantController {

    private final AssistantApplicationService assistantApplicationService;

    @GetMapping("/quick")
    public List<FreeSlotResponse> quickAnswer(
            @RequestParam String type,
            @RequestParam(required = false) Long sportId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return assistantApplicationService.quickAnswer(QuickQuestion.fromParam(type), sportId, date);
    }

    @PostMapping("/message")
    public AssistantReplyResponse sendMessage(@Valid @RequestBody AssistantMessageRequest request,
                                              HttpServletRequest servletRequest) {
        return assistantApplicationService.reply(servletRequest.getRemoteAddr(), request.message());
    }
}
