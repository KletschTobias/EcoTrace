package at.htl.resources;

import at.htl.dtos.CreateUserActivityRequest;
import at.htl.dtos.StatsDto;
import at.htl.dtos.UserActivityDto;
import at.htl.services.AchievementService;
import at.htl.services.AuthService;
import at.htl.services.UserActivityService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.time.LocalDate;
import java.util.List;

@Path("/api/users/me/activities")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MeActivityResource {

    @Inject
    UserActivityService userActivityService;

    @Inject
    AchievementService achievementService;

    @Inject
    AuthService authService;

    @Inject
    JsonWebToken jwt;

    @GET
    public List<UserActivityDto> getUserActivities() {
        Long userId = authService.getCurrentUserId(jwt);
        return userActivityService.getUserActivities(userId);
    }

    @GET
    @Path("/category/{category}")
    public List<UserActivityDto> getUserActivitiesByCategory(@PathParam("category") String category) {
        Long userId = authService.getCurrentUserId(jwt);
        return userActivityService.getUserActivitiesByCategory(userId, category);
    }

    @GET
    @Path("/date-range")
    public List<UserActivityDto> getUserActivitiesByDateRange(
            @QueryParam("startDate") String startDate,
            @QueryParam("endDate") String endDate) {
        Long userId = authService.getCurrentUserId(jwt);
        return userActivityService.getUserActivitiesByDateRange(
                userId,
                LocalDate.parse(startDate),
                LocalDate.parse(endDate)
        );
    }

    @GET
    @Path("/stats")
    public StatsDto getUserStats(
            @QueryParam("startDate") String startDate,
            @QueryParam("endDate") String endDate) {
        Long userId = authService.getCurrentUserId(jwt);
        return userActivityService.getUserStats(
                userId,
                LocalDate.parse(startDate),
                LocalDate.parse(endDate)
        );
    }

    @POST
    public Response createUserActivity(@Valid CreateUserActivityRequest request) {
        Long userId = authService.getCurrentUserId(jwt);
        UserActivityDto created = userActivityService.createUserActivity(userId, request);
        
        // Check and unlock achievements after creating activity
        achievementService.checkAndUnlockAchievements(userId);
        
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    @DELETE
    @Path("/{activityId}")
    public Response deleteUserActivity(@PathParam("activityId") Long activityId) {
        Long userId = authService.getCurrentUserId(jwt);
        userActivityService.deleteUserActivity(userId, activityId);
        return Response.noContent().build();
    }
}
