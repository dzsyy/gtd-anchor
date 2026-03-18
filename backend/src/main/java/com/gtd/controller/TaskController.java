package com.gtd.controller;

import com.gtd.dto.ProcessTaskDTO;
import com.gtd.dto.TaskDTO;
import com.gtd.entity.TaskStatus;
import com.gtd.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    @Autowired
    private TaskService taskService;

    // 获取所有任务
    @GetMapping
    public ResponseEntity<List<TaskDTO>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    // 按状态获取任务
    @GetMapping("/status/{status}")
    public ResponseEntity<List<TaskDTO>> getTasksByStatus(@PathVariable TaskStatus status) {
        return ResponseEntity.ok(taskService.getTasksByStatus(status));
    }

    // 获取单个任务
    @GetMapping("/{id}")
    public ResponseEntity<TaskDTO> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    // 创建任务
    @PostMapping
    public ResponseEntity<TaskDTO> createTask(@RequestBody TaskDTO taskDTO) {
        return ResponseEntity.ok(taskService.createTask(taskDTO));
    }

    // 更新任务
    @PutMapping("/{id}")
    public ResponseEntity<TaskDTO> updateTask(@PathVariable Long id, @RequestBody TaskDTO taskDTO) {
        return ResponseEntity.ok(taskService.updateTask(id, taskDTO));
    }

    // 删除任务
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok().build();
    }

    // 移动任务到其他分区
    @PostMapping("/{id}/move")
    public ResponseEntity<TaskDTO> moveTask(@PathVariable Long id, @RequestParam TaskStatus status) {
        return ResponseEntity.ok(taskService.moveTask(id, status));
    }

    // GTD 决策流程处理
    @PostMapping("/process")
    public ResponseEntity<TaskDTO> processTask(@RequestBody ProcessTaskDTO processDTO) {
        return ResponseEntity.ok(taskService.processTask(processDTO));
    }

    // 获取项目子任务
    @GetMapping("/{id}/subtasks")
    public ResponseEntity<List<TaskDTO>> getSubTasks(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getSubTasks(id));
    }
}
