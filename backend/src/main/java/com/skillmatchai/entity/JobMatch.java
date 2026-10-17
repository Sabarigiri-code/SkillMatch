package com.skillmatchai.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "job_matches")
public class JobMatch {

    @Id
    private String id;
    
    @Indexed
    private String userId;
    
    @Indexed
    private String resumeId;
    
    @Indexed
    private String jobId;

    private int overallScore;
    private int skillScore;
    private int experienceScore;
    private int educationScore;

    private List<String> matchedSkills;
    private List<String> partialSkills;
    private List<String> missingSkills;

    private List<MatchSkillGap> skillGaps;

    private LocalDateTime analyzedAt;

    public JobMatch() {}

    public static class MatchSkillGap {
        private String skill;
        private String currentLevel;
        private String requiredLevel;
        private String gap;
        private String priority;

        public MatchSkillGap() {}

        public MatchSkillGap(String skill, String currentLevel, String requiredLevel, String gap, String priority) {
            this.skill = skill;
            this.currentLevel = currentLevel;
            this.requiredLevel = requiredLevel;
            this.gap = gap;
            this.priority = priority;
        }

        // Getters and Setters
        public String getSkill() { return skill; }
        public void setSkill(String skill) { this.skill = skill; }
        public String getCurrentLevel() { return currentLevel; }
        public void setCurrentLevel(String currentLevel) { this.currentLevel = currentLevel; }
        public String getRequiredLevel() { return requiredLevel; }
        public void setRequiredLevel(String requiredLevel) { this.requiredLevel = requiredLevel; }
        public String getGap() { return gap; }
        public void setGap(String gap) { this.gap = gap; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
    }

    // --- Getters & Setters ---

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getResumeId() { return resumeId; }
    public void setResumeId(String resumeId) { this.resumeId = resumeId; }
    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }
    public int getOverallScore() { return overallScore; }
    public void setOverallScore(int overallScore) { this.overallScore = overallScore; }
    public int getSkillScore() { return skillScore; }
    public void setSkillScore(int skillScore) { this.skillScore = skillScore; }
    public int getExperienceScore() { return experienceScore; }
    public void setExperienceScore(int experienceScore) { this.experienceScore = experienceScore; }
    public int getEducationScore() { return educationScore; }
    public void setEducationScore(int educationScore) { this.educationScore = educationScore; }
    public List<String> getMatchedSkills() { return matchedSkills; }
    public void setMatchedSkills(List<String> matchedSkills) { this.matchedSkills = matchedSkills; }
    public List<String> getPartialSkills() { return partialSkills; }
    public void setPartialSkills(List<String> partialSkills) { this.partialSkills = partialSkills; }
    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; }
    public List<MatchSkillGap> getSkillGaps() { return skillGaps; }
    public void setSkillGaps(List<MatchSkillGap> skillGaps) { this.skillGaps = skillGaps; }
    public LocalDateTime getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(LocalDateTime analyzedAt) { this.analyzedAt = analyzedAt; }
}
