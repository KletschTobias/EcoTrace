package at.htl.services;

import at.htl.entities.UserActivity;
import io.quarkus.runtime.StartupEvent;
import io.quarkus.scheduler.Scheduled;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.time.LocalDate;
import java.util.List;

/**
 * Daily scheduler that generates activity entries for recurring activities.
 * For example, if a user set up "Car drive 5x/week", this scheduler creates
 * a daily entry each day so the dashboard shows the actual daily consumption.
 *
 * The daily impact is calculated as: singleOccurrenceImpact * timesPerWeek / 7.0
 * so that the weekly total matches the user's configured frequency.
 *
 * NOTE: These generated entries do NOT update user.totalCo2 because the full
 * yearly total (timesPerWeek * weeksPerYear * impact) was already added to
 * the user's totals when the recurring activity was first created.
 */
@ApplicationScoped
public class RecurringActivityScheduler {

    private static final Logger LOG = Logger.getLogger(RecurringActivityScheduler.class);

    void onStartup(@Observes StartupEvent ev) {
        generateUpToToday();
    }

    @Scheduled(cron = "0 0 0 * * ?")  // runs every day at midnight
    @Transactional
    public void generateDailyRecurringEntries() {
        generateUpToToday();
    }

    /**
     * Fills in any missed days up to today for all recurring activities.
     */
    @Transactional
    public void generateUpToToday() {
        LocalDate today = LocalDate.now();

        List<UserActivity> recurringActivities = UserActivity.list(
                "isRecurring = true and (lastGeneratedDate is null or lastGeneratedDate < ?1)", today);

        if (recurringActivities.isEmpty()) {
            return;
        }

        LOG.infof("Generating daily entries for %d recurring activities", recurringActivities.size());

        for (UserActivity recurring : recurringActivities) {
            try {
                generateEntriesForActivity(recurring, today);
            } catch (Exception e) {
                LOG.errorf("Failed to generate entries for recurring activity id=%d: %s", recurring.id, e.getMessage());
            }
        }
    }

    private void generateEntriesForActivity(UserActivity recurring, LocalDate today) {
        // Start from the day after the last generated date (or the activity's own date)
        LocalDate from = recurring.lastGeneratedDate != null
                ? recurring.lastGeneratedDate.plusDays(1)
                : recurring.date.plusDays(1);

        if (!from.isAfter(today)) {
            // Daily impact = single occurrence * timesPerWeek / 7 days
            double dailyFactor = recurring.timesPerWeek != null ? recurring.timesPerWeek / 7.0 : 1.0;
            double dailyCo2 = (recurring.co2Impact != null ? recurring.co2Impact : 0.0) * dailyFactor;
            double dailyWater = (recurring.waterImpact != null ? recurring.waterImpact : 0.0) * dailyFactor;
            double dailyElectricity = (recurring.electricityImpact != null ? recurring.electricityImpact : 0.0) * dailyFactor;

            LocalDate current = from;
            while (!current.isAfter(today)) {
                // Only generate if there isn't already a generated entry for this day
                long existingCount = UserActivity.count(
                        "user.id = ?1 and sourceRecurringId = ?2 and date = ?3",
                        recurring.user.id, recurring.id, current);

                if (existingCount == 0) {
                    UserActivity daily = new UserActivity();
                    daily.user = recurring.user;
                    daily.activityName = recurring.activityName;
                    daily.category = recurring.category;
                    daily.quantity = recurring.quantity != null ? recurring.quantity * dailyFactor : dailyFactor;
                    daily.unit = recurring.unit;
                    daily.co2Impact = dailyCo2;
                    daily.waterImpact = dailyWater;
                    daily.electricityImpact = dailyElectricity;
                    daily.date = current;
                    daily.isRecurring = false;
                    daily.sourceRecurringId = recurring.id;
                    daily.persist();
                }

                current = current.plusDays(1);
            }

            // Update lastGeneratedDate on the parent recurring activity via query
            UserActivity.update("lastGeneratedDate = ?1 where id = ?2", today, recurring.id);

            LOG.infof("Generated daily entries for '%s' (user %d) from %s to %s",
                    recurring.activityName, recurring.user.id, from, today);
        }
    }
}