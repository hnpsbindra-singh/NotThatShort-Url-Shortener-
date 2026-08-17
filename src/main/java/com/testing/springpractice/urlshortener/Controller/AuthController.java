package com.testing.springpractice.urlshortener.Controller;

import com.testing.springpractice.urlshortener.DataTransferObjects.LoginRequest;
import com.testing.springpractice.urlshortener.DataTransferObjects.RegisterRequest;
import com.testing.springpractice.urlshortener.DataTransferObjects.ResetPasswordRequest;
import com.testing.springpractice.urlshortener.DataTransferObjects.VerifyEmailRequest;
import com.testing.springpractice.urlshortener.Service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public String register(@Valid @RequestBody RegisterRequest registerRequest){
        return authService.register(registerRequest);
    }
    @PostMapping("/verify-otp")
    public String verify(@Valid @RequestBody VerifyEmailRequest request){
        return authService.verify(request);
    }

    @PostMapping("/login")
    public String login(@Valid @RequestBody LoginRequest request){
        return authService.login(request);
    }

    @PostMapping("/send-otp")
    public String sendOtp(@RequestParam String username){
        return authService.sendOtp(username);
    }
    @PutMapping("/verify-reset-otp")
    public String verifyOtp(@Valid @RequestBody ResetPasswordRequest resetPasswordRequest){
        return authService.verifyPassword(resetPasswordRequest);
    }

}
