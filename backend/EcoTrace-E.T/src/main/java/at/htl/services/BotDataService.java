package at.htl.services;

import at.htl.entities.Activity;
import at.htl.entities.LeaderboardEntry;
import at.htl.entities.LeaderboardEntry.PeriodType;
import at.htl.entities.User;
import at.htl.entities.UserActivity;
import at.htl.repositories.LeaderboardRepository;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

/**
 * Service that generates bot/fake user data for the leaderboard.
 * Bots have realistic daily activities just like real users.
 */
@ApplicationScoped
public class BotDataService {

    private static final Logger LOG = Logger.getLogger(BotDataService.class);
    
    @Inject
    LeaderboardRepository leaderboardRepository;

    private final Random random = new Random();
    
    // Bot user definitions: username, email, fullName, avatarColor, hasSolarPanels, hasHeatPump
    private static final String[][] BOT_DEFINITIONS = {
        {"eco_viking", "bot1@ecotrace.bot", "Erik Nordstrom", "#10B981", "true", "false"},
        {"green_lotus", "bot2@ecotrace.bot", "Yuki Tanaka", "#6366F1", "false", "true"},
        {"sustainable_sam", "bot3@ecotrace.bot", "Sam Wilson", "#F59E0B", "false", "false"},
        {"earth_guardian", "bot4@ecotrace.bot", "Maria Santos", "#EC4899", "true", "true"},
        {"climate_hero", "bot5@ecotrace.bot", "Alex Chen", "#8B5CF6", "false", "false"},
        {"eco_warrior", "bot6@ecotrace.bot", "Lena Mueller", "#14B8A6", "true", "false"},
        {"planet_saver", "bot7@ecotrace.bot", "Marco Rossi", "#F43F5E", "false", "false"},
        {"green_ninja", "bot8@ecotrace.bot", "Aiko Yamamoto", "#22C55E", "true", "true"},
        {"eco_pioneer", "bot9@ecotrace.bot", "Emma Johnson", "#3B82F6", "false", "true"},
        {"nature_friend", "bot10@ecotrace.bot", "Pierre Dubois", "#EAB308", "false", "false"},
        {"carbon_cutter", "bot11@ecotrace.bot", "Sofia Andersson", "#06B6D4", "true", "false"},
        {"eco_champion", "bot12@ecotrace.bot", "Lucas Schmidt", "#A855F7", "false", "true"}
    };

    /**
     * Generate bot data at startup
     */
    public void onStart(@Observes StartupEvent ev) {
        LOG.info("StartupEvent received, triggering bot data generation...");
        generateBotData();
    }
    
    /**
     * Public method to generate bot data
     */
    @Transactional
    public void generateBotData() {
        LOG.info("Generating bot users and their activities...");
        
        // First, create bot users if they don't exist
        createBotUsersIfNotExist();
        
        // Find all bot users
        List<User> botUsers = User.find("externalId like '%bot%'").list();
        
        if (botUsers.isEmpty()) {
            LOG.warn("No bot users found!");
            return;
        }

        LOG.info("Found " + botUsers.size() + " bot users");

        // Get available activities (exclude negative impact ones like Recycling/Composting)
        // Also exclude zero-impact activities like Walking/Cycling
        List<Activity> activities = Activity.<Activity>listAll().stream()
            .filter(a -> a.co2PerUnit > 0 || a.waterPerUnit > 0 || a.electricityPerUnit > 0)
            .filter(a -> a.co2PerUnit >= 0) // No negative CO2
            .collect(Collectors.toList());
            
        if (activities.isEmpty()) {
            LOG.warn("No positive-impact activities found!");
            return;
        }

        LOG.info("Using " + activities.size() + " activities for bot data generation");

        for (User bot : botUsers) {
            generateBotActivitiesForAllPeriods(bot, activities);
        }

        LOG.info("Bot data generation complete!");
    }
    
