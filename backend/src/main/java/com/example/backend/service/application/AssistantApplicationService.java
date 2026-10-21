package com.example.backend.service.application;

import com.example.backend.dto.AssistantReplyResponse;
import com.example.backend.dto.FreeSlotResponse;
import com.example.backend.dto.QuickQuestion;
import java.time.LocalDate;
import java.util.List;

public interface AssistantApplicationService {

    List<FreeSlotResponse> quickAnswer(QuickQuestion question, Long sportId, LocalDate date);

    AssistantReplyResponse reply(String clientIp, String message);
}
