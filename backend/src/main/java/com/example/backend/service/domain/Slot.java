package com.example.backend.service.domain;

import java.time.LocalDateTime;

public record Slot(LocalDateTime startAt, boolean available) {
}
