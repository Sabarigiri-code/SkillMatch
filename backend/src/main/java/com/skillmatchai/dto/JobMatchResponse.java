package com.skillmatchai.dto;

import com.skillmatchai.entity.JobMatch;

import java.time.LocalDateTime;
import java.util.List;

public class JobMatchResponse {

    private String id;
    private String resumeId;
    private String jobId;
    private int overallScore;
    private int skillScore;
    private int experienceScore;
    private int educationScore;

    private List<String> matchedSkills;
    private List<String> partialSkills;
    private List<String> missingSkills;

    private List<JobMatch.MatchSkillGap> skillGaps;

    private LocalDateTime analyzedAt;

    public JobMatchResponse() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
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
    public List<JobMatch.MatchSkillGap> getSkillGaps() { return skillGaps; }
    public void setSkillGaps(List<JobMatch.MatchSkillGap> skillGaps) { this.skillGaps = skillGaps; }
    public LocalDateTime getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(LocalDateTime analyzedAt) { this.analyzedAt = analyzedAt; }

    private String jobTitle;
    private String company;

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
}
