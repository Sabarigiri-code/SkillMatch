package com.skillmatchai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillmatchai.dto.*;
import com.skillmatchai.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class LearningAndProgressIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LearningRoadmapRepository roadmapRepository;

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private InterviewRepository interviewRepository;

    private String userToken;
    private String userId;

    @BeforeEach
    void setUp() throws Exception {
        roadmapRepository.deleteAll();
        assessmentRepository.deleteAll();
        interviewRepository.deleteAll();
        userRepository.deleteAll();

        // Register User
        RegisterRequest req = new RegisterRequest();
        req.setName("Test Learner");
        req.setEmail("learner@example.com");
        req.setPassword("password123");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)));

        // Login User
        LoginRequest login = new LoginRequest();
        login.setEmail("learner@example.com");
        login.setPassword("password123");
        MvcResult res = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(login))).andReturn();
        userToken = objectMapper.readTree(res.getResponse().getContentAsString()).get("token").asText();
        userId = objectMapper.readTree(res.getResponse().getContentAsString()).get("user").get("id").asText();
    }

    @Test
    @DisplayName("Learning Roadmap Lifecycle")
    void testRoadmapLifecycle() throws Exception {
        GenerateRoadmapRequest req = new GenerateRoadmapRequest();
        req.setTargetRole("Backend Developer");
        req.setSkillGaps(Arrays.asList("Spring Boot", "Docker"));

        // Generate Roadmap
        MvcResult createResult = mockMvc.perform(post("/api/roadmaps/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + userToken)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.weeks", hasSize(2)))
                .andExpect(jsonPath("$.progressPercentage").value(0))
                .andReturn();

        String roadmapId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asText();

        // Update Progress
        mockMvc.perform(put("/api/roadmaps/" + roadmapId + "/progress")
                        .param("weekNumber", "1")
                        .param("completed", "true")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.progressPercentage").value(50));
    }

    @Test
    @DisplayName("Assessment Lifecycle")
    void testAssessmentLifecycle() throws Exception {
        GenerateAssessmentRequest req = new GenerateAssessmentRequest();
        req.setSkill("Java");
        req.setDifficulty("INTERMEDIATE");

        // Generate Assessment
        MvcResult createResult = mockMvc.perform(post("/api/assessments/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + userToken)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.questions", hasSize(3)))
                .andReturn();

        String assessmentId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asText();
        String q1Id = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("questions").get(0).get("id").asText();
        String q2Id = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("questions").get(1).get("id").asText();
        String q3Id = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("questions").get(2).get("id").asText();

        // Submit Assessment
        SubmitAssessmentRequest submitReq = new SubmitAssessmentRequest();
        Map<String, String> answers = new HashMap<>();
        answers.put(q1Id, "Language"); // Correct
        answers.put(q2Id, "Option B"); // Wrong (Correct is 'Contract')
        answers.put(q3Id, "manage"); // Correct based on naive contains
        submitReq.setAnswers(answers);

        mockMvc.perform(post("/api/assessments/" + assessmentId + "/submit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + userToken)
                        .content(objectMapper.writeValueAsString(submitReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.score").value(67)); // 2/3 correct
    }

    @Test
    @DisplayName("Interview Lifecycle")
    void testInterviewLifecycle() throws Exception {
        GenerateInterviewRequest req = new GenerateInterviewRequest();
        req.setRole("Java Developer");
        req.setFocusAreas(Arrays.asList("Spring"));

        // Generate Interview
        MvcResult createResult = mockMvc.perform(post("/api/interviews/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + userToken)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.questions", hasSize(2)))
                .andReturn();

        String interviewId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asText();
        String q1Id = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("questions").get(0).get("id").asText();
        String q2Id = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("questions").get(1).get("id").asText();

        // Evaluate Interview
        EvaluateInterviewRequest evaluateReq = new EvaluateInterviewRequest();
        Map<String, String> answers = new HashMap<>();
        answers.put(q1Id, "I led a team of 5 to rebuild the auth system using Spring Security."); // Length > 20 -> 85
        answers.put(q2Id, "Testing."); // Short -> 50
        evaluateReq.setAnswers(answers);

        mockMvc.perform(post("/api/interviews/" + interviewId + "/evaluate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + userToken)
                        .content(objectMapper.writeValueAsString(evaluateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.overallScore").value(68)); // (85+50)/200 * 100
    }

    @Test
    @DisplayName("Progress Tracking")
    void testProgressTracking() throws Exception {
        mockMvc.perform(get("/api/progress")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.overallReadinessScore").exists())
                .andExpect(jsonPath("$.resumeQualityScore").exists());
    }
}
