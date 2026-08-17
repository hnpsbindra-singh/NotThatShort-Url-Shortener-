package com.testing.springpractice.urlshortener.Repository;

import com.testing.springpractice.urlshortener.Models.Users;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;

import java.util.Optional;

public interface UsersRepository extends MongoRepository<Users, String> {
    Optional<Users> findByUsername(String username);

    boolean existsByUsername(String username);
    @Query("{ 'email': ?1 }") // Note: Users model maps 'email' field to username
    @Update("{ '$set': { 'password': ?0 } }")
    int updatePasswordForUsername(String newPassword, String username);
}
