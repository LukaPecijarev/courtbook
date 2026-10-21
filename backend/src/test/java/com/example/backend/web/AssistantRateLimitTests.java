package com.example.backend.web;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.backend.service.application.impl.ClaudeAssistantClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

@SpringBootTest
@AutoConfigureMockMvc
class AssistantRateLimitTests {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ClaudeAssistantClient claudeAssistantClient;

    @BeforeEach
    void stubClaude() {
        when(claudeAssistantClient.reply(anyString())).thenReturn("Следниот слободен термин е утре во 10:00.");
    }

    @Test
    void returnsTheModelReply() throws Exception {
        send("10.0.1.1")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reply").value("Следниот слободен термин е утре во 10:00."));
    }

    @Test
    void eleventhMessageFromTheSameIpWithinAnHourReturns429() throws Exception {
        for (int i = 0; i < 10; i++) {
            send("10.0.2.1").andExpect(status().isOk());
        }

        send("10.0.2.1")
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.message").exists());
        send("10.0.2.2").andExpect(status().isOk());
    }

    private ResultActions send(String clientIp) throws Exception {
        return mockMvc.perform(post("/api/assistant/message")
                .with(request -> {
                    request.setRemoteAddr(clientIp);
                    return request;
                })
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"message": "Кога е следниот слободен термин?"}"""));
    }
}
