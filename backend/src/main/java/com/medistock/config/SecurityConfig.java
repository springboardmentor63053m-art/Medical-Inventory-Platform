package com.medistock.config;

import com.medistock.security.JwtAuthEntryPoint;
import com.medistock.security.JwtAuthFilter;
import com.medistock.security.OAuth2LoginSuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final JwtAuthEntryPoint jwtAuthEntryPoint;

    /**
     * Comma-separated list of allowed frontend origins in production, e.g.
     * "https://your-frontend.onrender.com,https://your-custom-domain.com".
     * Falls back to app.frontend-url (single origin) when this isn't set.
     * localhost:* is additionally allowed outside the "prod" profile only.
     */
    @Value("${app.cors.allowed-origins:${app.frontend-url:}}")
    private String allowedOriginsProperty;
    private final com.medistock.service.CustomUserDetailsService userDetailsService;
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    private final Environment environment;
    // Only present if spring.security.oauth2.client.registration.* is configured
    // (see application.properties). Used to detect — without forcing — whether
    // Google OAuth2 login is set up, so the filter chain below can enable it
    // conditionally instead of failing to start when it isn't configured.
    private final ObjectProvider<ClientRegistrationRepository> clientRegistrationRepository;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .exceptionHandling(ex -> ex.authenticationEntryPoint(jwtAuthEntryPoint))
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/health").permitAll()
                .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        // Google OAuth2 login (tech stack: "OAuth2 (Google Login)") — only
        // wired up if a ClientRegistrationRepository bean actually exists,
        // which Spring Boot only creates once GOOGLE_CLIENT_ID/SECRET are
        // configured. Nothing changes for the default build/run without them.
        if (clientRegistrationRepository.getIfAvailable() != null) {
            http.oauth2Login(oauth2 -> oauth2.successHandler(oAuth2LoginSuccessHandler));
        }

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> patterns = new ArrayList<>();
        // Only trust arbitrary localhost origins outside production — in prod
        // this would let any page running on a visitor's own machine make
        // credentialed cross-origin requests against the live API.
        if (!environment.acceptsProfiles(Profiles.of("prod"))) {
            patterns.add("http://localhost:*");
        }
        if (allowedOriginsProperty != null && !allowedOriginsProperty.isBlank()) {
            for (String origin : allowedOriginsProperty.split(",")) {
                String trimmed = origin.trim();
                if (!trimmed.isEmpty()) {
                    patterns.add(trimmed);
                }
            }
        }
        configuration.setAllowedOriginPatterns(patterns);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
