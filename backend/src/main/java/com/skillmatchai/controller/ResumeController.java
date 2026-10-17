package com.skillmatchai.controller;

import com.skillmatchai.dto.ResumeDetailResponse;
import com.skillmatchai.dto.ResumeResponse;
import com.skillmatchai.service.resume.ResumeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    /** Upload a resume (PDF or DOCX) */
    @PostMapping("/upload")
    public ResponseEntity<ResumeDetailResponse> upload(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        ResumeDetailResponse response = resumeService.upload(file, userDetails.getUsername());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /** Get all resumes for the authenticated user */
    @GetMapping
    public ResponseEntity<List<ResumeResponse>> getMyResumes(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<ResumeResponse> resumes = resumeService.getMyResumes(userDetails.getUsername());
        return ResponseEntity.ok(resumes);
    }

    /** Get a single resume by ID — ownership enforced in service */
    @GetMapping("/{id}")
    public ResponseEntity<ResumeDetailResponse> getById(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        ResumeDetailResponse resume = resumeService.getById(id, userDetails.getUsername());
        return ResponseEntity.ok(resume);
    }

    /** Delete a resume by ID — ownership enforced in service */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        resumeService.delete(id, userDetails.getUsername());
        return ResponseEntity.ok(Map.of("message", "Resume deleted successfully."));
    }

    /** Tailor a specific bullet point using AI */
    @PostMapping("/{id}/tailor")
    public ResponseEntity<ResumeDetailResponse> tailorBullet(
            @PathVariable String id,
            @jakarta.validation.Valid @RequestBody com.skillmatchai.dto.TailorBulletRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        ResumeDetailResponse updatedResume = resumeService.tailorResumeBullet(
                id, request.getBulletId(), request.getMissingSkill(), userDetails.getUsername()
        );
        return ResponseEntity.ok(updatedResume);
    }
}
