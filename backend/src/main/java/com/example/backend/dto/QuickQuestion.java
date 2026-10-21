package com.example.backend.dto;

import java.util.Arrays;

public enum QuickQuestion {
    NEXT_FREE("next-free"),
    FREE_ON_DATE("free-on-date");

    private final String param;

    QuickQuestion(String param) {
        this.param = param;
    }

    public static QuickQuestion fromParam(String param) {
        return Arrays.stream(values())
                .filter(question -> question.param.equals(param))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown question type: " + param));
    }
}
