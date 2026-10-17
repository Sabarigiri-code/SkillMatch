package com.skillmatchai.service.matching;

import com.skillmatchai.entity.JobMatch;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SkillMatchingEngine {

    private final SkillNormalizer skillNormalizer;

    public SkillMatchingEngine(SkillNormalizer skillNormalizer) {
        this.skillNormalizer = skillNormalizer;
    }

    public JobMatch calculateMatch(List<String> candidateSkills, List<String> requiredSkills, List<String> preferredSkills) {
        Set<String> normalizedCandidateSkills = candidateSkills.stream()
                .map(skillNormalizer::normalize)
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        List<String> matched = new ArrayList<>();
        List<String> partial = new ArrayList<>();
        List<String> missing = new ArrayList<>();
        List<JobMatch.MatchSkillGap> skillGaps = new ArrayList<>();

        // Score tracking
        int totalRequired = requiredSkills != null ? requiredSkills.size() : 0;
        int matchedRequired = 0;

        if (requiredSkills != null) {
            for (String req : requiredSkills) {
                String normReq = skillNormalizer.normalize(req);
                String normReqLower = normReq.toLowerCase();

                if (normalizedCandidateSkills.contains(normReqLower)) {
                    matched.add(normReq);
                    matchedRequired++;
                } else if (isPartialMatch(normalizedCandidateSkills, normReqLower)) {
                    partial.add(normReq);
                    // Partial gives half credit
                    matchedRequired += 0.5;
                    skillGaps.add(new JobMatch.MatchSkillGap(
                            normReq, "Beginner/Partial", "Required", "Knowledge Gap", "Medium"
                    ));
                } else {
                    missing.add(normReq);
                    skillGaps.add(new JobMatch.MatchSkillGap(
                            normReq, "None", "Required", "Missing Skill", "High"
                    ));
                }
            }
        }

        // Preferred skills are bonus but can be included in missing if desired
        if (preferredSkills != null) {
            for (String pref : preferredSkills) {
                String normPref = skillNormalizer.normalize(pref);
                if (normalizedCandidateSkills.contains(normPref.toLowerCase())) {
                    if (!matched.contains(normPref)) {
                        matched.add(normPref);
                    }
                } else if (!missing.contains(normPref) && !partial.contains(normPref)) {
                    missing.add(normPref);
                    skillGaps.add(new JobMatch.MatchSkillGap(
                            normPref, "None", "Preferred", "Bonus Missing", "Low"
                    ));
                }
            }
        }

        int skillScore = 0;
        if (totalRequired > 0) {
            skillScore = (int) Math.round(((double) matchedRequired / totalRequired) * 100);
            skillScore = Math.min(100, Math.max(0, skillScore)); // clamp between 0-100
        } else {
            // Job AI failed to extract required skills — cannot compute accurate score.
            // Default to 0 to indicate "unknown/insufficient data" rather than falsely showing 100%.
            skillScore = 0;
        }

        // Use the AI-computed skillScore for experience as well (heuristic until AI handles experience)
        int experienceScore = skillScore;
        // Education and additional default to 75 (neutral/fair) instead of 100 to avoid inflating score
        int educationScore = 75;
        int additionalScore = 75;

        // Weighted scoring: Skill Match = 70%, Experience = 20%, Education/Other = 10%
        int overallScore = (int) Math.round((skillScore * 0.70) + (experienceScore * 0.20) + (educationScore * 0.05) + (additionalScore * 0.05));
        overallScore = Math.min(100, Math.max(0, overallScore));

        JobMatch match = new JobMatch();
        match.setSkillScore(skillScore);
        match.setExperienceScore(experienceScore);
        match.setEducationScore(educationScore);
        match.setOverallScore(overallScore);
        match.setMatchedSkills(matched);
        match.setPartialSkills(partial);
        match.setMissingSkills(missing);
        match.setSkillGaps(skillGaps);

        return match;
    }

    private boolean isPartialMatch(Set<String> candidateSkills, String requiredSkillLower) {
        // Simple partial match logic (e.g., candidate has "Java" and required is "JavaScript" - not a match,
        // but if candidate has "React" and required is "React Native", maybe partial).
        // For simplicity, string contains logic
        for (String cSkill : candidateSkills) {
            if (cSkill.contains(requiredSkillLower) || requiredSkillLower.contains(cSkill)) {
                return true;
            }
        }
        return false;
    }
}
