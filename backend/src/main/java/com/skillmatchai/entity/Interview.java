package com.skillmatchai.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "interviews")
public class Interview {

    @Id
    private String id;
    
    @Indexed
    private String userId;
    
    @Indexed
    private String jobMatchId;
    
    private String targetRole;
    private Integer overallScore;
    
    private List<InterviewQuestion> questions;
    private List<String> strengths;
    private List<String> weaknesses;
    
    private LocalDateTime conductedAt;

    public Interview() {}

    public static class InterviewQuestion {
        private String id;
        private String questionText;
        private String expectedAnswer; // Mock criteria
        private String userAnswer;
        private Integer score; // Score for this specific question
        private String feedback;
        private String audioUrl; // Voice recording data or URL
        private Integer audioDuration; // Duration in seconds

        public InterviewQuestion() {}

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getQuestionText() { return questionText; }
        public void setQuestionText(String questionText) { this.questionText = questionText; }
        public String getExpectedAnswer() { return expectedAnswer; }
        public void setExpectedAnswer(String expectedAnswer) { this.expectedAnswer = expectedAnswer; }
        public String getUserAnswer() { return userAnswer; }
        public void setUserAnswer(String userAnswer) { this.userAnswer = userAnswer; }
        public Integer getScore() { return score; }
        public void setScore(Integer score) { this.score = score; }
        public String getFeedback() { return feedback; }
        public void setFeedback(String feedback) { this.feedback = feedback; }
        public String getAudioUrl() { return audioUrl; }
        public void setAudioUrl(String audioUrl) { this.audioUrl = audioUrl; }
        public Integer getAudioDuration() { return audioDuration; }
        public void setAudioDuration(Integer audioDuration) { this.audioDuration = audioDuration; }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getJobMatchId() { return jobMatchId; }
    public void setJobMatchId(String jobMatchId) { this.jobMatchId = jobMatchId; }
    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
    public Integer getOverallScore() { return overallScore; }
    public void setOverallScore(Integer overallScore) { this.overallScore = overallScore; }
    public List<InterviewQuestion> getQuestions() { return questions; }
    public void setQuestions(List<InterviewQuestion> questions) { this.questions = questions; }
    public List<String> getStrengths() { return strengths; }
    public void setStrengths(List<String> strengths) { this.strengths = strengths; }
    public List<String> getWeaknesses() { return weaknesses; }
    public void setWeaknesses(List<String> weaknesses) { this.weaknesses = weaknesses; }
    public LocalDateTime getConductedAt() { return conductedAt; }
    public void setConductedAt(LocalDateTime conductedAt) { this.conductedAt = conductedAt; }
}
