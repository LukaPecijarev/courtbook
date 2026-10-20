package com.example.backend.web.interceptor;

import com.example.backend.exception.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class HostTokenInterceptor implements HandlerInterceptor {

    public static final String HEADER = "X-Host-Token";

    private final byte[] hostToken;

    public HostTokenInterceptor(@Value("${courtbook.host-token}") String hostToken) {
        this.hostToken = hostToken.getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String token = request.getHeader(HEADER);
        if (token == null || !MessageDigest.isEqual(hostToken, token.getBytes(StandardCharsets.UTF_8))) {
            throw new UnauthorizedException("Missing or invalid host token");
        }
        return true;
    }
}
