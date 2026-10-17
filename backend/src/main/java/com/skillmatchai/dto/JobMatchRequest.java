package com.skillmatchai.dto;

import jakarta.validation.constraints.NotBlank;

public class JobMatchRequest {

    @NotBlank(message = "Resume ID is required")
    private String resumeId;

    @NotBlank(message = "Job ID is required")
    private String jobId;

    public JobMatchRequest() {}

    public String getResumeId() { return resumeId; }
    public void setResumeId(String resumeId) { this.resumeId = resumeId; }

    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }
}
