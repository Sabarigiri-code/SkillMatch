package com.skillmatchai.repository;

import com.skillmatchai.entity.SkillGap;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SkillGapRepository extends MongoRepository<SkillGap, String> {
    List<SkillGap> findByUserId(String userId);
}
