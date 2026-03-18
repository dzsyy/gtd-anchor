package com.gtd.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_skill_particle")
public class SkillParticle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "skill_domain", length = 32, nullable = false)
    private String skillDomain;

    @Column(name = "particle_name", length = 100, nullable = false)
    private String particleName;

    @Column(name = "particle_tip", columnDefinition = "TEXT")
    private String particleTip;

    @Column(name = "is_mastered")
    private Integer isMastered;

    @Column(name = "mastered_time")
    private LocalDateTime masteredTime;

    @Column(name = "create_time")
    private LocalDateTime createTime;

    @Column(name = "update_time")
    private LocalDateTime updateTime;

    @Column(name = "is_deleted")
    private Integer isDeleted;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSkillDomain() { return skillDomain; }
    public void setSkillDomain(String skillDomain) { this.skillDomain = skillDomain; }

    public String getParticleName() { return particleName; }
    public void setParticleName(String particleName) { this.particleName = particleName; }

    public String getParticleTip() { return particleTip; }
    public void setParticleTip(String particleTip) { this.particleTip = particleTip; }

    public Integer getIsMastered() { return isMastered; }
    public void setIsMastered(Integer isMastered) { this.isMastered = isMastered; }

    public LocalDateTime getMasteredTime() { return masteredTime; }
    public void setMasteredTime(LocalDateTime masteredTime) { this.masteredTime = masteredTime; }

    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }

    public LocalDateTime getUpdateTime() { return updateTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }

    public Integer getIsDeleted() { return isDeleted; }
    public void setIsDeleted(Integer isDeleted) { this.isDeleted = isDeleted; }
}
