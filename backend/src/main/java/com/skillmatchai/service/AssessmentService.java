package com.skillmatchai.service;

import com.skillmatchai.dto.GenerateAssessmentRequest;
import com.skillmatchai.dto.SubmitAssessmentRequest;
import com.skillmatchai.entity.Assessment;
import com.skillmatchai.exception.ResourceNotFoundException;
import com.skillmatchai.exception.UnauthorizedResourceException;
import com.skillmatchai.repository.AssessmentRepository;
import com.skillmatchai.repository.UserRepository;
import com.skillmatchai.service.ai.AssessmentAIService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final UserRepository userRepository;
    private final AssessmentAIService assessmentAIService;

    public AssessmentService(AssessmentRepository assessmentRepository,
                             UserRepository userRepository,
                             AssessmentAIService assessmentAIService) {
        this.assessmentRepository = assessmentRepository;
        this.userRepository = userRepository;
        this.assessmentAIService = assessmentAIService;
    }

    /**
     * Generates a DAILY or WEEKLY_FULL assessment based on the request type.
     */
    public Assessment generateAssessment(GenerateAssessmentRequest request, String userEmail) {
        String userId = resolveUserId(userEmail);

        Assessment assessment = new Assessment();
        assessment.setUserId(userId);
        assessment.setJobMatchId(request.getJobMatchId());
        assessment.setDifficulty(request.getDifficulty() != null ? request.getDifficulty() : "INTERMEDIATE");
        assessment.setTakenAt(LocalDateTime.now());
        assessment.setScore(0);
        assessment.setCompanyName(request.getCompanyName());
        assessment.setJobTitle(request.getJobTitle());

        AssessmentAIService.AssessmentResult aiResult;

        boolean isFullAssessment = "WEEKLY_FULL".equalsIgnoreCase(request.getAssessmentType())
                || (request.getSkills() != null && !request.getSkills().isEmpty());

        if (isFullAssessment) {
            assessment.setAssessmentType("WEEKLY_FULL");
            assessment.setSkills(request.getSkills());

            String company = request.getCompanyName() != null ? request.getCompanyName() : "a top IT company";
            String jobTitle = request.getJobTitle() != null ? request.getJobTitle() : "Software Engineer";
            List<String> skills = request.getSkills();
            String difficulty = request.getDifficulty() != null ? request.getDifficulty() : "INTERMEDIATE";

            aiResult = assessmentAIService.generateFullAssessment(company, jobTitle, skills, difficulty);
        } else {
            assessment.setAssessmentType("DAILY");
            assessment.setSkill(request.getSkill());
            aiResult = assessmentAIService.generateAssessment(request.getSkill(), request.getDifficulty());
        }

        if (aiResult != null && aiResult.questions != null) {
            for (Assessment.AssessmentQuestion q : aiResult.questions) {
                if (q.getId() == null || q.getId().isBlank()) {
                    q.setId(UUID.randomUUID().toString());
                }
            }
            assessment.setQuestions(aiResult.questions);
        } else {
            assessment.setQuestions(new ArrayList<>());
        }

        return assessmentRepository.save(assessment);
    }

    public Assessment submitAssessment(String id, SubmitAssessmentRequest request, String userEmail) {
        String userId = resolveUserId(userEmail);
        Assessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found"));

        if (!assessment.getUserId().equals(userId)) {
            throw new UnauthorizedResourceException();
        }

        int totalQuestions = assessment.getQuestions().size();
        int correctCount = 0;

        for (Assessment.AssessmentQuestion q : assessment.getQuestions()) {
            String userAnswer = request.getAnswers().get(q.getId());
            q.setUserResponse(userAnswer);

            boolean isCorrect = false;
            if (userAnswer != null && q.getCorrectOption() != null) {
                isCorrect = userAnswer.trim().equalsIgnoreCase(q.getCorrectOption().trim());
            }
            q.setCorrect(isCorrect);
            if (isCorrect) correctCount++;
        }

        int finalScore = totalQuestions == 0 ? 0 : (int) Math.round(((double) correctCount / totalQuestions) * 100);
        assessment.setScore(finalScore);

        return assessmentRepository.save(assessment);
    }

    public List<Assessment> getAssessmentHistory(String userEmail) {
        String userId = resolveUserId(userEmail);
        return assessmentRepository.findByUserIdOrderByTakenAtDesc(userId);
    }

    public void deleteAssessment(String id, String userEmail) {
        String userId = resolveUserId(userEmail);
        Assessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found"));

        if (!assessment.getUserId().equals(userId)) {
            throw new UnauthorizedResourceException();
        }

        assessmentRepository.delete(assessment);
    }

    private String resolveUserId(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."))
                .getId();
    }
}
