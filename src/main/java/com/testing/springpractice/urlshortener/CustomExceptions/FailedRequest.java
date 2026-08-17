package com.testing.springpractice.urlshortener.CustomExceptions;

public class FailedRequest extends RuntimeException {
    public FailedRequest(String message) {
        super(message);
    }
}
