package com.skillmatchai.service;

import com.skillmatchai.dto.GenerateRoadmapRequest;
import com.skillmatchai.entity.LearningRoadmap;
import com.skillmatchai.exception.ResourceNotFoundException;
import com.skillmatchai.exception.UnauthorizedResourceException;
import com.skillmatchai.repository.LearningRoadmapRepository;
import com.skillmatchai.repository.UserRepository;
import com.skillmatchai.service.ai.RoadmapAIService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class RoadmapService {

    private final LearningRoadmapRepository roadmapRepository;
    private final UserRepository userRepository;
    private final RoadmapAIService roadmapAIService;

    public RoadmapService(LearningRoadmapRepository roadmapRepository, 
                          UserRepository userRepository,
                          RoadmapAIService roadmapAIService) {
        this.roadmapRepository = roadmapRepository;
        this.userRepository = userRepository;
        this.roadmapAIService = roadmapAIService;
    }

    public LearningRoadmap generateRoadmap(GenerateRoadmapRequest request, String userEmail) {
        String userId = resolveUserId(userEmail);

        // Remove any previous roadmap for the same job match to ensure fresh sprint generation
        if (request.getJobMatchId() != null && !request.getJobMatchId().isBlank()) {
            roadmapRepository.findByUserIdOrderByGeneratedAtDesc(userId).stream()
                .filter(r -> request.getJobMatchId().equals(r.getJobMatchId()))
                .forEach(roadmapRepository::delete);
        }

        LearningRoadmap roadmap = new LearningRoadmap();
        roadmap.setUserId(userId);
        roadmap.setJobMatchId(request.getJobMatchId());
        roadmap.setTargetRole(request.getTargetRole());
        roadmap.setProgressPercentage(0);
        roadmap.setGeneratedAt(LocalDateTime.now());

        RoadmapAIService.RoadmapResult aiResult = roadmapAIService.generateRoadmap(
                request.getTargetRole(), 
                request.getSkillGaps(),
                request.getSprintWeeks()
        );

        if (aiResult != null && aiResult.weeks != null) {
            roadmap.setWeeks(aiResult.weeks);
        } else {
            roadmap.setWeeks(new ArrayList<>());
        }
        
        return roadmapRepository.save(roadmap);
    }

    public List<LearningRoadmap> getMyRoadmaps(String userEmail) {
        String userId = resolveUserId(userEmail);
        return roadmapRepository.findByUserIdOrderByGeneratedAtDesc(userId);
    }

    public LearningRoadmap getById(String id, String userEmail) {
        String userId = resolveUserId(userEmail);
        LearningRoadmap roadmap = roadmapRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Roadmap not found"));

        if (!roadmap.getUserId().equals(userId)) {
            throw new UnauthorizedResourceException();
        }
        return roadmap;
    }

    public void deleteRoadmap(String id, String userEmail) {
        LearningRoadmap roadmap = getById(id, userEmail);
        roadmapRepository.delete(roadmap);
    }

    public LearningRoadmap updateProgress(String id, int weekNumber, boolean completed, String userEmail) {
        LearningRoadmap roadmap = getById(id, userEmail);
        
        int totalWeeks = roadmap.getWeeks().size();
        int completedWeeks = 0;

        for (LearningRoadmap.RoadmapWeek week : roadmap.getWeeks()) {
            if (week.getWeekNumber() == weekNumber) {
                week.setCompleted(completed);
            }
            if (week.isCompleted()) {
                completedWeeks++;
            }
        }

        int progress = totalWeeks == 0 ? 0 : (int) Math.round(((double) completedWeeks / totalWeeks) * 100);
        roadmap.setProgressPercentage(progress);

        return roadmapRepository.save(roadmap);
    }

    private String resolveUserId(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."))
                .getId();
    }
}
