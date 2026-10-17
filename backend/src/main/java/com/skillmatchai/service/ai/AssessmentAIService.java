package com.skillmatchai.service.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillmatchai.entity.Assessment;
import com.skillmatchai.service.ai.prompts.PromptTemplates;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AssessmentAIService {
    private static final Logger logger = LoggerFactory.getLogger(AssessmentAIService.class);
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    public AssessmentAIService(GeminiService geminiService, ObjectMapper objectMapper) {
        this.geminiService = geminiService;
        this.objectMapper = objectMapper;
    }

    /**
     * Generates a DAILY assessment: 20+ MCQs for a single skill.
     */
    public AssessmentResult generateAssessment(String skill, String difficulty) {
        // Note: %s appears 4 times because we repeat skill and difficulty for reinforcement
        String prompt = String.format(PromptTemplates.ASSESSMENT_GENERATION, skill, difficulty, skill, difficulty);
        try {
            String jsonResponse = geminiService.generateJson(prompt);
            return objectMapper.readValue(jsonResponse, AssessmentResult.class);
        } catch (JsonProcessingException e) {
            logger.error("Failed to parse Gemini JSON response for Assessment: {}", e.getMessage());
            return new AssessmentResult();
        }
    }

    /**
     * Generates a WEEKLY FULL-PORTION TEST: 25+ questions across multiple skills with company context.
     */
    public AssessmentResult generateFullAssessment(String companyName, String jobTitle, List<String> skills, String difficulty) {
        String skillsCsv = String.join(", ", skills);
        String prompt = String.format(
            PromptTemplates.FULL_ASSESSMENT_GENERATION,
            companyName, jobTitle, skillsCsv, difficulty,
            companyName,
            companyName, jobTitle, skillsCsv
        );
        try {
            String jsonResponse = geminiService.generateJson(prompt);
            return objectMapper.readValue(jsonResponse, AssessmentResult.class);
        } catch (JsonProcessingException e) {
            logger.error("Failed to parse Gemini JSON response for Full Assessment: {}", e.getMessage());
            return new AssessmentResult();
        }
    }

    public static class AssessmentResult {
        public List<Assessment.AssessmentQuestion> questions;
    }
}
