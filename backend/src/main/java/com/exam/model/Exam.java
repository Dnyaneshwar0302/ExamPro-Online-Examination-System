package com.exam.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "exams")
public class Exam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    private String description;
    private Integer durationMinutes;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer totalMarks;
    private Integer passingMarks;
    private Boolean isActive = true;
    private Boolean enableProctoring = false;
    private LocalDateTime createdAt;
    
    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;
    
    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL)
    private List<Question> questions = new ArrayList<>();
    
    // Constructors
    public Exam() {
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    
    public Integer getTotalMarks() { return totalMarks; }
    public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }
    
    public Integer getPassingMarks() { return passingMarks; }
    public void setPassingMarks(Integer passingMarks) { this.passingMarks = passingMarks; }
    
    public Boolean getIsActive() { return isActive; }
    public void setActive(Boolean active) { isActive = active; }
    
    public Boolean getEnableProctoring() { return enableProctoring; }
    public void setEnableProctoring(Boolean enableProctoring) { this.enableProctoring = enableProctoring; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    
    public List<Question> getQuestions() { return questions; }
    public void setQuestions(List<Question> questions) { this.questions = questions; }
}