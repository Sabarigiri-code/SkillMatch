package com.skillmatchai.service.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillmatchai.entity.LearningRoadmap;
import com.skillmatchai.service.ai.prompts.PromptTemplates;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoadmapAIService {
    private static final Logger logger = LoggerFactory.getLogger(RoadmapAIService.class);
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    public RoadmapAIService(GeminiService geminiService, ObjectMapper objectMapper) {
        this.geminiService = geminiService;
        this.objectMapper = objectMapper;
    }

    public RoadmapResult generateRoadmap(String targetRole, List<String> skillGaps) {
        return generateRoadmap(targetRole, skillGaps, 3);
    }

    public RoadmapResult generateRoadmap(String targetRole, List<String> skillGaps, Integer sprintWeeks) {
        int weeks = (sprintWeeks != null && sprintWeeks > 0) ? sprintWeeks : 3;
        int days = Math.min(28, Math.max(14, weeks * 7));
        int count = (skillGaps != null) ? skillGaps.size() : 0;
        
        // Build a numbered list so Gemini clearly sees each skill gap as a separate item
        StringBuilder numberedGaps = new StringBuilder();
        if (skillGaps != null) {
            for (int i = 0; i < skillGaps.size(); i++) {
                numberedGaps.append(i + 1).append(". ").append(skillGaps.get(i));
                if (i < skillGaps.size() - 1) numberedGaps.append(", ");
            }
        }
        String gapsStr = numberedGaps.toString();
        String prompt = String.format(PromptTemplates.ROADMAP_GENERATION, targetRole, gapsStr, weeks, days, weeks, weeks);
        logger.info("Generating {}-day ({}-week) campus placement sprint roadmap for role '{}' across {} skills: {}", 
                days, weeks, targetRole, count, gapsStr);
        
        try {
            String rawResponse = geminiService.generateJson(prompt);
            // Strip markdown fences if present
            String jsonResponse = rawResponse
                .replaceAll("(?s)```json\\s*", "")
                .replaceAll("(?s)```\\s*", "")
                .trim();
            return objectMapper.readValue(jsonResponse, RoadmapResult.class);
        } catch (JsonProcessingException e) {
            logger.error("Failed to parse Gemini JSON response for Roadmap: {}", e.getMessage());
            return new RoadmapResult();
        }
    }

    public static class RoadmapResult {
        public List<LearningRoadmap.RoadmapWeek> weeks;
    }
}
