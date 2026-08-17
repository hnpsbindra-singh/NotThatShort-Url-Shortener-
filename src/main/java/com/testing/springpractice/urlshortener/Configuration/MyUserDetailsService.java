package com.testing.springpractice.urlshortener.Configuration;

import com.testing.springpractice.urlshortener.Models.Users;
import com.testing.springpractice.urlshortener.Repository.UsersRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;
@Service
public class MyUserDetailsService implements UserDetailsService {
    private final UsersRepository usersRepository;

    public MyUserDetailsService(UsersRepository usersRepository) {
        this.usersRepository = usersRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Users user= usersRepository.findByUsername(username).orElseThrow(
                ()-> new UsernameNotFoundException("Invalid Username")
        );
        return user;
    }
}
