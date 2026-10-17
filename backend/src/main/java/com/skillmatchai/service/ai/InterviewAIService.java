package com.skillmatchai.service.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillmatchai.entity.Interview;
import com.skillmatchai.service.ai.prompts.PromptTemplates;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InterviewAIService {
    private static final Logger logger = LoggerFactory.getLogger(InterviewAIService.class);
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    public InterviewAIService(GeminiService geminiService, ObjectMapper objectMapper) {
        this.geminiService = geminiService;
        this.objectMapper = objectMapper.copy();
        this.objectMapper.configure(com.fasterxml.jackson.core.json.JsonReadFeature.ALLOW_UNESCAPED_CONTROL_CHARS.mappedFeature(), true);
    }

    public InterviewGenResult generateInterview(String role, List<String> focusAreas) {
        String focusStr = focusAreas != null ? String.join(", ", focusAreas) : "general";
        String prompt = String.format(PromptTemplates.INTERVIEW_GENERATION, role, focusStr);
        try {
            String jsonResponse = geminiService.generateJson(prompt);
            return objectMapper.readValue(jsonResponse, InterviewGenResult.class);
        } catch (JsonProcessingException e) {
            logger.error("Failed to parse Gemini JSON response for Interview Gen: {}", e.getMessage());
            return new InterviewGenResult();
        }
    }

    public InterviewEvalResult evaluateInterview(String role, List<Interview.InterviewQuestion> questions) {
        String qaPairs = questions.stream()
                .map(q -> "Q: " + q.getQuestionText() + "\nA: " + q.getUserAnswer())
                .collect(Collectors.joining("\n\n"));
                
        String prompt = String.format(PromptTemplates.INTERVIEW_EVALUATION, role, qaPairs);
        try {
            String jsonResponse = geminiService.generateJson(prompt);
            return objectMapper.readValue(jsonResponse, InterviewEvalResult.class);
        } catch (JsonProcessingException e) {
            logger.error("Failed to parse Gemini JSON response for Interview Eval: {}", e.getMessage());
            return new InterviewEvalResult();
        }
    }

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
    public static class InterviewGenResult {
        public List<Interview.InterviewQuestion> questions;
    }

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
    public static class QuestionScore {
        public Integer score;
        public String feedback;
    }

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
    public static class InterviewEvalResult {
        public Integer overallScore;
        public Integer technicalCorrectness;
        public Integer clarity;
        public Integer completeness;
        public Integer relevance;
        public List<String> strengths;
        public List<String> weaknesses;
        public String suggestions;
        public List<QuestionScore> questionScores;
    }
}
