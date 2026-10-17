package com.skillmatchai.service;

import com.skillmatchai.dto.AuthResponse;
import com.skillmatchai.dto.LoginRequest;
import com.skillmatchai.dto.RegisterRequest;
import com.skillmatchai.dto.UserResponse;
import com.skillmatchai.entity.Role;
import com.skillmatchai.entity.User;
import com.skillmatchai.exception.EmailAlreadyExistsException;
import com.skillmatchai.exception.InvalidCredentialsException;
import com.skillmatchai.repository.UserRepository;
import com.skillmatchai.security.JwtService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

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
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
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
