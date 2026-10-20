package com.example.backend.exception;

import java.time.LocalDateTime;

public class SlotAlreadyBookedException extends RuntimeException {

    public SlotAlreadyBookedException(LocalDateTime startAt) {
        super("Slot is already booked: " + startAt);
    }
}
