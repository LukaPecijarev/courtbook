package com.example.backend.service.application.impl;

import com.example.backend.exception.TooManyRequestsException;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashMap;
import java.util.Map;
import org.springframework.stereotype.Component;

/** Sliding one-hour window of assistant messages per client IP, kept in memory. */
@Component
class AssistantRateLimiter {

    static final int MAX_MESSAGES = 10;
    static final Duration WINDOW = Duration.ofHours(1);

    private final Map<String, Deque<Instant>> messagesByIp = new HashMap<>();

    synchronized void acquire(String clientIp) {
        Instant windowStart = Instant.now().minus(WINDOW);
        messagesByIp.values().forEach(sent -> dropBefore(sent, windowStart));
        messagesByIp.values().removeIf(Deque::isEmpty);

        Deque<Instant> sent = messagesByIp.computeIfAbsent(clientIp, ip -> new ArrayDeque<>());
        if (sent.size() >= MAX_MESSAGES) {
            throw new TooManyRequestsException("Too many messages. Try again in an hour.");
        }
        sent.addLast(Instant.now());
    }

    private static void dropBefore(Deque<Instant> sent, Instant windowStart) {
        while (!sent.isEmpty() && !sent.peekFirst().isAfter(windowStart)) {
            sent.pollFirst();
        }
    }
}
