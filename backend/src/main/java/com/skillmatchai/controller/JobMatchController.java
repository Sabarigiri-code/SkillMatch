package com.skillmatchai.controller;

import com.skillmatchai.dto.JobMatchRequest;
import com.skillmatchai.dto.JobMatchResponse;
import com.skillmatchai.service.matching.MatchingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
public class JobMatchController {

    private final MatchingService matchingService;

    public JobMatchController(MatchingService matchingService) {
        this.matchingService = matchingService;
    }

    @PostMapping
    public ResponseEntity<JobMatchResponse> calculateMatch(
            @Valid @RequestBody JobMatchRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        JobMatchResponse response = matchingService.calculateMatch(request, userDetails.getUsername());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<JobMatchResponse>> getMyMatches(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<JobMatchResponse> responses = matchingService.getMyMatches(userDetails.getUsername());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobMatchResponse> getMatchById(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        JobMatchResponse response = matchingService.getById(id, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMatch(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        matchingService.deleteMatch(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
