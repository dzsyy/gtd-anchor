package com.gtd.dto;

import java.time.LocalDateTime;

public class ProcessTaskDTO {
    private Long taskId;
    private Boolean actionable;
    private Boolean twoMinutes;
    private Boolean isProject;
    private Boolean hasSpecificTime;
    private Boolean isMyTask;
    private String waitingFor;
    private String contextTag;
    private String referenceContent;
    private LocalDateTime dueDate;

    // Getters and Setters
    public Long getTaskId() { return taskId; }
    public void setTaskId(Long taskId) { this.taskId = taskId; }

    public Boolean getActionable() { return actionable; }
    public void setActionable(Boolean actionable) { this.actionable = actionable; }

    public Boolean getTwoMinutes() { return twoMinutes; }
    public void setTwoMinutes(Boolean twoMinutes) { this.twoMinutes = twoMinutes; }

    public Boolean getIsProject() { return isProject; }
    public void setIsProject(Boolean isProject) { this.isProject = isProject; }

    public Boolean getHasSpecificTime() { return hasSpecificTime; }
    public void setHasSpecificTime(Boolean hasSpecificTime) { this.hasSpecificTime = hasSpecificTime; }

    public Boolean getIsMyTask() { return isMyTask; }
    public void setIsMyTask(Boolean isMyTask) { this.isMyTask = isMyTask; }

    public String getWaitingFor() { return waitingFor; }
    public void setWaitingFor(String waitingFor) { this.waitingFor = waitingFor; }

    public String getContextTag() { return contextTag; }
    public void setContextTag(String contextTag) { this.contextTag = contextTag; }

    public String getReferenceContent() { return referenceContent; }
    public void setReferenceContent(String referenceContent) { this.referenceContent = referenceContent; }

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
}
