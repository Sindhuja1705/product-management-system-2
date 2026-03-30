package com.productmanagement.config;

import com.productmanagement.entity.User;
import com.productmanagement.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Component
public class DataLoader implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataLoader.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataLoader(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        try {
            if (!userRepository.existsByUsername("admin@system.com")) {
                User admin = new User("admin@system.com", passwordEncoder.encode("admin123"), Set.of("ADMIN"));
                userRepository.save(admin);
                log.info("Created default admin user (email: admin@system.com, password: admin123)");
            }
            if (!userRepository.existsByUsername("user@system.com")) {
                User user = new User("user@system.com", passwordEncoder.encode("user123"), Set.of("USER"));
                userRepository.save(user);
                log.info("Created default user (email: user@system.com, password: user123)");
            }
        } catch (Exception e) {
            log.error("DataLoader failed to create default users: {}", e.getMessage());
        }
    }
}
