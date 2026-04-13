package com.vibechecker.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class VibeCodeCheckerApplication {

	public static void main(String[] args) {
		SpringApplication.run(VibeCodeCheckerApplication.class, args);
	}
}