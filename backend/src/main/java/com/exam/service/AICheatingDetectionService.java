package com.exam.service;

import com.exam.model.CheatingLog;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@Service
public class AICheatingDetectionService {

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public boolean detectCheating(String videoFrame, Long userId, Long examId) {
        try {
            String url = aiServiceUrl + "/detect_cheating";
            
            Map<String, Object> request = new HashMap<>();
            request.put("frame", videoFrame);
            request.put("userId", userId);
            request.put("examId", examId);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, Map.class);
            
            if (response.getBody() != null) {
                return (boolean) response.getBody().get("cheating_detected");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    public Map<String, Object> evaluateCode(String code, String language, 
                                           String testCases, int marks) {
        try {
            String url = aiServiceUrl + "/evaluate_code";
            
            Map<String, Object> request = new HashMap<>();
            request.put("code", code);
            request.put("language", language);
            request.put("testCases", testCases);
            request.put("totalMarks", marks);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, Map.class);
            
            return response.getBody();
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("marks", 0);
            errorResult.put("feedback", "Evaluation failed");
            return errorResult;
        }
    }
}