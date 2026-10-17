package com.skillmatchai.repository;

import com.skillmatchai.entity.SkillProfile;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SkillProfileRepository extends MongoRepository<SkillProfile, String> {
    List<SkillProfile> findByUserId(String userId);
}
