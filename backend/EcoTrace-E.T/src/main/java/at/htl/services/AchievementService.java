package at.htl.services;

import at.htl.dtos.AchievementDto;
import at.htl.entities.*;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class AchievementService {

    @Transactional
    public List<AchievementDto> getUserAchievements(Long userId) {
        User user = User.findById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        List<Achievement> allAchievements = Achievement.listAll();
        List<UserAchievement> userAchievements = UserAchievement.list("user.id = ?1", userId);

        return allAchievements.stream().map(achievement -> {
            AchievementDto dto = mapToDto(achievement);
            
            // Check if user has unlocked this achievement
            UserAchievement userAch = userAchievements.stream()
                .filter(ua -> ua.achievement.id.equals(achievement.id))
                .findFirst()
                .orElse(null);

            if (userAch != null) {
                dto.isUnlocked = true;
                dto.unlockedAt = userAch.unlockedAt;
                dto.progress = 100;
                dto.isNew = userAch.isNew;
            } else {
                dto.isUnlocked = false;
                dto.progress = calculateProgress(user, achievement);
                dto.isNew = false;
            }

            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void checkAndUnlockAchievements(Long userId) {
        User user = User.findById(userId);
        if (user == null) return;

        List<Achievement> allAchievements = Achievement.listAll();
        
        for (Achievement achievement : allAchievements) {
            // Skip if already unlocked
            UserAchievement existing = UserAchievement.findByUserAndAchievement(userId, achievement.id);
            if (existing != null) continue;

            // Check if conditions are met
            if (checkAchievementCondition(user, achievement)) {
                unlockAchievement(user, achievement);
            }
        }
    }

    @Transactional
    public void markAchievementsAsViewed(Long userId) {
        List<UserAchievement> newAchievements = UserAchievement.list("user.id = ?1 and isNew = true", userId);
        for (UserAchievement ua : newAchievements) {
            ua.isNew = false;
            ua.persist();
        }
    }

    private boolean checkAchievementCondition(User user, Achievement achievement) {
        switch (achievement.targetType) {
            case "ACTIVITY_COUNT":
                long activityCount = UserActivity.countByUserId(user.id);
                return activityCount >= achievement.targetValue;

            case "CO2_SAVED":
                // Negative CO2 means savings (e.g., cycling instead of driving)
                double co2Saved = Math.abs(Math.min(0, user.totalCo2));
                return co2Saved >= achievement.targetValue;

            case "FRIENDS_COUNT":
                long friendCount = Friendship.count("user.id = ?1 or friend.id = ?1", user.id);
                return friendCount >= achievement.targetValue;

            case "SPECIFIC_ACTIVITY":
                long specificCount = UserActivity.count("user.id = ?1 and activityName = ?2", 
                    user.id, achievement.specificActivity);
                return specificCount >= achievement.targetValue;

            case "DAYS_STREAK":
                return checkStreak(user.id, achievement.targetValue);

            case "LOW_CO2":
                return user.totalCo2 != null && user.totalCo2 <= achievement.targetValue;

            default:
                return false;
        }
    }

    private boolean checkStreak(Long userId, int requiredDays) {
        List<UserActivity> activities = UserActivity.list("user.id = ?1 order by date desc", userId);
        if (activities.isEmpty()) return false;

        LocalDate currentDate = activities.get(0).date;
        int streak = 1;

        for (int i = 1; i < activities.size(); i++) {
            LocalDate previousDate = activities.get(i).date;
            if (currentDate.minusDays(1).equals(previousDate)) {
                streak++;
                currentDate = previousDate;
                if (streak >= requiredDays) return true;
            } else if (!currentDate.equals(previousDate)) {
                break; // Streak broken
            }
        }

        return streak >= requiredDays;
    }

    private int calculateProgress(User user, Achievement achievement) {
        switch (achievement.targetType) {
            case "ACTIVITY_COUNT":
                long activityCount = UserActivity.countByUserId(user.id);
                return Math.min(100, (int) ((activityCount * 100.0) / achievement.targetValue));

            case "CO2_SAVED":
                double co2Saved = Math.abs(Math.min(0, user.totalCo2 != null ? user.totalCo2 : 0));
                return Math.min(100, (int) ((co2Saved * 100.0) / achievement.targetValue));

            case "FRIENDS_COUNT":
                long friendCount = Friendship.count("user.id = ?1 or friend.id = ?1", user.id);
                return Math.min(100, (int) ((friendCount * 100.0) / achievement.targetValue));

            case "SPECIFIC_ACTIVITY":
                long specificCount = UserActivity.count("user.id = ?1 and activityName = ?2", 
                    user.id, achievement.specificActivity);
                return Math.min(100, (int) ((specificCount * 100.0) / achievement.targetValue));

            case "LOW_CO2":
                if (user.totalCo2 == null || user.totalCo2 <= 0) return 100;
                return Math.max(0, 100 - (int) ((user.totalCo2 * 100.0) / achievement.targetValue));

            default:
                return 0;
        }
    }

    @Transactional
    public void unlockAchievement(User user, Achievement achievement) {
        UserAchievement userAchievement = new UserAchievement();
        userAchievement.user = user;
        userAchievement.achievement = achievement;
        userAchievement.progress = 100;
        userAchievement.isNew = true;
        userAchievement.persist();
    }

    private AchievementDto mapToDto(Achievement achievement) {
        AchievementDto dto = new AchievementDto();
        dto.id = achievement.id;
        dto.name = achievement.name;
        dto.description = achievement.description;
        dto.icon = achievement.icon;
        dto.category = achievement.category;
        dto.targetValue = achievement.targetValue;
        dto.targetType = achievement.targetType;
        dto.specificActivity = achievement.specificActivity;
        dto.badgeColor = achievement.badgeColor;
        dto.points = achievement.points;
        return dto;
    }
}
