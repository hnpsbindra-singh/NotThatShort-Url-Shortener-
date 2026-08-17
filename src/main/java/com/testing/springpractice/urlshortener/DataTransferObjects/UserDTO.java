package com.testing.springpractice.urlshortener.DataTransferObjects;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserDTO {
    private String id;
    private String name;
    private String username;
    private Long urlShortenAllowed;
    private Long urlShortenedLeft;
    @Builder.Default
    private Boolean verified = false;
}
