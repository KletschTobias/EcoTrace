package at.htl.services;

import at.htl.dtos.CreateUserActivityRequest;
import at.htl.dtos.StatsDto;
import at.htl.dtos.UserActivityDto;
import at.htl.entities.User;
import at.htl.entities.UserActivity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class UserActivityService {

    @Inject
    AuthService authService;

    public List<UserActivityDto> getUserActivities(Long userId) {
        User user = User.findById(userId);
        if (user == null) {
            throw new NotFoundException("User not found");
        }

        return UserActivity.<UserActivity>list("user.id = ?1 order by date desc", userId).stream()
                .map(UserActivityDto::from)
                .collect(Collectors.toList());
    }

    public List<UserActivityDto> getUserActivitiesByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        User user = User.findById(userId);
        if (user == null) {
            throw new NotFoundException("User not found");
        }

        return UserActivity.<UserActivity>list("user.id = ?1 and date >= ?2 and date <= ?3 order by date desc", 
                userId, startDate, endDate).stream()
                .map(UserActivityDto::from)
                .collect(Collectors.toList());
    }

    public List<UserActivityDto> getUserActivitiesByCategory(Long userId, String category) {
        return UserActivity.<UserActivity>list("user.id = ?1 and category = ?2 order by date desc", 
                userId, category).stream()
                .map(UserActivityDto::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserActivityDto createUserActivity(Long userId, CreateUserActivityRequest request) {
        User user = User.findById(userId);
        if (user == null) {
            throw new NotFoundException("User not found");
        }

        UserActivity userActivity = new UserActivity();
        userActivity.user = user;
        userActivity.activityName = request.activityName;
        userActivity.category = request.category;
        userActivity.quantity = request.quantity;
        userActivity.unit = request.unit;
        userActivity.co2Impact = request.co2Impact != null ? request.co2Impact : 0.0;
        userActivity.waterImpact = request.waterImpact != null ? request.waterImpact : 0.0;
        userActivity.electricityImpact = request.electricityImpact != null ? request.electricityImpact : 0.0;
        userActivity.date = request.date;
        
        // Recurring activity fields
        userActivity.isRecurring = request.isRecurring != null ? request.isRecurring : false;
        userActivity.timesPerWeek = request.timesPerWeek;
        userActivity.weeksPerYear = request.weeksPerYear != null ? request.weeksPerYear : 52;
        
        userActivity.persist();

        // Update user totals (using total impact which includes recurring multiplier)
        user.totalCo2 += userActivity.getTotalCo2Impact();
        user.totalWater += userActivity.getTotalWaterImpact();
        user.totalElectricity += userActivity.getTotalElectricityImpact();
        user.persist();

        return UserActivityDto.from(userActivity);
    }

    @Transactional
    public void deleteUserActivity(Long userId, Long activityId) {
        UserActivity userActivity = UserActivity.findById(activityId);
        if (userActivity == null) {
            throw new NotFoundException("Activity not found");
        }

        if (!userActivity.user.id.equals(userId)) {
            throw new NotFoundException("Activity does not belong to this user");
        }

        // Update user totals (using total impact which includes recurring multiplier)
        User user = userActivity.user;
        user.totalCo2 -= userActivity.getTotalCo2Impact();
        user.totalWater -= userActivity.getTotalWaterImpact();
        user.totalElectricity -= userActivity.getTotalElectricityImpact();
        user.persist();

        userActivity.delete();
    }

    public StatsDto getUserStats(Long userId, LocalDate startDate, LocalDate endDate) {
        List<UserActivity> activities = UserActivity.list("user.id = ?1 and date >= ?2 and date <= ?3", 
                userId, startDate, endDate);

        double co2 = activities.stream().mapToDouble(a -> a.co2Impact).sum();
        double water = activities.stream().mapToDouble(a -> a.waterImpact).sum();
        double electricity = activities.stream().mapToDouble(a -> a.electricityImpact).sum();

        return new StatsDto(co2, water, electricity);
    }
}
