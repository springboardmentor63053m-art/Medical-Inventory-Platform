package com.medistock.service;

import com.medistock.dto.ForgotPasswordRequest;
import com.medistock.dto.RegisterRequest;
import com.medistock.dto.ResetPasswordRequest;
import com.medistock.model.PasswordResetToken;
import com.medistock.model.Role;
import com.medistock.model.User;
import com.medistock.repository.PasswordResetTokenRepository;
import com.medistock.repository.SupplierRepository;
import com.medistock.repository.UserRepository;
import com.medistock.security.CurrentUserProvider;
import com.medistock.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.security.core.userdetails.User.UserBuilder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Covers the two most safety-critical pieces of AuthService: that public
 * self-registration can never produce a SUPPLIER or ADMIN account
 * (requirement 5 / the security fix in this pass), and that the
 * password-reset flow behaves correctly for the happy path and every
 * failure mode (expired / used / unknown token) without ever revealing
 * whether an email is registered (requirement 21).
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private SupplierRepository supplierRepository;
    @Mock private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private org.springframework.security.authentication.AuthenticationManager authenticationManager;
    @Mock private CustomUserDetailsService userDetailsService;
    @Mock private JwtUtil jwtUtil;
    @Mock private ActiveUserTrackingService activeUserTrackingService;
    @Mock private UserActivityService userActivityService;
    @Mock private CurrentUserProvider currentUserProvider;
    @Mock private EmailNotificationService emailNotificationService;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "frontendUrl", "http://localhost:5173");
        // Common stubs needed by issueToken(), only used by tests that reach that far.
    }

    private void stubIssueToken() {
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername("test@medistock.com").password("x").authorities(List.of()).build();
        when(userDetailsService.loadUserByUsername(anyString())).thenReturn(userDetails);
        when(jwtUtil.generateToken(any(), anyString())).thenReturn("fake-jwt");
    }

    // ---------------------------------------------------------- register()

    @ParameterizedTest
    @EnumSource(value = Role.class, names = {"STAFF", "PHARMACIST"})
    void register_allowsStaffAndPharmacist(Role role) {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Jane Doe");
        request.setEmail("jane@medistock.com");
        request.setPassword("password123");
        request.setRole(role);

        when(userRepository.existsByEmail("jane@medistock.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        stubIssueToken();

        authService.register(request);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getRole()).isEqualTo(role);
        assertThat(captor.getValue().getSupplierId()).isNull();
    }

    @Test
    void register_rejectsSupplierRoleEvenWithValidSupplierId() {
        // This is the exact exploit this pass fixed: a raw API call claiming
        // role=SUPPLIER (with a real supplierId) must never succeed through
        // the public registration endpoint.
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Sneaky Supplier");
        request.setEmail("sneaky@medistock.com");
        request.setPassword("password123");
        request.setRole(Role.SUPPLIER);
        request.setSupplierId(1L);

        when(userRepository.existsByEmail("sneaky@medistock.com")).thenReturn(false);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("STAFF or PHARMACIST");

        verify(userRepository, never()).save(any());
        verifyNoInteractions(supplierRepository); // must not even check if the supplier exists — rejected before that
    }

    @Test
    void register_rejectsAdminRole() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Wannabe Admin");
        request.setEmail("wannabe@medistock.com");
        request.setPassword("password123");
        request.setRole(Role.ADMIN);

        when(userRepository.existsByEmail("wannabe@medistock.com")).thenReturn(false);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(IllegalArgumentException.class);
        verify(userRepository, never()).save(any());
    }

    @Test
    void register_rejectsDuplicateEmail() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Jane Doe");
        request.setEmail("jane@medistock.com");
        request.setPassword("password123");
        request.setRole(Role.STAFF);

        when(userRepository.existsByEmail("jane@medistock.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already exists");
        verify(userRepository, never()).save(any());
    }

    // ------------------------------------------------- registerSupplierAccount()

    @Test
    void registerSupplierAccount_succeedsWithValidSupplierId() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Supplier Rep");
        request.setEmail("rep@supplier.com");
        request.setPassword("password123");

        when(userRepository.existsByEmail("rep@supplier.com")).thenReturn(false);
        when(supplierRepository.existsById(7L)).thenReturn(true);
        when(passwordEncoder.encode("password123")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        stubIssueToken();

        authService.registerSupplierAccount(request, 7L);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getRole()).isEqualTo(Role.SUPPLIER);
        assertThat(captor.getValue().getSupplierId()).isEqualTo(7L);
    }

    @Test
    void registerSupplierAccount_rejectsUnknownSupplierId() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Supplier Rep");
        request.setEmail("rep@supplier.com");
        request.setPassword("password123");

        when(userRepository.existsByEmail("rep@supplier.com")).thenReturn(false);
        when(supplierRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> authService.registerSupplierAccount(request, 999L))
                .isInstanceOf(jakarta.persistence.EntityNotFoundException.class);
        verify(userRepository, never()).save(any());
    }

    // ----------------------------------------------------- forgotPassword()

    @Test
    void forgotPassword_silentlyNoOpsForUnknownEmail() {
        // No exception, no token created, no email sent — and crucially, no
        // way for the caller to distinguish this from the "email exists" case.
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("nobody@medistock.com");
        when(userRepository.findByEmail("nobody@medistock.com")).thenReturn(Optional.empty());

        authService.forgotPassword(request);

        verify(passwordResetTokenRepository, never()).save(any());
        verifyNoInteractions(emailNotificationService);
    }

    @Test
    void forgotPassword_createsTokenAndSendsEmailForKnownUser() {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("jane@medistock.com");
        User user = User.builder().id(1L).email("jane@medistock.com").fullName("Jane").role(Role.STAFF).build();
        when(userRepository.findByEmail("jane@medistock.com")).thenReturn(Optional.of(user));

        authService.forgotPassword(request);

        ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(passwordResetTokenRepository).save(tokenCaptor.capture());
        PasswordResetToken saved = tokenCaptor.getValue();
        assertThat(saved.getUser()).isEqualTo(user);
        assertThat(saved.isUsed()).isFalse();
        assertThat(saved.getExpiresAt()).isAfter(LocalDateTime.now());
        // The raw token must never be persisted — only its hash.
        assertThat(saved.getTokenHash()).isNotBlank();

        verify(emailNotificationService).sendPasswordResetEmail(eq("jane@medistock.com"), contains("/reset-password?token="));
    }

    // ------------------------------------------------------ resetPassword()

    @Test
    void resetPassword_rejectsUnknownToken() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("garbage-token");
        request.setNewPassword("newpassword123");
        when(passwordResetTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.resetPassword(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid or expired");
    }

    @Test
    void resetPassword_rejectsAlreadyUsedToken() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("some-token");
        request.setNewPassword("newpassword123");

        PasswordResetToken token = PasswordResetToken.builder()
                .used(true).expiresAt(LocalDateTime.now().plusMinutes(10))
                .user(User.builder().id(1L).build()).build();
        when(passwordResetTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> authService.resetPassword(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already been used");
        verify(userRepository, never()).save(any());
    }

    @Test
    void resetPassword_rejectsExpiredToken() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("some-token");
        request.setNewPassword("newpassword123");

        PasswordResetToken token = PasswordResetToken.builder()
                .used(false).expiresAt(LocalDateTime.now().minusMinutes(1))
                .user(User.builder().id(1L).build()).build();
        when(passwordResetTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> authService.resetPassword(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("expired");
        verify(userRepository, never()).save(any());
    }

    @Test
    void resetPassword_updatesPasswordAndConsumesTokenOnSuccess() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("valid-token");
        request.setNewPassword("brandNewPassword1");

        User user = User.builder().id(1L).fullName("Jane").email("jane@medistock.com").role(Role.STAFF).build();
        PasswordResetToken token = PasswordResetToken.builder()
                .used(false).expiresAt(LocalDateTime.now().plusMinutes(10)).user(user).build();
        when(passwordResetTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));
        when(passwordEncoder.encode("brandNewPassword1")).thenReturn("hashed-new-password");

        authService.resetPassword(request);

        assertThat(user.getPassword()).isEqualTo("hashed-new-password");
        assertThat(token.isUsed()).isTrue();
        verify(userRepository).save(user);
        verify(passwordResetTokenRepository).save(token);
    }

    private static String contains(String substring) {
        return org.mockito.ArgumentMatchers.argThat(s -> s != null && s.contains(substring));
    }
}
