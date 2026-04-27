package com.gtd.repository;

import com.gtd.entity.Task;
import com.gtd.entity.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByStatus(TaskStatus status);

    List<Task> findByStatusOrderByCreatedAtDesc(TaskStatus status);

    List<Task> findByStatusAndPriority(TaskStatus status, com.gtd.entity.Priority priority);

    List<Task> findByParentId(Long parentId);

    List<Task> findByContextTag(String contextTag);

    List<Task> findByStatusIn(List<TaskStatus> statuses);

    Page<Task> findAll(Pageable pageable);

    Page<Task> findByStatus(TaskStatus status, Pageable pageable);
}