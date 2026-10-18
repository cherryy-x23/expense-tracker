package com.exam.expense;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AuthInterceptor auth;
    private final String[] origins;

    public WebConfig(AuthInterceptor auth,
                     @Value("${CORS_ORIGINS:http://localhost:5173,http://127.0.0.1:5173}") String[] origins) {
        this.auth = auth;
        this.origins = origins;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(auth).addPathPatterns(
                "/api/expenses", "/api/expenses/**", "/api/auth/me", "/api/auth/logout");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(origins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}