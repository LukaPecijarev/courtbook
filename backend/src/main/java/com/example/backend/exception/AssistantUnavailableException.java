package com.example.backend.exception;

public class AssistantUnavailableException extends RuntimeException {

    public AssistantUnavailableException(String message) {
        super(message);
    }
}
