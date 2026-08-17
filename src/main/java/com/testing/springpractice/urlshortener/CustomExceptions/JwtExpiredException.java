package com.testing.springpractice.urlshortener.CustomExceptions;

public class JwtExpiredException extends RuntimeException{
    public JwtExpiredException(String Message){
        super(Message);
    }
}
