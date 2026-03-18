package com.gtd.controller;

import com.gtd.entity.SkillParticle;
import com.gtd.service.SkillParticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skill-particle")
@CrossOrigin(origins = "*")
public class SkillParticleController {

    @Autowired
    private SkillParticleService skillParticleService;

    @GetMapping("/list")
    public ResponseEntity<List<SkillParticle>> list(@RequestParam(required = false) String skillDomain) {
        if (skillDomain != null && !skillDomain.isEmpty()) {
            return ResponseEntity.ok(skillParticleService.getSkillParticlesByDomain(skillDomain));
        }
        return ResponseEntity.ok(skillParticleService.getAllSkillParticles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SkillParticle> getById(@PathVariable Long id) {
        return ResponseEntity.ok(skillParticleService.getById(id));
    }

    @PostMapping("/save")
    public ResponseEntity<SkillParticle> save(@RequestBody SkillParticle skillParticle) {
        return ResponseEntity.ok(skillParticleService.save(skillParticle));
    }

    @PutMapping("/update")
    public ResponseEntity<SkillParticle> update(@RequestBody SkillParticle skillParticle) {
        return ResponseEntity.ok(skillParticleService.update(skillParticle));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        skillParticleService.delete(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/master/{id}")
    public ResponseEntity<SkillParticle> master(@PathVariable Long id) {
        return ResponseEntity.ok(skillParticleService.master(id));
    }
}
