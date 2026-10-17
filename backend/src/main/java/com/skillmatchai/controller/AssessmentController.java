package com.skillmatchai.controller;

import com.skillmatchai.dto.GenerateAssessmentRequest;
import com.skillmatchai.dto.SubmitAssessmentRequest;
import com.skillmatchai.entity.Assessment;
import com.skillmatchai.service.AssessmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {

    private final AssessmentService assessmentService;

    public AssessmentController(AssessmentService assessmentService) {
        this.assessmentService = assessmentService;
    }

    @PostMapping("/generate")
    public ResponseEntity<Assessment> generateAssessment(
            @RequestBody GenerateAssessmentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Assessment assessment = assessmentService.generateAssessment(request, userDetails.getUsername());
        return new ResponseEntity<>(assessment, HttpStatus.CREATED);
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<Assessment> submitAssessment(
            @PathVariable String id,
            @RequestBody SubmitAssessmentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Assessment assessment = assessmentService.submitAssessment(id, request, userDetails.getUsername());
        return ResponseEntity.ok(assessment);
    }

    @GetMapping("/history")
    public ResponseEntity<List<Assessment>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<Assessment> history = assessmentService.getAssessmentHistory(userDetails.getUsername());
        return ResponseEntity.ok(history);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssessment(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        assessmentService.deleteAssessment(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
