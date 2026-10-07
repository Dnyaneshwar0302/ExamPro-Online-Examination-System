package com.exam.controller;

import com.exam.model.Exam;
import com.exam.model.Question;
import com.exam.repository.ExamRepository;
import com.exam.repository.QuestionRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin/questions")
@CrossOrigin(origins = "http://localhost:3000")
public class QuestionBankController {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private ExamRepository examRepository;

    @GetMapping
    public ResponseEntity<?> getAllQuestions() {
        try {
            List<Question> questions = questionRepository.findAll();
            List<Map<String, Object>> response = new ArrayList<>();

            for (Question q : questions) {
                response.add(toResponse(q));
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to fetch questions: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createQuestion(@RequestBody Map<String, Object> data) {
        try {
            Long examId = toLong(data.get("examId"));

            if (examId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Please select an examination."));
            }

            Optional<Exam> examOptional = examRepository.findById(examId);
            if (examOptional.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Selected examination was not found."));
            }

            String questionText = text(data.get("questionText"));
            if (questionText.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Question text is required."));
            }

            Question question = new Question();
            copyFields(question, data);
            question.setExam(examOptional.get());

            Question saved = questionRepository.save(question);

            return ResponseEntity.ok(Map.of(
                    "message", "Question created successfully",
                    "question", toResponse(saved)
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to create question: " + e.getMessage()));
        }
    }

    @PutMapping("/{questionId}")
    public ResponseEntity<?> updateQuestion(
            @PathVariable Long questionId,
            @RequestBody Map<String, Object> data) {

        try {
            Optional<Question> questionOptional = questionRepository.findById(questionId);

            if (questionOptional.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Question question = questionOptional.get();

            Long examId = toLong(data.get("examId"));
            if (examId != null) {
                Optional<Exam> examOptional = examRepository.findById(examId);

                if (examOptional.isEmpty()) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Selected examination was not found."));
                }

                question.setExam(examOptional.get());
            }

            String questionText = text(data.get("questionText"));
            if (questionText.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Question text is required."));
            }

            copyFields(question, data);

            Question saved = questionRepository.save(question);

            return ResponseEntity.ok(Map.of(
                    "message", "Question updated successfully",
                    "question", toResponse(saved)
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to update question: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{questionId}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long questionId) {
        try {
            if (!questionRepository.existsById(questionId)) {
                return ResponseEntity.notFound().build();
            }

            questionRepository.deleteById(questionId);

            return ResponseEntity.ok(
                    Map.of("message", "Question deleted successfully")
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to delete question: " + e.getMessage()));
        }
    }

    private void copyFields(Question question, Map<String, Object> data) {
        question.setQuestionText(text(data.get("questionText")));
        question.setQuestionType(text(data.get("questionType")).isBlank()
                ? "MCQ"
                : text(data.get("questionType")));
        question.setOptionA(text(data.get("optionA")));
        question.setOptionB(text(data.get("optionB")));
        question.setOptionC(text(data.get("optionC")));
        question.setOptionD(text(data.get("optionD")));
        question.setCorrectAnswer(text(data.get("correctAnswer")));
        question.setMarks(toInteger(data.get("marks")));
        question.setProblemStatement(text(data.get("problemStatement")));
        question.setSampleInput(text(data.get("sampleInput")));
        question.setSampleOutput(text(data.get("sampleOutput")));
        question.setTestCases(text(data.get("testCases")));
    }

    private Map<String, Object> toResponse(Question q) {
        Map<String, Object> item = new LinkedHashMap<>();

        item.put("id", q.getId());
        item.put("questionText", q.getQuestionText());
        item.put("questionType", q.getQuestionType());
        item.put("optionA", q.getOptionA());
        item.put("optionB", q.getOptionB());
        item.put("optionC", q.getOptionC());
        item.put("optionD", q.getOptionD());
        item.put("correctAnswer", q.getCorrectAnswer());
        item.put("marks", q.getMarks());
        item.put("problemStatement", q.getProblemStatement());
        item.put("sampleInput", q.getSampleInput());
        item.put("sampleOutput", q.getSampleOutput());
        item.put("testCases", q.getTestCases());

        if (q.getExam() != null) {
            item.put("examId", q.getExam().getId());
            item.put("examTitle", q.getExam().getTitle());
        } else {
            item.put("examId", null);
            item.put("examTitle", "Unassigned");
        }

        return item;
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private Long toLong(Object value) {
        if (value == null || String.valueOf(value).isBlank()) {
            return null;
        }

        try {
            return Long.valueOf(String.valueOf(value));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Integer toInteger(Object value) {
        if (value == null || String.valueOf(value).isBlank()) {
            return 0;
        }

        try {
            return Integer.valueOf(String.valueOf(value));
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
