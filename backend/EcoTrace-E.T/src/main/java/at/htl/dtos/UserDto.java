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
    public String externalId;
    public Boolean isAdmin;
    public String profileImageUrl;
    public String biography;
    public Boolean hasSolarPanels;
    public Boolean hasHeatPump;

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
        this.externalId = user.externalId;
        this.isAdmin = user.isAdmin;
        this.profileImageUrl = user.profileImageUrl;
        this.biography = user.biography;
        this.hasSolarPanels = user.hasSolarPanels;
        this.hasHeatPump = user.hasHeatPump;
    }

    public static UserDto from(User user) {
        return new UserDto(user);
    }
}