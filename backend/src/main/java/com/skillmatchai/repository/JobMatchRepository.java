package com.skillmatchai.repository;

import com.skillmatchai.entity.JobMatch;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobMatchRepository extends MongoRepository<JobMatch, String> {
    List<JobMatch> findByUserIdOrderByAnalyzedAtDesc(String userId);
    List<JobMatch> findByUserIdOrderByOverallScoreDesc(String userId);
}
