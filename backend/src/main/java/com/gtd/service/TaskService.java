package com.gtd.service;

import com.gtd.dto.ProcessTaskDTO;
import com.gtd.dto.TaskDTO;
import com.gtd.entity.Priority;
import com.gtd.entity.Task;
import com.gtd.entity.TaskStatus;
import com.gtd.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    // 获取所有任务
    public List<TaskDTO> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // 按状态获取任务
    public List<TaskDTO> getTasksByStatus(TaskStatus status) {
        return taskRepository.findByStatusOrderByCreatedAtDesc(status).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // 获取任务
    public TaskDTO getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found: " + id));
        return toDTO(task);
    }

    // 创建任务
    @Transactional
    public TaskDTO createTask(TaskDTO taskDTO) {
        Task task = toEntity(taskDTO);
        task.setStatus(TaskStatus.INBOX); // 默认进入收集箱
        Task saved = taskRepository.save(task);
        return toDTO(saved);
    }

    // 更新任务
    @Transactional
    public TaskDTO updateTask(Long id, TaskDTO taskDTO) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found: " + id));

        task.setTitle(taskDTO.getTitle());
        task.setDescription(taskDTO.getDescription());
        task.setStatus(taskDTO.getStatus());
        task.setPriority(taskDTO.getPriority());
        task.setContextTag(taskDTO.getContextTag());
        task.setEstimatedTime(taskDTO.getEstimatedTime());
        task.setDueDate(taskDTO.getDueDate());
        task.setParentId(taskDTO.getParentId());
        task.setWaitingFor(taskDTO.getWaitingFor());
        task.setIsProject(taskDTO.getIsProject());

        Task updated = taskRepository.save(task);
        return toDTO(updated);
    }

    // 删除任务
    @Transactional
    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    // 移动任务到其他分区
    @Transactional
    public TaskDTO moveTask(Long id, TaskStatus newStatus) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found: " + id));
        task.setStatus(newStatus);
        Task updated = taskRepository.save(task);
        return toDTO(updated);
    }

    // GTD 决策流程处理
    @Transactional
    public TaskDTO processTask(ProcessTaskDTO processDTO) {
        Task task = taskRepository.findById(processDTO.getTaskId())
                .orElseThrow(() -> new RuntimeException("Task not found: " + processDTO.getTaskId()));

        // 决策流程
        if (Boolean.FALSE.equals(processDTO.getActionable())) {
            // 不可行动 -> 参考资料/可能清单/回收箱
            // 暂时放入 someday，后续可选择转换为 reference 或 trash
            task.setStatus(TaskStatus.SOMEDAY);
        } else {
            // 可行动
            if (Boolean.TRUE.equals(processDTO.getTwoMinutes())) {
                // 2分钟内能完成 -> 立即执行（标记为完成）
                task.setStatus(TaskStatus.DONE);
            } else if (Boolean.TRUE.equals(processDTO.getIsProject())) {
                // 需要多步骤 -> 项目清单
                task.setStatus(TaskStatus.PROJECT);
                task.setIsProject(true);
            } else if (processDTO.getHasSpecificTime() != null && processDTO.getHasSpecificTime()) {
                // 有特定时间 -> 保持 inbox，稍后进入日历
                task.setDueDate(processDTO.getDueDate());
            } else if (Boolean.FALSE.equals(processDTO.getIsMyTask())) {
                // 不该我做 -> 等待清单
                task.setStatus(TaskStatus.WAITING);
                task.setWaitingFor(processDTO.getWaitingFor());
            } else {
                // 进入执行清单
                task.setStatus(TaskStatus.CONTEXT);
                task.setContextTag(processDTO.getContextTag());
            }
        }

        Task updated = taskRepository.save(task);
        return toDTO(updated);
    }

    // 获取项目子任务
    public List<TaskDTO> getSubTasks(Long parentId) {
        return taskRepository.findByParentId(parentId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // 转换为 DTO
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
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());
        return dto;
    }

    // 转换为 Entity
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
        return task;
    }
}
