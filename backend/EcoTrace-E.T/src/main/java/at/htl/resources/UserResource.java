package at.htl.resources;

import at.htl.dtos.StatsDto;
import at.htl.dtos.UpdateProfileRequest;
import at.htl.dtos.UserDto;
import at.htl.entities.User;
import at.htl.services.KeycloakService;
import at.htl.services.UserActivityService;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.time.LocalDate;
import java.util.Map;
import java.util.logging.Logger;

@Path("/api/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {

    private static final Logger LOGGER = Logger.getLogger(UserResource.class.getName());

    @Inject
    UserActivityService userActivityService;

    @Inject
    KeycloakService keycloakService;

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

        // Check if username is being changed and if it's unique
        if (request.username != null && !request.username.trim().isEmpty()) {
            String newUsername = request.username.trim();
            if (!newUsername.equals(user.username)) {
                // Username changed, check uniqueness
                User existingUser = User.find("username", newUsername).firstResult();
                if (existingUser != null && !existingUser.id.equals(id)) {
                    return Response.status(Response.Status.BAD_REQUEST)
                            .entity(Map.of("message", "Username already taken"))
                            .build();
                }
                user.username = newUsername;
            }
        }

        if (request.fullName != null && !request.fullName.trim().isEmpty()) {
            String oldFullName = user.fullName;
            user.fullName = request.fullName.trim();
            
            // Update Keycloak if fullName changed
            if (!user.fullName.equals(oldFullName)) {
                LOGGER.info("Full name changed, updating Keycloak for user: " + user.externalId);
                try {
                    // Split fullName into firstName and lastName
                    String[] nameParts = user.fullName.split(" ", 2);
                    String firstName = nameParts[0];
                    String lastName = nameParts.length > 1 ? nameParts[1] : "";
                    keycloakService.updateKeycloakUserName(user.externalId, firstName, lastName);
                } catch (Exception e) {
                    LOGGER.warning("Failed to update Keycloak name: " + e.getMessage());
                }
            }
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
