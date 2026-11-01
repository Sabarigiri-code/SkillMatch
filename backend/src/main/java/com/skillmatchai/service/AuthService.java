package com.skillmatchai.service;

import com.skillmatchai.dto.AuthResponse;
import com.skillmatchai.dto.LoginRequest;
import com.skillmatchai.dto.RegisterRequest;
import com.skillmatchai.dto.UserResponse;
import com.skillmatchai.entity.Role;
import com.skillmatchai.entity.User;
import com.skillmatchai.exception.EmailAlreadyExistsException;
import com.skillmatchai.repository.UserRepository;
import com.skillmatchai.security.JwtService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@SuppressWarnings("null")
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.skillmatchai.repository.ResumeRepository resumeRepository;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.skillmatchai.repository.JobMatchRepository jobMatchRepository;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.skillmatchai.repository.LearningRoadmapRepository learningRoadmapRepository;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.skillmatchai.repository.AssessmentRepository assessmentRepository;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.skillmatchai.repository.InterviewRepository interviewRepository;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.skillmatchai.repository.ProgressRepository progressRepository;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.skillmatchai.service.resume.StorageService storageService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       UserDetailsService userDetailsService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException(request.getEmail());
        }

        User user = new User(
                request.getName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                Role.USER
        );

        User saved = userRepository.save(user);
        return toUserResponse(saved);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> userRepository.findByEmail(request.getEmail() != null ? request.getEmail().trim() : "")
                        .orElseThrow(() -> new com.skillmatchai.exception.ResourceNotFoundException("No account found with this email address. Please check your spelling or register.")));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new com.skillmatchai.exception.InvalidCredentialsException("Incorrect password. Please check your password and try again.");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(token, toUserResponse(user));
    }

    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new com.skillmatchai.exception.ResourceNotFoundException("User not found."));
        return toUserResponse(user);
    }

    public boolean checkEmailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    public UserResponse updateProfilePhoto(String email, String base64Photo) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new com.skillmatchai.exception.ResourceNotFoundException("User not found."));
        user.setProfilePhoto(base64Photo);
        return toUserResponse(userRepository.save(user));
    }

    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new com.skillmatchai.exception.ResourceNotFoundException("User not found."));
        
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Incorrect current password");
        }
        
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public AuthResponse resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new com.skillmatchai.exception.ResourceNotFoundException("User not found with email: " + email));
        
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        User saved = userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(saved.getEmail());
        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(token, toUserResponse(saved));
    }

    public UserResponse updateProfile(String email, String name, String targetRole, String experience) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new com.skillmatchai.exception.ResourceNotFoundException("User not found."));
        
        if (name != null) user.setName(name);
        if (targetRole != null) user.setTargetRole(targetRole);
        if (experience != null) user.setExperience(experience);
        
        return toUserResponse(userRepository.save(user));
    }

    public void deleteAccount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new com.skillmatchai.exception.ResourceNotFoundException("User not found."));
        String userId = user.getId();

        // 1. Delete resumes & physical files
        if (resumeRepository != null) {
            try {
                var resumes = resumeRepository.findByUserId(userId);
                if (storageService != null) {
                    for (var r : resumes) {
                        if (r.getStoragePath() != null) {
                            storageService.delete(r.getStoragePath());
                        }
                    }
                }
                resumeRepository.deleteAll(resumes);
            } catch (Exception ignored) {}
        }

        // 2. Delete job matches
        if (jobMatchRepository != null) {
            try {
                var matches = jobMatchRepository.findByUserIdOrderByAnalyzedAtDesc(userId);
                jobMatchRepository.deleteAll(matches);
            } catch (Exception ignored) {}
        }

        // 3. Delete roadmaps
        if (learningRoadmapRepository != null) {
            try {
                var roadmaps = learningRoadmapRepository.findByUserIdOrderByGeneratedAtDesc(userId);
                learningRoadmapRepository.deleteAll(roadmaps);
            } catch (Exception ignored) {}
        }

        // 4. Delete assessments
        if (assessmentRepository != null) {
            try {
                var assessments = assessmentRepository.findByUserId(userId);
                assessmentRepository.deleteAll(assessments);
            } catch (Exception ignored) {}
        }

        // 5. Delete interviews
        if (interviewRepository != null) {
            try {
                var interviews = interviewRepository.findByUserIdOrderByConductedAtDesc(userId);
                interviewRepository.deleteAll(interviews);
            } catch (Exception ignored) {}
        }

        // 6. Delete progress
        if (progressRepository != null) {
            try {
                var progressList = progressRepository.findByUserId(userId);
                progressRepository.deleteAll(progressList);
            } catch (Exception ignored) {}
        }

        // 7. Delete User entity
        userRepository.delete(user);
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
            user.getId(), 
            user.getName(), 
            user.getEmail(), 
            user.getRole(), 
            user.getProfilePhoto(),
            user.getTargetRole(),
            user.getExperience()
        );
    }
}
