package com.skillmatchai.service.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillmatchai.service.ai.prompts.PromptTemplates;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ResumeAIService {
    private static final Logger logger = LoggerFactory.getLogger(ResumeAIService.class);
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    public ResumeAIService(GeminiService geminiService, ObjectMapper objectMapper) {
        this.geminiService = geminiService;
        this.objectMapper = objectMapper;
    }

    public ResumeAnalysisResult analyzeResume(String extractedText) {
        if (extractedText == null || extractedText.isBlank()) {
            return new ResumeAnalysisResult();
        }

        String prompt = String.format(PromptTemplates.RESUME_ANALYSIS, extractedText);
        
        try {
            String jsonResponse = geminiService.generateJson(prompt);
            logger.info("RAW GEMINI JSON: \n{}", jsonResponse);
            return objectMapper.readValue(jsonResponse, ResumeAnalysisResult.class);
        } catch (JsonProcessingException e) {
            logger.error("Failed to parse Gemini JSON response for Resume: {}", e.getMessage());
            return new ResumeAnalysisResult(); // graceful fallback
        }
    }

    public TailoredBulletResult tailorBullet(String originalBullet, String missingSkill) {
        String prompt = String.format(PromptTemplates.BULLET_TAILORING, missingSkill, originalBullet);
        try {
            String jsonResponse = geminiService.generateJson(prompt);
            return objectMapper.readValue(jsonResponse, TailoredBulletResult.class);
        } catch (JsonProcessingException e) {
            logger.error("Failed to tailor bullet: {}", e.getMessage());
            return null;
        }
    }

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
    public static class TailoredBulletResult {
        public String optimizedText;
    }

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
    public static class ResumeAnalysisResult {
        public List<String> skills;
        public Map<String, String> skillLevels;
        public List<String> projects;
        public List<String> education;
        public List<com.skillmatchai.entity.Resume.Experience> experience;
        public List<String> certifications;
        public String summary;
        public Integer atsScore;
        public String atsFeedback;
    }
}
