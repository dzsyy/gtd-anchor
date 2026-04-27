package com.gtd.controller;

import com.gtd.dto.PageResponse;
import com.gtd.dto.ProcessTaskDTO;
import com.gtd.dto.TaskDTO;
import com.gtd.entity.TaskStatus;
import com.gtd.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<List<TaskDTO>> getAllTasks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (page > 0 || size != 20) {
            return ResponseEntity.ok(taskService.getTasksPaginated(page, size).getContent());
        }
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<TaskDTO>> getTasksByStatus(
            @PathVariable TaskStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (page > 0 || size != 20) {
            return ResponseEntity.ok(taskService.getTasksByStatusPaginated(status, page, size).getContent());
        }
        return ResponseEntity.ok(taskService.getTasksByStatus(status));
    }

    @GetMapping("/page")
    public ResponseEntity<PageResponse<TaskDTO>> getTasksPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(taskService.getTasksPaginated(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDTO> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @PostMapping
    public ResponseEntity<TaskDTO> createTask(@RequestBody TaskDTO taskDTO) {
        return ResponseEntity.ok(taskService.createTask(taskDTO));
    }

    @PostMapping("/batch-create")
    public ResponseEntity<List<TaskDTO>> batchCreateTasks(@RequestBody List<TaskDTO> taskDTOs) {
        return ResponseEntity.ok(taskService.batchCreateTasks(taskDTOs));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDTO> updateTask(@PathVariable Long id, @RequestBody TaskDTO taskDTO) {
        return ResponseEntity.ok(taskService.updateTask(id, taskDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/move")
    public ResponseEntity<TaskDTO> moveTask(@PathVariable Long id, @RequestParam TaskStatus status) {
        return ResponseEntity.ok(taskService.moveTask(id, status));
    }

    @PostMapping("/process")
    public ResponseEntity<TaskDTO> processTask(@RequestBody ProcessTaskDTO processDTO) {
        return ResponseEntity.ok(taskService.processTask(processDTO));
    }

    @GetMapping("/{id}/subtasks")
    public ResponseEntity<List<TaskDTO>> getSubTasks(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getSubTasks(id));
    }

    @PutMapping("/batch")
    public ResponseEntity<List<TaskDTO>> batchUpdateTasks(@RequestBody List<TaskDTO> tasks) {
        return ResponseEntity.ok(taskService.batchUpdateTasks(tasks));
    }
}