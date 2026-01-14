package at.htl.services;

import at.htl.dtos.UserDto;
import at.htl.entities.Friendship;
import at.htl.entities.User;
import at.htl.entities.UserActivity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@ApplicationScoped
public class AuthService {

    private static final Logger LOGGER = Logger.getLogger(AuthService.class.getName());

    @Inject
    KeycloakService keycloakService;

    public UserDto getUserById(Long id) {
        User user = User.findById(id);
        if (user == null) {
            throw new NotFoundException("User not found");
        }
        return UserDto.from(user);
    }

    public UserDto getUserByExternalId(String externalId) {
        User user = User.findByExternalId(externalId);
        if (user == null) {
            throw new NotFoundException("User not found");
        }
        return UserDto.from(user);
    }

    public List<UserDto> getAllUsers() {
        return User.<User>listAll().stream()
                .map(UserDto::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto updateAvatarColor(Long id, String avatarColor) {
        User user = User.findById(id);
        if (user == null) {
            throw new NotFoundException("User not found");
        }
        user.avatarColor = avatarColor;
        user.persist();
        return UserDto.from(user);
    }

    @Transactional
    public void deleteUserByExternalId(String externalId) {
        User user = User.findByExternalId(externalId);
        if (user != null) {
            deleteUserAndRelatedData(user);
        }
    }

    @Transactional
    public void deleteCurrentUser(JsonWebToken jwt) {
        LOGGER.info("🔴 deleteCurrentUser called");
        UserDto userDto = getCurrentUser(jwt);
        LOGGER.info(() -> "Found user to delete: ID=" + userDto.id + ", externalId=" + userDto.externalId);
        User user = User.findById(userDto.id);
        if (user != null) {
            LOGGER.info("User entity found, proceeding with deletion");
            deleteUserAndRelatedData(user);
            LOGGER.info("✅ deleteCurrentUser completed");
        } else {
            LOGGER.warning("⚠️ User not found in database!");
        }
    }

    /**
     * Delete user and all related data (activities, friendships)
     * Also deletes the user from Keycloak
     */
    private void deleteUserAndRelatedData(User user) {
        String externalId = user.externalId;

        LOGGER.info(() -> "Deleting related data for user " + externalId + " (ID=" + user.id + ")");

        // Delete all user activities (correct JPQL predicate)
        long activitiesDeleted = UserActivity.delete("user.id = ?1", user.id);
        LOGGER.info(() -> "Deleted activities: " + activitiesDeleted);

        // Delete all friendships (both as user and as friend)
        long friendshipsDeleted = Friendship.delete("user.id = ?1 or friend.id = ?1", user.id);
        LOGGER.info(() -> "Deleted friendships: " + friendshipsDeleted);

        // Delete the user from database
        user.delete();
        LOGGER.info(() -> "User entity deleted from database");

        // Delete from Keycloak - MUST be after database deletion to prevent rollback
        LOGGER.info(() -> "🔴 Attempting to delete user from Keycloak: " + externalId);
        try {
            keycloakService.deleteKeycloakUser(externalId);
            LOGGER.info(() -> "✅ Keycloak deletion initiated for: " + externalId);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "❌ Failed to delete user from Keycloak: " + externalId, e);
            // Don't throw - database deletion should succeed even if Keycloak fails
        }
    }

    /**
     * Extract current authenticated user from JWT token
     * Auto-creates user if not exists
     */
    public UserDto getCurrentUser(JsonWebToken jwt) {
        if (jwt == null) {
            throw new NotFoundException("Not authenticated");
        }
        String externalId = jwt.getSubject();
        if (externalId == null || externalId.isBlank()) {
            throw new NotFoundException("Invalid JWT token");
        }
        User user = User.findByExternalId(externalId);
        if (user == null) {
            // Extract user info from JWT token
            String username = jwt.getName(); // preferred_username claim
            String fullName = (String) jwt.getClaim("name");
            String email = (String) jwt.getClaim("email");
            
            // Auto-create user if doesn't exist
            user = createNewUser(externalId, username, fullName, email);
        }
        
        // Check if user has et-admin role in JWT token
        boolean isAdmin = jwt.getGroups() != null && jwt.getGroups().contains("et-admin");
        user.isAdmin = isAdmin;
        user.persist();
        
        return UserDto.from(user);
    }

    /**
     * Create a new user with auto-generated avatar color
     */
    @Transactional
    public User createNewUser(String externalId, String username, String fullName, String email) {
        User user = new User();
        user.externalId = externalId;
        user.username = username;
        user.fullName = fullName;
        user.email = email;
        // Avatar color will be auto-generated in @PrePersist
        user.persist();
        return user;
    }

    /**
     * Create user with minimal info (fallback)
     */
    @Transactional
    public User createNewUser(String externalId) {
        return createNewUser(externalId, externalId, "User", null);
    }

    /**
     * Get user ID from JWT token (for internal use)
     */
    public Long getCurrentUserId(JsonWebToken jwt) {
        return getCurrentUser(jwt).id;
    }
}
