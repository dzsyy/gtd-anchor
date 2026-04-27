package com.gtd.controller;

import com.gtd.entity.Material;
import com.gtd.service.MaterialService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/material")
public class MaterialController {

    private final MaterialService materialService;

    public MaterialController(MaterialService materialService) {
        this.materialService = materialService;
    }

    @GetMapping("/list")
    public ResponseEntity<List<Material>> list() {
        return ResponseEntity.ok(materialService.getAllMaterials());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Material> getById(@PathVariable Long id) {
        return ResponseEntity.ok(materialService.getById(id));
    }

    @PostMapping("/save")
    public ResponseEntity<Material> save(@RequestBody Material material) {
        return ResponseEntity.ok(materialService.save(material));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        materialService.delete(id);
        return ResponseEntity.ok().build();
    }
}