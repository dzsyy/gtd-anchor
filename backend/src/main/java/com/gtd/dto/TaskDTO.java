package com.gtd.dto;

import com.gtd.entity.Priority;
import com.gtd.entity.TaskStatus;

import java.time.LocalDateTime;

public class TaskDTO {
    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private Priority priority;
    private String contextTag;
    private Integer estimatedTime;
    private LocalDateTime dueDate;
    private Long parentId;
    private String waitingFor;
    private Boolean isProject;
    // 碎碎锚扩展字段
    private Integer nodeLevel;
    private Boolean isCompleted;
    private Boolean isSubmitted;
    private LocalDateTime completedTime;
    private LocalDateTime createdAt;
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

    public Boolean getIsSubmitted() { return isSubmitted; }
    public void setIsSubmitted(Boolean isSubmitted) { this.isSubmitted = isSubmitted; }

    public LocalDateTime getCompletedTime() { return completedTime; }
    public void setCompletedTime(LocalDateTime completedTime) { this.completedTime = completedTime; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
