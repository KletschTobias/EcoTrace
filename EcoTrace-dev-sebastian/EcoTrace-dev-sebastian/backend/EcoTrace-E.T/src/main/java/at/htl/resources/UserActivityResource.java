package at.htl.resources;

import at.htl.dtos.CreateUserActivityRequest;
import at.htl.dtos.StatsDto;
import at.htl.dtos.UserActivityDto;
import at.htl.entities.User;
import at.htl.services.LeaderboardService;
import at.htl.services.UserActivityService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.time.LocalDate;
import java.util.List;

@Path("/api/users/{userId}/activities")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserActivityResource {

    @Inject
    UserActivityService userActivityService;

    @Inject
    LeaderboardService leaderboardService;

    @GET
    public List<UserActivityDto> getUserActivities(@PathParam("userId") Long userId) {
        return userActivityService.getUserActivities(userId);
    }

    @GET
    @Path("/category/{category}")
    public List<UserActivityDto> getUserActivitiesByCategory(
            @PathParam("userId") Long userId,
            @PathParam("category") String category) {
        return userActivityService.getUserActivitiesByCategory(userId, category);
    }

    @GET
    @Path("/date-range")
    public List<UserActivityDto> getUserActivitiesByDateRange(
            @PathParam("userId") Long userId,
            @QueryParam("startDate") String startDate,
            @QueryParam("endDate") String endDate) {
        return userActivityService.getUserActivitiesByDateRange(
                userId,
                LocalDate.parse(startDate),
                LocalDate.parse(endDate)
        );
    }

    @GET
    @Path("/stats")
    public StatsDto getUserStats(
            @PathParam("userId") Long userId,
            @QueryParam("startDate") String startDate,
            @QueryParam("endDate") String endDate) {
        return userActivityService.getUserStats(
                userId,
                LocalDate.parse(startDate),
                LocalDate.parse(endDate)
        );
    }

    @POST
    public Response createUserActivity(
            @PathParam("userId") Long userId,
            @Valid CreateUserActivityRequest request) {
        UserActivityDto created = userActivityService.createUserActivity(userId, request);
        
        // Update leaderboard entries for all periods
        User user = User.findById(userId);
        if (user != null) {
            leaderboardService.updateLeaderboardForUser(user, LocalDate.now());
        }
        
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    @DELETE
    @Path("/{activityId}")
    public Response deleteUserActivity(
            @PathParam("userId") Long userId,
            @PathParam("activityId") Long activityId) {
        userActivityService.deleteUserActivity(userId, activityId);
        
        // Recalculate leaderboard after deletion
        leaderboardService.recalculateUserLeaderboard(userId);
        
        return Response.noContent().build();
    }
}
