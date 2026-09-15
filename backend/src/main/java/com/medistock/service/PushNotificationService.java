package com.medistock.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Tech-stack doc lists Firebase Cloud Messaging as a push-notification
 * channel. Rather than pulling in the firebase-admin SDK (whose heavy
 * transitive dependency tree — protobuf/gRPC/guava — is a common source of
 * runtime classpath conflicts in Spring Boot apps), this calls the FCM v1
 * REST API directly over HTTPS with the JDK's built-in HttpClient.
 *
 * FCM v1 requires a short-lived OAuth2 access token per request; generating
 * one from a service-account key needs a JWT/OAuth exchange that would
 * otherwise pull in google-auth-library. To keep this dependency-free, the
 * token is supplied directly via firebase.access-token — generate one with
 * `gcloud auth print-access-token` (or a small scheduled job of your own)
 * and refresh it periodically; tokens are valid for ~1 hour. Stays a clean
 * no-op until that token and app.notifications.push.enabled are set.
 */
@Service
@Slf4j
public class PushNotificationService {

    private static final HttpClient CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    @Value("${app.notifications.push.enabled:false}")
    private boolean enabled;

    @Value("${firebase.project-id:}")
    private String projectId;

    @Value("${firebase.access-token:}")
    private String accessToken;

    public boolean isActive() {
        return enabled && !projectId.isBlank() && !accessToken.isBlank();
    }

    public void sendAlert(String deviceToken, String title, String body) {
        if (!isActive() || deviceToken == null || deviceToken.isBlank()) {
            log.debug("Push alerts not configured/enabled — skipping alert.");
            return;
        }
        try {
            String json = """
                {"message":{"token":"%s","notification":{"title":"%s","body":"%s"}}}
                """.formatted(escape(deviceToken), escape(title), escape(body));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://fcm.googleapis.com/v1/projects/" + projectId + "/messages:send"))
                    .timeout(Duration.ofSeconds(10))
                    .header("Authorization", "Bearer " + accessToken)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> response = CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 300) {
                log.warn("FCM push send failed ({}): {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.warn("Failed to send push alert: {}", e.getMessage());
        }
    }

    private static String escape(String s) {
        return s == null ? "" : s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
