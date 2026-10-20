package com.example.backend.exception;

import java.time.LocalDateTime;

public class SlotAlreadyPublishedException extends RuntimeException {

    public SlotAlreadyPublishedException(LocalDateTime startAt) {
        super("Slot is already published: " + startAt);
    }
}
