package com.skillmatchai.repository;

import com.skillmatchai.entity.Assessment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentRepository extends MongoRepository<Assessment, String> {
    List<Assessment> findByUserId(String userId);
    List<Assessment> findByUserIdAndSkill(String userId, String skill);
    List<Assessment> findByUserIdOrderByTakenAtDesc(String userId);
    List<Assessment> findByJobMatchId(String jobMatchId);
}
