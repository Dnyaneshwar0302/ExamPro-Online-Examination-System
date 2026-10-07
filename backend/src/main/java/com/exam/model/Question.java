package com.exam.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "questions")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String questionText;

    private String questionType; // MCQ or CODING

    // ============================================================
    // MCQ FIELDS
    // ============================================================

    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;

    private String correctAnswer;

    // ============================================================
    // CODING FIELDS
    // ============================================================

    /**
     * Programming language used for the coding question.
     *
     * Examples:
     * Java
     * Python
     * C
     * C++
     * JavaScript
     * SQL
     */
    private String programmingLanguage;

    @Column(columnDefinition = "TEXT")
    private String problemStatement;

    @Column(columnDefinition = "TEXT")
    private String sampleInput;

    @Column(columnDefinition = "TEXT")
    private String sampleOutput;

    /**
     * Starter / boilerplate code shown to the student
     * when the coding question is opened.
     */
    @Column(columnDefinition = "TEXT")
    private String starterCode;

    /**
     * Hidden test cases stored as JSON.
     *
     * Example:
     *
     * [
     *   {
     *     "input": "2 3",
     *     "expectedOutput": "5"
     *   }
     * ]
     */
    @Column(columnDefinition = "TEXT")
    private String testCases;

    // ============================================================
    // GENERAL FIELDS
    // ============================================================

    private Integer marks;

    private Integer difficultyLevel = 1;

    // ============================================================
    // EXAM RELATIONSHIP
    // ============================================================

    @ManyToOne
    @JoinColumn(name = "exam_id")
    @JsonIgnore
    private Exam exam;

    // ============================================================
    // CONSTRUCTOR
    // ============================================================

    public Question() {
    }

    // ============================================================
    // GETTERS AND SETTERS
    // ============================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public String getQuestionType() {
        return questionType;
    }

    public void setQuestionType(String questionType) {
        this.questionType = questionType;
    }

    public String getOptionA() {
        return optionA;
    }

    public void setOptionA(String optionA) {
        this.optionA = optionA;
    }

    public String getOptionB() {
        return optionB;
    }

    public void setOptionB(String optionB) {
        this.optionB = optionB;
    }

    public String getOptionC() {
        return optionC;
    }

    public void setOptionC(String optionC) {
        this.optionC = optionC;
    }

    public String getOptionD() {
        return optionD;
    }

    public void setOptionD(String optionD) {
        this.optionD = optionD;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    public String getProgrammingLanguage() {
        return programmingLanguage;
    }

    public void setProgrammingLanguage(String programmingLanguage) {
        this.programmingLanguage = programmingLanguage;
    }

    public String getProblemStatement() {
        return problemStatement;
    }

    public void setProblemStatement(String problemStatement) {
        this.problemStatement = problemStatement;
    }

    public String getSampleInput() {
        return sampleInput;
    }

    public void setSampleInput(String sampleInput) {
        this.sampleInput = sampleInput;
    }

    public String getSampleOutput() {
        return sampleOutput;
    }

    public void setSampleOutput(String sampleOutput) {
        this.sampleOutput = sampleOutput;
    }

    public String getStarterCode() {
        return starterCode;
    }

    public void setStarterCode(String starterCode) {
        this.starterCode = starterCode;
    }

    public String getTestCases() {
        return testCases;
    }

    public void setTestCases(String testCases) {
        this.testCases = testCases;
    }

    public Integer getMarks() {
        return marks;
    }

    public void setMarks(Integer marks) {
        this.marks = marks;
    }

    public Integer getDifficultyLevel() {
        return difficultyLevel;
    }

    public void setDifficultyLevel(Integer difficultyLevel) {
        this.difficultyLevel = difficultyLevel;
    }

    public Exam getExam() {
        return exam;
    }

    public void setExam(Exam exam) {
        this.exam = exam;
    }
}