package com.testing.springpractice.urlshortener.Controller;

import com.testing.springpractice.urlshortener.DataTransferObjects.UrlDTO;
import com.testing.springpractice.urlshortener.DataTransferObjects.UserDTO;
import com.testing.springpractice.urlshortener.Models.Url;
import com.testing.springpractice.urlshortener.Service.UrlMappingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/api/url")
public class UrlController {
    private final UrlMappingService urlMappingService;

    public UrlController(UrlMappingService urlMappingService) {
        this.urlMappingService = urlMappingService;
    }

    @PostMapping("/shorten")
    public ResponseEntity<String> urlShortener(@Valid @RequestBody UrlDTO dto){
        return urlMappingService.urlShortener(dto);
    }

    @GetMapping("/get/{code}")
    public String getLink(@PathVariable String code){
        return urlMappingService.getLink(code);
    }

    @GetMapping("/get/All/me")
    public List<Url> getLinks(){
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return urlMappingService.getAllLinks(username);
    }

    @GetMapping("/get/me")
    public ResponseEntity<UserDTO> getUserProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(urlMappingService.getUserProfile(username));
    }

    @DeleteMapping("/get/{code}")
    public ResponseEntity<String> deleteLink(@PathVariable String code){
        return urlMappingService.delete(code);
    }
}
