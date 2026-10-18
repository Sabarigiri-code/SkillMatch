package com.skillmatchai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillmatchai.dto.JobMatchRequest;
import com.skillmatchai.dto.LoginRequest;
import com.skillmatchai.dto.RegisterRequest;
import com.skillmatchai.entity.Job;
import com.skillmatchai.entity.Resume;
import com.skillmatchai.repository.JobMatchRepository;
import com.skillmatchai.repository.JobRepository;
import com.skillmatchai.repository.ResumeRepository;
import com.skillmatchai.repository.UserRepository;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@SuppressWarnings("null")
class JobMatchIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private JobMatchRepository jobMatchRepository;

    private String user1Token;
    private String user1Id;
    private String user2Token;

    @BeforeEach
    void setUp() throws Exception {
        jobMatchRepository.deleteAll();
        jobRepository.deleteAll();
        resumeRepository.deleteAll();
        userRepository.deleteAll();

        // Register User 1
        RegisterRequest req1 = new RegisterRequest();
        req1.setName("User One");
        req1.setEmail("user1@example.com");
        req1.setPassword("password123");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req1)));

        // Login User 1
        LoginRequest login1 = new LoginRequest();
        login1.setEmail("user1@example.com");
        login1.setPassword("password123");
        MvcResult res1 = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(login1))).andReturn();
        user1Token = objectMapper.readTree(res1.getResponse().getContentAsString()).get("token").asText();
        user1Id = objectMapper.readTree(res1.getResponse().getContentAsString()).get("user").get("id").asText();

        // Register User 2
        RegisterRequest req2 = new RegisterRequest();
        req2.setName("User Two");
        req2.setEmail("user2@example.com");
        req2.setPassword("password123");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req2)));

        LoginRequest login2 = new LoginRequest();
        login2.setEmail("user2@example.com");
        login2.setPassword("password123");
        MvcResult res2 = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(login2))).andReturn();
        user2Token = objectMapper.readTree(res2.getResponse().getContentAsString()).get("token").asText();
    }

    @Test
    @DisplayName("Calculate match, read list, and verify unauthorized access")
    void testMatchingLifecycle() throws Exception {
        // Create Mock Resume for User 1
        Resume resume = new Resume(user1Id, "myresume.pdf", "application/pdf", 1024, "path", "I know Java, SQL, and Git.");
        // explicitly set detected skills to mimic parsing
        resume.setDetectedSkills(Arrays.asList("Java", "SQL", "Git"));
        resume = resumeRepository.save(resume);

        // Create Mock Job for User 1
        Job job = new Job(user1Id, "Acme", "Developer", "Need Java, SQL, Git, Spring Boot, Docker");
        job.setRequiredSkills(Arrays.asList("Java", "SQL", "Git", "Spring Boot", "Docker"));
        job = jobRepository.save(job);

        // Calculate Match
        JobMatchRequest req = new JobMatchRequest();
        req.setResumeId(resume.getId());
        req.setJobId(job.getId());

        MvcResult createResult = mockMvc.perform(post("/api/matches")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + user1Token)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.skillScore").value(60))
                .andExpect(jsonPath("$.matchedSkills", hasSize(3)))
                .andExpect(jsonPath("$.missingSkills", hasSize(2)))
                .andReturn();

        String matchId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asText();

        // Get My Matches
        mockMvc.perform(get("/api/matches")
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(matchId));

        // Get Match By Id
        mockMvc.perform(get("/api/matches/" + matchId)
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(matchId));

        // Verify Ownership (User 2 should fail)
        mockMvc.perform(get("/api/matches/" + matchId)
                        .header("Authorization", "Bearer " + user2Token))
                .andExpect(status().isForbidden());
    }
}
