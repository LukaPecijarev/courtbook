package com.example.backend.web;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class HostTokenInterceptor implements HandlerInterceptor {

    static final String HEADER = "X-Host-Token";

    private final byte[] hostToken;

    public HostTokenInterceptor(@Value("${courtbook.host-token}") String hostToken) {
        this.hostToken = hostToken.getBytes(StandardCharsets.UTF_8);
    }

    // Thrown exceptions reach GlobalExceptionHandler, so the 401 body matches other errors.
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String token = request.getHeader(HEADER);
        // Constant-time comparison so the token cannot be guessed from response timing.
        if (token == null || !MessageDigest.isEqual(hostToken, token.getBytes(StandardCharsets.UTF_8))) {
            throw new UnauthorizedException("Missing or invalid host token");
        }
        return true;
    }
}
