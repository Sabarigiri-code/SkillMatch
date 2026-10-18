package com.skillmatchai.service.matching;

import com.skillmatchai.dto.JobMatchRequest;
import com.skillmatchai.dto.JobMatchResponse;
import com.skillmatchai.entity.Job;
import com.skillmatchai.entity.JobMatch;
import com.skillmatchai.entity.Resume;
import com.skillmatchai.exception.ResourceNotFoundException;
import com.skillmatchai.exception.UnauthorizedResourceException;
import com.skillmatchai.entity.LearningRoadmap;
import com.skillmatchai.repository.JobMatchRepository;
import com.skillmatchai.repository.JobRepository;
import com.skillmatchai.repository.LearningRoadmapRepository;
import com.skillmatchai.repository.ResumeRepository;
import com.skillmatchai.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@SuppressWarnings("null")
public class MatchingService {

    private final JobMatchRepository jobMatchRepository;
    private final JobRepository jobRepository;
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final SkillMatchingEngine skillMatchingEngine;
    private final LearningRoadmapRepository learningRoadmapRepository;

    public MatchingService(JobMatchRepository jobMatchRepository,
                           JobRepository jobRepository,
                           ResumeRepository resumeRepository,
                           UserRepository userRepository,
                           SkillMatchingEngine skillMatchingEngine,
                           LearningRoadmapRepository learningRoadmapRepository) {
        this.jobMatchRepository = jobMatchRepository;
        this.jobRepository = jobRepository;
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
        this.skillMatchingEngine = skillMatchingEngine;
        this.learningRoadmapRepository = learningRoadmapRepository;
    }

    public JobMatchResponse calculateMatch(JobMatchRequest request, String userEmail) {
        String userId = resolveUserId(userEmail);

        Resume resume = resumeRepository.findById(request.getResumeId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!resume.getUserId().equals(userId) || !job.getUserId().equals(userId)) {
            throw new UnauthorizedResourceException();
        }

        // Simulating Candidate Skills from Resume text (since no AI is implemented yet)
        List<String> candidateSkills = resume.getDetectedSkills();
        if (candidateSkills == null || candidateSkills.isEmpty()) {
            candidateSkills = simulateSkillExtraction(resume.getExtractedText(), job.getRequiredSkills(), job.getPreferredSkills());
        }

        JobMatch match = skillMatchingEngine.calculateMatch(
                candidateSkills,
                job.getRequiredSkills(),
                job.getPreferredSkills()
        );

        match.setUserId(userId);
        match.setResumeId(resume.getId());
        match.setJobId(job.getId());
        match.setAnalyzedAt(LocalDateTime.now());

        JobMatch saved = jobMatchRepository.save(match);
        return toResponse(saved);
    }

    public List<JobMatchResponse> getMyMatches(String userEmail) {
        String userId = resolveUserId(userEmail);
        return jobMatchRepository.findByUserIdOrderByAnalyzedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public JobMatchResponse getById(String id, String userEmail) {
        String userId = resolveUserId(userEmail);
        JobMatch match = jobMatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("JobMatch not found"));

        if (!match.getUserId().equals(userId)) {
            throw new UnauthorizedResourceException();
        }

        return toResponse(match);
    }

    public void deleteMatch(String id, String userEmail) {
        String userId = resolveUserId(userEmail);
        JobMatch match = jobMatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("JobMatch not found"));

        if (!match.getUserId().equals(userId)) {
            throw new UnauthorizedResourceException();
        }

        // Delete connected roadmaps for this match
        try {
            List<LearningRoadmap> roadmaps = learningRoadmapRepository.findByJobMatchIdOrderByGeneratedAtDesc(id);
            if (roadmaps != null && !roadmaps.isEmpty()) {
                learningRoadmapRepository.deleteAll(roadmaps);
            }
        } catch (Exception ignored) {}

        // Delete associated Job entity if applicable
        if (match.getJobId() != null) {
            try {
                jobRepository.deleteById(match.getJobId());
            } catch (Exception ignored) {}
        }

        // Delete the match itself
        jobMatchRepository.delete(match);
    }

    private String resolveUserId(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."))
                .getId();
    }

    /**
     * Temporary naive extraction: Look for words in the resume that match the job's skills.
     */
    private List<String> simulateSkillExtraction(String text, List<String> required, List<String> preferred) {
        List<String> extracted = new ArrayList<>();
        if (text == null) return extracted;
        
        String lowerText = text.toLowerCase();
        
        if (required != null) {
            for (String req : required) {
                if (lowerText.contains(req.toLowerCase())) {
                    extracted.add(req);
                }
            }
        }
        if (preferred != null) {
            for (String pref : preferred) {
                if (lowerText.contains(pref.toLowerCase()) && !extracted.contains(pref)) {
                    extracted.add(pref);
                }
            }
        }
        
        return extracted;
    }

    private JobMatchResponse toResponse(JobMatch match) {
        JobMatchResponse resp = new JobMatchResponse();
        resp.setId(match.getId());
        resp.setResumeId(match.getResumeId());
        resp.setJobId(match.getJobId());
        resp.setOverallScore(match.getOverallScore());
        resp.setSkillScore(match.getSkillScore());
        resp.setExperienceScore(match.getExperienceScore());
        resp.setEducationScore(match.getEducationScore());
        resp.setMatchedSkills(match.getMatchedSkills());
        resp.setPartialSkills(match.getPartialSkills());
        resp.setMissingSkills(match.getMissingSkills());
        resp.setSkillGaps(match.getSkillGaps());
        resp.setAnalyzedAt(match.getAnalyzedAt());

        jobRepository.findById(match.getJobId()).ifPresent(job -> {
            resp.setJobTitle(job.getTitle());
            resp.setCompany(job.getCompany());
        });

        return resp;
    }
}
