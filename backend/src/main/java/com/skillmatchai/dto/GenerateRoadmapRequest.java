package com.skillmatchai.dto;

import java.util.List;

public class GenerateRoadmapRequest {
    private String targetRole;
    private List<String> skillGaps;
    private String jobMatchId;
    private Integer sprintWeeks;

    public GenerateRoadmapRequest() {}

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
    public List<String> getSkillGaps() { return skillGaps; }
    public void setSkillGaps(List<String> skillGaps) { this.skillGaps = skillGaps; }
    public String getJobMatchId() { return jobMatchId; }
    public void setJobMatchId(String jobMatchId) { this.jobMatchId = jobMatchId; }
    public Integer getSprintWeeks() { return sprintWeeks; }
    public void setSprintWeeks(Integer sprintWeeks) { this.sprintWeeks = sprintWeeks; }
}
