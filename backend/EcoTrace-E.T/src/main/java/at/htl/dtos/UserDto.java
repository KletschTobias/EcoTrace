package at.htl.dtos;

public class UserDto {
    public String firstName;
    public String lastName;
    public String email;
    public String username;

    public UserDto(String firstName, String lastName, String email, String username) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.username = username;
    }
}