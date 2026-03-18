package com.gtd.service;

import com.gtd.entity.Achievement;
import com.gtd.repository.AchievementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AchievementService {

    @Autowired
    private AchievementRepository achievementRepository;

    public List<Achievement> getAllAchievements() {
        return achievementRepository.findByIsDeletedOrderByCreateTimeDesc(0);
    }

    public List<Achievement> getAchievementsByTag(String tag) {
        return achievementRepository.findByIsDeletedAndTagOrderByCreateTimeDesc(0, tag);
    }

    public Achievement getById(Long id) {
        return achievementRepository.findById(id).orElse(null);
    }

    @Transactional
    public Achievement save(Achievement achievement) {
        achievement.setIsDeleted(0);
        achievement.setCreateTime(LocalDateTime.now());
        achievement.setUpdateTime(LocalDateTime.now());
        return achievementRepository.save(achievement);
    }

    @Transactional
    public Achievement update(Achievement achievement) {
        achievement.setUpdateTime(LocalDateTime.now());
        return achievementRepository.save(achievement);
    }

    @Transactional
    public void delete(Long id) {
        Achievement achievement = achievementRepository.findById(id).orElse(null);
        if (achievement != null) {
            achievement.setIsDeleted(1);
            achievementRepository.save(achievement);
        }
    }

    public Map<String, Object> getTodayStats() {
        Map<String, Object> stats = new HashMap<>();

        // 今日记录的灵感数
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        Long todayInspirationCount = achievementRepository.countByIsDeletedAndCreateTimeGreaterThan(0, startOfDay);

        // 今日成果数
        Long todayAchievementCount = achievementRepository.countByIsDeletedAndCreateTimeGreaterThan(0, startOfDay);

        stats.put("todayInspirations", todayInspirationCount);
        stats.put("todayAchievements", todayAchievementCount);
        stats.put("todayTotal", todayInspirationCount + todayAchievementCount);

        return stats;
    }
}
