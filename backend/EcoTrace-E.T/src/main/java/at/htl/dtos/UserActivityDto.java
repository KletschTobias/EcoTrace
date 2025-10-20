package at.htl.dtos;

import at.htl.entities.UserActivity;
import java.time.LocalDate;

public class UserActivityDto {
    public Long id;
    public Long userId;
    public String activityName;
    public String category;
    public Double quantity;
    public String unit;
    public Double co2Impact;
    public Double waterImpact;
    public Double electricityImpact;
    public LocalDate date;

    public UserActivityDto() {}

    public UserActivityDto(UserActivity userActivity) {
        this.id = userActivity.id;
        this.userId = userActivity.user.id;
        this.activityName = userActivity.activityName;
        this.category = userActivity.category;
        this.quantity = userActivity.quantity;
        this.unit = userActivity.unit;
        this.co2Impact = userActivity.co2Impact;
        this.waterImpact = userActivity.waterImpact;
        this.electricityImpact = userActivity.electricityImpact;
        this.date = userActivity.date;
    }

    public static UserActivityDto from(UserActivity userActivity) {
        return new UserActivityDto(userActivity);
    }
}
