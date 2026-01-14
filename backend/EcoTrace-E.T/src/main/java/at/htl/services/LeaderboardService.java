package at.htl.services;

import at.htl.entities.LeaderboardEntry;
import at.htl.entities.LeaderboardEntry.PeriodType;
import at.htl.entities.User;
import at.htl.entities.UserActivity;
import at.htl.repositories.LeaderboardRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@ApplicationScoped
public class LeaderboardService {

    @Inject
    LeaderboardRepository leaderboardRepository;

    // Realistic daily limits for disqualification
    private static final double MAX_DAILY_CO2 = 100.0; // kg - about 10x average
    private static final double MAX_DAILY_WATER = 2000.0; // liters - about 10x average
    private static final double MAX_DAILY_ELECTRICITY = 100.0; // kWh - about 10x average
    
    private static final double MIN_DAILY_CO2 = 0.1; // kg - minimum realistic
    private static final double MIN_DAILY_WATER = 1.0; // liters - minimum realistic
    private static final double MIN_DAILY_ELECTRICITY = 0.1; // kWh - minimum realistic

    /**
     * Update or create leaderboard entry when user logs an activity
     */
    @Transactional
    public void updateLeaderboardForUser(User user, LocalDate activityDate) {
        // Update all period types
        for (PeriodType periodType : PeriodType.values()) {
            updateLeaderboardEntry(user, periodType, activityDate);
        }
    }

    /**
     * Update a specific leaderboard entry for a user
     */
    @Transactional
    public void updateLeaderboardEntry(User user, PeriodType periodType, LocalDate activityDate) {
        LocalDate periodStart = LeaderboardRepository.calculatePeriodStart(periodType);
        LocalDate periodEnd = LeaderboardRepository.calculatePeriodEnd(periodType);
        
        // Check if activity date is within current period
        if (activityDate.isBefore(periodStart) || activityDate.isAfter(periodEnd)) {
            return; // Activity is not in current period
        }

        // Find or create leaderboard entry
        LeaderboardEntry entry = leaderboardRepository.findByUserAndPeriod(user.id, periodType, periodStart)
                .orElseGet(() -> {
                    LeaderboardEntry newEntry = new LeaderboardEntry();
                    newEntry.user = user;
                    newEntry.periodType = periodType;
                    newEntry.periodStart = periodStart;
                    newEntry.periodEnd = periodEnd;
                    newEntry.daysRequired = LeaderboardRepository.calculateDaysRequired(periodType);
                    return newEntry;
                });

        // Calculate totals from activities
        calculateTotalsForPeriod(entry, user.id, periodStart, periodEnd);
        
        // Count unique days tracked
        Set<LocalDate> daysTracked = getTrackedDays(user.id, periodStart, periodEnd);
        entry.daysTracked = daysTracked.size();
        
        // Validate values
        validateEntry(entry);
        
        // Check eligibility
        entry.checkEligibility();
        
        // Save entry
        leaderboardRepository.persist(entry);
    }

    /**
     * Calculate total impacts for a period
     */
    private void calculateTotalsForPeriod(LeaderboardEntry entry, Long userId, LocalDate start, LocalDate end) {
        List<UserActivity> activities = UserActivity.find(
                "user.id = ?1 and date >= ?2 and date <= ?3", userId, start, end).list();
        
        entry.totalCo2 = activities.stream().mapToDouble(a -> a.co2Impact != null ? a.co2Impact : 0.0).sum();
        entry.totalWater = activities.stream().mapToDouble(a -> a.waterImpact != null ? a.waterImpact : 0.0).sum();
        entry.totalElectricity = activities.stream().mapToDouble(a -> a.electricityImpact != null ? a.electricityImpact : 0.0).sum();
    }

    /**
     * Get unique days that user has tracked activities
     */
    private Set<LocalDate> getTrackedDays(Long userId, LocalDate start, LocalDate end) {
        List<UserActivity> activities = UserActivity.find(
                "user.id = ?1 and date >= ?2 and date <= ?3", userId, start, end).list();
        
        return activities.stream()
                .map(a -> a.date)
                .collect(Collectors.toSet());
    }

    /**
     * Validate entry values and mark as invalid if unrealistic
     */
    private void validateEntry(LeaderboardEntry entry) {
        int days = Math.max(1, entry.daysTracked);
        
        double avgDailyCo2 = entry.totalCo2 / days;
        double avgDailyWater = entry.totalWater / days;
        double avgDailyElectricity = entry.totalElectricity / days;
        
        List<String> reasons = new ArrayList<>();
        
        // Check for unrealistically high values
        if (avgDailyCo2 > MAX_DAILY_CO2) {
            reasons.add("CO2 too high (" + String.format("%.1f", avgDailyCo2) + " kg/day)");
        }
        if (avgDailyWater > MAX_DAILY_WATER) {
            reasons.add("Water too high (" + String.format("%.0f", avgDailyWater) + " L/day)");
        }
        if (avgDailyElectricity > MAX_DAILY_ELECTRICITY) {
            reasons.add("Electricity too high (" + String.format("%.1f", avgDailyElectricity) + " kWh/day)");
        }
        
        // Check for unrealistically low values (gaming the system)
        if (entry.totalCo2 > 0 && avgDailyCo2 < MIN_DAILY_CO2) {
            reasons.add("CO2 suspiciously low");
        }
        if (entry.totalWater > 0 && avgDailyWater < MIN_DAILY_WATER) {
            reasons.add("Water suspiciously low");
        }
        if (entry.totalElectricity > 0 && avgDailyElectricity < MIN_DAILY_ELECTRICITY) {
            reasons.add("Electricity suspiciously low");
        }
        
        if (!reasons.isEmpty()) {
            entry.isValid = false;
            entry.disqualificationReason = String.join("; ", reasons);
        } else {
            entry.isValid = true;
            entry.disqualificationReason = null;
        }
    }

