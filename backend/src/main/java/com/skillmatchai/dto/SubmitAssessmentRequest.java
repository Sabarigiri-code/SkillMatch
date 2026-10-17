package com.skillmatchai.dto;

import java.util.Map;

public class SubmitAssessmentRequest {
    private Map<String, String> answers; // Question ID -> User Answer

    public SubmitAssessmentRequest() {}

    public Map<String, String> getAnswers() { return answers; }
    public void setAnswers(Map<String, String> answers) { this.answers = answers; }
}
