package com.testing.springpractice.urlshortener.DataTransferObjects.EmailDataTransferObjects;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Receiver {
    private String email;
}
