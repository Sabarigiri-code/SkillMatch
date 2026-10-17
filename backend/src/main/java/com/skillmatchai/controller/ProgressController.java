package com.skillmatchai.controller;

import com.skillmatchai.dto.ProgressResponse;
import com.skillmatchai.service.CareerReadinessService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final CareerReadinessService careerReadinessService;

    public ProgressController(CareerReadinessService careerReadinessService) {
        this.careerReadinessService = careerReadinessService;
    }

    @GetMapping
    public ResponseEntity<ProgressResponse> getProgress(
            @AuthenticationPrincipal UserDetails userDetails,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String jobMatchId) {
        ProgressResponse response = careerReadinessService.calculateProgress(userDetails.getUsername(), jobMatchId);
        return ResponseEntity.ok(response);
    }
}
