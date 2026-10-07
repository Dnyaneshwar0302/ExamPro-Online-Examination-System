package com.exam.controller;

import com.exam.model.Result;
import com.exam.repository.ResultRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin/results")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminResultsController {

    @Autowired
    private ResultRepository resultRepository;

    @GetMapping
    public ResponseEntity<?> getAllResults() {
        try {
            List<Result> results = resultRepository.findAll();

            List<Map<String, Object>> response = new ArrayList<>();

            for (Result result : results) {
                Map<String, Object> item = new LinkedHashMap<>();

                item.put("id", result.getId());
                item.put("marksObtained", result.getMarksObtained());
                item.put("totalMarks", result.getTotalMarks());
                item.put("percentage", result.getPercentage());
                item.put("passed", result.getPassed());
                item.put("submissionTime", result.getSubmissionTime());
                item.put("cheatingAttempts", result.getCheatingAttempts());
                item.put("timeTakenSeconds", result.getTimeTakenSeconds());

                if (result.getUser() != null) {
                    item.put("studentId", result.getUser().getId());
                    item.put("studentName", result.getUser().getFullName());
                    item.put("username", result.getUser().getUsername());
                    item.put("email", result.getUser().getEmail());
                    item.put("department", result.getUser().getDepartment());
                } else {
                    item.put("studentId", null);
                    item.put("studentName", "Unknown Student");
                    item.put("username", "");
                    item.put("email", "");
                    item.put("department", "");
                }

                if (result.getExam() != null) {
                    item.put("examId", result.getExam().getId());
                    item.put("examTitle", result.getExam().getTitle());
                    item.put("passingMarks", result.getExam().getPassingMarks());
                } else {
                    item.put("examId", null);
                    item.put("examTitle", "Unknown Examination");
                    item.put("passingMarks", 40);
                }

                response.add(item);
            }

            response.sort((a, b) -> {
                String first = String.valueOf(a.get("submissionTime"));
                String second = String.valueOf(b.get("submissionTime"));
                return second.compareTo(first);
            });

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                Map.of("error", "Failed to fetch results: " + e.getMessage())
            );
        }
    }
}
