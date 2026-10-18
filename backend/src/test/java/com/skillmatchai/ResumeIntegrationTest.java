package com.skillmatchai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillmatchai.dto.LoginRequest;
import com.skillmatchai.dto.RegisterRequest;
import com.skillmatchai.repository.ResumeRepository;
import com.skillmatchai.repository.UserRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.io.ByteArrayOutputStream;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@SuppressWarnings("null")
class ResumeIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    private String user1Token;
    private String user2Token;

    @BeforeEach
    void setUp() throws Exception {
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

    private byte[] createSamplePdf() throws Exception {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                contentStream.newLineAtOffset(50, 700);
                contentStream.showText("Jane Doe - Software Engineer - Java, Spring Boot, React, MongoDB");
                contentStream.endText();
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        }
    }

    @Test
    @DisplayName("Upload, Read, and Delete Resume Lifecycle")
    void testResumeLifecycle() throws Exception {
        byte[] pdfBytes = createSamplePdf();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "sample.pdf",
                "application/pdf",
                pdfBytes
        );

        // 1. Upload Resume
        MvcResult uploadResult = mockMvc.perform(multipart("/api/resumes/upload")
                        .file(file)
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.originalFileName").value("sample.pdf"))
                .andExpect(jsonPath("$.contentType").value("application/pdf"))
                .andExpect(jsonPath("$.extractedText", containsString("Jane Doe")))
                .andExpect(jsonPath("$.extractedText", containsString("Java")))
                .andReturn();

        String resumeId = objectMapper.readTree(uploadResult.getResponse().getContentAsString()).get("id").asText();

        // 2. Get My Resumes (List)
        mockMvc.perform(get("/api/resumes")
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(resumeId))
                .andExpect(jsonPath("$[0].extractedText").doesNotExist()); // List view shouldn't have full text

        // 3. Get Resume By Id (Detail)
        mockMvc.perform(get("/api/resumes/" + resumeId)
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(resumeId))
                .andExpect(jsonPath("$.extractedText", containsString("Jane Doe")));

        // 4. Verify Ownership Enforcement (User 2 tries to access User 1's resume)
        mockMvc.perform(get("/api/resumes/" + resumeId)
                        .header("Authorization", "Bearer " + user2Token))
                .andExpect(status().isForbidden());

        // 5. Delete Resume
        mockMvc.perform(delete("/api/resumes/" + resumeId)
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk());

        // 6. Verify Deletion
        mockMvc.perform(get("/api/resumes/" + resumeId)
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Upload Invalid File Type")
    void testUploadInvalidFile() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "malicious.exe",
                "application/x-msdownload",
                "fake-exe-content".getBytes()
        );

        mockMvc.perform(multipart("/api/resumes/upload")
                        .file(file)
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Unsupported file type")));
    }
}
