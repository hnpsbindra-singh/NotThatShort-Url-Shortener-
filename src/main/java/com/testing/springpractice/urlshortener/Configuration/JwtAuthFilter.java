package com.testing.springpractice.urlshortener.Configuration;

import com.testing.springpractice.urlshortener.Models.Users;
import com.testing.springpractice.urlshortener.Repository.UsersRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtUtils jwtUtils;
    private final UsersRepository usersRepository;

    public JwtAuthFilter(JwtUtils jwtUtils, UsersRepository usersRepository) {
        this.jwtUtils = jwtUtils;
        this.usersRepository = usersRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request
            , HttpServletResponse response
            , FilterChain filterChain) throws ServletException, IOException {
        String username = null;
        String token = null;
        String header = request.getHeader("Authorization");
        if (request.getRequestURI().startsWith("/v1/api/auth")){
            filterChain.doFilter(request, response);
            return;
        }
        if (header!=null&&header.startsWith("Bearer ")){
            token = header.substring(7);
        }

        try {
            if (token!=null){
                if (jwtUtils.isExpired(token)){
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token Invalid");
                    return;
                }
                if (!jwtUtils.isVerified(token)) {
                    response.sendError(HttpServletResponse.SC_FORBIDDEN, "User account is not verified");
                    return;
                }
                username = jwtUtils.getUsername(token);
            }
        }catch (Exception e){
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, e.getMessage());
            return;
        }

        if (username!=null&& SecurityContextHolder.getContext().getAuthentication()==null){
            Users users = usersRepository.findByUsername(username).orElseThrow(
                    ()->new UsernameNotFoundException("Invalid Username")
            );
            if (users!=null){
                SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                        users,
                        token,
                        users.getAuthorities()
                ));
            }
        }
        filterChain.doFilter(request, response);
    }
}
