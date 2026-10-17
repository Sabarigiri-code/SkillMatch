package com.skillmatchai.exception;

public class UnauthorizedResourceException extends RuntimeException {
    public UnauthorizedResourceException() {
        super("You do not have permission to access this resource.");
    }
}