    /**
     * Create bot users in database if they don't exist
     */
    private void createBotUsersIfNotExist() {
        LOG.info("Creating bot users if they don't exist...");
        int created = 0;
        int skipped = 0;
        
        for (String[] botDef : BOT_DEFINITIONS) {
            String username = botDef[0];
            String email = botDef[1];
            String fullName = botDef[2];
            String avatarColor = botDef[3];
            boolean hasSolarPanels = Boolean.parseBoolean(botDef[4]);
            boolean hasHeatPump = Boolean.parseBoolean(botDef[5]);
            
            // Create externalId from email (bot1@ecotrace.bot -> bot1)
            String externalId = email.split("@")[0];
            
            try {
                // Check if user already exists
                User existingUser = User.find("externalId", externalId).firstResult();
                if (existingUser != null) {
                    LOG.info("Bot user " + username + " already exists (ID: " + existingUser.id + ")");
                    skipped++;
                    continue;
                }
                
                // Create new bot user
                User botUser = new User();
                botUser.externalId = externalId;
                botUser.username = username;
                botUser.email = email;
                botUser.fullName = fullName;
                botUser.avatarColor = avatarColor;
                botUser.hasSolarPanels = Boolean.valueOf(hasSolarPanels);
                botUser.hasHeatPump = Boolean.valueOf(hasHeatPump);
                botUser.totalCo2 = 0.0;
                botUser.totalWater = 0.0;
                botUser.totalElectricity = 0.0;
                botUser.persist();
                
                LOG.info("✓ Created bot user: " + username + " (ID: " + botUser.id + ")");
                created++;
            } catch (Exception e) {
                LOG.error("✗ Error creating bot user " + username + ": " + e.getMessage(), e);
            }
        }
        
        LOG.info("Bot user creation complete: " + created + " created, " + skipped + " skipped");
    }
    
    /**
     * Reset and regenerate all bot data - deletes existing bot activities and leaderboard entries
     */
    @Transactional
    public void resetBotData() {
        LOG.info("Resetting all bot data...");
        
        // Find all bot users
        List<User> botUsers = User.find("externalId like '%bot%'").list();
        
        for (User bot : botUsers) {
            // Delete all activities for this bot
            long deletedActivities = UserActivity.delete("user.id", bot.id);
            LOG.info("Deleted " + deletedActivities + " activities for bot: " + bot.externalId);
            
            // Delete all leaderboard entries for this bot
            long deletedEntries = leaderboardRepository.delete("user.id", bot.id);
            LOG.info("Deleted " + deletedEntries + " leaderboard entries for bot: " + bot.externalId);
        }
        
        LOG.info("Bot data reset complete.");
        
        // Now regenerate fresh data
        generateFreshBotData();
    }
    
    /**
     * Generate completely fresh bot data (called after reset)
     */
    private void generateFreshBotData() {
        LOG.info("Generating fresh bot data...");
        
        // Find all bot users
        List<User> botUsers = User.find("email like '%@ecotrace.bot'").list();
        
        // Get available activities
        List<Activity> activities = Activity.<Activity>listAll().stream()
            .filter(a -> a.co2PerUnit > 0 || a.waterPerUnit > 0 || a.electricityPerUnit > 0)
            .filter(a -> a.co2PerUnit >= 0)
            .collect(Collectors.toList());
            
        if (activities.isEmpty()) {
            LOG.warn("No positive-impact activities found!");
            return;
        }

        LocalDate today = LocalDate.now();
        
        for (User bot : botUsers) {
            double totalCo2 = 0, totalWater = 0, totalElec = 0;
            
            // Generate activities for past 400 days to cover yearly period
            for (int daysAgo = 0; daysAgo <= 400; daysAgo++) {
                LocalDate date = today.minusDays(daysAgo);
                
                // 90% chance of activity each day
                if (random.nextDouble() < 0.1) continue;
                
                // Generate 2-4 activities per day
                int activitiesCount = 2 + random.nextInt(3);
                
                for (int i = 0; i < activitiesCount; i++) {
                    Activity activity = activities.get(random.nextInt(activities.size()));
                    
                    double quantity = generateQuantity(activity);
                    if (quantity <= 0) continue;
                    
                    double co2 = Math.max(0, activity.co2PerUnit * quantity);
                    double water = Math.max(0, activity.waterPerUnit * quantity);
                    double elec = Math.max(0, activity.electricityPerUnit * quantity);
                    
                    // Apply eco-equipment modifiers
                    if (bot.hasSolarPanels && elec > 0) {
                        elec *= 0.3;
                        co2 *= 0.7;
                    }
                    if (bot.hasHeatPump && co2 > 0) {
                        co2 *= 0.8;
                    }

                    UserActivity ua = new UserActivity();
                    ua.user = bot;
                    ua.activityName = activity.name;
                    ua.category = activity.category;
                    ua.quantity = quantity;
                    ua.unit = activity.unit;
                    ua.co2Impact = co2;
                    ua.waterImpact = water;
                    ua.electricityImpact = elec;
                    ua.date = date;
                    ua.createdDate = date.atTime(8 + random.nextInt(12), random.nextInt(60));
                    ua.persist();

                    totalCo2 += co2;
                    totalWater += water;
                    totalElec += elec;
                }
            }
            
            // Update bot totals
            bot.totalCo2 = totalCo2;
            bot.totalWater = totalWater;
            bot.totalElectricity = totalElec;
            bot.updatedDate = LocalDateTime.now();
            bot.persist();
            
            LOG.info("Generated activities for bot: " + bot.externalId);
            
            // Create leaderboard entries
            updateLeaderboardEntriesFromActivities(bot);
        }
        
        LOG.info("Fresh bot data generation complete!");
    }

