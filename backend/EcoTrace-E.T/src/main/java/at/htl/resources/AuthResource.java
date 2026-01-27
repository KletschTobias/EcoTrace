package at.htl.resources;

import at.htl.dtos.UserDto;
import at.htl.entities.User;
import at.htl.services.AuthService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.jwt.JsonWebToken;

import jakarta.ws.rs.core.Response;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Map;

@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject
    AuthService authService;

    @Inject
    JsonWebToken jwt;

    /**
     * Create user in database (called during startup - no auth required)
     */
    @POST
    @Path("/users/sync")
    @Transactional
    public Response syncUser(Map<String, String> body) {
        try {
            String externalId = body.get("externalId");
            String username = body.get("username");
            String fullName = body.get("fullName");
            String email = body.get("email");
            
            if (externalId == null || externalId.isBlank()) {
                return Response.status(400).entity("externalId is required").build();
            }
            
            // Check if user already exists
            User user = User.findByExternalId(externalId);
            if (user == null) {
                user = authService.createNewUser(externalId, username, fullName, email);
            }
            
            return Response.ok(UserDto.from(user)).build();
        } catch (Exception e) {
            return Response.status(500).entity(e.getMessage()).build();
        }
    }

    /**
     * Get all users (ADMIN only)
     */
    @GET
    @Path("/users")
    @RolesAllowed("ROLE_ADMIN")
    public List<UserDto> getAllUsers() {
        return authService.getAllUsers();
    }

    /**
     * Get user by ID (ADMIN only)
     */
    @GET
    @Path("/users/{id}")
    @RolesAllowed("ROLE_ADMIN")
    public UserDto getUserById(@PathParam("id") Long id) {
        return authService.getUserById(id);
    }

    /**
     * Get current user profile (authenticated USER)
     */
    @GET
    @Path("/me")
    @RolesAllowed({"et-user"})
    public UserDto getCurrentUser() {
        return authService.getCurrentUser(jwt);
    }

    /**
     * Update current user's avatar color (authenticated USER)
     */
    @PATCH
    @Path("/me/avatar")
    @RolesAllowed({"et-user"})
    public UserDto updateMyAvatar(Map<String, String> body) {
        String avatarColor = body.get("avatarColor");
        if (avatarColor == null || avatarColor.trim().isEmpty()) {
            throw new BadRequestException("avatarColor is required");
        }
        Long userId = authService.getCurrentUserId(jwt);
        return authService.updateAvatarColor(userId, avatarColor);
    }

    /**
     * Update user avatar by ID (ADMIN only)
     */
    @PATCH
    @Path("/users/{id}/avatar")
    @RolesAllowed("ROLE_ADMIN")
    public UserDto updateAvatar(@PathParam("id") Long id, Map<String, String> body) {
        String avatarColor = body.get("avatarColor");
        if (avatarColor == null || avatarColor.trim().isEmpty()) {
            throw new BadRequestException("avatarColor is required");
        }
        return authService.updateAvatarColor(id, avatarColor);
    }

    /**
     * Delete current user account (authenticated USER)
     * This will delete the user and all related data (activities, friendships)
     */
    @DELETE
    @Path("/me")
    @RolesAllowed({"ROLE_USER", "et-user"})
    public void deleteMyAccount() {
        System.out.println("🚨 DELETE /api/auth/me endpoint called!");
        authService.deleteCurrentUser(jwt);
        System.out.println("✅ DELETE /api/auth/me completed");
    }

    /**
     * Delete user webhook (triggered by Keycloak)
     * No role required - called by Keycloak server directly
     */
    @DELETE
    @Path("/webhook/users/{externalId}")
    public void handleUserDeletion(@PathParam("externalId") String externalId) {
        authService.deleteUserByExternalId(externalId);
    }
}
