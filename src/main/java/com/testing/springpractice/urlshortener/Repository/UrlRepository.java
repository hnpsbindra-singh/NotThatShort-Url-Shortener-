package com.testing.springpractice.urlshortener.Repository;

import com.testing.springpractice.urlshortener.Models.Url;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UrlRepository extends MongoRepository<Url, String>{
    boolean existsByShortenCode(String shortenCode);
    Optional<Url> findByShortenCode(String shortenCode);
    List<Url> findByOwner(String owner);
    void deleteByShortenCode(String shortenCode);
}
