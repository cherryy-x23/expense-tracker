package com.exam.expense;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Instant;
import java.util.Optional;

/** Checks "Authorization: Bearer <token>" and puts the logged-in User on the request. */
@Component
public class AuthInterceptor implements HandlerInterceptor {

    private final UserRepository users;

    public AuthInterceptor(UserRepository users) {
        this.users = users;
    }

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) return true; // CORS preflight

        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7).trim();
            if (!token.isEmpty()) {
                Optional<User> user = users.findByToken(token);
                if (user.isPresent() && user.get().getTokenExpiresAt() != null
                        && user.get().getTokenExpiresAt().isAfter(Instant.now())) {
                    req.setAttribute("user", user.get());
                    return true;
                }
            }
        }
        res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        res.setContentType("application/json");
        res.getWriter().write("{\"message\":\"Please log in to continue\"}");
        return false;
    }
}
