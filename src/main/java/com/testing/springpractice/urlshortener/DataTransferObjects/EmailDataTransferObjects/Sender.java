package com.testing.springpractice.urlshortener.DataTransferObjects.EmailDataTransferObjects;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sender {
    private String name;
    private String email;
}
