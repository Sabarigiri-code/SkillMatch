package com.skillmatchai.dto;

import jakarta.validation.constraints.NotBlank;

public class TailorBulletRequest {
    
    @NotBlank(message = "Bullet ID is required")
    private String bulletId;
    
    @NotBlank(message = "Missing skill is required")
    private String missingSkill;
    
    public String getBulletId() { return bulletId; }
    public void setBulletId(String bulletId) { this.bulletId = bulletId; }
    
    public String getMissingSkill() { return missingSkill; }
    public void setMissingSkill(String missingSkill) { this.missingSkill = missingSkill; }
}
