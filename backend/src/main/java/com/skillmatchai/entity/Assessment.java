package com.skillmatchai.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "assessments")
public class Assessment {

    @Id
    private String id;

    @Indexed
    private String userId;

    @Indexed
    private String jobMatchId;

    private String skill;          // Single skill (DAILY mode)
    private List<String> skills;   // Multi-skill list (WEEKLY_FULL mode)
    private String companyName;    // Company context
    private String jobTitle;       // Job title context
    private String assessmentType; // DAILY or WEEKLY_FULL
    private String difficulty;     // BEGINNER, INTERMEDIATE, ADVANCED
    private Integer score;

    private List<AssessmentQuestion> questions;

    private LocalDateTime takenAt;

    public Assessment() {}

    public static class AssessmentQuestion {
        private String id;
        private String type; // MCQ, coding, scenario
        private String questionText;
        private List<String> options; // For MCQ - 4 options A,B,C,D
        private String correctOption; // Exact text of correct option
        private String explanation;   // Why this is the correct answer
        private String userResponse;
        private boolean isCorrect;
        private String skill;
        private String skillCategory;

        public AssessmentQuestion() {}

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getQuestionText() { return questionText; }
        public void setQuestionText(String questionText) { this.questionText = questionText; }
        public List<String> getOptions() { return options; }
        public void setOptions(List<String> options) { this.options = options; }
        public String getCorrectOption() { return correctOption; }
        public void setCorrectOption(String correctOption) { this.correctOption = correctOption; }
        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }
        public String getUserResponse() { return userResponse; }
        public void setUserResponse(String userResponse) { this.userResponse = userResponse; }
        public boolean isCorrect() { return isCorrect; }
        public void setCorrect(boolean correct) { isCorrect = correct; }
        public String getSkill() { return skill != null ? skill : skillCategory; }
        public void setSkill(String skill) { this.skill = skill; }
        public String getSkillCategory() { return skillCategory != null ? skillCategory : skill; }
        public void setSkillCategory(String skillCategory) { this.skillCategory = skillCategory; }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getJobMatchId() { return jobMatchId; }
    public void setJobMatchId(String jobMatchId) { this.jobMatchId = jobMatchId; }
    public String getSkill() { return skill; }
    public void setSkill(String skill) { this.skill = skill; }
    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public String getAssessmentType() { return assessmentType; }
    public void setAssessmentType(String assessmentType) { this.assessmentType = assessmentType; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public List<AssessmentQuestion> getQuestions() { return questions; }
    public void setQuestions(List<AssessmentQuestion> questions) { this.questions = questions; }
    public LocalDateTime getTakenAt() { return takenAt; }
    public void setTakenAt(LocalDateTime takenAt) { this.takenAt = takenAt; }
}
