package com.testing.springpractice.urlshortener.Service;

import com.testing.springpractice.urlshortener.Configuration.ProjectUtils;
import com.testing.springpractice.urlshortener.CustomExceptions.FailedRequest;
import com.testing.springpractice.urlshortener.CustomExceptions.InvalidAccess;
import com.testing.springpractice.urlshortener.CustomExceptions.LimitQuotaReached;
import com.testing.springpractice.urlshortener.CustomExceptions.LinkNotFoundException;
import com.testing.springpractice.urlshortener.DataTransferObjects.UrlDTO;
import com.testing.springpractice.urlshortener.Models.Url;
import com.testing.springpractice.urlshortener.Models.Users;
import com.testing.springpractice.urlshortener.Repository.UrlRepository;
import com.testing.springpractice.urlshortener.Repository.UsersRepository;
import jakarta.validation.Valid;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.testing.springpractice.urlshortener.DataTransferObjects.UserDTO;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UrlMappingService {

    private final ProjectUtils projectUtils;
    private final UrlRepository urlRepository;
    private final UsersRepository usersRepository;
    private final CacheManager cacheManager;

    public UrlMappingService(ProjectUtils projectUtils, UrlRepository urlRepository, UsersRepository usersRepository, CacheManager cacheManager) {
        this.projectUtils = projectUtils;
        this.urlRepository = urlRepository;
        this.usersRepository = usersRepository;
        this.cacheManager = cacheManager;
    }


    public ResponseEntity<String> urlShortener(@Valid UrlDTO dto) {

        Users principal = (Users) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        Users user = usersRepository.findByUsername(principal.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (user.getUrlShortenedLeft() == null || user.getUrlShortenedLeft() <= 0) {
            throw new LimitQuotaReached("Limit Reached");
        }
        user.setUrlShortenedLeft(user.getUrlShortenedLeft() - 1);
        usersRepository.save(user);

        Url url = new Url();
        url.setOriginalUrl(dto.getOriginalUrl());
        url.setOwner(user.getUsername());


        String shortenCode;
        do {
            shortenCode = projectUtils.generateCode();
        } while (urlRepository.existsByShortenCode(shortenCode));

        url.setShortenCode(shortenCode);
        url.setExpiresAt(LocalDateTime.now().plusDays(7));
        Url saved = urlRepository.save(url);
        if (cacheManager.getCache("urlCache") != null) {
            cacheManager.getCache("urlCache").evict(user.getUsername());
        }

        String shortUrl = projectUtils.getLink(saved.getShortenCode());
        return ResponseEntity.status(HttpStatus.OK)
                .body(shortUrl);
    }

    @Cacheable(value = "shortenUrl", key = "#code")
    public String getLink(String code) {
        Url url = urlRepository.findByShortenCode(code)
                .orElseThrow(() -> new FailedRequest("URL not found"));
        if (url.getExpiresAt() != null && url.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new FailedRequest("This URL has expired");
        }
        return url.getOriginalUrl();
    }

    @Cacheable(value = "urlCache", key = "#username")
    public List<Url> getAllLinks(String username) {
        return urlRepository.findByOwner(username);
    }

    public UserDTO getUserProfile(String username) {
        Users user = usersRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .username(user.getUsername())
                .urlShortenAllowed(user.getUrlShortenAllowed())
                .urlShortenedLeft(user.getUrlShortenedLeft())
                .verified(user.getVerified())
                .build();
    }

    public ResponseEntity<String> delete(String code) {
        Url url = urlRepository.findByShortenCode(code).orElseThrow(()-> new LinkNotFoundException("Invalid Link"));
        String username = usersRepository.findByUsername(SecurityContextHolder.getContext().getAuthentication().getName())
                .orElseThrow(()->new UsernameNotFoundException("Invalid Username")).getUsername();
        if (!url.getOwner().equals(username)){
            throw new InvalidAccess("Invalid Access");
        }
        urlRepository.deleteByShortenCode(code);
        if (cacheManager.getCache("shortenUrl") != null) {
            cacheManager.getCache("shortenUrl").evict(code);
        }
        if (cacheManager.getCache("urlCache") != null) {
            cacheManager.getCache("urlCache").evict(username);
        }
        return ResponseEntity.status(HttpStatus.OK).body("URL deleted successfully");

    }
}
