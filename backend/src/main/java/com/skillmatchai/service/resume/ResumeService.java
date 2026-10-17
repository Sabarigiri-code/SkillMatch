package com.skillmatchai.service.resume;

import com.skillmatchai.dto.ResumeDetailResponse;
import com.skillmatchai.dto.ResumeResponse;
import com.skillmatchai.entity.Resume;
import com.skillmatchai.exception.ResourceNotFoundException;
import com.skillmatchai.exception.UnauthorizedResourceException;
import com.skillmatchai.repository.ResumeRepository;
import com.skillmatchai.repository.UserRepository;
import com.skillmatchai.service.ai.ResumeAIService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResumeService {

    private static final Logger logger = LoggerFactory.getLogger(ResumeService.class);

    private final ResumeRepository resumeRepository;
    private final ResumeParserService resumeParserService;
    private final StorageService storageService;
    private final UserRepository userRepository;
    private final ResumeAIService resumeAIService;

    public ResumeService(ResumeRepository resumeRepository,
                         ResumeParserService resumeParserService,
                         StorageService storageService,
                         UserRepository userRepository,
                         ResumeAIService resumeAIService) {
        this.resumeRepository = resumeRepository;
        this.resumeParserService = resumeParserService;
        this.storageService = storageService;
        this.userRepository = userRepository;
        this.resumeAIService = resumeAIService;
    }

    public ResumeDetailResponse upload(MultipartFile file, String userEmail) {
        String userId = resolveUserId(userEmail);

        String extractedText = resumeParserService.extractText(file);
        String storagePath = storageService.store(file, userId);

        Resume resume = new Resume(
                userId,
                file.getOriginalFilename(),
                file.getContentType(),
                file.getSize(),
                storagePath,
                extractedText
        );

        // AI Analysis
        ResumeAIService.ResumeAnalysisResult aiResult = resumeAIService.analyzeResume(extractedText);
        if (aiResult != null && aiResult.skills != null) {
            resume.setDetectedSkills(aiResult.skills);
            resume.setAiAnalysisSummary(aiResult.summary);
            resume.setExperience(aiResult.experience);
            resume.setSkillLevels(aiResult.skillLevels);
            resume.setProjects(aiResult.projects);
            resume.setEducation(aiResult.education);
            resume.setCertifications(aiResult.certifications);
            resume.setAtsScore(aiResult.atsScore);
            resume.setAtsFeedback(aiResult.atsFeedback);
        }

        Resume saved = resumeRepository.save(resume);
        return toDetailResponse(saved);
    }

    public List<ResumeResponse> getMyResumes(String userEmail) {
        String userId = resolveUserId(userEmail);
        return resumeRepository.findByUserIdOrderByUploadedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ResumeDetailResponse getById(String id, String userEmail) {
        String userId = resolveUserId(userEmail);
        Resume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + id));

        if (!resume.getUserId().equals(userId)) {
            throw new UnauthorizedResourceException();
        }

        return toDetailResponse(resume);
    }

    public void delete(String id, String userEmail) {
        String userId = resolveUserId(userEmail);
        Resume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + id));

        if (!resume.getUserId().equals(userId)) {
            throw new UnauthorizedResourceException();
        }

        storageService.delete(resume.getStoragePath());
        resumeRepository.deleteById(id);
        logger.info("Resume {} deleted for user {}", id, userId);
    }

    public ResumeDetailResponse tailorResumeBullet(String resumeId, String bulletId, String missingSkill, String userEmail) {
        String userId = resolveUserId(userEmail);
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + resumeId));

        if (!resume.getUserId().equals(userId)) {
            throw new UnauthorizedResourceException();
        }

        if (resume.getExperience() != null) {
            for (Resume.Experience exp : resume.getExperience()) {
                if (exp.getBullets() != null) {
                    for (Resume.ResumeBullet bullet : exp.getBullets()) {
                        if (bulletId.equals(bullet.getId())) {
                            // Call AI to rewrite the bullet
                            ResumeAIService.TailoredBulletResult result = resumeAIService.tailorBullet(
                                    bullet.getOriginalText(), missingSkill
                            );

                            if (result != null && result.optimizedText != null) {
                                bullet.setOptimizedText(result.optimizedText);
                                if (bullet.getInjectedSkills() == null) {
                                    bullet.setInjectedSkills(new java.util.ArrayList<>());
                                }
                                if (!bullet.getInjectedSkills().contains(missingSkill)) {
                                    bullet.getInjectedSkills().add(missingSkill);
                                }
                                resumeRepository.save(resume);
                            }
                            return toDetailResponse(resume);
                        }
                    }
                }
            }
        }
        throw new ResourceNotFoundException("Bullet point not found with id: " + bulletId);
    }

    private String resolveUserId(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."))
                .getId();
    }

    private ResumeResponse toResponse(Resume resume) {
        ResumeResponse response = new ResumeResponse();
        response.setId(resume.getId());
        response.setOriginalFileName(resume.getOriginalFileName());
        response.setContentType(resume.getContentType());
        response.setFileSizeBytes(resume.getFileSizeBytes());
        response.setUploadedAt(resume.getUploadedAt());
        response.setVersion(resume.getVersion());
        response.setDetectedSkills(resume.getDetectedSkills());
        response.setAnalysisComplete(resume.getAiAnalysisSummary() != null);
        response.setAtsScore(resume.getAtsScore());
        return response;
    }

    private ResumeDetailResponse toDetailResponse(Resume resume) {
        ResumeDetailResponse response = new ResumeDetailResponse();
        response.setId(resume.getId());
        response.setOriginalFileName(resume.getOriginalFileName());
        response.setContentType(resume.getContentType());
        response.setFileSizeBytes(resume.getFileSizeBytes());
        response.setUploadedAt(resume.getUploadedAt());
        response.setVersion(resume.getVersion());
        response.setDetectedSkills(resume.getDetectedSkills());
        response.setAnalysisComplete(resume.getAiAnalysisSummary() != null);
        response.setExtractedText(resume.getExtractedText());
        response.setAiAnalysisSummary(resume.getAiAnalysisSummary());
        response.setExperience(resume.getExperience());
        response.setVerifiedBadges(resume.getVerifiedBadges());
        response.setSkillLevels(resume.getSkillLevels());
        response.setProjects(resume.getProjects());
        response.setEducation(resume.getEducation());
        response.setCertifications(resume.getCertifications());
        response.setAtsScore(resume.getAtsScore());
        response.setAtsFeedback(resume.getAtsFeedback());
        return response;
    }
}
