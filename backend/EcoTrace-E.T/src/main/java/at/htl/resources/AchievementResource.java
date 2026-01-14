package at.htl.resources;

import at.htl.dtos.AchievementDto;
import at.htl.services.AchievementService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/api/users/{userId}/achievements")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AchievementResource {

    @Inject
    AchievementService achievementService;

    @GET
    public Response getUserAchievements(@PathParam("userId") Long userId) {
        try {
            List<AchievementDto> achievements = achievementService.getUserAchievements(userId);
            return Response.ok(achievements).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }

    @POST
    @Path("/check")
    public Response checkAndUnlockAchievements(@PathParam("userId") Long userId) {
        try {
            achievementService.checkAndUnlockAchievements(userId);
            List<AchievementDto> achievements = achievementService.getUserAchievements(userId);
            return Response.ok(achievements).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }

    @PUT
    @Path("/mark-viewed")
    public Response markAchievementsAsViewed(@PathParam("userId") Long userId) {
        try {
            achievementService.markAchievementsAsViewed(userId);
            return Response.ok().build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }

    public static class ErrorResponse {
        public String message;

        public ErrorResponse(String message) {
            this.message = message;
        }
    }
}
