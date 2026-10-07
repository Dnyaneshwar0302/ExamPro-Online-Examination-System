package com.exam.controller;



import com.exam.model.Exam;

import com.exam.model.Question;

import com.exam.model.Result;

import com.exam.model.User;

import com.exam.repository.ExamRepository;

import com.exam.repository.QuestionRepository;

import com.exam.repository.ResultRepository;

import com.exam.repository.UserRepository;



import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;



import java.time.LocalDateTime;

import java.util.*;



@RestController

@RequestMapping("/api")

@CrossOrigin(origins = "http://localhost:3000")

public class ExamController {



    @Autowired

    private ExamRepository examRepository;



    @Autowired

    private QuestionRepository questionRepository;



    @Autowired

    private ResultRepository resultRepository;



    @Autowired

    private UserRepository userRepository;

    @Value("${ai.service.url:http://localhost:5000}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();





    // ============================================================

    // HELPER: GET USER ID FROM CURRENT AUTHORIZATION TOKEN

    // ============================================================



    private Long getUserIdFromAuthorizationHeader(String authorization) {



        if (authorization == null || authorization.trim().isEmpty()) {

            return null;

        }



        if (!authorization.startsWith("Bearer ")) {

            return null;

        }



        String token = authorization.substring(7).trim();



        /*

         * Current AuthController generates tokens in this format:

         *

         * jwt-token-<userId>

         *

         * Example:

         * jwt-token-5

         */

        if (!token.startsWith("jwt-token-")) {

            return null;

        }



        String userIdPart = token.substring("jwt-token-".length());



        try {

            return Long.parseLong(userIdPart);

        } catch (NumberFormatException e) {

            return null;

        }

    }





    // ============================================================

    
    // ============================================================
    // CODING EVALUATION HELPERS
    // ============================================================

    private Map<String, Object> evaluateCodingAnswer(
            Question question,
            String code,
            String languageOverride
    ) throws Exception {

        List<Map<String, Object>> testCases =
                parseCodingTestCases(question.getTestCases());

        if (testCases.isEmpty()) {
            return Collections.emptyMap();
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("code", code);
        payload.put("testCases", testCases);
        payload.put(
                "totalMarks",
                question.getMarks() != null
                        ? question.getMarks()
                        : 0
        );
        String language = languageOverride;

        if (language == null || language.trim().isEmpty()) {
            language = question.getProgrammingLanguage();
        }

        if (language == null || language.trim().isEmpty()) {
            language = "Python";
        }

        payload.put("language", language);

        @SuppressWarnings("unchecked")
        Map<String, Object> evaluation =
                restTemplate.postForObject(
                        aiServiceUrl + "/evaluate_code",
                        payload,
                        Map.class
                );

        return evaluation != null
                ? evaluation
                : Collections.emptyMap();
    }

    private List<Map<String, Object>> parseCodingTestCases(
            String testCasesJson
    ) {

        List<Map<String, Object>> parsed =
                new ArrayList<>();

        if (testCasesJson == null
                || testCasesJson.trim().isEmpty()) {
            return parsed;
        }

        String json = testCasesJson.trim();

        if (!json.startsWith("[")
                || !json.endsWith("]")) {
            return parsed;
        }

        /*
         * The Python service stores coding test cases as a simple
         * JSON array of objects:
         *
         * [
         *   {"input":"7","output":"Odd"},
         *   {"input":"8","output":"Even"}
         * ]
         *
         * We parse that small structure here using only the JDK.
         * This avoids requiring Jackson databind in the backend.
         */
        List<String> objects =
                splitJsonObjects(json.substring(1, json.length() - 1));

        for (String object : objects) {

            String input =
                    extractJsonString(object, "input");

            String expectedOutput =
                    extractJsonString(
                            object,
                            "expectedOutput"
                    );

            if (expectedOutput == null) {
                expectedOutput =
                        extractJsonString(
                                object,
                                "output"
                        );
            }

            if (input == null) {
                input = "";
            }

            if (expectedOutput == null) {
                expectedOutput = "";
            }

            Map<String, Object> normalized =
                    new HashMap<>();

            normalized.put("input", input);
            normalized.put(
                    "expectedOutput",
                    expectedOutput
            );

            parsed.add(normalized);
        }

        return parsed;
    }

    private List<String> splitJsonObjects(String content) {

        List<String> objects =
                new ArrayList<>();

        boolean insideString = false;
        boolean escaped = false;
        int depth = 0;
        int start = -1;

        for (int i = 0; i < content.length(); i++) {

            char ch = content.charAt(i);

            if (escaped) {
                escaped = false;
                continue;
            }

            if (ch == '\\' && insideString) {
                escaped = true;
                continue;
            }

            if (ch == '"') {
                insideString = !insideString;
                continue;
            }

            if (insideString) {
                continue;
            }

            if (ch == '{') {

                if (depth == 0) {
                    start = i;
                }

                depth++;

            } else if (ch == '}') {

                depth--;

                if (depth == 0 && start >= 0) {
                    objects.add(
                            content.substring(
                                    start,
                                    i + 1
                            )
                    );
                    start = -1;
                }
            }
        }

        return objects;
    }

    private String extractJsonString(
            String object,
            String key
    ) {

        String search =
                "\"" + key + "\"";

        int keyIndex =
                object.indexOf(search);

        if (keyIndex < 0) {
            return null;
        }

        int colonIndex =
                object.indexOf(
                        ':',
                        keyIndex + search.length()
                );

        if (colonIndex < 0) {
            return null;
        }

        int valueStart = colonIndex + 1;

        while (valueStart < object.length()
                && Character.isWhitespace(
                        object.charAt(valueStart)
                )) {
            valueStart++;
        }

        if (valueStart >= object.length()
                || object.charAt(valueStart) != '"') {
            return null;
        }

        StringBuilder value =
                new StringBuilder();

        boolean escaped = false;

        for (
                int i = valueStart + 1;
                i < object.length();
                i++
        ) {

            char ch = object.charAt(i);

            if (escaped) {

                switch (ch) {

                    case 'n':
                        value.append('\n');
                        break;

                    case 'r':
                        value.append('\r');
                        break;

                    case 't':
                        value.append('\t');
                        break;

                    case 'b':
                        value.append('\b');
                        break;

                    case 'f':
                        value.append('\f');
                        break;

                    case '"':
                        value.append('"');
                        break;

                    case '\\':
                        value.append('\\');
                        break;

                    default:
                        value.append(ch);
                        break;
                }

                escaped = false;

            } else if (ch == '\\') {

                escaped = true;

            } else if (ch == '"') {

                return value.toString();

            } else {

                value.append(ch);
            }
        }

        return null;
    }

    // ============================================================
    // STUDENT - RUN CODING QUESTION
    // ============================================================

    @PostMapping("/student/coding/run")
    public ResponseEntity<?> runCodingQuestion(
            @RequestHeader(
                    value = "Authorization",
                    required = false
            ) String authorization,
            @RequestBody Map<String, Object> request
    ) {

        Map<String, Object> response =
                new HashMap<>();

        try {

            Long userId =
                    getUserIdFromAuthorizationHeader(
                            authorization
                    );

            if (userId == null) {
                response.put("error", "Unauthorized request");
                return ResponseEntity.status(401).body(response);
            }

            Optional<User> userOptional =
                    userRepository.findById(userId);

            if (!userOptional.isPresent()
                    || userOptional.get().getRole() == null
                    || !"STUDENT".equalsIgnoreCase(
                            userOptional.get().getRole()
                    )) {

                response.put(
                        "error",
                        "Only students can run coding questions"
                );

                return ResponseEntity.status(403).body(response);
            }

            Object questionIdObject =
                    request.get("questionId");

            if (questionIdObject == null) {
                response.put(
                        "error",
                        "Question ID is required"
                );
                return ResponseEntity.badRequest().body(response);
            }

            Long questionId =
                    Long.parseLong(
                            questionIdObject.toString()
                    );

            Optional<Question> questionOptional =
                    questionRepository.findById(questionId);

            if (!questionOptional.isPresent()) {
                response.put(
                        "error",
                        "Coding question not found"
                );
                return ResponseEntity.badRequest().body(response);
            }

            Question question = questionOptional.get();

            if (!"CODING".equalsIgnoreCase(
                    question.getQuestionType()
            )) {

                response.put(
                        "error",
                        "The selected question is not a coding question"
                );

                return ResponseEntity.badRequest().body(response);
            }

            String code =
                    request.get("code") != null
                            ? request.get("code").toString()
                            : "";

            if (code.trim().isEmpty()) {
                response.put("error", "Code is required");
                return ResponseEntity.badRequest().body(response);
            }

            List<Map<String, Object>> allTestCases =
                    parseCodingTestCases(
                            question.getTestCases()
                    );

            if (allTestCases.isEmpty()) {
                response.put(
                        "error",
                        "No test cases are configured for this question"
                );
                return ResponseEntity.badRequest().body(response);
            }

            List<Map<String, Object>> sampleTest =
                    new ArrayList<>();

            sampleTest.add(allTestCases.get(0));

            Map<String, Object> payload =
                    new HashMap<>();

            payload.put("code", code);
            payload.put("testCases", sampleTest);
            payload.put(
                    "totalMarks",
                    question.getMarks() != null
                            ? question.getMarks()
                            : 0
            );
            String selectedLanguage =
                    request.get("language") != null
                            ? request.get("language").toString().trim()
                            : null;

            if (selectedLanguage == null || selectedLanguage.isEmpty()) {
                selectedLanguage = question.getProgrammingLanguage();
            }

            if (selectedLanguage == null || selectedLanguage.isEmpty()) {
                selectedLanguage = "Python";
            }

            payload.put("language", selectedLanguage);

            @SuppressWarnings("unchecked")
            Map<String, Object> evaluation =
                    restTemplate.postForObject(
                            aiServiceUrl + "/evaluate_code",
                            payload,
                            Map.class
                    );

            return ResponseEntity.ok(
                    evaluation != null
                            ? evaluation
                            : Collections.emptyMap()
            );

        } catch (Exception e) {

            response.put(
                    "error",
                    "Failed to run code: " + e.getMessage()
            );

            return ResponseEntity.badRequest().body(response);
        }
    }

    // ============================================================
    // STUDENT - SUBMIT CODING QUESTION
    // ============================================================

    @PostMapping("/student/coding/submit")
    public ResponseEntity<?> submitCodingQuestion(
            @RequestHeader(
                    value = "Authorization",
                    required = false
            ) String authorization,
            @RequestBody Map<String, Object> request
    ) {

        Map<String, Object> response =
                new HashMap<>();

        try {

            Long userId =
                    getUserIdFromAuthorizationHeader(
                            authorization
                    );

            if (userId == null) {
                response.put("error", "Unauthorized request");
                return ResponseEntity.status(401).body(response);
            }

            Optional<User> userOptional =
                    userRepository.findById(userId);

            if (!userOptional.isPresent()
                    || userOptional.get().getRole() == null
                    || !"STUDENT".equalsIgnoreCase(
                            userOptional.get().getRole()
                    )) {

                response.put(
                        "error",
                        "Only students can submit coding questions"
                );

                return ResponseEntity.status(403).body(response);
            }

            Object questionIdObject =
                    request.get("questionId");

            if (questionIdObject == null) {
                response.put(
                        "error",
                        "Question ID is required"
                );
                return ResponseEntity.badRequest().body(response);
            }

            Long questionId =
                    Long.parseLong(
                            questionIdObject.toString()
                    );

            Optional<Question> questionOptional =
                    questionRepository.findById(questionId);

            if (!questionOptional.isPresent()) {
                response.put(
                        "error",
                        "Coding question not found"
                );
                return ResponseEntity.badRequest().body(response);
            }

            Question question = questionOptional.get();

            if (!"CODING".equalsIgnoreCase(
                    question.getQuestionType()
            )) {

                response.put(
                        "error",
                        "The selected question is not a coding question"
                );

                return ResponseEntity.badRequest().body(response);
            }

            String code =
                    request.get("code") != null
                            ? request.get("code").toString()
                            : "";

            if (code.trim().isEmpty()) {
                response.put("error", "Code is required");
                return ResponseEntity.badRequest().body(response);
            }

            String selectedLanguage =
                    request.get("language") != null
                            ? request.get("language").toString().trim()
                            : null;

            Map<String, Object> evaluation =
                    evaluateCodingAnswer(
                            question,
                            code,
                            selectedLanguage
                    );

            return ResponseEntity.ok(evaluation);

        } catch (Exception e) {

            response.put(
                    "error",
                    "Failed to submit code: " + e.getMessage()
            );

            return ResponseEntity.badRequest().body(response);
        }
    }


// ADMIN - CREATE EXAM

    // ============================================================



    @PostMapping("/admin/exams")

    public ResponseEntity<?> createExam(@RequestBody Exam exam) {



        Map<String, Object> response = new HashMap<>();



        try {



            if (exam.getQuestions() != null) {



                for (Question question : exam.getQuestions()) {

                    question.setExam(exam);

                }

            }



            exam.setActive(true);



            if (exam.getTotalMarks() == null) {



                int totalMarks = 0;



                if (exam.getQuestions() != null) {



                    for (Question q : exam.getQuestions()) {



                        totalMarks += q.getMarks() != null

                                ? q.getMarks()

                                : 0;

                    }

                }



                exam.setTotalMarks(totalMarks);

            }



            Exam savedExam = examRepository.save(exam);



            response.put("message", "Exam created successfully");

            response.put("examId", savedExam.getId());



            return ResponseEntity.ok(response);



        } catch (Exception e) {



            response.put(

                    "error",

                    "Failed to create exam: " + e.getMessage()

            );



            return ResponseEntity.badRequest().body(response);

        }

    }





    // ============================================================

    // STUDENT - GET AVAILABLE EXAMS

    // ============================================================



    @GetMapping("/student/exams")

    public ResponseEntity<?> getAvailableExams() {



        try {



            List<Exam> exams = examRepository.findByIsActiveTrue();



            return ResponseEntity.ok(exams);



        } catch (Exception e) {



            Map<String, String> error = new HashMap<>();



            error.put(

                    "error",

                    "Failed to fetch exams"

            );



            return ResponseEntity.badRequest().body(error);

        }

    }





    // ============================================================

    // STUDENT - GET EXAM QUESTIONS

    // ============================================================



    @GetMapping("/student/exams/{examId}/questions")

    public ResponseEntity<?> getExamQuestions(

            @PathVariable Long examId) {



        try {



            List<Question> questions =

                    questionRepository.findByExamId(examId);



            /*

             * Never send correct answers or test cases

             * to the student frontend.

             */

            for (Question q : questions) {



                q.setCorrectAnswer(null);

                q.setTestCases(null);

            }



            return ResponseEntity.ok(questions);



        } catch (Exception e) {



            Map<String, String> error = new HashMap<>();



            error.put(

                    "error",

                    "Failed to fetch questions"

            );



            return ResponseEntity.badRequest().body(error);

        }

    }





    // ============================================================

    // STUDENT - SUBMIT EXAM

    // ============================================================



    @PostMapping("/student/exams/{examId}/submit")

    public ResponseEntity<?> submitExam(

            @PathVariable Long examId,

            @RequestBody Map<String, Object> submission,

            @RequestHeader(

                    value = "Authorization",

                    required = false

            ) String authorization) {



        Map<String, Object> response = new HashMap<>();



        try {



            // ----------------------------------------------------

            // 1. IDENTIFY LOGGED-IN STUDENT

            // ----------------------------------------------------



            Long userId =

                    getUserIdFromAuthorizationHeader(authorization);



            if (userId == null) {



                response.put(

                        "error",

                        "Unauthorized: invalid or missing authentication token"

                );



                return ResponseEntity

                        .status(401)

                        .body(response);

            }





            // ----------------------------------------------------

            // 2. FIND USER

            // ----------------------------------------------------



            Optional<User> studentOptional =

                    userRepository.findById(userId);



            if (!studentOptional.isPresent()) {



                response.put(

                        "error",

                        "Student account not found"

                );



                return ResponseEntity

                        .status(404)

                        .body(response);

            }



            User student = studentOptional.get();





            // ----------------------------------------------------

            // 3. VERIFY USER ROLE

            // ----------------------------------------------------



            if (student.getRole() == null

                    || !"STUDENT".equalsIgnoreCase(student.getRole())) {



                response.put(

                        "error",

                        "Only students can submit exams"

                );



                return ResponseEntity

                        .status(403)

                        .body(response);

            }





            // ----------------------------------------------------

            // 4. FIND EXAM

            // ----------------------------------------------------



            Optional<Exam> examOptional =

                    examRepository.findById(examId);



            if (!examOptional.isPresent()) {



                response.put(

                        "error",

                        "Exam not found"

                );



                return ResponseEntity

                        .badRequest()

                        .body(response);

            }



            Exam exam = examOptional.get();





            // ----------------------------------------------------

            // 5. GET QUESTIONS

            // ----------------------------------------------------



            List<Question> questions =

                    questionRepository.findByExamId(examId);





            // ----------------------------------------------------

            // 6. GET STUDENT ANSWERS

            // ----------------------------------------------------



            Map<String, String> answers = null;



            Object answersObject =

                    submission.get("answers");



            if (answersObject instanceof Map) {



                answers = new HashMap<>();



                Map<?, ?> rawAnswers =

                        (Map<?, ?>) answersObject;



                for (Map.Entry<?, ?> entry : rawAnswers.entrySet()) {



                    if (entry.getKey() != null) {



                        String key =

                                String.valueOf(entry.getKey());



                        String value =

                                entry.getValue() != null

                                        ? String.valueOf(entry.getValue())

                                        : null;



                        answers.put(key, value);

                    }

                }

            }





            // ----------------------------------------------------

            Map<String, String> codingLanguages = new HashMap<>();

            Object codingLanguagesObject =
                    submission.get("codingLanguages");

            if (codingLanguagesObject instanceof Map) {
                Map<?, ?> rawLanguages = (Map<?, ?>) codingLanguagesObject;

                for (Map.Entry<?, ?> entry : rawLanguages.entrySet()) {
                    if (entry.getKey() != null && entry.getValue() != null) {
                        codingLanguages.put(
                                String.valueOf(entry.getKey()),
                                String.valueOf(entry.getValue())
                        );
                    }
                }
            }


            // 7. CALCULATE MARKS
            // ----------------------------------------------------

            int mcqMarks = 0;
            int codingMarks = 0;

            if (answers != null) {

                for (Question question : questions) {

                    String questionType =
                            question.getQuestionType();

                    if ("MCQ".equalsIgnoreCase(questionType)) {

                        String studentAnswer =
                                answers.get(
                                        question.getId().toString()
                                );

                        if (studentAnswer != null
                                && studentAnswer.equals(
                                        question.getCorrectAnswer()
                                )) {

                            mcqMarks +=
                                    question.getMarks() != null
                                            ? question.getMarks()
                                            : 0;
                        }

                    } else if ("CODING".equalsIgnoreCase(questionType)) {

                        String submittedCode =
                                answers.get(
                                        question.getId().toString()
                                );

                        if (submittedCode != null
                                && !submittedCode.trim().isEmpty()) {

                            try {

                                String selectedLanguage =
                                        codingLanguages.get(
                                                question.getId().toString()
                                        );

                                Map<String, Object> evaluation =
                                        evaluateCodingAnswer(
                                                question,
                                                submittedCode,
                                                selectedLanguage
                                        );

                                Object marksObject =
                                        evaluation.get("marksObtained");

                                if (marksObject != null) {

                                    codingMarks +=
                                            (int) Math.round(
                                                    Double.parseDouble(
                                                            marksObject.toString()
                                                    )
                                            );
                                }

                            } catch (Exception codingException) {

                                System.err.println(
                                        "Coding evaluation failed for question "
                                                + question.getId()
                                                + ": "
                                                + codingException.getMessage()
                                );
                            }
                        }
                    }
                }
            }

            int totalMarksObtained =
                    mcqMarks + codingMarks;


            // ----------------------------------------------------
            // 8. CALCULATE PERCENTAGE
            // ----------------------------------------------------



            // ----------------------------------------------------



            double percentage =

                    exam.getTotalMarks() > 0

                            ? (totalMarksObtained * 100.0)

                            / exam.getTotalMarks()

                            : 0;





            // ----------------------------------------------------

            // 9. DETERMINE PASS / FAIL

            // ----------------------------------------------------



            int passingMarks =

                    exam.getPassingMarks() != null

                            ? exam.getPassingMarks()

                            : 40;



            boolean passed =

                    percentage >= passingMarks;





            // ----------------------------------------------------

            // 10. FIND OR CREATE RESULT

            // ----------------------------------------------------

            // One student + one exam = one result.

            //

            // If the student has already submitted this exam,

            // update the latest existing result instead of creating

            // another result row.

            List<Result> existingResults =

                    resultRepository

                            .findByUserIdAndExamIdOrderBySubmissionTimeDesc(

                                    student.getId(),

                                    exam.getId()

                            );



            Result result;



            if (existingResults != null

                    && !existingResults.isEmpty()) {



                // Keep the newest result as the single active result.

                result = existingResults.get(0);



                // Remove older duplicate rows, if any already exist.

                if (existingResults.size() > 1) {

                    for (int i = 1; i < existingResults.size(); i++) {

                        resultRepository.delete(existingResults.get(i));

                    }

                }



            } else {

                result = new Result();

            }



            result.setExam(exam);

            result.setUser(student);

            result.setMarksObtained(totalMarksObtained);



            result.setTotalMarks(

                    exam.getTotalMarks()

            );



            result.setPercentage(percentage);



            result.setPassed(passed);



            result.setSubmissionTime(

                    LocalDateTime.now()

            );





            // ----------------------------------------------------

            // 11. SAVE CHEATING ATTEMPTS

            // ----------------------------------------------------



            int cheatingAttempts = 0;



            if (submission.get("cheatingAttempts") != null) {



                try {



                    cheatingAttempts =

                            Integer.parseInt(

                                    submission

                                            .get("cheatingAttempts")

                                            .toString()

                            );



                } catch (NumberFormatException ignored) {



                    cheatingAttempts = 0;

                }

            }



            result.setCheatingAttempts(

                    Math.max(0, cheatingAttempts)

            );





            // ----------------------------------------------------

            // 12. SAVE TIME TAKEN

            // ----------------------------------------------------



            if (submission.get("timeTakenSeconds") != null) {



                try {



                    result.setTimeTakenSeconds(

                            Integer.parseInt(

                                    submission

                                            .get("timeTakenSeconds")

                                            .toString()

                            )

                    );



                } catch (NumberFormatException ignored) {



                    result.setTimeTakenSeconds(0);

                }

            }





            // ----------------------------------------------------

            // 13. SAVE RESULT TO DATABASE

            // ----------------------------------------------------



            Result savedResult =

                    resultRepository.save(result);





            // ----------------------------------------------------

            // 14. RESPONSE

            // ----------------------------------------------------



            response.put(

                    "message",

                    "Exam submitted successfully"

            );



            response.put(

                    "resultId",

                    savedResult.getId()

            );



            response.put(

                    "userId",

                    student.getId()

            );



            response.put(

                    "username",

                    student.getUsername()

            );



            response.put(

                    "marksObtained",

                    totalMarksObtained

            );



            response.put(

                    "totalMarks",

                    exam.getTotalMarks()

            );



            response.put(

                    "percentage",

                    percentage

            );



            response.put(

                    "passed",

                    passed

            );



            response.put(

                    "cheatingAttempts",

                    cheatingAttempts

            );



            return ResponseEntity.ok(response);



        } catch (Exception e) {



            e.printStackTrace();



            response.put(

                    "error",

                    "Failed to submit exam: " + e.getMessage()

            );



            return ResponseEntity

                    .badRequest()

                    .body(response);

        }

    }





    // ============================================================

    // STUDENT - GET MY RESULTS

    // ============================================================



    @GetMapping("/student/results")

    public ResponseEntity<?> getStudentResults(

            @RequestHeader(

                    value = "Authorization",

                    required = false

            ) String authorization) {



        try {



            // ----------------------------------------------------

            // 1. IDENTIFY LOGGED-IN STUDENT

            // ----------------------------------------------------



            Long userId =

                    getUserIdFromAuthorizationHeader(authorization);



            if (userId == null) {



                Map<String, String> error =

                        new HashMap<>();



                error.put(

                        "error",

                        "Unauthorized: invalid or missing authentication token"

                );



                return ResponseEntity

                        .status(401)

                        .body(error);

            }





            // ----------------------------------------------------

            // 2. VERIFY USER EXISTS

            // ----------------------------------------------------



            Optional<User> studentOptional =

                    userRepository.findById(userId);



            if (!studentOptional.isPresent()) {



                Map<String, String> error =

                        new HashMap<>();



                error.put(

                        "error",

                        "Student account not found"

                );



                return ResponseEntity

                        .status(404)

                        .body(error);

            }





            // ----------------------------------------------------

            // 3. VERIFY STUDENT ROLE

            // ----------------------------------------------------



            User student =

                    studentOptional.get();



            if (student.getRole() == null

                    || !"STUDENT".equalsIgnoreCase(student.getRole())) {



                Map<String, String> error =

                        new HashMap<>();



                error.put(

                        "error",

                        "Only students can access student results"

                );



                return ResponseEntity

                        .status(403)

                        .body(error);

            }





            // ----------------------------------------------------

            // 4. FETCH ONLY THIS STUDENT'S RESULTS

            // ----------------------------------------------------



            List<Result> results =

                    resultRepository.findByUserId(userId);





            return ResponseEntity.ok(results);



        } catch (Exception e) {



            Map<String, String> error =

                    new HashMap<>();



            error.put(

                    "error",

                    "Failed to fetch results"

            );



            return ResponseEntity

                    .badRequest()

                    .body(error);

        }

    }





    // ============================================================

    // LEADERBOARD

    // ============================================================



    @GetMapping("/leaderboard/{examId}")

    public ResponseEntity<?> getLeaderboard(

            @PathVariable Long examId) {



        try {



            List<Result> results =

                    resultRepository

                            .findByExamIdOrderByMarksObtainedDesc(

                                    examId

                            );



            // Protect the leaderboard from legacy duplicate result rows.

            // One student should appear only once for one exam.

            Map<Long, Result> uniqueResults =

                    new LinkedHashMap<>();



            for (Result result : results) {



                if (result.getUser() == null

                        || result.getUser().getId() == null) {

                    continue;

                }



                Long studentId =

                        result.getUser().getId();



                Result existing =

                        uniqueResults.get(studentId);



                if (existing == null) {

                    uniqueResults.put(

                            studentId,

                            result

                    );

                } else {

                    LocalDateTime existingTime =

                            existing.getSubmissionTime();



                    LocalDateTime currentTime =

                            result.getSubmissionTime();



                    // Keep the latest result if duplicate legacy

                    // rows already exist.

                    if (currentTime != null

                            && (existingTime == null

                            || currentTime.isAfter(existingTime))) {



                        uniqueResults.put(

                                studentId,

                                result

                        );

                    }

                }

            }



            List<Result> uniqueLeaderboardResults =

                    new ArrayList<>(

                            uniqueResults.values()

                    );



            // Re-sort after deduplication.

            uniqueLeaderboardResults.sort(

                    Comparator

                            .comparing(

                                    Result::getMarksObtained,

                                    Comparator.nullsLast(

                                            Comparator.reverseOrder()

                                    )

                            )

                            .thenComparing(

                                    Result::getSubmissionTime,

                                    Comparator.nullsLast(

                                            Comparator.naturalOrder()

                                    )

                            )

            );



            List<Map<String, Object>> leaderboard =

                    new ArrayList<>();



            int rank = 1;



            for (Result result : uniqueLeaderboardResults) {



                Map<String, Object> entry =

                        new HashMap<>();



                entry.put(

                        "rank",

                        rank++

                );



                entry.put(

                        "username",

                        result.getUser().getUsername()

                );



                entry.put(

                        "fullName",

                        result.getUser().getFullName()

                );



                entry.put(

                        "marks",

                        result.getMarksObtained()

                );



                entry.put(

                        "percentage",

                        result.getPercentage()

                );



                entry.put(

                        "timeTaken",

                        result.getTimeTakenSeconds()

                );



                leaderboard.add(entry);

            }



            return ResponseEntity.ok(leaderboard);



        } catch (Exception e) {



            Map<String, String> error =

                    new HashMap<>();



            error.put(

                    "error",

                    "Failed to fetch leaderboard"

            );



            return ResponseEntity

                    .badRequest()

                    .body(error);

        }

    }





    // ============================================================

    // STUDENT - DETECT CHEATING

    // ============================================================



    @PostMapping("/student/detect-cheating")

    public ResponseEntity<?> detectCheating(

            @RequestBody Map<String, Object> data) {



        Map<String, Object> response =

                new HashMap<>();



        response.put(

                "cheatingDetected",

                false

        );



        response.put(

                "confidence",

                0.0

        );



        return ResponseEntity.ok(response);

    }





    // ============================================================

    // ADMIN - EXAM MANAGEMENT

    // ============================================================



    @GetMapping("/admin/exams")

    public ResponseEntity<?> getAdminExams() {



        try {



            return ResponseEntity.ok(

                    examRepository.findAll()

            );



        } catch (Exception e) {



            Map<String, String> error =

                    new HashMap<>();



            error.put(

                    "error",

                    "Failed to fetch examinations: "

                            + e.getMessage()

            );



            return ResponseEntity

                    .badRequest()

                    .body(error);

        }

    }





    // ============================================================

    // ADMIN - UPDATE EXAM

    // ============================================================



    @PutMapping("/admin/exams/{examId}")

    public ResponseEntity<?> updateAdminExam(

            @PathVariable Long examId,

            @RequestBody Map<String, Object> data) {



        Map<String, Object> response =

                new HashMap<>();



        try {



            Optional<Exam> examOptional =

                    examRepository.findById(examId);



            if (!examOptional.isPresent()) {



                response.put(

                        "error",

                        "Exam not found"

                );



                return ResponseEntity

                        .notFound()

                        .build();

            }



            Exam exam =

                    examOptional.get();





            if (data.containsKey("title")) {



                exam.setTitle(

                        String.valueOf(

                                data.get("title")

                        )

                );

            }





            if (data.containsKey("description")) {



                exam.setDescription(

                        data.get("description") == null

                                ? null

                                : String.valueOf(

                                        data.get("description")

                                )

                );

            }





            if (data.containsKey("durationMinutes")) {



                exam.setDurationMinutes(

                        Integer.valueOf(

                                String.valueOf(

                                        data.get("durationMinutes")

                                )

                        )

                );

            }





            if (data.containsKey("passingMarks")) {



                exam.setPassingMarks(

                        Integer.valueOf(

                                String.valueOf(

                                        data.get("passingMarks")

                                )

                        )

                );

            }





            if (data.containsKey("startTime")

                    && data.get("startTime") != null) {



                exam.setStartTime(

                        LocalDateTime.parse(

                                String.valueOf(

                                        data.get("startTime")

                                )

                        )

                );

            }





            if (data.containsKey("endTime")

                    && data.get("endTime") != null) {



                exam.setEndTime(

                        LocalDateTime.parse(

                                String.valueOf(

                                        data.get("endTime")

                                )

                        )

                );

            }





            if (data.containsKey("active")) {



                exam.setActive(

                        Boolean.parseBoolean(

                                String.valueOf(

                                        data.get("active")

                                )

                        )

                );

            }





            // ----------------------------------------------------

            // VALIDATE EXAM TIME

            // ----------------------------------------------------



            if (exam.getStartTime() != null

                    && exam.getEndTime() != null

                    && !exam.getEndTime()

                            .isAfter(exam.getStartTime())) {



                response.put(

                        "error",

                        "End time must be after start time"

                );



                return ResponseEntity

                        .badRequest()

                        .body(response);

            }





            // ----------------------------------------------------

            // SAVE UPDATED EXAM

            // ----------------------------------------------------



            Exam savedExam =

                    examRepository.save(exam);



            response.put(

                    "message",

                    "Exam updated successfully"

            );



            response.put(

                    "exam",

                    savedExam

            );



            return ResponseEntity.ok(response);



        } catch (Exception e) {



            response.put(

                    "error",

                    "Failed to update exam: "

                            + e.getMessage()

            );



            return ResponseEntity

                    .badRequest()

                    .body(response);

        }

    }





    // ============================================================

    // ADMIN - DELETE EXAM

    // ============================================================



    @DeleteMapping("/admin/exams/{examId}")

    public ResponseEntity<?> deleteAdminExam(

            @PathVariable Long examId) {



        Map<String, String> response =

                new HashMap<>();



        try {



            Optional<Exam> examOptional =

                    examRepository.findById(examId);



            if (!examOptional.isPresent()) {



                response.put(

                        "error",

                        "Exam not found"

                );



                return ResponseEntity

                        .notFound()

                        .build();

            }





            Exam exam =

                    examOptional.get();





            // ----------------------------------------------------

            // PREVENT DELETING EXAM WITH RESULTS

            // ----------------------------------------------------



            List<Result> results =

                    resultRepository

                            .findByExamIdOrderByMarksObtainedDesc(

                                    examId

                            );



            if (results != null

                    && !results.isEmpty()) {



                response.put(

                        "error",

                        "This exam has submitted results. Deactivate it instead of deleting it."

                );



                return ResponseEntity

                        .status(409)

                        .body(response);

            }





            // ----------------------------------------------------

            // DELETE QUESTIONS

            // ----------------------------------------------------



            List<Question> questions =

                    questionRepository

                            .findByExamId(examId);



            if (questions != null

                    && !questions.isEmpty()) {



                questionRepository.deleteAll(

                        questions

                );

            }





            // ----------------------------------------------------

            // DELETE EXAM

            // ----------------------------------------------------



            examRepository.delete(exam);



            response.put(

                    "message",

                    "Exam deleted successfully"

            );



            return ResponseEntity.ok(response);



        } catch (Exception e) {



            response.put(

                    "error",

                    "Failed to delete exam: "

                            + e.getMessage()

            );



            return ResponseEntity

                    .badRequest()

                    .body(response);

        }

    }

}