package com.medistock.common.security.oauth2;

import com.medistock.common.security.jwt.JwtService;
import com.medistock.common.security.principal.UserPrincipal;
import com.medistock.user.entity.User;
import com.medistock.user.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {

        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        Map<String, Object> attributes = oauth2User.getAttributes();
        
        String email = (String) attributes.get("email");
        if (email == null && attributes.containsKey("login")) {
            email = "github_" + attributes.get("id") + "@medistock.com";
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("OAuth2 User not found after authentication"));

        UserPrincipal userPrincipal = UserPrincipal.create(user);
        String token = jwtService.generateToken(userPrincipal);

        String redirectUrl = "http://localhost:5173/login?oauthToken=" + URLEncoder.encode(token, StandardCharsets.UTF_8)
                + "&email=" + URLEncoder.encode(user.getEmail(), StandardCharsets.UTF_8);

        log.info("OAuth2 login successful for user {}, redirecting to {}", email, redirectUrl);
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
