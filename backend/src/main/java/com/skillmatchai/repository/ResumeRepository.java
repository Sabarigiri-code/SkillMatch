package com.skillmatchai.repository;

import com.skillmatchai.entity.Resume;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResumeRepository extends MongoRepository<Resume, String> {
    List<Resume> findByUserId(String userId);
    List<Resume> findByUserIdOrderByUploadedAtDesc(String userId);
    long countByUserId(String userId);
}
