package com.example.backend.exception;

/** Errors of the courtbook assistant, mapped to 429 and 503 by {@link GlobalExceptionHandler}. */
public final class AssistantExceptions {

    private AssistantExceptions() {
    }

    public static class AssistantUnavailableException extends RuntimeException {

        public AssistantUnavailableException(String message) {
            super(message);
        }
    }

    public static class TooManyRequestsException extends RuntimeException {

        public TooManyRequestsException(String message) {
            super(message);
        }
    }
}
