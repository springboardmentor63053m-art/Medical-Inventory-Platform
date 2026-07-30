package com.medistock.common.security.oauth2;

import com.medistock.role.entity.Role;
import com.medistock.role.repository.RoleRepository;
import com.medistock.user.entity.User;
import com.medistock.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        Map<String, Object> attributes = oauth2User.getAttributes();
        String email = extractEmail(attributes, registrationId);
        String name = extractName(attributes, registrationId);

        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException("Email not provided by " + registrationId + " OAuth2 provider");
        }

        String[] nameParts = name != null ? name.split(" ", 2) : new String[]{"OAuth2", "User"};
        String firstName = nameParts.length > 0 && !nameParts[0].isBlank() ? nameParts[0] : "OAuth2";
        String lastName = nameParts.length > 1 ? nameParts[1] : "User";

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            Role staffRole = roleRepository.findByName("STAFF")
                    .orElseGet(() -> roleRepository.save(Role.builder()
                            .name("STAFF")
                            .description("Staff Role")
                            .build()));

            long count = userRepository.count() + 1;
            String autoEmpId = String.format("EMP%03d", count);

            return User.builder()
                    .employeeId(autoEmpId)
                    .email(email)
                    .firstName(firstName)
                    .lastName(lastName)
                    .password(UUID.randomUUID().toString()) // Dummy password for OAuth users
                    .enabled(true)
                    .accountNonLocked(true)
                    .roles(new HashSet<>(Collections.singletonList(staffRole)))
                    .build();
        });

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        return oauth2User;
    }

    private String extractEmail(Map<String, Object> attributes, String provider) {
        if (attributes.containsKey("email") && attributes.get("email") != null) {
            return (String) attributes.get("email");
        }
        return provider.toLowerCase() + "_" + attributes.getOrDefault("id", UUID.randomUUID().toString()) + "@medistock.com";
    }

    private String extractName(Map<String, Object> attributes, String provider) {
        if (attributes.containsKey("name") && attributes.get("name") != null) {
            return (String) attributes.get("name");
        }
        if (attributes.containsKey("login")) {
            return (String) attributes.get("login");
        }
        return "OAuth2 User";
    }
}
