package com.skillmatchai.dto;

import java.util.Map;

public class EvaluateInterviewRequest {
    private Map<String, String> answers; // Question ID -> User Answer
    private Map<String, String> audioData; // Question ID -> Base64 data URL or audio URL
    private Map<String, Integer> audioDurations; // Question ID -> duration in seconds

    public EvaluateInterviewRequest() {}

    public Map<String, String> getAnswers() { return answers; }
    public void setAnswers(Map<String, String> answers) { this.answers = answers; }

    public Map<String, String> getAudioData() { return audioData; }
    public void setAudioData(Map<String, String> audioData) { this.audioData = audioData; }

    public Map<String, Integer> getAudioDurations() { return audioDurations; }
    public void setAudioDurations(Map<String, Integer> audioDurations) { this.audioDurations = audioDurations; }
}
