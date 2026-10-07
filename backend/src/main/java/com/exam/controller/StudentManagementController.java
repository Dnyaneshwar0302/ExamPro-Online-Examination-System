package com.exam.controller;

import com.exam.model.User;
import com.exam.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin/students")
@CrossOrigin(origins = "http://localhost:3000")
public class StudentManagementController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getStudents() {
        try {
            List<User> users = userRepository.findAll();

            List<Map<String, Object>> students = new ArrayList<>();

            for (User user : users) {
                if (user.getRole() != null &&
                    "STUDENT".equalsIgnoreCase(user.getRole().toString())) {

                    Map<String, Object> student = new LinkedHashMap<>();

                    student.put("id", user.getId());
                    student.put("fullName", user.getFullName());
                    student.put("username", user.getUsername());
                    student.put("email", user.getEmail());
                    student.put("department", user.getDepartment());
                    student.put("createdAt", user.getCreatedAt());
                    student.put("lastLogin", user.getLastLogin());
                    student.put("status", "Active");

                    students.add(student);
                }
            }

            students.sort(
                Comparator.comparing(
                    s -> String.valueOf(s.get("fullName")),
                    String.CASE_INSENSITIVE_ORDER
                )
            );

            return ResponseEntity.ok(students);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                Map.of("error", "Failed to fetch students: " + e.getMessage())
            );
        }
    }
}
