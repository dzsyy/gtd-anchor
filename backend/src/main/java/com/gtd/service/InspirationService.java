package com.gtd.service;

import com.gtd.entity.Inspiration;
import com.gtd.repository.InspirationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InspirationService {

    @Autowired
    private InspirationRepository inspirationRepository;

    public List<Inspiration> getAllInspirations() {
        return inspirationRepository.findByIsDeletedOrderByCreateTimeDesc(0);
    }

    public List<Inspiration> getInspirationsByTag(String tag) {
        return inspirationRepository.findByIsDeletedAndTagOrderByCreateTimeDesc(0, tag);
    }

    public Inspiration getById(Long id) {
        return inspirationRepository.findById(id).orElse(null);
    }

    @Transactional
    public Inspiration save(Inspiration inspiration) {
        inspiration.setIsArchived(0);
        inspiration.setIsDeleted(0);
        inspiration.setCreateTime(LocalDateTime.now());
        inspiration.setUpdateTime(LocalDateTime.now());
        return inspirationRepository.save(inspiration);
    }

    @Transactional
    public Inspiration update(Inspiration inspiration) {
        inspiration.setUpdateTime(LocalDateTime.now());
        return inspirationRepository.save(inspiration);
    }

    @Transactional
    public void delete(Long id) {
        Inspiration inspiration = inspirationRepository.findById(id).orElse(null);
        if (inspiration != null) {
            inspiration.setIsDeleted(1);
            inspirationRepository.save(inspiration);
        }
    }

    @Transactional
    public void archive(Long id) {
        Inspiration inspiration = inspirationRepository.findById(id).orElse(null);
        if (inspiration != null) {
            inspiration.setIsArchived(1);
            inspirationRepository.save(inspiration);
        }
    }
}
