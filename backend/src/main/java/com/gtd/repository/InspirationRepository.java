package com.gtd.repository;

import com.gtd.entity.Inspiration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InspirationRepository extends JpaRepository<Inspiration, Long> {
    List<Inspiration> findByIsDeletedAndTagOrderByCreateTimeDesc(Integer isDeleted, String tag);
    List<Inspiration> findByIsDeletedOrderByCreateTimeDesc(Integer isDeleted);
    List<Inspiration> findByIsDeletedAndIsArchivedOrderByCreateTimeDesc(Integer isDeleted, Integer isArchived);
}
