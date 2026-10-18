package com.skillmatchai.dto;

import java.util.List;
import java.util.Map;

import com.skillmatchai.entity.Resume;

public class ResumeDetailResponse extends ResumeResponse {

    private String extractedText;
    private String aiAnalysisSummary;
    private List<String> verifiedBadges;
    private List<Resume.Experience> experience;
    
    private Map<String, String> skillLevels;
    private List<String> projects;
    private List<String> education;
    private List<String> certifications;

    public ResumeDetailResponse() {}

    public String getExtractedText() { return extractedText; }
    public void setExtractedText(String extractedText) { this.extractedText = extractedText; }

    public String getAiAnalysisSummary() { return aiAnalysisSummary; }
    public void setAiAnalysisSummary(String aiAnalysisSummary) { this.aiAnalysisSummary = aiAnalysisSummary; }

    public List<String> getVerifiedBadges() { return verifiedBadges; }
    public void setVerifiedBadges(List<String> verifiedBadges) { this.verifiedBadges = verifiedBadges; }

    public List<Resume.Experience> getExperience() { return experience; }
    public void setExperience(List<Resume.Experience> experience) { this.experience = experience; }

    public Map<String, String> getSkillLevels() { return skillLevels; }
    public void setSkillLevels(Map<String, String> skillLevels) { this.skillLevels = skillLevels; }
    public List<String> getProjects() { return projects; }
    public void setProjects(List<String> projects) { this.projects = projects; }
    public List<String> getEducation() { return education; }
    public void setEducation(List<String> education) { this.education = education; }
    public List<String> getCertifications() { return certifications; }
    public void setCertifications(List<String> certifications) { this.certifications = certifications; }
    
    private Integer atsScore;
    private String atsFeedback;
    
    public Integer getAtsScore() { return atsScore; }
    public void setAtsScore(Integer atsScore) { this.atsScore = atsScore; }
    
    public String getAtsFeedback() { return atsFeedback; }
    public void setAtsFeedback(String atsFeedback) { this.atsFeedback = atsFeedback; }
}
