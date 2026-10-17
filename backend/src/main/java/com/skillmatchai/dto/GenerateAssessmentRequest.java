package com.skillmatchai.dto;

import java.util.List;

public class GenerateAssessmentRequest {
    private String skill;            // Single skill for DAILY assessments
    private List<String> skills;     // Multiple skills for WEEKLY_FULL assessments
    private String difficulty;       // BEGINNER, INTERMEDIATE, ADVANCED
    private String companyName;      // Company context (e.g., "Wipro")
    private String jobTitle;         // Job title context
    private String jobDescription;   // Full JD text for company-specific pattern generation
    private String assessmentType;   // "DAILY" or "WEEKLY_FULL"
    private String jobMatchId;

    public GenerateAssessmentRequest() {}

    public String getSkill() { return skill; }
    public void setSkill(String skill) { this.skill = skill; }
    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public String getJobDescription() { return jobDescription; }
    public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }
    public String getAssessmentType() { return assessmentType; }
    public void setAssessmentType(String assessmentType) { this.assessmentType = assessmentType; }
    public String getJobMatchId() { return jobMatchId; }
    public void setJobMatchId(String jobMatchId) { this.jobMatchId = jobMatchId; }
}
