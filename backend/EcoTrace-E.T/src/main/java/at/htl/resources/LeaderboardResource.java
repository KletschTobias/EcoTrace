package at.htl.resources;

import at.htl.dtos.LeaderboardEntryDto;
import at.htl.entities.LeaderboardEntry;
import at.htl.entities.LeaderboardEntry.PeriodType;
import at.htl.entities.Friendship;
import at.htl.entities.User;
import at.htl.services.BotDataService;
import at.htl.services.LeaderboardService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Path("/api/leaderboard")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class LeaderboardResource {

    @Inject
    LeaderboardService leaderboardService;
    
    @Inject
    BotDataService botDataService;

    @GET
    @Path("/{periodType}")
    public Response getLeaderboard(@PathParam("periodType") String periodType) {
        try {
            PeriodType type = PeriodType.valueOf(periodType.toUpperCase());
            List<LeaderboardEntry> entries = leaderboardService.getLeaderboard(type);
            List<LeaderboardEntryDto> dtos = entries.stream()
                    .map(this::toDto)
                    .toList();
            
            return Response.ok(dtos).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "Invalid period type. Use: DAILY, WEEKLY, MONTHLY, YEARLY"))
                    .build();
        }
    }

    @GET
    @Path("/{periodType}/friends/{userId}")
    public Response getLeaderboardForUserAndFriends(
            @PathParam("periodType") String periodType,
            @PathParam("userId") Long userId) {
        try {
            PeriodType type = PeriodType.valueOf(periodType.toUpperCase());
            
            // Get friend IDs - Friendship has 'user' and 'friend' fields
            List<Friendship> friendships = Friendship.find("user.id = ?1 or friend.id = ?1", userId).list();
            List<Long> friendIds = new ArrayList<>();
            for (Friendship f : friendships) {
                if (f.user.id.equals(userId)) {
                    friendIds.add(f.friend.id);
                } else {
                    friendIds.add(f.user.id);
                }
            }
            
            List<LeaderboardEntry> entries = leaderboardService.getLeaderboardForUserAndFriends(userId, friendIds, type);
            List<LeaderboardEntryDto> dtos = entries.stream()
                    .map(this::toDto)
                    .toList();
            
            return Response.ok(dtos).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "Invalid period type. Use: DAILY, WEEKLY, MONTHLY, YEARLY"))
                    .build();
        }
    }

    @GET
    @Path("/{periodType}/user/{userId}")
    public Response getUserEntry(
            @PathParam("periodType") String periodType,
            @PathParam("userId") Long userId) {
        try {
            PeriodType type = PeriodType.valueOf(periodType.toUpperCase());
            Optional<LeaderboardEntry> entryOpt = leaderboardService.getUserEntry(userId, type);
            
            if (entryOpt.isEmpty()) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(Map.of("message", "No entry found for this user in the current period"))
                        .build();
            }
            
            LeaderboardEntryDto dto = toDto(entryOpt.get());
            return Response.ok(dto).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "Invalid period type. Use: DAILY, WEEKLY, MONTHLY, YEARLY"))
                    .build();
        }
    }

    @GET
    @Path("/{periodType}/reset-time")
    public Response getTimeUntilReset(@PathParam("periodType") String periodType) {
        try {
            PeriodType type = PeriodType.valueOf(periodType.toUpperCase());
            Map<String, Object> resetInfo = leaderboardService.getTimeUntilReset(type);
            
            return Response.ok(resetInfo).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "Invalid period type. Use: DAILY, WEEKLY, MONTHLY, YEARLY"))
                    .build();
        }
    }

    @POST
    @Path("/recalculate/{userId}")
    public Response recalculateUserLeaderboard(@PathParam("userId") Long userId) {
        User user = User.findById(userId);
        if (user == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "User not found"))
                    .build();
        }
        leaderboardService.recalculateUserLeaderboard(userId);
        return Response.ok(Map.of("message", "Leaderboard recalculated for user " + userId)).build();
    }

    @POST
    @Path("/generate-bot-data")
    public Response generateBotData() {
        botDataService.generateBotData();
        return Response.ok(Map.of("message", "Bot data generation triggered")).build();
    }
    
    @POST
    @Path("/reset-bot-data")
    public Response resetBotData() {
        botDataService.resetBotData();
        return Response.ok(Map.of("message", "Bot data reset and regenerated")).build();
    }

    private LeaderboardEntryDto toDto(LeaderboardEntry entry) {
        LeaderboardEntryDto dto = new LeaderboardEntryDto();
        dto.id = entry.id;
        dto.userId = entry.user.id;
        dto.username = entry.user.username;
        dto.fullName = entry.user.fullName != null ? entry.user.fullName : entry.user.username;
        dto.avatarColor = entry.user.avatarColor;
        dto.profileImageUrl = entry.user.profileImageUrl;
        dto.hasSolarPanels = entry.user.hasSolarPanels;
        dto.hasHeatPump = entry.user.hasHeatPump;
        
        dto.periodType = entry.periodType.toString();
        dto.periodStart = entry.periodStart.toString();
        dto.periodEnd = entry.periodEnd.toString();
        
        dto.totalCo2 = entry.totalCo2;
        dto.totalWater = entry.totalWater;
        dto.totalElectricity = entry.totalElectricity;
        
        dto.daysTracked = entry.daysTracked;
        dto.daysRequired = entry.daysRequired;
        dto.isEligible = entry.isEligible;
        dto.isValid = entry.isValid;
        dto.disqualificationReason = entry.disqualificationReason;
        dto.rank = entry.rank;
        
        return dto;
    }
}
