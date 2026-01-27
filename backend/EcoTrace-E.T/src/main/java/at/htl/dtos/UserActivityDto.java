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
    
    // Recurring activity fields
    public Boolean isRecurring;
    public Integer timesPerWeek;
    public Integer weeksPerYear;
    
    // Calculated total impacts (including recurring multiplier)
    public Double totalCo2Impact;
    public Double totalWaterImpact;
    public Double totalElectricityImpact;

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
        
        // Recurring fields
        this.isRecurring = userActivity.isRecurring;
        this.timesPerWeek = userActivity.timesPerWeek;
        this.weeksPerYear = userActivity.weeksPerYear;
        
        // Calculate totals
        this.totalCo2Impact = userActivity.getTotalCo2Impact();
        this.totalWaterImpact = userActivity.getTotalWaterImpact();
        this.totalElectricityImpact = userActivity.getTotalElectricityImpact();
    }

    public static UserActivityDto from(UserActivity userActivity) {
        return new UserActivityDto(userActivity);
    }
}
