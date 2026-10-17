package com.skillmatchai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class JobRequest {

    @NotBlank(message = "Company is required")
    @Size(max = 500, message = "Company name must not exceed 500 characters")
    private String company;

    @NotBlank(message = "Job title is required")
    @Size(max = 500, message = "Job title must not exceed 500 characters")
    private String jobTitle;

    @NotBlank(message = "Job description is required")
    @Size(max = 50000, message = "Job description is too long")
    private String jobDescription;

    public JobRequest() {}

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getJobDescription() { return jobDescription; }
    public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }
}
