package com.skillmatchai.dto;

public class ProgressResponse {
    private int overallReadinessScore;
    private int resumeQualityScore;
    private int jobCompatibilityScore;
    private int verifiedSkillsScore;
    private int assessmentScore;
    private int interviewScore;
    private int roadmapCompletion;

    public ProgressResponse() {}

    public int getOverallReadinessScore() { return overallReadinessScore; }
    public void setOverallReadinessScore(int overallReadinessScore) { this.overallReadinessScore = overallReadinessScore; }
    public int getResumeQualityScore() { return resumeQualityScore; }
    public void setResumeQualityScore(int resumeQualityScore) { this.resumeQualityScore = resumeQualityScore; }
    public int getJobCompatibilityScore() { return jobCompatibilityScore; }
    public void setJobCompatibilityScore(int jobCompatibilityScore) { this.jobCompatibilityScore = jobCompatibilityScore; }
    public int getVerifiedSkillsScore() { return verifiedSkillsScore; }
    public void setVerifiedSkillsScore(int verifiedSkillsScore) { this.verifiedSkillsScore = verifiedSkillsScore; }
    public int getAssessmentScore() { return assessmentScore; }
    public void setAssessmentScore(int assessmentScore) { this.assessmentScore = assessmentScore; }
    public int getInterviewScore() { return interviewScore; }
    public void setInterviewScore(int interviewScore) { this.interviewScore = interviewScore; }
    public int getRoadmapCompletion() { return roadmapCompletion; }
    public void setRoadmapCompletion(int roadmapCompletion) { this.roadmapCompletion = roadmapCompletion; }
}
