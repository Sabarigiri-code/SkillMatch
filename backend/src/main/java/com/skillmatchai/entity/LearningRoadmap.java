package com.skillmatchai.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "learningroadmaps")
public class LearningRoadmap {

    @Id
    private String id;
    
    @Indexed
    private String userId;
    
    @Indexed
    private String jobMatchId;
    
    private String targetRole;
    private Integer progressPercentage;
    
    private List<RoadmapWeek> weeks;
    
    private LocalDateTime generatedAt;

    public LearningRoadmap() {}

    public static class RoadmapWeek {
        private int weekNumber;
        private String skill;
        private List<String> topics;
        private String estimatedTime;
        private String practicalTask;
        private String project;
        private boolean completed;

        public RoadmapWeek() {}

        public int getWeekNumber() { return weekNumber; }
        public void setWeekNumber(int weekNumber) { this.weekNumber = weekNumber; }
        public String getSkill() { return skill; }
        public void setSkill(String skill) { this.skill = skill; }
        public List<String> getTopics() { return topics; }
        public void setTopics(List<String> topics) { this.topics = topics; }
        public String getEstimatedTime() { return estimatedTime; }
        public void setEstimatedTime(String estimatedTime) { this.estimatedTime = estimatedTime; }
        public String getPracticalTask() { return practicalTask; }
        public void setPracticalTask(String practicalTask) { this.practicalTask = practicalTask; }
        public String getProject() { return project; }
        public void setProject(String project) { this.project = project; }
        public boolean isCompleted() { return completed; }
        public void setCompleted(boolean completed) { this.completed = completed; }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getJobMatchId() { return jobMatchId; }
    public void setJobMatchId(String jobMatchId) { this.jobMatchId = jobMatchId; }
    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
    public Integer getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Integer progressPercentage) { this.progressPercentage = progressPercentage; }
    public List<RoadmapWeek> getWeeks() { return weeks; }
    public void setWeeks(List<RoadmapWeek> weeks) { this.weeks = weeks; }
    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}
