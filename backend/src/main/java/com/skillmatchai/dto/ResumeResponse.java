package com.skillmatchai.dto;

import java.time.LocalDateTime;
import java.util.List;

/** Safe resume response - never exposes extractedText in list view to keep payload small */
public class ResumeResponse {

    private String id;
    private String originalFileName;
    private String contentType;
    private long fileSizeBytes;
    private int version;
    private List<String> detectedSkills;
    private Integer atsScore;
    private boolean analysisComplete;
    private LocalDateTime uploadedAt;

    public ResumeResponse() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }

    public int getVersion() { return version; }
    public void setVersion(int version) { this.version = version; }

    public List<String> getDetectedSkills() { return detectedSkills; }
    public void setDetectedSkills(List<String> detectedSkills) { this.detectedSkills = detectedSkills; }

    public Integer getAtsScore() { return atsScore; }
    public void setAtsScore(Integer atsScore) { this.atsScore = atsScore; }

    public boolean isAnalysisComplete() { return analysisComplete; }
    public void setAnalysisComplete(boolean analysisComplete) { this.analysisComplete = analysisComplete; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
