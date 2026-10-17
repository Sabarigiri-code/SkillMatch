package com.skillmatchai.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class HealthService {

    @Value("${spring.application.name:SkillMatch AI}")
    private String appName;

    public Map<String, String> getHealthStatus() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        status.put("application", "SkillMatch AI");
        return status;
    }
}
