package com.exam.expense;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    public record RegisterRequest(
            @NotBlank(message = "Name is required") @Size(max = 60, message = "Name must be 60 characters or fewer") String name,
            @NotBlank(message = "Email is required") @Email(message = "Enter a valid email address") String email,
            @NotBlank(message = "Password is required") @Size(min = 6, max = 72, message = "Password must be 6 to 72 characters") String password) {}

    public record LoginRequest(
            @NotBlank(message = "Email is required") String email,
            @NotBlank(message = "Password is required") String password) {}

    private static final SecureRandom RANDOM = new SecureRandom();
    private final UserRepository users;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthController(UserRepository users) {
        this.users = users;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> register(@Valid @RequestBody RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (users.existsByEmail(email)) throw emailTaken();

        User user = new User();
        user.setName(req.name().trim());
        user.setEmail(email);
        user.setPasswordHash(encoder.encode(req.password()));
        try {
            return startSession(user);
        } catch (DuplicateKeyException e) {
            throw emailTaken();
        }
    }

    @PostMapping("/login")
    public Map<String, Object> login(@Valid @RequestBody LoginRequest req) {
        User user = users.findByEmail(req.email().trim().toLowerCase()).orElse(null);
        if (user == null || !encoder.matches(req.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        return startSession(user);
    }

    @GetMapping("/me")
    public Map<String, Object> me(@RequestAttribute("user") User user) {
        return publicUser(user);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@RequestAttribute("user") User user) {
        user.setToken(null);
        user.setTokenExpiresAt(null);
        users.save(user);
    }

    private Map<String, Object> startSession(User user) {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        user.setToken(Base64.getUrlEncoder().withoutPadding().encodeToString(bytes));
        user.setTokenExpiresAt(Instant.now().plus(Duration.ofDays(7)));
        users.save(user);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("token", user.getToken());
        body.put("user", publicUser(user));
        return body;
    }

    private Map<String, Object> publicUser(User user) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("name", user.getName());
        m.put("email", user.getEmail());
        return m;
    }

    private ResponseStatusException emailTaken() {
        return new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
    }
}
