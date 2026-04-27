package com.gtd.exception;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(TaskNotFoundException.class)
    public Map<String, Object> handleTaskNotFound(TaskNotFoundException ex) {
        return Map.of(
            "success", false,
            "error", ex.getMessage()
        );
    }

    @ExceptionHandler(Exception.class)
    public Map<String, Object> handleGeneral(Exception ex) {
        return Map.of(
            "success", false,
            "error", "Internal server error"
        );
    }
}