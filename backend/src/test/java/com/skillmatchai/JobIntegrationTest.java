package com.skillmatchai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillmatchai.dto.JobRequest;
import com.skillmatchai.dto.LoginRequest;
import com.skillmatchai.dto.RegisterRequest;
import com.skillmatchai.repository.JobRepository;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@SuppressWarnings("null")
class JobIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    private String user1Token;
    private String user2Token;

    @BeforeEach
    void setUp() throws Exception {
        jobRepository.deleteAll();
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

        // Register User 2
        RegisterRequest req2 = new RegisterRequest();
        req2.setName("User Two");
        req2.setEmail("user2@example.com");
        req2.setPassword("password123");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req2)));

        // Login User 2
        LoginRequest login2 = new LoginRequest();
        login2.setEmail("user2@example.com");
        login2.setPassword("password123");
        MvcResult res2 = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(login2))).andReturn();
        user2Token = objectMapper.readTree(res2.getResponse().getContentAsString()).get("token").asText();
    }

    @Test
    @DisplayName("Create, Read, and Delete Job Lifecycle")
    void testJobLifecycle() throws Exception {
        JobRequest req = new JobRequest();
        req.setCompany("Example Technologies");
        req.setJobTitle("Java Developer");
        req.setJobDescription("We are looking for a Java developer...");

        // 1. Create Job
        MvcResult createResult = mockMvc.perform(post("/api/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + user1Token)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.company").value("Example Technologies"))
                .andExpect(jsonPath("$.jobTitle").value("Java Developer"))
                .andExpect(jsonPath("$.jobDescription").value("We are looking for a Java developer..."))
                .andReturn();

        String jobId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asText();

        // 2. Get My Jobs
        mockMvc.perform(get("/api/jobs")
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(jobId));

        // 3. Get Job By Id
        mockMvc.perform(get("/api/jobs/" + jobId)
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(jobId))
                .andExpect(jsonPath("$.company").value("Example Technologies"));

        // 4. Verify Ownership Enforcement (User 2 tries to access User 1's job)
        mockMvc.perform(get("/api/jobs/" + jobId)
                        .header("Authorization", "Bearer " + user2Token))
                .andExpect(status().isForbidden());

        // 5. Delete Job
        mockMvc.perform(delete("/api/jobs/" + jobId)
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk());

        // 6. Verify Deletion
        mockMvc.perform(get("/api/jobs/" + jobId)
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Create Job with Invalid Data")
    void testCreateInvalidJob() throws Exception {
        JobRequest req = new JobRequest();
        req.setCompany(""); // Invalid
        req.setJobTitle(""); // Invalid
        req.setJobDescription(""); // Invalid

        mockMvc.perform(post("/api/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + user1Token)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Company is required")))
                .andExpect(jsonPath("$.message", containsString("Job title is required")));
    }
}
