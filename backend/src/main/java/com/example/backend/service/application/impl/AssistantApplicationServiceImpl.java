package com.example.backend.service.application.impl;

import com.example.backend.dto.AssistantReplyResponse;
import com.example.backend.dto.FreeSlotResponse;
import com.example.backend.dto.QuickQuestion;
import com.example.backend.service.application.AssistantApplicationService;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AssistantApplicationServiceImpl implements AssistantApplicationService {

    private static final int MAX_SLOTS_ON_DATE = 50;

    private final FreeSlotFinder freeSlotFinder;
    private final AssistantRateLimiter rateLimiter;
    private final ClaudeAssistantClient claudeAssistantClient;

    @Override
    @Transactional(readOnly = true)
    public List<FreeSlotResponse> quickAnswer(QuickQuestion question, Long sportId, LocalDate date) {
        return switch (question) {
            case NEXT_FREE -> freeSlotFinder.next(sportId, 1);
            case FREE_ON_DATE -> freeSlotFinder.on(requireDate(date), sportId, MAX_SLOTS_ON_DATE);
        };
    }

    @Override
    public AssistantReplyResponse reply(String clientIp, String message) {
        rateLimiter.acquire(clientIp);
        return new AssistantReplyResponse(claudeAssistantClient.reply(message.strip()));
    }

    private static LocalDate requireDate(LocalDate date) {
        if (date == null) {
            throw new IllegalArgumentException("A date is required for free-on-date");
        }
        return date;
    }
}
