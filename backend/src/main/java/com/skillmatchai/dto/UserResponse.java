package com.skillmatchai.dto;

import com.skillmatchai.entity.Role;

public class UserResponse {

    private String id;
    private String name;
    private String email;
    private Role role;
    private String profilePhoto;
    private String targetRole;
    private String experience;

    public UserResponse() {}

    public UserResponse(String id, String name, String email, Role role, String profilePhoto, String targetRole, String experience) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.profilePhoto = profilePhoto;
        this.targetRole = targetRole;
        this.experience = experience;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getProfilePhoto() { return profilePhoto; }
    public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }

    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }
}

