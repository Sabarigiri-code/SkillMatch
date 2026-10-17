package com.skillmatchai.exception;

public class ResumeNotFoundException extends RuntimeException {
    public ResumeNotFoundException(String id) {
        super("Resume not found with id: " + id);
    }
}
