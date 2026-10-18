package com.skillmatchai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillmatchai.dto.LoginRequest;
import com.skillmatchai.dto.RegisterRequest;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@SuppressWarnings("null")
class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    // ──────────────────────────────────────────────────────────
    // REGISTRATION TESTS
    // ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/auth/register - Success (201)")
    void shouldRegisterSuccessfully() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setName("Test User");
        request.setEmail("test@example.com");
        request.setPassword("securepassword");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.name").value("Test User"))
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/auth/register - Duplicate email (409)")
    void shouldReturn409OnDuplicateEmail() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setName("Test User");
        request.setEmail("duplicate@example.com");
        request.setPassword("securepassword");

        // First registration
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Second registration with same email
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    @DisplayName("POST /api/auth/register - Validation failure (400)")
    void shouldReturn400OnInvalidRegistration() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setName("");
        request.setEmail("not-an-email");
        request.setPassword("short");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // ──────────────────────────────────────────────────────────
    // LOGIN TESTS
    // ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/auth/login - Success (200) returns JWT")
    void shouldLoginSuccessfully() throws Exception {
        // Register first
        RegisterRequest reg = new RegisterRequest();
        reg.setName("Login Test");
        reg.setEmail("login@example.com");
        reg.setPassword("mypassword1");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reg)));

        // Login
        LoginRequest login = new LoginRequest();
        login.setEmail("login@example.com");
        login.setPassword("mypassword1");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.email").value("login@example.com"))
                .andExpect(jsonPath("$.user.passwordHash").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/auth/login - Invalid password (401)")
    void shouldReturn401OnWrongPassword() throws Exception {
        // Register
        RegisterRequest reg = new RegisterRequest();
        reg.setName("Wrong Pass");
        reg.setEmail("wrongpass@example.com");
        reg.setPassword("correctpassword");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reg)));

        // Login with wrong password
        LoginRequest login = new LoginRequest();
        login.setEmail("wrongpass@example.com");
        login.setPassword("wrongpassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized());
    }

    // ──────────────────────────────────────────────────────────
    // PROTECTED ENDPOINT TESTS
    // ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/users/me - No token (401)")
    void shouldReturn401WithoutToken() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/users/me - Valid token (200)")
    void shouldReturnCurrentUserWithValidToken() throws Exception {
        // Register
        RegisterRequest reg = new RegisterRequest();
        reg.setName("Me Test");
        reg.setEmail("metest@example.com");
        reg.setPassword("mepassword1");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reg)));

        // Login and extract token
        LoginRequest login = new LoginRequest();
        login.setEmail("metest@example.com");
        login.setPassword("mepassword1");

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = loginResult.getResponse().getContentAsString();
        String token = objectMapper.readTree(responseBody).get("token").asText();

        // Access protected endpoint
        mockMvc.perform(get("/api/users/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("metest@example.com"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    @DisplayName("GET /api/health - Public endpoint (200)")
    void shouldAllowHealthCheckWithoutAuth() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }
}
