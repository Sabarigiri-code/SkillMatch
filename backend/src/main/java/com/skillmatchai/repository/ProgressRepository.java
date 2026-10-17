package com.skillmatchai.repository;

import com.skillmatchai.entity.Progress;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgressRepository extends MongoRepository<Progress, String> {
    List<Progress> findByUserId(String userId);
    List<Progress> findByUserIdOrderByRecordedAtDesc(String userId);
}