    /**
     * Generate activities for a bot to cover all leaderboard periods
     */
    private void generateBotActivitiesForAllPeriods(User bot, List<Activity> activities) {
        try {
            // Check if bot already has activities for today
            LocalDate today = LocalDate.now();
            long todayCount = UserActivity.count("user.id = ?1 and date = ?2", bot.id, today);
            
            if (todayCount > 0) {
                LOG.info("Bot " + bot.externalId + " already has activities for today, just updating leaderboard...");
                updateLeaderboardEntriesFromActivities(bot);
                return;
            }

            // Generate activities for the past 35 days (covers daily, weekly, monthly periods)
            double totalCo2 = 0, totalWater = 0, totalElec = 0;
            int activitiesGenerated = 0;

            for (int daysAgo = 0; daysAgo <= 35; daysAgo++) {
                LocalDate date = today.minusDays(daysAgo);
                
                // Skip some days (10% chance of no activity)
                if (random.nextDouble() < 0.1) continue;

                // Generate 2-4 activities per day
                int activitiesCount = 2 + random.nextInt(3);
                
                for (int i = 0; i < activitiesCount; i++) {
                    Activity activity = activities.get(random.nextInt(activities.size()));
                    
                    double quantity = generateQuantity(activity);
                    if (quantity <= 0) continue;
                    
                    double co2 = Math.max(0, activity.co2PerUnit * quantity);
                    double water = Math.max(0, activity.waterPerUnit * quantity);
                    double elec = Math.max(0, activity.electricityPerUnit * quantity);
                    
                    // Apply eco-equipment modifiers
                    if (bot.hasSolarPanels && elec > 0) {
                        elec *= 0.3;
                        co2 *= 0.7;
                    }
                    if (bot.hasHeatPump && co2 > 0) {
                        co2 *= 0.8;
                    }

                    UserActivity ua = new UserActivity();
                    ua.user = bot;
                    ua.activityName = activity.name;
                    ua.category = activity.category;
                    ua.quantity = quantity;
                    ua.unit = activity.unit;
                    ua.co2Impact = co2;
                    ua.waterImpact = water;
                    ua.electricityImpact = elec;
                    ua.date = date;
                    ua.createdDate = date.atTime(8 + random.nextInt(12), random.nextInt(60));
                    ua.persist();

                    totalCo2 += co2;
                    totalWater += water;
                    totalElec += elec;
                    activitiesGenerated++;
                }
            }

            // Update bot's total consumption
            bot.totalCo2 = totalCo2;
            bot.totalWater = totalWater;
            bot.totalElectricity = totalElec;
            bot.updatedDate = LocalDateTime.now();
            bot.persist();
            
            LOG.info("Generated " + activitiesGenerated + " activities for bot: " + bot.externalId + 
                     " (CO2: " + String.format("%.1f", totalCo2) + 
                     ", Water: " + String.format("%.0f", totalWater) + 
                     ", Elec: " + String.format("%.1f", totalElec) + ")");
            
            // Create leaderboard entries
            updateLeaderboardEntriesFromActivities(bot);
        } catch (Exception e) {
            LOG.error("Error generating activities for bot " + bot.externalId + ": " + e.getMessage(), e);
        }
    }

