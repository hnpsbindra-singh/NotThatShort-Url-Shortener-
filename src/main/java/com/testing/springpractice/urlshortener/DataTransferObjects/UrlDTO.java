package com.testing.springpractice.urlshortener.DataTransferObjects;


import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.URL;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UrlDTO {
    @NotBlank(message = "Original URL is required")
    @URL(message = "Invalid URL format")
    private String originalUrl;
}
