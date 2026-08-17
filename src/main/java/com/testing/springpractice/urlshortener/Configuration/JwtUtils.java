package com.testing.springpractice.urlshortener.Configuration;

import com.testing.springpractice.urlshortener.Models.Users;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String jwtSecret;
    @Value("${jwt.expiration}")
    private Long jwtExpiration;

    public Key getSignedKey(){
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateJWT(Users users){
        return Jwts.builder().signWith(getSignedKey())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis()+jwtExpiration))
                .setSubject(users.getUsername())
                .claim("name", users.getName())
                .claim("id", users.getId())
                .claim("verified", users.getVerified())
                .compact();
    }

    public Claims getClaims(String token){
        return Jwts.parser().setSigningKey(getSignedKey())
                .build()
                .parseClaimsJws(token).getBody();
    }
    public String getId(String token){
        return getClaims(token).get("id", String.class);
    }
    public String getUsername(String token){
        return getClaims(token).getSubject();
    }
    public Date getExpiration(String token){
        return getClaims(token).getExpiration();
    }
    public Boolean isExpired(String token){
        return getExpiration(token).before(new Date(System.currentTimeMillis()));
    }
    public String getName(String token){
        return getClaims(token).get("name", String.class);
    }
    public boolean isVerified(String token){
        return getClaims(token).get("verified", Boolean.class);
    }



}
