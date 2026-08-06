package com.medistock.service;

import com.medistock.model.User;
import com.medistock.model.UserActivityLog;
import com.medistock.repository.UserActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserActivityService {

    private final UserActivityLogRepository userActivityLogRepository;

    @Transactional
    public void log(User user, String action, String details) {
        if (user == null) return;
        userActivityLogRepository.save(UserActivityLog.builder()
                .user(user)
                .action(action)
                .details(details)
                .build());
    }

    public List<UserActivityLog> getAll() {
        return userActivityLogRepository.findAllByOrderByTimestampDesc();
    }
}
