package com.testing.springpractice.urlshortener.Service;

import com.testing.springpractice.urlshortener.Configuration.JwtUtils;
import com.testing.springpractice.urlshortener.CustomExceptions.FailedRequest;
import com.testing.springpractice.urlshortener.CustomExceptions.OtpExpiredException;
import com.testing.springpractice.urlshortener.DataTransferObjects.LoginRequest;
import com.testing.springpractice.urlshortener.DataTransferObjects.RegisterRequest;
import com.testing.springpractice.urlshortener.DataTransferObjects.ResetPasswordRequest;
import com.testing.springpractice.urlshortener.DataTransferObjects.VerifyEmailRequest;
import com.testing.springpractice.urlshortener.Models.Users;
import com.testing.springpractice.urlshortener.Repository.UsersRepository;
import jakarta.validation.Valid;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.Duration;

@Component
public class AuthService {
    private final PasswordEncoder passwordEncoder;
    private final StringRedisTemplate stringRedisTemplate;
    private final EmailService emailService;
    private final RedisTemplate<String, RegisterRequest> registerRequestRedisTemplate;
    private final UsersRepository usersRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(PasswordEncoder passwordEncoder, StringRedisTemplate stringRedisTemplate, EmailService emailService, RedisTemplate<String, RegisterRequest> registerRequestRedisTemplate, UsersRepository usersRepository, AuthenticationManager authenticationManager, JwtUtils jwtUtils) {
        this.passwordEncoder = passwordEncoder;
        this.stringRedisTemplate = stringRedisTemplate;
        this.emailService = emailService;
        this.registerRequestRedisTemplate = registerRequestRedisTemplate;
        this.usersRepository = usersRepository;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
    }

    public String register(@Valid RegisterRequest registerRequest) {
        if (usersRepository.existsByUsername(registerRequest.getUsername().trim().toLowerCase())) {
            throw new FailedRequest("User already exists");
        }
        registerRequest.setUsername(registerRequest.getUsername().trim().toLowerCase());

        registerRequest.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        String otp = String.valueOf(100000 + secureRandom.nextInt(900000));

        stringRedisTemplate.opsForValue().set("otp:reg:" + registerRequest.getUsername(),
                otp,
                Duration.ofMinutes(5));
        registerRequestRedisTemplate.opsForValue().set("user:reg:" + registerRequest.getUsername(),
                registerRequest,
                Duration.ofMinutes(5));
        emailService.sendOtp(registerRequest.getUsername(), registerRequest.getName(), otp);
        return "Email Sent Successfully";
    }

    public String verify(@Valid VerifyEmailRequest verifyEmailRequest) {
        String username = verifyEmailRequest.getUsername().trim().toLowerCase();
        if (usersRepository.existsByUsername(username)) {
            throw new FailedRequest("User Already Exist");
        }
        RegisterRequest registerRequest = registerRequestRedisTemplate.opsForValue().get("user:reg:" + username);
        String storedOtp = stringRedisTemplate.opsForValue().get("otp:reg:" + username);
        if (storedOtp == null) {
            throw new OtpExpiredException("OTP expired.");
        }

        if (!storedOtp.equals(verifyEmailRequest.getOtp())) {
            throw new OtpExpiredException("Invalid OTP.");
        }
        if (registerRequest == null) {
            throw new FailedRequest("Registration expired.");
        }
        Users user = Users.builder()
                .name(registerRequest.getName())
                .username(registerRequest.getUsername())
                .password(registerRequest.getPassword())
                .verified(true)
                .build();
        usersRepository.save(user);
        registerRequestRedisTemplate.delete("user:reg:" + username);
        stringRedisTemplate.delete("otp:reg:" + username);
        return "Registration Successful";
    }


    public String login(@Valid LoginRequest request) {
        request.setUsername(request.getUsername().toLowerCase().trim());
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                request.getUsername(), request.getPassword()
        ));
        Users user = usersRepository.findByUsername(request.getUsername()).orElse(null);
        if (user == null) {
            throw new FailedRequest("User not found");
        }
        return jwtUtils.generateJWT(user);
    }

    public String sendOtp(String username) {
        username = username.toLowerCase().trim();
        RegisterRequest pendingReg = registerRequestRedisTemplate.opsForValue().get("user:reg:" + username);
        if (pendingReg != null) {
            String otp = String.valueOf(100000 + secureRandom.nextInt(900000));
            stringRedisTemplate.opsForValue().set("otp:reg:" + username,
                    otp,
                    Duration.ofMinutes(5));
            emailService.sendOtp(username, pendingReg.getName(), otp);
            return "Otp Sent Successfully";
        }
        if (!usersRepository.existsByUsername(username)) {
            throw new FailedRequest("User Doesn't Exist");
        }
        String otp = String.valueOf(100000 + secureRandom.nextInt(900000));
        stringRedisTemplate.opsForValue().set("otp:reset:" + username,
                otp,
                Duration.ofMinutes(5));
        emailService.sendOtp(username, "user", otp);
        return "Otp Sent Successfully";
    }

    public String verifyPassword(@Valid ResetPasswordRequest resetPasswordRequest) {
        String username = resetPasswordRequest.getUsername().toLowerCase().trim();
        String storedOtp = stringRedisTemplate.opsForValue().get("otp:reset:" + username);
        if (storedOtp == null) {
            throw new OtpExpiredException("OTP expired.");
        }
        if (!storedOtp.equals(resetPasswordRequest.getOtp())) {
            throw new OtpExpiredException("Invalid OTP.");
        }
        int rowsAffected = usersRepository.updatePasswordForUsername(
                passwordEncoder.encode(resetPasswordRequest.getNewPassword()),
                username
        );
        if (rowsAffected == 0) {
            return "Password update failed";
        }
        stringRedisTemplate.delete("otp:reset:" + username);
        return "Password updated successfully";
    }
}
