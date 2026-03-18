package com.gtd.repository;

import com.gtd.entity.SkillParticle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkillParticleRepository extends JpaRepository<SkillParticle, Long> {
    List<SkillParticle> findByIsDeletedOrderByCreateTimeDesc(Integer isDeleted);
    List<SkillParticle> findByIsDeletedAndSkillDomainOrderByCreateTimeDesc(Integer isDeleted, String skillDomain);
    Long countByIsDeletedAndIsMastered(Integer isDeleted, Integer isMastered);
}
