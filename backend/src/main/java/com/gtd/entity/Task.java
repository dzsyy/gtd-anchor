package com.gtd.entity;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private TaskStatus status = TaskStatus.INBOX;

    @Enumerated(EnumType.STRING)
    private Priority priority;

    private String contextTag;

    private Integer estimatedTime;

    private LocalDateTime dueDate;

    @Column(name = "parent_id")
    private Long parentId;

    private String waitingFor;

    @Column(name = "is_project")
    private Boolean isProject = false;

    // 碎碎锚扩展字段
    @Column(name = "node_level")
    private Integer nodeLevel;  // 0-根节点, 1-里程碑, 2-模块, 3-粉末节点

    @Column(name = "is_completed")
    private Boolean isCompleted = false;  // 是否完成（仅粉末节点可标记）

    @Column(name = "completed_time")
    private LocalDateTime completedTime;  // 完成时间

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus status) { this.status = status; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public String getContextTag() { return contextTag; }
    public void setContextTag(String contextTag) { this.contextTag = contextTag; }

    public Integer getEstimatedTime() { return estimatedTime; }
    public void setEstimatedTime(Integer estimatedTime) { this.estimatedTime = estimatedTime; }

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }

    public String getWaitingFor() { return waitingFor; }
    public void setWaitingFor(String waitingFor) { this.waitingFor = waitingFor; }

    public Boolean getIsProject() { return isProject; }
    public void setIsProject(Boolean isProject) { this.isProject = isProject; }

    public Integer getNodeLevel() { return nodeLevel; }
    public void setNodeLevel(Integer nodeLevel) { this.nodeLevel = nodeLevel; }

    public Boolean getIsCompleted() { return isCompleted; }
    public void setIsCompleted(Boolean isCompleted) { this.isCompleted = isCompleted; }

    public LocalDateTime getCompletedTime() { return completedTime; }
    public void setCompletedTime(LocalDateTime completedTime) { this.completedTime = completedTime; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
