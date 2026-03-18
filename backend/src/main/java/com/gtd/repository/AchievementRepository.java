package com.gtd.repository;

import com.gtd.entity.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    List<Achievement> findByIsDeletedOrderByCreateTimeDesc(Integer isDeleted);
    List<Achievement> findByIsDeletedAndTagOrderByCreateTimeDesc(Integer isDeleted, String tag);
    Long countByIsDeletedAndCreateTimeGreaterThan(Integer isDeleted, java.time.LocalDateTime dateTime);
}
