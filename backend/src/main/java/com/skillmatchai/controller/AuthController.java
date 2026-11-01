package com.skillmatchai.controller;

import com.skillmatchai.dto.AuthResponse;
import com.skillmatchai.dto.LoginRequest;
import com.skillmatchai.dto.RegisterRequest;
import com.skillmatchai.dto.UserResponse;
import com.skillmatchai.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.skillmatchai.service.OtpService;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

    public AuthController(AuthService authService, OtpService otpService) {
        this.authService = authService;
        this.otpService = otpService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse user = authService.register(request);
        return new ResponseEntity<>(user, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(authResponse);
    }

    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmail(@RequestParam String email) {
        boolean exists = authService.checkEmailExists(email);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, String>> sendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        otpService.generateAndSendOtp(email);
        return ResponseEntity.ok(Map.of("message", "OTP sent successfully to " + email));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        
        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and OTP are required"));
        }

        boolean isValid = otpService.verifyOtp(email, otp);
        if (isValid) {
            return ResponseEntity.ok(Map.of("message", "OTP verified successfully"));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid or expired OTP"));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required."));
        }
        
        email = email.trim().toLowerCase();
        if (!authService.checkEmailExists(email)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "No account found with this email address. Please check your spelling or register."));
        }

        try {
            otpService.generateAndSendPasswordResetOtp(email);
            return ResponseEntity.ok(Map.of("message", "A 6-digit verification code has been sent to your email."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unable to send verification email. Please try again later."));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");

        if (email == null || email.isBlank() || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and new password are required."));
        }

        email = email.trim().toLowerCase();

        if (otp == null || otp.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Verification code (OTP) is required."));
        }

        if (newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 6 characters."));
        }

        boolean isValid = otpService.verifyOtp(email, otp.trim());
        if (!isValid) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid or expired verification code. Please check your email or request a new code."));
        }

        AuthResponse response = authService.resetPassword(email, newPassword);
        return ResponseEntity.ok(response);
    }
}
