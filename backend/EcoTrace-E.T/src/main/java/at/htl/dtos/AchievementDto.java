package at.htl.dtos;

import java.time.LocalDateTime;

public class AchievementDto {
    public Long id;
    public String name;
    public String description;
    public String icon;
    public String category;
    public Integer targetValue;
    public String targetType;
    public String specificActivity;
    public String badgeColor;
    public Integer points;
    
    // For user achievements
    public LocalDateTime unlockedAt;
    public Integer progress;
    public Boolean isNew;
    public Boolean isUnlocked;
}
