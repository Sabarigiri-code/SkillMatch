package com.skillmatchai.dto;

import java.util.List;

public class GenerateInterviewRequest {
    private String role;
    private List<String> focusAreas;
    private String jobMatchId;

    public GenerateInterviewRequest() {}

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public List<String> getFocusAreas() { return focusAreas; }
    public void setFocusAreas(List<String> focusAreas) { this.focusAreas = focusAreas; }
    public String getJobMatchId() { return jobMatchId; }
    public void setJobMatchId(String jobMatchId) { this.jobMatchId = jobMatchId; }
}
