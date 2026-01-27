package at.htl.services;

import at.htl.dtos.LoginRequest;
import at.htl.dtos.RegisterRequest;
import at.htl.dtos.UserDto;
import at.htl.entities.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class AuthService {

    @Transactional
    public UserDto register(RegisterRequest request) {
        // Check if user already exists
        if (User.findByEmail(request.email) != null) {
            throw new BadRequestException("Email already registered");
        }
        if (User.findByUsername(request.username) != null) {
            throw new BadRequestException("Username already taken");
        }

        User user = new User();
        user.username = request.username;
        user.email = request.email;
        user.password = request.password; // In production, hash this!
        user.fullName = request.fullName;
        user.persist();

        return UserDto.from(user);
    }

    public UserDto login(LoginRequest request) {
        User user = User.findByEmail(request.email);
        if (user == null || !user.password.equals(request.password)) {
            throw new BadRequestException("Invalid credentials");
        }
        return UserDto.from(user);
    }

    public UserDto getUserById(Long id) {
        User user = User.findById(id);
        if (user == null) {
            throw new NotFoundException("User not found");
        }
        return UserDto.from(user);
    }

    public UserDto getUserByEmail(String email) {
        User user = User.findByEmail(email);
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
    public UserDto updateUser(Long id, UserDto userDto) {
        User user = User.findById(id);
        if (user == null) {
            throw new NotFoundException("User not found");
        }

        if (userDto.fullName != null) user.fullName = userDto.fullName;
        if (userDto.totalCo2 != null) user.totalCo2 = userDto.totalCo2;
        if (userDto.totalWater != null) user.totalWater = userDto.totalWater;
        if (userDto.totalElectricity != null) user.totalElectricity = userDto.totalElectricity;

        user.persist();
        return UserDto.from(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = User.findById(id);
        if (user == null) {
            throw new NotFoundException("User not found");
        }
        user.delete();
    }
}
