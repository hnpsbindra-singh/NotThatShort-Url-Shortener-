package com.testing.springpractice.urlshortener.CustomExceptions;

public class InvalidAccess extends RuntimeException {
    public InvalidAccess(String message) {
        super(message);
    }
}
