package com.skillmatchai.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Document(collection = "resumes")
public class Resume {

    @Id
    private String id;
    @Indexed
    private String userId;

    private String originalFileName;
    private String contentType;
    private long fileSizeBytes;
    private String storagePath;
    private String extractedText;
    private int version = 1;

    private List<String> detectedSkills;
    private String aiAnalysisSummary;
    private List<String> verifiedBadges;
    private List<Experience> experience;
    
    private Map<String, String> skillLevels;
    private List<String> projects;
    private List<String> education;
    private List<String> certifications;

    private Integer atsScore;
    private String atsFeedback;

    private LocalDateTime uploadedAt;

    public Resume() {}

    public Resume(String userId, String originalFileName, String contentType,
                  long fileSizeBytes, String storagePath, String extractedText) {
        this.userId = userId;
        this.originalFileName = originalFileName;
        this.contentType = contentType;
        this.fileSizeBytes = fileSizeBytes;
        this.storagePath = storagePath;
        this.extractedText = extractedText;
        this.uploadedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    public long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }
    public String getStoragePath() { return storagePath; }
    public void setStoragePath(String storagePath) { this.storagePath = storagePath; }
    public String getExtractedText() { return extractedText; }
    public void setExtractedText(String extractedText) { this.extractedText = extractedText; }
    public int getVersion() { return version; }
    public void setVersion(int version) { this.version = version; }
    public List<String> getDetectedSkills() { return detectedSkills; }
    public void setDetectedSkills(List<String> detectedSkills) { this.detectedSkills = detectedSkills; }
    public String getAiAnalysisSummary() { return aiAnalysisSummary; }
    public void setAiAnalysisSummary(String aiAnalysisSummary) { this.aiAnalysisSummary = aiAnalysisSummary; }
    public List<String> getVerifiedBadges() { return verifiedBadges; }
    public void setVerifiedBadges(List<String> verifiedBadges) { this.verifiedBadges = verifiedBadges; }
    public List<Experience> getExperience() { return experience; }
    public void setExperience(List<Experience> experience) { this.experience = experience; }
    public Map<String, String> getSkillLevels() { return skillLevels; }
    public void setSkillLevels(Map<String, String> skillLevels) { this.skillLevels = skillLevels; }
    public List<String> getProjects() { return projects; }
    public void setProjects(List<String> projects) { this.projects = projects; }
    public List<String> getEducation() { return education; }
    public void setEducation(List<String> education) { this.education = education; }
    public List<String> getCertifications() { return certifications; }
    public void setCertifications(List<String> certifications) { this.certifications = certifications; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }

    public Integer getAtsScore() { return atsScore; }
    public void setAtsScore(Integer atsScore) { this.atsScore = atsScore; }
    public String getAtsFeedback() { return atsFeedback; }
    public void setAtsFeedback(String atsFeedback) { this.atsFeedback = atsFeedback; }

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
    public static class Experience {
        private String company;
        private String role;
        private List<ResumeBullet> bullets;
        public String getCompany() { return company; }
        public void setCompany(String company) { this.company = company; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public List<ResumeBullet> getBullets() { return bullets; }
        public void setBullets(List<ResumeBullet> bullets) { this.bullets = bullets; }
    }

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
    public static class ResumeBullet {
        private String id;
        private String originalText;
        private String optimizedText;
        private List<String> injectedSkills;
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getOriginalText() { return originalText; }
        public void setOriginalText(String originalText) { this.originalText = originalText; }
        public String getOptimizedText() { return optimizedText; }
        public void setOptimizedText(String optimizedText) { this.optimizedText = optimizedText; }
        public List<String> getInjectedSkills() { return injectedSkills; }
        public void setInjectedSkills(List<String> injectedSkills) { this.injectedSkills = injectedSkills; }
    }
}
