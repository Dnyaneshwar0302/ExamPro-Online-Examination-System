package com.exam.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "results")
public class Result {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "exam_id")
    private Exam exam;

    private Integer marksObtained;
    private Integer totalMarks;
    private Integer mcqMarks;
    private Integer codingMarks;
    private Double percentage;
    private Boolean passed;
    private Integer cheatingAttempts = 0;
    private LocalDateTime submissionTime;
    private Integer timeTakenSeconds;

    @Column(columnDefinition = "TEXT")
    private String answers;

    public Result() {
        this.submissionTime = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Exam getExam() { return exam; }
    public void setExam(Exam exam) { this.exam = exam; }

    public Integer getMarksObtained() { return marksObtained; }
    public void setMarksObtained(Integer marksObtained) { this.marksObtained = marksObtained; }

    public Integer getTotalMarks() { return totalMarks; }
    public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }

    public Integer getMcqMarks() { return mcqMarks; }
    public void setMcqMarks(Integer mcqMarks) { this.mcqMarks = mcqMarks; }

    public Integer getCodingMarks() { return codingMarks; }
    public void setCodingMarks(Integer codingMarks) { this.codingMarks = codingMarks; }

    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }

    public Boolean getPassed() { return passed; }
    public void setPassed(Boolean passed) { this.passed = passed; }

    public Integer getCheatingAttempts() { return cheatingAttempts; }
    public void setCheatingAttempts(Integer cheatingAttempts) { this.cheatingAttempts = cheatingAttempts; }

    public LocalDateTime getSubmissionTime() { return submissionTime; }
    public void setSubmissionTime(LocalDateTime submissionTime) { this.submissionTime = submissionTime; }

    public Integer getTimeTakenSeconds() { return timeTakenSeconds; }
    public void setTimeTakenSeconds(Integer timeTakenSeconds) { this.timeTakenSeconds = timeTakenSeconds; }

    public String getAnswers() { return answers; }
    public void setAnswers(String answers) { this.answers = answers; }
}
