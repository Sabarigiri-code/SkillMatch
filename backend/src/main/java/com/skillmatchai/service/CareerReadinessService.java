package com.skillmatchai.service;

import com.skillmatchai.dto.ProgressResponse;
import com.skillmatchai.entity.Assessment;
import com.skillmatchai.entity.Interview;
import com.skillmatchai.entity.JobMatch;
import com.skillmatchai.entity.LearningRoadmap;
import com.skillmatchai.exception.ResourceNotFoundException;
import com.skillmatchai.repository.AssessmentRepository;
import com.skillmatchai.repository.InterviewRepository;
import com.skillmatchai.repository.JobMatchRepository;
import com.skillmatchai.repository.LearningRoadmapRepository;
import com.skillmatchai.repository.UserRepository;
import com.skillmatchai.repository.ResumeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CareerReadinessService {

    private final UserRepository userRepository;
    private final JobMatchRepository jobMatchRepository;
    private final AssessmentRepository assessmentRepository;
    private final InterviewRepository interviewRepository;
    private final LearningRoadmapRepository roadmapRepository;
    private final ResumeRepository resumeRepository;

    public CareerReadinessService(UserRepository userRepository,
                                  JobMatchRepository jobMatchRepository,
                                  AssessmentRepository assessmentRepository,
                                  InterviewRepository interviewRepository,
                                  LearningRoadmapRepository roadmapRepository,
                                  ResumeRepository resumeRepository) {
        this.userRepository = userRepository;
        this.jobMatchRepository = jobMatchRepository;
        this.assessmentRepository = assessmentRepository;
        this.interviewRepository = interviewRepository;
        this.roadmapRepository = roadmapRepository;
        this.resumeRepository = resumeRepository;
    }

    public ProgressResponse calculateProgress(String userEmail, String jobMatchId) {
        String userId = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"))
                .getId();

        ProgressResponse response = new ProgressResponse();

        int resumeQuality = 0;
        int jobCompatibility = 0;
        List<Assessment> assessments;
        List<Interview> interviews;
        List<LearningRoadmap> roadmaps;

        if (jobMatchId != null && !jobMatchId.isBlank()) {
            JobMatch match = jobMatchRepository.findById(jobMatchId)
                    .orElseThrow(() -> new ResourceNotFoundException("Job Match not found"));
            
            jobCompatibility = match.getOverallScore();
            
            com.skillmatchai.entity.Resume resume = resumeRepository.findById(match.getResumeId())
                    .orElse(null);
            if (resume != null && resume.getAtsScore() != null) {
                resumeQuality = resume.getAtsScore();
            } else if (resume != null) {
                resumeQuality = 80;
            }
            
            assessments = assessmentRepository.findByJobMatchId(jobMatchId);
            interviews = interviewRepository.findByJobMatchIdOrderByConductedAtDesc(jobMatchId);
            roadmaps = roadmapRepository.findByJobMatchIdOrderByGeneratedAtDesc(jobMatchId);
        } else {
            long resumeCount = resumeRepository.countByUserId(userId);
            resumeQuality = (resumeCount > 0) ? 80 : 0;
            
            List<JobMatch> matches = jobMatchRepository.findByUserIdOrderByAnalyzedAtDesc(userId);
            jobCompatibility = matches.isEmpty() ? 0 : 
                    (int) matches.stream().mapToInt(JobMatch::getOverallScore).average().orElse(0);
            
            assessments = assessmentRepository.findByUserId(userId);
            interviews = interviewRepository.findByUserIdOrderByConductedAtDesc(userId);
            roadmaps = roadmapRepository.findByUserIdOrderByGeneratedAtDesc(userId);
        }

        int assessmentScore = assessments.isEmpty() ? 0 :
                (int) assessments.stream().mapToInt(Assessment::getScore).average().orElse(0);

        int interviewScore = interviews.isEmpty() ? 0 :
                (int) interviews.stream().mapToInt(Interview::getOverallScore).average().orElse(0);

        int verifiedSkills = assessments.isEmpty() ? 0 : assessmentScore;

        int roadmapCompletion = roadmaps.isEmpty() ? 0 :
                (int) roadmaps.stream().mapToInt(LearningRoadmap::getProgressPercentage).average().orElse(0);

        int overallScore = (int) Math.round(
                (resumeQuality * 0.20) +
                (jobCompatibility * 0.30) +
                (verifiedSkills * 0.20) +
                (assessmentScore * 0.15) +
                (interviewScore * 0.15)
        );

        response.setResumeQualityScore(resumeQuality);
        response.setJobCompatibilityScore(jobCompatibility);
        response.setAssessmentScore(assessmentScore);
        response.setInterviewScore(interviewScore);
        response.setVerifiedSkillsScore(verifiedSkills);
        response.setRoadmapCompletion(roadmapCompletion);
        response.setOverallReadinessScore(Math.min(100, Math.max(0, overallScore)));

        return response;
    }
}
