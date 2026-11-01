package com.skillmatchai.service;

import com.skillmatchai.entity.OtpToken;
import com.skillmatchai.repository.OtpTokenRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class OtpService {

    private final OtpTokenRepository otpTokenRepository;
    private final EmailService emailService;

    public OtpService(OtpTokenRepository otpTokenRepository, EmailService emailService) {
        this.otpTokenRepository = otpTokenRepository;
        this.emailService = emailService;
    }

    public void generateAndSendOtp(String email) {
        // Remove any existing OTPs for this email to prevent spam/confusion
        otpTokenRepository.deleteByEmail(email);

        // Generate 6-digit random OTP
        String otp = String.format("%06d", new Random().nextInt(999999));

        OtpToken token = new OtpToken();
        token.setEmail(email);
        token.setOtp(otp);
        token.setCreatedAt(LocalDateTime.now());
        
        otpTokenRepository.save(token);

        // Send via Email
        emailService.sendOtpEmail(email, otp);
    }

    public void generateAndSendPasswordResetOtp(String email) {
        // Remove any existing OTPs for this email to prevent spam/confusion
        otpTokenRepository.deleteByEmail(email);

        // Generate 6-digit random OTP
        String otp = String.format("%06d", new Random().nextInt(999999));

        OtpToken token = new OtpToken();
        token.setEmail(email);
        token.setOtp(otp);
        token.setCreatedAt(LocalDateTime.now());
        
        otpTokenRepository.save(token);

        // Send via Email with password reset styling
        emailService.sendPasswordResetOtpEmail(email, otp);
    }

    public boolean verifyOtp(String email, String otp) {
        Optional<OtpToken> tokenOpt = otpTokenRepository.findByEmailAndOtp(email, otp);
        if (tokenOpt.isPresent()) {
            // OTP is correct and hasn't expired (TTL handles expiration in MongoDB)
            otpTokenRepository.deleteByEmail(email); // consume it so it can't be used again
            return true;
        }
        return false;
    }
}
