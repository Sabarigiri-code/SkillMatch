package com.skillmatchai.controller;

import com.skillmatchai.dto.UserResponse;
import com.skillmatchai.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.skillmatchai.dto.ChangePasswordRequest;
import com.skillmatchai.dto.UpdateProfileRequest;
import java.util.Map;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final AuthService authService;

    public UserController(AuthService authService) {
        this.authService = authService;
    }

    /** Gets the currently authenticated user's profile */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        UserResponse user = authService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(user);
    }
    
    /** Updates the currently authenticated user's profile details */
    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateProfileRequest request) {
        UserResponse updatedUser = authService.updateProfile(
                userDetails.getUsername(), 
                request.getName(), 
                request.getTargetRole(), 
                request.getExperience()
        );
        return ResponseEntity.ok(updatedUser);
    }

    /** Updates the currently authenticated user's profile photo */
    @PutMapping("/profile-photo")
    public ResponseEntity<UserResponse> updateProfilePhoto(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {
        String photo = body.get("profilePhoto");
        UserResponse updatedUser = authService.updateProfilePhoto(userDetails.getUsername(), photo);
        return ResponseEntity.ok(updatedUser);
    }

    /** Changes the currently authenticated user's password */
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ChangePasswordRequest request) {
        try {
            authService.changePassword(userDetails.getUsername(), request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

