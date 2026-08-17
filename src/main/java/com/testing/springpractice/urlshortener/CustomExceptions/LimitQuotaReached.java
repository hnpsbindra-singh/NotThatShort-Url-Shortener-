package com.testing.springpractice.urlshortener.CustomExceptions;

public class LimitQuotaReached extends RuntimeException {
    public LimitQuotaReached(String message) {
        super(message);
    }
}
