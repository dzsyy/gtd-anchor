package com.gtd.service;

import com.gtd.dto.PageResponse;
import com.gtd.dto.ProcessTaskDTO;
import com.gtd.dto.TaskDTO;
import com.gtd.entity.Task;
import com.gtd.entity.TaskStatus;
import com.gtd.exception.TaskNotFoundException;
import com.gtd.repository.TaskRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<TaskDTO> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public PageResponse<TaskDTO> getTasksPaginated(int page, int size) {
        Page<Task> taskPage = taskRepository.findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        List<TaskDTO> dtos = taskPage.getContent().stream().map(this::toDTO).collect(Collectors.toList());
        return new PageResponse<>(dtos, page, size, taskPage.getTotalElements());
    }

    public List<TaskDTO> getTasksByStatus(TaskStatus status) {
        return taskRepository.findByStatusOrderByCreatedAtDesc(status).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public PageResponse<TaskDTO> getTasksByStatusPaginated(TaskStatus status, int page, int size) {
        Page<Task> taskPage = taskRepository.findByStatus(status, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        List<TaskDTO> dtos = taskPage.getContent().stream().map(this::toDTO).collect(Collectors.toList());
        return new PageResponse<>(dtos, page, size, taskPage.getTotalElements());
    }

    public TaskDTO getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
        return toDTO(task);
    }

    @Transactional
    public TaskDTO createTask(TaskDTO taskDTO) {
        Task task = toEntity(taskDTO);
        if (taskDTO.getStatus() == null) {
            task.setStatus(TaskStatus.INBOX);
        }
        Task saved = taskRepository.save(task);
        return toDTO(saved);
    }

    @Transactional
    public List<TaskDTO> batchCreateTasks(List<TaskDTO> taskDTOs) {
        List<Task> tasks = taskDTOs.stream()
                .map(dto -> {
                    Task task = toEntity(dto);
                    if (dto.getStatus() == null) {
                        task.setStatus(TaskStatus.INBOX);
                    }
                    return task;
                })
                .collect(Collectors.toList());
        List<Task> saved = taskRepository.saveAll(tasks);
        return saved.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public TaskDTO updateTask(Long id, TaskDTO taskDTO) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
        updateFields(task, taskDTO);
        Task updated = taskRepository.save(task);
        return toDTO(updated);
    }

    @Transactional
    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new TaskNotFoundException(id);
        }
        taskRepository.deleteById(id);
    }

    @Transactional
    public TaskDTO moveTask(Long id, TaskStatus newStatus) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
        task.setStatus(newStatus);
        Task updated = taskRepository.save(task);
        return toDTO(updated);
    }

    @Transactional
    public TaskDTO processTask(ProcessTaskDTO processDTO) {
        Task task = taskRepository.findById(processDTO.getTaskId())
                .orElseThrow(() -> new TaskNotFoundException(processDTO.getTaskId()));

        if (Boolean.FALSE.equals(processDTO.getActionable())) {
            task.setStatus(TaskStatus.SOMEDAY);
        } else {
            if (Boolean.TRUE.equals(processDTO.getTwoMinutes())) {
                task.setStatus(TaskStatus.DONE);
            } else if (Boolean.TRUE.equals(processDTO.getIsProject())) {
                task.setStatus(TaskStatus.PROJECT);
                task.setIsProject(true);
            } else if (Boolean.TRUE.equals(processDTO.getHasSpecificTime())) {
                task.setDueDate(processDTO.getDueDate());
            } else if (Boolean.FALSE.equals(processDTO.getIsMyTask())) {
                task.setStatus(TaskStatus.WAITING);
                task.setWaitingFor(processDTO.getWaitingFor());
            } else {
                task.setStatus(TaskStatus.CONTEXT);
                task.setContextTag(processDTO.getContextTag());
            }
        }

        Task updated = taskRepository.save(task);
        return toDTO(updated);
    }

    public List<TaskDTO> getSubTasks(Long parentId) {
        return taskRepository.findByParentId(parentId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<TaskDTO> batchUpdateTasks(List<TaskDTO> tasks) {
        List<Task> updatedTasks = tasks.stream()
                .filter(dto -> dto.getId() != null)
                .map(dto -> {
                    Task task = taskRepository.findById(dto.getId())
                            .orElseThrow(() -> new TaskNotFoundException(dto.getId()));
                    updateFields(task, dto);
                    return task;
                })
                .collect(Collectors.toList());
        return taskRepository.saveAll(updatedTasks).stream().map(this::toDTO).collect(Collectors.toList());
    }

    private void updateFields(Task task, TaskDTO dto) {
        if (dto.getTitle() != null) task.setTitle(dto.getTitle());
        if (dto.getDescription() != null) task.setDescription(dto.getDescription());
        if (dto.getStatus() != null) task.setStatus(dto.getStatus());
        if (dto.getPriority() != null) task.setPriority(dto.getPriority());
        if (dto.getContextTag() != null) task.setContextTag(dto.getContextTag());
        if (dto.getEstimatedTime() != null) task.setEstimatedTime(dto.getEstimatedTime());
        if (dto.getDueDate() != null) task.setDueDate(dto.getDueDate());
        if (dto.getParentId() != null) task.setParentId(dto.getParentId());
        if (dto.getWaitingFor() != null) task.setWaitingFor(dto.getWaitingFor());
        if (dto.getIsProject() != null) task.setIsProject(dto.getIsProject());
        if (dto.getNodeLevel() != null) task.setNodeLevel(dto.getNodeLevel());
        if (dto.getIsCompleted() != null) {
            task.setIsCompleted(dto.getIsCompleted());
            task.setCompletedTime(Boolean.TRUE.equals(dto.getIsCompleted()) ? LocalDateTime.now() : null);
        }
        if (dto.getIsSubmitted() != null) task.setIsSubmitted(dto.getIsSubmitted());
    }

    private TaskDTO toDTO(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());
        dto.setContextTag(task.getContextTag());
        dto.setEstimatedTime(task.getEstimatedTime());
        dto.setDueDate(task.getDueDate());
        dto.setParentId(task.getParentId());
        dto.setWaitingFor(task.getWaitingFor());
        dto.setIsProject(task.getIsProject());
        dto.setNodeLevel(task.getNodeLevel());
        dto.setIsCompleted(task.getIsCompleted());
        dto.setIsSubmitted(task.getIsSubmitted());
        dto.setCompletedTime(task.getCompletedTime());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());
        return dto;
    }

    private Task toEntity(TaskDTO dto) {
        Task task = new Task();
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setStatus(dto.getStatus());
        task.setPriority(dto.getPriority());
        task.setContextTag(dto.getContextTag());
        task.setEstimatedTime(dto.getEstimatedTime());
        task.setDueDate(dto.getDueDate());
        task.setParentId(dto.getParentId());
        task.setWaitingFor(dto.getWaitingFor());
        task.setIsProject(dto.getIsProject());
        task.setNodeLevel(dto.getNodeLevel());
        task.setIsCompleted(dto.getIsCompleted());
        return task;
    }
}