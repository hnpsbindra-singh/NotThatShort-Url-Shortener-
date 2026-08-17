package com.testing.springpractice.urlshortener.Models;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.IndexDirection;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class Url {
    @Id
    private String id;
    private String originalUrl;
    @Indexed(unique = true, direction = IndexDirection.ASCENDING)
    private String shortenCode;
    private String owner;
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    @Indexed(expireAfter = "0")
    private LocalDateTime expiresAt;

}
