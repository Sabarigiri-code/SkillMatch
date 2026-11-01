package com.skillmatchai.service;

import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@SuppressWarnings("null")
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String to, String otp) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

            // Set the custom sender name "SkillMatch"
            helper.setFrom(new InternetAddress(fromEmail, "SkillMatch"));
            helper.setTo(to);
            helper.setSubject("SkillMatch Verification Code: " + otp);
            
            String textContent = "Hello,\n\n" +
                    "Your One-Time Password (OTP) for SkillMatch AI is: " + otp + "\n\n" +
                    "This code is valid for the next 10 minutes.\n\n" +
                    "Best regards,\n" +
                    "The SkillMatch AI Team";
            
            helper.setText(textContent, false);
            
            mailSender.send(mimeMessage);
            logger.info("OTP email successfully sent to {} from SkillMatch", to);
        } catch (Exception e) {
            logger.error("Failed to send OTP email to {}", to, e);
        }
    }

    public void sendPasswordResetOtpEmail(String to, String otp) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "utf-8");

            helper.setFrom(new InternetAddress(fromEmail, "SkillMatch AI"));
            helper.setTo(to);
            helper.setSubject("SkillMatch AI - Password Reset Code: " + otp);
            
            String htmlContent = "<div style=\"font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;\">" +
                    "<div style=\"text-align: center; margin-bottom: 24px;\">" +
                    "<h2 style=\"margin: 0; color: #4f46e5; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;\">SkillMatch AI</h2>" +
                    "<p style=\"margin: 4px 0 0 0; color: #64748b; font-size: 13px;\">Career Intelligence & Assessment Platform</p>" +
                    "</div>" +
                    "<div style=\"background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 20px;\">" +
                    "<h3 style=\"margin: 0 0 10px 0; color: #0f172a; font-size: 17px; font-weight: 700;\">Password Reset Request</h3>" +
                    "<p style=\"margin: 0 0 16px 0; color: #475569; font-size: 14px; line-height: 1.6;\">We received a request to reset the password for your account. Please use the following one-time verification code to complete your password update:</p>" +
                    "<div style=\"text-align: center; margin: 24px 0;\">" +
                    "<span style=\"display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #4338ca; background: #eef2ff; border: 1.5px solid #c7d2fe; border-radius: 10px; padding: 12px 24px;\">" + otp + "</span>" +
                    "</div>" +
                    "<p style=\"margin: 0; color: #64748b; font-size: 12px; line-height: 1.5;\">⏰ <strong>Security Notice:</strong> This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>" +
                    "</div>" +
                    "<p style=\"margin: 0 0 16px 0; color: #64748b; font-size: 12px; line-height: 1.5;\">If you did not request a password reset, you can safely ignore this email. Your account remains completely secure.</p>" +
                    "<hr style=\"border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;\" />" +
                    "<p style=\"margin: 0; color: #94a3b8; font-size: 11px; text-align: center;\">&copy; " + java.time.Year.now().getValue() + " SkillMatch AI. All rights reserved.</p>" +
                    "</div>";

            String plainText = "SkillMatch AI - Password Reset Request\n\n" +
                    "Your One-Time Password (OTP) for resetting your SkillMatch AI password is: " + otp + "\n\n" +
                    "This code is valid for the next 10 minutes.\n\n" +
                    "If you did not request this, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "The SkillMatch AI Team";

            helper.setText(plainText, htmlContent);
            
            mailSender.send(mimeMessage);
            logger.info("Password reset OTP email successfully sent to {} from SkillMatch AI", to);
        } catch (Exception e) {
            logger.error("Failed to send password reset OTP email to {}", to, e);
            throw new RuntimeException("Failed to send verification email. Please try again later.", e);
        }
    }
}
