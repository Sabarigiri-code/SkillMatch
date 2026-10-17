package com.skillmatchai.service.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillmatchai.service.ai.prompts.PromptTemplates;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobAIService {
    private static final Logger logger = LoggerFactory.getLogger(JobAIService.class);
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    public JobAIService(GeminiService geminiService, ObjectMapper objectMapper) {
        this.geminiService = geminiService;
        this.objectMapper = objectMapper;
    }

    public JobAnalysisResult analyzeJob(String jobDescription) {
        String prompt = String.format(PromptTemplates.JOB_ANALYSIS, jobDescription);
        try {
            String rawResponse = geminiService.generateJson(prompt);
            logger.info("RAW JOB AI JSON: {}", rawResponse);
            // Strip any markdown code fences if present
            String jsonResponse = rawResponse
                .replaceAll("(?s)```json\\s*", "")
                .replaceAll("(?s)```\\s*", "")
                .trim();
            return objectMapper.readValue(jsonResponse, JobAnalysisResult.class);
        } catch (JsonProcessingException e) {
            logger.error("Failed to parse Gemini JSON response for Job: {}", e.getMessage());
            return new JobAnalysisResult();
        }
    }

    public static class JobAnalysisResult {
        public String role;
        public List<String> requiredSkills;
        public List<String> preferredSkills;
        public List<String> tools;
        public String experience;
        public String education;
        public List<String> softSkills;
    }
}
