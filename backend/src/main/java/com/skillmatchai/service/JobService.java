package com.skillmatchai.service;

import com.skillmatchai.dto.JobRequest;
import com.skillmatchai.dto.JobResponse;
import com.skillmatchai.entity.Job;
import com.skillmatchai.exception.ResourceNotFoundException;
import com.skillmatchai.exception.UnauthorizedResourceException;
import com.skillmatchai.repository.JobRepository;
import com.skillmatchai.repository.UserRepository;
import com.skillmatchai.service.ai.JobAIService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final JobAIService jobAIService;

    public JobService(JobRepository jobRepository, UserRepository userRepository, JobAIService jobAIService) {
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.jobAIService = jobAIService;
    }

    public JobResponse createJob(JobRequest request, String userEmail) {
        String userId = resolveUserId(userEmail);

        Job job = new Job(
                userId,
                request.getCompany(),
                request.getJobTitle(),
                request.getJobDescription()
        );
        
        // AI Analysis
        JobAIService.JobAnalysisResult aiResult = jobAIService.analyzeJob(request.getJobDescription());
        if (aiResult != null && aiResult.requiredSkills != null) {
            job.setRequiredSkills(aiResult.requiredSkills);
            job.setPreferredSkills(aiResult.preferredSkills != null ? aiResult.preferredSkills : new ArrayList<>());
            job.setExperienceRequired(aiResult.experience);
            job.setEducationRequired(aiResult.education);
        } else {
            job.setRequiredSkills(new ArrayList<>());
            job.setPreferredSkills(new ArrayList<>());
        }

        Job saved = jobRepository.save(job);
        return toResponse(saved);
    }

    public List<JobResponse> getMyJobs(String userEmail) {
        String userId = resolveUserId(userEmail);
        return jobRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public JobResponse getById(String id, String userEmail) {
        String userId = resolveUserId(userEmail);
        Job job = findAndVerifyOwnership(id, userId);
        return toResponse(job);
    }

    public void deleteJob(String id, String userEmail) {
        String userId = resolveUserId(userEmail);
        Job job = findAndVerifyOwnership(id, userId);
        jobRepository.deleteById(id);
    }

    private String resolveUserId(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."))
                .getId();
    }

    private Job findAndVerifyOwnership(String id, String userId) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));

        if (!job.getUserId().equals(userId)) {
            throw new UnauthorizedResourceException();
        }
        return job;
    }

    private JobResponse toResponse(Job job) {
        JobResponse response = new JobResponse();
        response.setId(job.getId());
        response.setCompany(job.getCompany());
        response.setJobTitle(job.getTitle());
        response.setJobDescription(job.getDescription());
        response.setRequiredSkills(job.getRequiredSkills());
        response.setPreferredSkills(job.getPreferredSkills());
        response.setExperienceRequired(job.getExperienceRequired());
        response.setEducationRequired(job.getEducationRequired());
        response.setCreatedAt(job.getCreatedAt());
        response.setUpdatedAt(job.getUpdatedAt());
        return response;
    }
}
