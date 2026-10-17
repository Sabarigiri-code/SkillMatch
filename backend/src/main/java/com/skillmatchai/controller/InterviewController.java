package com.skillmatchai.controller;

import com.skillmatchai.dto.EvaluateInterviewRequest;
import com.skillmatchai.dto.GenerateInterviewRequest;
import com.skillmatchai.entity.Interview;
import com.skillmatchai.service.InterviewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @PostMapping("/generate")
    public ResponseEntity<Interview> generateInterview(
            @RequestBody GenerateInterviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Interview interview = interviewService.generateInterview(request, userDetails.getUsername());
        return new ResponseEntity<>(interview, HttpStatus.CREATED);
    }

    @PostMapping("/{id}/evaluate")
    public ResponseEntity<Interview> evaluateInterview(
            @PathVariable String id,
            @RequestBody EvaluateInterviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Interview interview = interviewService.evaluateInterview(id, request, userDetails.getUsername());
        return ResponseEntity.ok(interview);
    }

    @GetMapping("/history")
    public ResponseEntity<List<Interview>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<Interview> history = interviewService.getInterviewHistory(userDetails.getUsername());
        return ResponseEntity.ok(history);
    }
}
