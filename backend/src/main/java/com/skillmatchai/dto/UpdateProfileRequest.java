package com.skillmatchai.dto;

public class UpdateProfileRequest {
    private String name;
    private String targetRole;
    private String experience;

    public UpdateProfileRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }

    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }
}
