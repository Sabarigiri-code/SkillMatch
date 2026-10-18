package com.skillmatchai.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "progresss")
public class Progress {

    @Id
    private String id;
    @Indexed
    private String userId;
    private Double careerReadinessScore;
    private LocalDateTime recordedAt;

    public Progress() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public Double getCareerReadinessScore() { return careerReadinessScore; }
    public void setCareerReadinessScore(Double careerReadinessScore) { this.careerReadinessScore = careerReadinessScore; }
    public LocalDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(LocalDateTime recordedAt) { this.recordedAt = recordedAt; }

}
