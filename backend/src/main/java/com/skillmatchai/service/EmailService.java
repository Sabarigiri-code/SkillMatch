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
}
