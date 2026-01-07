package at.htl.resources;

import at.htl.dtos.StatsDto;
import at.htl.dtos.UpdateProfileRequest;
import at.htl.dtos.UserDto;
import at.htl.entities.User;
import at.htl.services.UserActivityService;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.time.LocalDate;

@Path("/api/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {

    @Inject
    UserActivityService userActivityService;

    @GET
    @Path("/{id}")
    public Response getUserById(@PathParam("id") Long id) {
        User user = User.findById(id);
        if (user == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(new UserDto(user)).build();
    }

    @PUT
    @Path("/{id}/profile")
    @Transactional
    public Response updateProfile(@PathParam("id") Long id, UpdateProfileRequest request) {
        User user = User.findById(id);
        if (user == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        // Check if username is being changed and if it's already taken
        if (request.username != null && !request.username.equals(user.username)) {
            User existingUser = User.findByUsername(request.username);
            if (existingUser != null && !existingUser.id.equals(user.id)) {
                return Response.status(Response.Status.CONFLICT)
                        .entity("{\"error\":\"Username already taken\"}").build();
            }
            user.username = request.username;
        }

        if (request.fullName != null) {
            user.fullName = request.fullName;
        }
        if (request.biography != null) {
            user.biography = request.biography;
        }
        if (request.profileImageUrl != null) {
            user.profileImageUrl = request.profileImageUrl;
        }
        if (request.hasSolarPanels != null) {
            user.hasSolarPanels = request.hasSolarPanels;
        }
        if (request.hasHeatPump != null) {
            user.hasHeatPump = request.hasHeatPump;
        }

        user.persist();
        return Response.ok(new UserDto(user)).build();
    }

    @GET
    @Path("/{id}/stats")
    public Response getUserStats(
            @PathParam("id") Long id,
            @QueryParam("startDate") String startDate,
            @QueryParam("endDate") String endDate) {
        
        User user = User.findById(id);
        if (user == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        
        StatsDto stats = userActivityService.getUserStats(id, start, end);
        return Response.ok(stats).build();
    }
}
