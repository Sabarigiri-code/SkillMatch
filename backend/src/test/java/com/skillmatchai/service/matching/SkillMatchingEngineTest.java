package com.skillmatchai.service.matching;

import com.skillmatchai.entity.JobMatch;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class SkillMatchingEngineTest {

    private SkillMatchingEngine engine;

    @BeforeEach
    void setUp() {
        engine = new SkillMatchingEngine(new SkillNormalizer());
    }

    @Test
    @DisplayName("Test matching engine with exact example from requirements")
    void testMatchingEngineWithExample() {
        // Arrange
        List<String> candidateSkills = Arrays.asList("Java", "SQL", "Git");
        List<String> requiredSkills = Arrays.asList("Java", "SQL", "Git", "Spring Boot", "Docker");
        List<String> preferredSkills = Arrays.asList();

        // Act
        JobMatch result = engine.calculateMatch(candidateSkills, requiredSkills, preferredSkills);

        // Assert
        assertEquals(60, result.getSkillScore(), "Skill score should be 60%");
        
        List<String> expectedMatched = Arrays.asList("Java", "SQL", "Git");
        assertTrue(result.getMatchedSkills().containsAll(expectedMatched));
        assertEquals(3, result.getMatchedSkills().size());

        List<String> expectedMissing = Arrays.asList("Spring Boot", "Docker");
        assertTrue(result.getMissingSkills().containsAll(expectedMissing));
        assertEquals(2, result.getMissingSkills().size());
        
        // Assert skill gaps are generated correctly for missing skills
        assertEquals(2, result.getSkillGaps().size());
        boolean hasSpringBootGap = result.getSkillGaps().stream()
                .anyMatch(gap -> gap.getSkill().equals("Spring Boot") && gap.getRequiredLevel().equals("Required"));
        assertTrue(hasSpringBootGap);
    }

    @Test
    @DisplayName("Test matching engine with normalization")
    void testMatchingEngineWithNormalization() {
        // Candidate has 'js', job requires 'JavaScript'
        List<String> candidateSkills = Arrays.asList("js", "react js");
        List<String> requiredSkills = Arrays.asList("JavaScript", "React", "Node.js");
        
        JobMatch result = engine.calculateMatch(candidateSkills, requiredSkills, null);

        assertTrue(result.getMatchedSkills().contains("JavaScript"));
        assertTrue(result.getMatchedSkills().contains("React"));
        assertTrue(result.getMissingSkills().contains("Node.js"));
        assertEquals(67, result.getSkillScore()); // 2 out of 3 = 66.6 -> 67
    }

    @Test
    @DisplayName("Test overall score constraints")
    void testOverallScoreBounds() {
        List<String> candidateSkills = Arrays.asList();
        List<String> requiredSkills = Arrays.asList("Java");
        
        JobMatch result = engine.calculateMatch(candidateSkills, requiredSkills, null);
        assertTrue(result.getOverallScore() >= 0 && result.getOverallScore() <= 100);
        assertEquals(0, result.getSkillScore());

        candidateSkills = Arrays.asList("Java");
        result = engine.calculateMatch(candidateSkills, requiredSkills, null);
        assertTrue(result.getOverallScore() >= 0 && result.getOverallScore() <= 100);
        assertEquals(100, result.getSkillScore());
    }
}