    /**
     * Get leaderboard for a specific period
     */
    public List<LeaderboardEntry> getLeaderboard(PeriodType periodType) {
        LocalDate periodStart = LeaderboardRepository.calculatePeriodStart(periodType);
        List<LeaderboardEntry> entries = leaderboardRepository.getLeaderboardByPeriod(periodType, periodStart);
        
        // Assign ranks
        for (int i = 0; i < entries.size(); i++) {
            entries.get(i).rank = i + 1;
        }
        
        return entries;
    }

    /**
     * Get leaderboard for user and their friends
     */
    public List<LeaderboardEntry> getLeaderboardForUserAndFriends(Long userId, List<Long> friendIds, PeriodType periodType) {
        List<Long> allUserIds = new ArrayList<>(friendIds);
        allUserIds.add(userId);
        
        List<LeaderboardEntry> entries = leaderboardRepository.getCurrentLeaderboardForUsers(allUserIds, periodType);
        
        // Sort by CO2 (eligible first, then by CO2 ascending)
        entries.sort((a, b) -> {
            // Eligible entries come first
            if (a.isEligible && !b.isEligible) return -1;
            if (!a.isEligible && b.isEligible) return 1;
            // Then sort by CO2
            return Double.compare(a.totalCo2, b.totalCo2);
        });
        
        // Assign ranks (only to eligible entries)
        int rank = 1;
        for (LeaderboardEntry entry : entries) {
            if (entry.isEligible) {
                entry.rank = rank++;
            } else {
                entry.rank = null; // Not ranked
            }
        }
        
        return entries;
    }

    /**
     * Get user's entry for a specific period
     */
    public Optional<LeaderboardEntry> getUserEntry(Long userId, PeriodType periodType) {
        LocalDate periodStart = LeaderboardRepository.calculatePeriodStart(periodType);
        return leaderboardRepository.findByUserAndPeriod(userId, periodType, periodStart);
    }

    /**
     * Get time until next reset for a period type
     * Returns a map with millisUntilReset and timeRemaining breakdown
     */
    public Map<String, Object> getTimeUntilReset(PeriodType periodType) {
        LocalDate periodEnd = LeaderboardRepository.calculatePeriodEnd(periodType);
        LocalDate today = LocalDate.now();
        
        // Calculate milliseconds until end of period (midnight of next day after period end)
        java.time.LocalDateTime endDateTime = periodEnd.plusDays(1).atStartOfDay();
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        long millisUntilReset = java.time.Duration.between(now, endDateTime).toMillis();
        
        // Calculate time components
        long totalSeconds = millisUntilReset / 1000;
        long days = totalSeconds / (24 * 3600);
        long hours = (totalSeconds % (24 * 3600)) / 3600;
        long minutes = (totalSeconds % 3600) / 60;
        long seconds = totalSeconds % 60;
        
        Map<String, Object> timeRemaining = new HashMap<>();
        timeRemaining.put("days", days);
        timeRemaining.put("hours", hours);
        timeRemaining.put("minutes", minutes);
        timeRemaining.put("seconds", seconds);
        
        Map<String, Object> result = new HashMap<>();
        result.put("periodType", periodType.toString());
        result.put("millisUntilReset", millisUntilReset);
        result.put("timeRemaining", timeRemaining);
        
        return result;
    }

    /**
     * Recalculate all leaderboard entries for a user (e.g., when activities are edited)
     */
    @Transactional
    public void recalculateUserLeaderboard(Long userId) {
        User user = User.findById(userId);
        if (user == null) return;
        
        for (PeriodType periodType : PeriodType.values()) {
            LocalDate periodStart = LeaderboardRepository.calculatePeriodStart(periodType);
            LocalDate periodEnd = LeaderboardRepository.calculatePeriodEnd(periodType);
            
            // Find or create entry
            LeaderboardEntry entry = leaderboardRepository.findByUserAndPeriod(userId, periodType, periodStart)
                    .orElseGet(() -> {
                        LeaderboardEntry newEntry = new LeaderboardEntry();
                        newEntry.user = user;
                        newEntry.periodType = periodType;
                        newEntry.periodStart = periodStart;
                        newEntry.periodEnd = periodEnd;
                        newEntry.daysRequired = LeaderboardRepository.calculateDaysRequired(periodType);
                        return newEntry;
                    });
            
            calculateTotalsForPeriod(entry, userId, periodStart, periodEnd);
            Set<LocalDate> daysTracked = getTrackedDays(userId, periodStart, periodEnd);
            entry.daysTracked = daysTracked.size();
            validateEntry(entry);
            entry.checkEligibility();
            
            leaderboardRepository.persist(entry);
        }
    }
}
