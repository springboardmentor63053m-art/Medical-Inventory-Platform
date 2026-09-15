package com.medistock.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;

/**
 * Tech-stack doc lists Twilio as an SMS notification channel. Rather than
 * pulling in the twilio-java SDK (which drags in okhttp/gson/jackson
 * versions that can clash with Spring Boot's own managed versions), this
 * calls Twilio's REST API directly over HTTPS with the JDK's built-in
 * HttpClient — zero extra dependencies. Stays a clean no-op until
 * twilio.account-sid / twilio.auth-token / app.notifications.sms.enabled
 * are all configured.
 */
@Service
@Slf4j
public class SmsNotificationService {

    private static final HttpClient CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    @Value("${app.notifications.sms.enabled:false}")
    private boolean enabled;

    @Value("${twilio.account-sid:}")
    private String accountSid;

    @Value("${twilio.auth-token:}")
    private String authToken;

    @Value("${twilio.from-number:}")
    private String fromNumber;

    public boolean isActive() {
        return enabled && !accountSid.isBlank() && !authToken.isBlank() && !fromNumber.isBlank();
    }

    public void sendAlert(String toPhoneNumber, String body) {
        if (!isActive() || toPhoneNumber == null || toPhoneNumber.isBlank()) {
            log.debug("SMS alerts not configured/enabled — skipping alert.");
            return;
        }
        try {
            String credentials = Base64.getEncoder()
                    .encodeToString((accountSid + ":" + authToken).getBytes(StandardCharsets.UTF_8));
            String form = "To=" + urlEncode(toPhoneNumber)
                    + "&From=" + urlEncode(fromNumber)
                    + "&Body=" + urlEncode(body);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json"))
                    .timeout(Duration.ofSeconds(10))
                    .header("Authorization", "Basic " + credentials)
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(form))
                    .build();

            HttpResponse<String> response = CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 300) {
                log.warn("Twilio SMS send failed ({}): {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            // Never let a notification failure break inventory processing.
            log.warn("Failed to send SMS alert: {}", e.getMessage());
        }
    }

    private static String urlEncode(String value) {
        return java.net.URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
