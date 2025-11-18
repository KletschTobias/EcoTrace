package at.htl.resources;

import at.htl.dtos.UserDto;
import at.htl.services.AuthService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.jwt.JsonWebToken;

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
    @RolesAllowed("ROLE_USER")
    public UserDto getCurrentUser() {
        return authService.getCurrentUser(jwt);
    }

    /**
     * Update current user's avatar color (authenticated USER)
     */
    @PATCH
    @Path("/me/avatar")
    @RolesAllowed("ROLE_USER")
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
     * Delete user webhook (triggered by Keycloak)
     * No role required - called by Keycloak server directly
     */
    @DELETE
    @Path("/webhook/users/{externalId}")
    public void handleUserDeletion(@PathParam("externalId") String externalId) {
        authService.deleteUserByExternalId(externalId);
    }
}
