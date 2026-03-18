package com.gtd.controller;

import com.gtd.entity.Inspiration;
import com.gtd.service.InspirationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inspiration")
@CrossOrigin(origins = "*")
public class InspirationController {

    @Autowired
    private InspirationService inspirationService;

    @GetMapping("/list")
    public ResponseEntity<List<Inspiration>> list(@RequestParam(required = false) String tag) {
        if (tag != null && !tag.isEmpty()) {
            return ResponseEntity.ok(inspirationService.getInspirationsByTag(tag));
        }
        return ResponseEntity.ok(inspirationService.getAllInspirations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Inspiration> getById(@PathVariable Long id) {
        return ResponseEntity.ok(inspirationService.getById(id));
    }

    @PostMapping("/save")
    public ResponseEntity<Inspiration> save(@RequestBody Inspiration inspiration) {
        return ResponseEntity.ok(inspirationService.save(inspiration));
    }

    @PutMapping("/update")
    public ResponseEntity<Inspiration> update(@RequestBody Inspiration inspiration) {
        return ResponseEntity.ok(inspirationService.update(inspiration));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        inspirationService.delete(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/to-achievement/{id}")
    public ResponseEntity<Void> toAchievement(@PathVariable Long id) {
        inspirationService.archive(id);
        return ResponseEntity.ok().build();
    }
}
