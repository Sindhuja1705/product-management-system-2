package com.productmanagement.dto;

public record AuthResponse(String token, String username, String type) {
    public static AuthResponse of(String token, String username) {
        return new AuthResponse(token, username, "Bearer");
    }
}
