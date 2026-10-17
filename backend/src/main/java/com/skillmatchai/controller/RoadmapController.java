package com.skillmatchai.controller;

import com.skillmatchai.dto.GenerateRoadmapRequest;
import com.skillmatchai.entity.LearningRoadmap;
import com.skillmatchai.service.RoadmapService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roadmaps")
public class RoadmapController {

    private final RoadmapService roadmapService;

    public RoadmapController(RoadmapService roadmapService) {
        this.roadmapService = roadmapService;
    }

    @PostMapping("/generate")
    public ResponseEntity<LearningRoadmap> generateRoadmap(
            @RequestBody GenerateRoadmapRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        LearningRoadmap roadmap = roadmapService.generateRoadmap(request, userDetails.getUsername());
        return new ResponseEntity<>(roadmap, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<LearningRoadmap>> getMyRoadmaps(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<LearningRoadmap> roadmaps = roadmapService.getMyRoadmaps(userDetails.getUsername());
        return ResponseEntity.ok(roadmaps);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LearningRoadmap> getRoadmapById(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        LearningRoadmap roadmap = roadmapService.getById(id, userDetails.getUsername());
        return ResponseEntity.ok(roadmap);
    }

    @PutMapping("/{id}/progress")
    public ResponseEntity<LearningRoadmap> updateProgress(
            @PathVariable String id,
            @RequestParam int weekNumber,
            @RequestParam boolean completed,
            @AuthenticationPrincipal UserDetails userDetails) {
        LearningRoadmap roadmap = roadmapService.updateProgress(id, weekNumber, completed, userDetails.getUsername());
        return ResponseEntity.ok(roadmap);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoadmap(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        roadmapService.deleteRoadmap(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
