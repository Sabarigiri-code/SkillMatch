package com.skillmatchai.repository;

import com.skillmatchai.entity.LearningRoadmap;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LearningRoadmapRepository extends MongoRepository<LearningRoadmap, String> {
    List<LearningRoadmap> findByUserIdOrderByGeneratedAtDesc(String userId);
    Optional<LearningRoadmap> findTopByUserIdOrderByGeneratedAtDesc(String userId);
    List<LearningRoadmap> findByJobMatchIdOrderByGeneratedAtDesc(String jobMatchId);
}
