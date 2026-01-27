package at.htl.repositories;

import at.htl.entities.LeaderboardEntry;
import at.htl.entities.LeaderboardEntry.PeriodType;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class LeaderboardRepository implements PanacheRepository<LeaderboardEntry> {

    /**
     * Find leaderboard entry for a specific user and period
     */
    public Optional<LeaderboardEntry> findByUserAndPeriod(Long userId, PeriodType periodType, LocalDate periodStart) {
        return find("user.id = ?1 and periodType = ?2 and periodStart = ?3", userId, periodType, periodStart)
                .firstResultOptional();
    }

    /**
     * Get eligible entries for a period, ordered by total CO2 (lowest first)
     */
    public List<LeaderboardEntry> getLeaderboardByPeriod(PeriodType periodType, LocalDate periodStart) {
        return find("periodType = ?1 and periodStart = ?2 and isEligible = true and isValid = true order by totalCo2 asc",
                periodType, periodStart)
                .list();
    }

    /**
     * Get all entries for a period (including ineligible) for a user's friends
     */
    public List<LeaderboardEntry> getLeaderboardForFriends(List<Long> userIds, PeriodType periodType, LocalDate periodStart) {
        return find("user.id in ?1 and periodType = ?2 and periodStart = ?3 order by totalCo2 asc",
                userIds, periodType, periodStart)
                .list();
    }

    /**
     * Get current period's leaderboard entries for specific users
     */
    public List<LeaderboardEntry> getCurrentLeaderboardForUsers(List<Long> userIds, PeriodType periodType) {
        LocalDate periodStart = calculatePeriodStart(periodType);
        return getLeaderboardForFriends(userIds, periodType, periodStart);
    }

    /**
     * Delete old leaderboard entries (for cleanup)
     */
    public long deleteOldEntries(LocalDate beforeDate) {
        return delete("periodEnd < ?1", beforeDate);
    }

    /**
     * Calculate the start date for a given period type
     */
    public static LocalDate calculatePeriodStart(PeriodType periodType) {
        LocalDate today = LocalDate.now();
        switch (periodType) {
            case DAILY:
                return today;
            case WEEKLY:
                // Week starts on Monday
                return today.minusDays(today.getDayOfWeek().getValue() - 1);
            case MONTHLY:
                return today.withDayOfMonth(1);
            case YEARLY:
                return today.withDayOfYear(1);
            default:
                return today;
        }
    }

    /**
     * Calculate the end date for a given period type
     */
    public static LocalDate calculatePeriodEnd(PeriodType periodType) {
        LocalDate today = LocalDate.now();
        switch (periodType) {
            case DAILY:
                return today;
            case WEEKLY:
                // Week ends on Sunday
                LocalDate weekStart = today.minusDays(today.getDayOfWeek().getValue() - 1);
                return weekStart.plusDays(6);
            case MONTHLY:
                return today.withDayOfMonth(today.lengthOfMonth());
            case YEARLY:
                return today.withDayOfYear(today.isLeapYear() ? 366 : 365);
            default:
                return today;
        }
    }

    /**
     * Calculate the number of days required for eligibility
     * Using realistic thresholds (not 100% of days)
     */
    public static int calculateDaysRequired(PeriodType periodType) {
        switch (periodType) {
            case DAILY:
                return 1; // Must track today
            case WEEKLY:
                return 1; // At least 1 day in the week
            case MONTHLY:
                return 1; // At least 1 day in the month
            case YEARLY:
                return 1; // At least 1 day in the year
            default:
                return 1;
        }
    }
}
