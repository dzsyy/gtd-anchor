package com.gtd.controller;

import com.gtd.entity.Achievement;
import com.gtd.service.AchievementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/achievement")
@CrossOrigin(origins = "*")
public class AchievementController {

    @Autowired
    private AchievementService achievementService;

    @GetMapping("/list")
    public ResponseEntity<List<Achievement>> list(@RequestParam(required = false) String tag) {
        if (tag != null && !tag.isEmpty()) {
            return ResponseEntity.ok(achievementService.getAchievementsByTag(tag));
        }
        return ResponseEntity.ok(achievementService.getAllAchievements());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Achievement> getById(@PathVariable Long id) {
        return ResponseEntity.ok(achievementService.getById(id));
    }

    @PostMapping("/save")
    public ResponseEntity<Achievement> save(@RequestBody Achievement achievement) {
        return ResponseEntity.ok(achievementService.save(achievement));
    }

    @PutMapping("/update")
    public ResponseEntity<Achievement> update(@RequestBody Achievement achievement) {
        return ResponseEntity.ok(achievementService.update(achievement));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        achievementService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stat/today")
    public ResponseEntity<Map<String, Object>> getTodayStats() {
        return ResponseEntity.ok(achievementService.getTodayStats());
    }
}
