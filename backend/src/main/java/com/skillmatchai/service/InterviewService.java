package com.skillmatchai.service;

import com.skillmatchai.dto.EvaluateInterviewRequest;
import com.skillmatchai.dto.GenerateInterviewRequest;
import com.skillmatchai.entity.Interview;
import com.skillmatchai.exception.ResourceNotFoundException;
import com.skillmatchai.exception.UnauthorizedResourceException;
import com.skillmatchai.repository.InterviewRepository;
import com.skillmatchai.repository.UserRepository;
import com.skillmatchai.service.ai.InterviewAIService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final UserRepository userRepository;
    private final InterviewAIService interviewAIService;

    public InterviewService(InterviewRepository interviewRepository, 
                            UserRepository userRepository,
                            InterviewAIService interviewAIService) {
        this.interviewRepository = interviewRepository;
        this.userRepository = userRepository;
        this.interviewAIService = interviewAIService;
    }

    public Interview generateInterview(GenerateInterviewRequest request, String userEmail) {
        String userId = resolveUserId(userEmail);

        Interview interview = new Interview();
        interview.setUserId(userId);
        interview.setJobMatchId(request.getJobMatchId());
        interview.setTargetRole(request.getRole());
        interview.setConductedAt(LocalDateTime.now());
        interview.setOverallScore(0);

        InterviewAIService.InterviewGenResult aiResult = interviewAIService.generateInterview(
                request.getRole(), 
                request.getFocusAreas()
        );

        if (aiResult != null && aiResult.questions != null) {
            for (Interview.InterviewQuestion q : aiResult.questions) {
                q.setId(UUID.randomUUID().toString());
            }
            interview.setQuestions(aiResult.questions);
        } else {
            interview.setQuestions(new ArrayList<>());
        }

        return interviewRepository.save(interview);
    }

    public Interview evaluateInterview(String id, EvaluateInterviewRequest request, String userEmail) {
        String userId = resolveUserId(userEmail);
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found"));

        if (!interview.getUserId().equals(userId)) {
            throw new UnauthorizedResourceException();
        }

        // Apply answers and audio recordings
        for (Interview.InterviewQuestion q : interview.getQuestions()) {
            if (request.getAnswers() != null && request.getAnswers().containsKey(q.getId())) {
                q.setUserAnswer(request.getAnswers().get(q.getId()));
            }
            if (request.getAudioData() != null && request.getAudioData().containsKey(q.getId())) {
                q.setAudioUrl(request.getAudioData().get(q.getId()));
            }
            if (request.getAudioDurations() != null && request.getAudioDurations().containsKey(q.getId())) {
                q.setAudioDuration(request.getAudioDurations().get(q.getId()));
            }
        }

        // AI Evaluation
        InterviewAIService.InterviewEvalResult evalResult = interviewAIService.evaluateInterview(
                interview.getTargetRole(), 
                interview.getQuestions()
        );

        if (evalResult != null) {
            interview.setOverallScore(evalResult.overallScore != null ? evalResult.overallScore : 0);
            interview.setStrengths(evalResult.strengths != null ? evalResult.strengths : java.util.Collections.emptyList());
            interview.setWeaknesses(evalResult.weaknesses != null ? evalResult.weaknesses : java.util.Collections.emptyList());
            
            List<Interview.InterviewQuestion> questions = interview.getQuestions();
            if (questions != null) {
                for (int i = 0; i < questions.size(); i++) {
                    Interview.InterviewQuestion q = questions.get(i);
                    Integer qScore = null;
                    String qFeedback = null;

                    if (evalResult.questionScores != null && i < evalResult.questionScores.size()) {
                        InterviewAIService.QuestionScore qs = evalResult.questionScores.get(i);
                        if (qs != null) {
                            qScore = qs.score;
                            qFeedback = qs.feedback;
                        }
                    }

                    boolean isAnswerBlank = q.getUserAnswer() == null || q.getUserAnswer().trim().isEmpty();
                    if (qScore == null) {
                        if (isAnswerBlank || (evalResult.overallScore != null && evalResult.overallScore == 0)) {
                            qScore = 0;
                        } else {
                            qScore = evalResult.overallScore != null ? evalResult.overallScore : 0;
                        }
                    }

                    if (qFeedback == null || qFeedback.trim().isEmpty()) {
                        if (isAnswerBlank || qScore == 0) {
                            qFeedback = "No substantive technical answer was provided to demonstrate proficiency on this question. Review the sample answer to learn the expected concepts, complexity analysis, and implementation details.";
                        } else {
                            qFeedback = evalResult.suggestions != null ? evalResult.suggestions : "Good attempt. Review the model answer to identify additional optimizations.";
                        }
                    }

                    q.setScore(qScore);
                    q.setFeedback(qFeedback);
                }
            }
        }

        return interviewRepository.save(interview);
    }

    public List<Interview> getInterviewHistory(String userEmail) {
        String userId = resolveUserId(userEmail);
        return interviewRepository.findByUserIdOrderByConductedAtDesc(userId);
    }

    private String resolveUserId(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."))
                .getId();
    }
}