    /**
     * Generate realistic quantity for an activity
     */
    private double generateQuantity(Activity activity) {
        String name = activity.name.toLowerCase();
        
        if (name.contains("car") || name.contains("drive")) {
            return 5 + random.nextDouble() * 25; // 5-30 km
        } else if (name.contains("electric car")) {
            return 10 + random.nextDouble() * 30; // 10-40 km
        } else if (name.contains("bike") || name.contains("cycling") || name.contains("walking")) {
            return 1 + random.nextDouble() * 8; // 1-9 km
        } else if (name.contains("bus") || name.contains("train")) {
            return 5 + random.nextDouble() * 20; // 5-25 km
        } else if (name.contains("flight")) {
            return 0; // Skip flights for bots
        } else if (name.contains("shower")) {
            return 5 + random.nextDouble() * 8; // 5-13 minutes
        } else if (name.contains("bath")) {
            return random.nextDouble() < 0.2 ? 1 : 0; // 20% chance
        } else if (name.contains("heat") || name.contains("conditioning")) {
            return 1 + random.nextDouble() * 3; // 1-4 hours
        } else if (name.contains("dishwasher") || name.contains("washing")) {
            return random.nextDouble() < 0.4 ? 1 : 0; // 40% chance
        } else if (name.contains("computer")) {
            return 1 + random.nextDouble() * 4; // 1-5 hours
        } else if (name.contains("tv")) {
            return 1 + random.nextDouble() * 3; // 1-4 hours
        } else if (name.contains("beef")) {
            return random.nextDouble() < 0.15 ? 1 : 0; // 15% chance
        } else if (name.contains("chicken") || name.contains("fish")) {
            return random.nextDouble() < 0.3 ? 1 : 0; // 30% chance
        } else if (name.contains("vegetarian") || name.contains("vegan")) {
            return random.nextDouble() < 0.6 ? 1 : 0; // 60% chance
        } else if (name.contains("coffee")) {
            return 1 + random.nextInt(3); // 1-3 cups
        } else if (name.contains("tea")) {
            return 1 + random.nextInt(2); // 1-2 cups
        } else if (name.contains("clothes") || name.contains("electronics")) {
            return 0; // Skip shopping for bots
        } else if (name.contains("online shopping")) {
            return random.nextDouble() < 0.1 ? 1 : 0; // 10% chance
        } else if (name.contains("grocery")) {
            return random.nextDouble() < 0.3 ? 1 : 0; // 30% chance
        }
        
        return 1; // Default
    }

    /**
     * Create/update leaderboard entries based on actual user activities
     */
    private void updateLeaderboardEntriesFromActivities(User bot) {
        for (PeriodType periodType : PeriodType.values()) {
            LocalDate periodStart = LeaderboardRepository.calculatePeriodStart(periodType);
            LocalDate periodEnd = LeaderboardRepository.calculatePeriodEnd(periodType);

            // Delete existing entry
            leaderboardRepository.delete("user.id = ?1 and periodType = ?2 and periodStart = ?3", 
                bot.id, periodType, periodStart);

            // Get activities for this period
            List<UserActivity> periodActivities = UserActivity.find(
                "user.id = ?1 and date >= ?2 and date <= ?3", 
                bot.id, periodStart, periodEnd
            ).list();

            if (periodActivities.isEmpty()) {
                continue;
            }

            double totalCo2 = periodActivities.stream().mapToDouble(a -> a.co2Impact).sum();
            double totalWater = periodActivities.stream().mapToDouble(a -> a.waterImpact).sum();
            double totalElec = periodActivities.stream().mapToDouble(a -> a.electricityImpact).sum();
            
            long daysTracked = periodActivities.stream()
                .map(a -> a.date)
                .distinct()
                .count();

            LeaderboardEntry entry = new LeaderboardEntry();
            entry.user = bot;
            entry.periodType = periodType;
            entry.periodStart = periodStart;
            entry.periodEnd = periodEnd;
            entry.totalCo2 = totalCo2;
            entry.totalWater = totalWater;
            entry.totalElectricity = totalElec;
            entry.daysTracked = (int) daysTracked;
            entry.daysRequired = LeaderboardRepository.calculateDaysRequired(periodType);
            entry.isEligible = entry.daysTracked >= entry.daysRequired;
            entry.isValid = true;

            leaderboardRepository.persist(entry);
            
            LOG.info("Created leaderboard entry for " + bot.externalId + " - " + periodType + 
                     " (Days: " + daysTracked + "/" + entry.daysRequired + ", CO2: " + String.format("%.1f", totalCo2) + ")");
        }
    }
}
