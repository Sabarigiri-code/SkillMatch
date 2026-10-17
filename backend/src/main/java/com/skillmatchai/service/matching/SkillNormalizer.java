package com.skillmatchai.service.matching;

import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class SkillNormalizer {

    private static final Map<String, String> SKILL_DICTIONARY = Map.ofEntries(
            Map.entry("js", "JavaScript"),
            Map.entry("react js", "React"),
            Map.entry("reactjs", "React"),
            Map.entry("node", "Node.js"),
            Map.entry("nodejs", "Node.js"),
            Map.entry("mongo", "MongoDB"),
            Map.entry("rest", "REST API"),
            Map.entry("restful api", "REST API"),
            Map.entry("k8s", "Kubernetes"),
            Map.entry("aws", "Amazon Web Services"),
            Map.entry("gcp", "Google Cloud"),
            Map.entry("ts", "TypeScript")
    );

    /**
     * Normalizes a skill string to a standard form.
     */
    public String normalize(String skill) {
        if (skill == null || skill.isBlank()) {
            return "";
        }
        String lower = skill.trim().toLowerCase();
        return SKILL_DICTIONARY.getOrDefault(lower, skill.trim());
    }
}
