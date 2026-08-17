package com.testing.springpractice.urlshortener.Configuration;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class ProjectUtils {

    private final HttpServletRequest request;

    SecureRandom random = new SecureRandom();

    public ProjectUtils(HttpServletRequest request) {
        this.request = request;
    }

    public String generateCode(){
        String chars = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        StringBuilder buffer = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            buffer.append(chars.charAt(random.nextInt(chars.length())));
        }
        return buffer.toString();
    }

    public String getLink(String shortCode){
        String shortUrl = request.getScheme()
                + "://"
                + request.getServerName()
                + ":"
                + request.getServerPort()
                + "/"
                + shortCode;

        return shortUrl;
    }
}
