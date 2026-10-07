package com.exam.controller;

import com.exam.model.User;
import com.exam.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    /*
     * Admin registration authorization code.
     *
     * This value will come from application.properties.
     */
    @Value("${admin.registration.code}")
    private String adminRegistrationCode;


    // ============================================================
    // STUDENT REGISTRATION
    // ============================================================

    @PostMapping("/register")
    public ResponseEntity<?> registerStudent(@RequestBody User user) {

        Map<String, Object> response = new HashMap<>();

        try {

            // Required fields
            if (user.getFullName() == null ||
                    user.getFullName().trim().isEmpty()) {

                response.put("error", "Full name is required");
                return ResponseEntity.badRequest().body(response);
            }

            if (user.getUsername() == null ||
                    user.getUsername().trim().isEmpty()) {

                response.put("error", "Username is required");
                return ResponseEntity.badRequest().body(response);
            }

            if (user.getEmail() == null ||
                    user.getEmail().trim().isEmpty()) {

                response.put("error", "Email is required");
                return ResponseEntity.badRequest().body(response);
            }

            if (user.getPassword() == null ||
                    user.getPassword().trim().isEmpty()) {

                response.put("error", "Password is required");
                return ResponseEntity.badRequest().body(response);
            }

            // Username already exists
            if (userRepository.existsByUsername(user.getUsername())) {

                response.put("error", "Username already exists");
                return ResponseEntity.badRequest().body(response);
            }

            // Email already exists
            if (userRepository.existsByEmail(user.getEmail())) {

                response.put("error", "Email already exists");
                return ResponseEntity.badRequest().body(response);
            }

            /*
             * IMPORTANT:
             *
             * We completely ignore whatever role the client sends.
             *
             * Normal registration ALWAYS creates a STUDENT.
             */
            user.setRole("STUDENT");

            // Encrypt password
            user.setPassword(passwordEncoder.encode(user.getPassword()));

            // Save student
            User savedUser = userRepository.save(user);

            response.put("message", "Student registration successful");
            response.put("userId", savedUser.getId());
            response.put("username", savedUser.getUsername());
            response.put("fullName", savedUser.getFullName());
            response.put("role", "STUDENT");

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            response.put(
                    "error",
                    "Student registration failed: " + e.getMessage()
            );

            return ResponseEntity.badRequest().body(response);
        }
    }


    // ============================================================
    // ADMIN REGISTRATION
    // ============================================================

    @PostMapping("/admin/register")
    public ResponseEntity<?> registerAdmin(
            @RequestBody Map<String, String> request) {

        Map<String, Object> response = new HashMap<>();

        try {

            String fullName = request.get("fullName");
            String username = request.get("username");
            String email = request.get("email");
            String password = request.get("password");
            String department = request.get("department");
            String authorizationCode = request.get("authorizationCode");

            // Required fields
            if (fullName == null || fullName.trim().isEmpty()) {

                response.put("error", "Admin full name is required");
                return ResponseEntity.badRequest().body(response);
            }

            if (username == null || username.trim().isEmpty()) {

                response.put("error", "Admin username is required");
                return ResponseEntity.badRequest().body(response);
            }

            if (email == null || email.trim().isEmpty()) {

                response.put("error", "Admin email is required");
                return ResponseEntity.badRequest().body(response);
            }

            if (password == null || password.trim().isEmpty()) {

                response.put("error", "Admin password is required");
                return ResponseEntity.badRequest().body(response);
            }

            if (authorizationCode == null ||
                    authorizationCode.trim().isEmpty()) {

                response.put("error", "Admin authorization code is required");
                return ResponseEntity.badRequest().body(response);
            }

            // Check authorization code
            if (!adminRegistrationCode.equals(authorizationCode)) {

                response.put(
                        "error",
                        "Invalid admin authorization code"
                );

                return ResponseEntity.badRequest().body(response);
            }

            // Check username
            if (userRepository.existsByUsername(username)) {

                response.put("error", "Username already exists");
                return ResponseEntity.badRequest().body(response);
            }

            // Check email
            if (userRepository.existsByEmail(email)) {

                response.put("error", "Email already exists");
                return ResponseEntity.badRequest().body(response);
            }

            // Create new User
            User admin = new User();

            admin.setFullName(fullName.trim());
            admin.setUsername(username.trim());
            admin.setEmail(email.trim());
            admin.setDepartment(
                    department != null ? department.trim() : null
            );

            /*
             * Admin role is assigned ONLY by backend.
             */
            admin.setRole("ADMIN");

            // Encrypt password
            admin.setPassword(passwordEncoder.encode(password));

            // Save admin
            User savedAdmin = userRepository.save(admin);

            response.put("message", "Admin registration successful");
            response.put("userId", savedAdmin.getId());
            response.put("username", savedAdmin.getUsername());
            response.put("fullName", savedAdmin.getFullName());
            response.put("role", "ADMIN");

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            response.put(
                    "error",
                    "Admin registration failed: " + e.getMessage()
            );

            return ResponseEntity.badRequest().body(response);
        }
    }


    // ============================================================
    // NORMAL LOGIN
    // ============================================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> loginRequest) {

        return authenticateUser(loginRequest, false);
    }


    // ============================================================
    // ADMIN LOGIN
    // ============================================================

    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(
            @RequestBody Map<String, String> loginRequest) {

        return authenticateUser(loginRequest, true);
    }


    // ============================================================
    // AUTHENTICATION METHOD
    // ============================================================

    private ResponseEntity<?> authenticateUser(
            Map<String, String> loginRequest,
            boolean adminOnly) {

        Map<String, Object> response = new HashMap<>();

        try {

            String username = loginRequest.get("username");
            String password = loginRequest.get("password");

            if (username == null || username.trim().isEmpty()) {

                response.put("error", "Username is required");
                return ResponseEntity.badRequest().body(response);
            }

            if (password == null || password.trim().isEmpty()) {

                response.put("error", "Password is required");
                return ResponseEntity.badRequest().body(response);
            }

            Optional<User> userOptional =
                    userRepository.findByUsername(username.trim());

            if (!userOptional.isPresent()) {

                response.put("error", "Invalid username or password");
                return ResponseEntity.badRequest().body(response);
            }

            User user = userOptional.get();

            // Check password
            if (!passwordEncoder.matches(
                    password,
                    user.getPassword())) {

                response.put("error", "Invalid username or password");
                return ResponseEntity.badRequest().body(response);
            }

            // Admin login can ONLY be used by admins
            if (adminOnly &&
                    !"ADMIN".equalsIgnoreCase(user.getRole())) {

                response.put(
                        "error",
                        "This account is not an administrator account"
                );

                return ResponseEntity.status(403).body(response);
            }

            // Update last login
            user.setLastLogin(
                    java.time.LocalDateTime.now()
            );

            userRepository.save(user);

            /*
             * TEMPORARY TOKEN
             *
             * We will replace this with a real JWT
             * in the authentication-security phase.
             */
            String token = "jwt-token-" + user.getId();

            response.put("token", token);
            response.put("username", user.getUsername());
            response.put("role", user.getRole());
            response.put(
                    "fullName",
                    user.getFullName() != null
                            ? user.getFullName()
                            : ""
            );
            response.put(
                    "userId",
                    user.getId().toString()
            );
            response.put(
                    "email",
                    user.getEmail()
            );
            response.put(
                    "department",
                    user.getDepartment() != null
                            ? user.getDepartment()
                            : ""
            );
            response.put("message", "Login successful");

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            response.put(
                    "error",
                    "Login failed: " + e.getMessage()
            );

            return ResponseEntity.badRequest().body(response);
        }
    }
}