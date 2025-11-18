package at.htl.services;

import at.htl.dtos.UserDto;
import at.htl.entities.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class AuthService {

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
            user.delete();
        }
    }

    /**
     * Extract current authenticated user from JWT token
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
            throw new NotFoundException("User profile not found");
        }
        return UserDto.from(user);
    }

    /**
     * Get user ID from JWT token (for internal use)
     */
    public Long getCurrentUserId(JsonWebToken jwt) {
        return getCurrentUser(jwt).id;
    }
}
