package com.testing.springpractice.urlshortener.Configuration;

import com.testing.springpractice.urlshortener.CustomExceptions.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;


@RestControllerAdvice
class CustomExceptionHandler {

    @ExceptionHandler(JwtExpiredException.class)
    public ResponseEntity<String> jwtExpiration(JwtExpiredException e){
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
    }


    @ExceptionHandler(OtpExpiredException.class)
    public ResponseEntity<String> otpExpired(OtpExpiredException e){
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(e.getMessage());
    }

    @ExceptionHandler(FailedRequest.class)
    public ResponseEntity<String> response(FailedRequest e){
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(e.getMessage());
    }

    @ExceptionHandler(LimitQuotaReached.class)
    public ResponseEntity<String> res(LimitQuotaReached e){
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(e.getMessage());
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<String> userNotFound(UserNotFoundException e){
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(e.getMessage());

    }

    @ExceptionHandler(LinkNotFoundException.class)
    public ResponseEntity<String> LinkNotFound(LinkNotFoundException e){
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(e.getMessage());

    }

    @ExceptionHandler(InvalidAccess.class)
    public ResponseEntity<String> accessNotFound(InvalidAccess e){
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(e.getMessage());

    }
}
