package com.gtd.service;

import com.gtd.entity.Material;
import com.gtd.repository.MaterialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MaterialService {

    @Autowired
    private MaterialRepository materialRepository;

    public List<Material> getAllMaterials() {
        return materialRepository.findByIsDeletedOrderByCreateTimeDesc(0);
    }

    public Material getById(Long id) {
        return materialRepository.findById(id).orElse(null);
    }

    @Transactional
    public Material save(Material material) {
        material.setIsDeleted(0);
        material.setCreateTime(LocalDateTime.now());
        material.setUpdateTime(LocalDateTime.now());
        return materialRepository.save(material);
    }

    @Transactional
    public void delete(Long id) {
        Material material = materialRepository.findById(id).orElse(null);
        if (material != null) {
            material.setIsDeleted(1);
            materialRepository.save(material);
        }
    }
}
