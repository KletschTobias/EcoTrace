package at.htl.dtos;

import at.htl.entities.Friendship;

public class FriendshipDto {
    public Long id;
    public UserDto user;
    public UserDto friend;
    public String status;

    public FriendshipDto() {}

    public FriendshipDto(Friendship friendship) {
        this.id = friendship.id;
        this.user = UserDto.from(friendship.user);
        this.friend = UserDto.from(friendship.friend);
        this.status = friendship.status;
    }

    public static FriendshipDto from(Friendship friendship) {
        return new FriendshipDto(friendship);
    }
}
