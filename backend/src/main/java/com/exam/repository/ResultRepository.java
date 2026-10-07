package com.exam.repository;

import com.exam.model.Result;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ResultRepository extends JpaRepository<Result, Long> {

    List<Result> findByUserId(Long userId);

    List<Result> findByExamId(Long examId);

    List<Result> findByUserIdAndExamIdOrderBySubmissionTimeDesc(
            Long userId,
            Long examId
    );

    @Query("SELECT r FROM Result r WHERE r.exam.id = :examId ORDER BY r.marksObtained DESC")
    List<Result> findByExamIdOrderByMarksObtainedDesc(Long examId);
}
