package at.htl.dtos;

import at.htl.entities.User;

public class UserDto {
    public Long id;
    public String username;
    public String email;
    public String fullName;
    public String avatarColor;
    public Double totalCo2;
    public Double totalWater;
    public Double totalElectricity;

    public UserDto() {}

    public UserDto(User user) {
        this.id = user.id;
        this.username = user.username;
        this.email = user.email;
        this.fullName = user.fullName;
        this.avatarColor = user.avatarColor;
        this.totalCo2 = user.totalCo2;
        this.totalWater = user.totalWater;
        this.totalElectricity = user.totalElectricity;
    }

    public static UserDto from(User user) {
        return new UserDto(user);
    }
}