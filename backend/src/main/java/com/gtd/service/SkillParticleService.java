package com.gtd.service;

import com.gtd.entity.SkillParticle;
import com.gtd.repository.SkillParticleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SkillParticleService {

    @Autowired
    private SkillParticleRepository skillParticleRepository;

    public List<SkillParticle> getAllSkillParticles() {
        return skillParticleRepository.findByIsDeletedOrderByCreateTimeDesc(0);
    }

    public List<SkillParticle> getSkillParticlesByDomain(String skillDomain) {
        return skillParticleRepository.findByIsDeletedAndSkillDomainOrderByCreateTimeDesc(0, skillDomain);
    }

    public SkillParticle getById(Long id) {
        return skillParticleRepository.findById(id).orElse(null);
    }

    @Transactional
    public SkillParticle save(SkillParticle skillParticle) {
        skillParticle.setIsMastered(0);
        skillParticle.setIsDeleted(0);
        skillParticle.setCreateTime(LocalDateTime.now());
        skillParticle.setUpdateTime(LocalDateTime.now());
        return skillParticleRepository.save(skillParticle);
    }

    @Transactional
    public SkillParticle update(SkillParticle skillParticle) {
        skillParticle.setUpdateTime(LocalDateTime.now());
        return skillParticleRepository.save(skillParticle);
    }

    @Transactional
    public void delete(Long id) {
        SkillParticle skillParticle = skillParticleRepository.findById(id).orElse(null);
        if (skillParticle != null) {
            skillParticle.setIsDeleted(1);
            skillParticleRepository.save(skillParticle);
        }
    }

    @Transactional
    public SkillParticle master(Long id) {
        SkillParticle skillParticle = skillParticleRepository.findById(id).orElse(null);
        if (skillParticle != null) {
            skillParticle.setIsMastered(1);
            skillParticle.setMasteredTime(LocalDateTime.now());
            skillParticleRepository.save(skillParticle);
        }
        return skillParticle;
    }
}
