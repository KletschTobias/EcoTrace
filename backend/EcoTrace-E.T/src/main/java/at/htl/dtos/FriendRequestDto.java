package at.htl.dtos;

import at.htl.entities.FriendRequest;
import java.time.LocalDateTime;

public class FriendRequestDto {
    public Long id;
    public UserDto sender;
    public UserDto receiver;
    public String status;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;

    public static FriendRequestDto from(FriendRequest fr) {
        FriendRequestDto dto = new FriendRequestDto();
        dto.id = fr.id;
        dto.sender = UserDto.from(fr.sender);
        dto.receiver = UserDto.from(fr.receiver);
        dto.status = fr.status.name();
        dto.createdAt = fr.createdAt;
        dto.updatedAt = fr.updatedAt;
        return dto;
    }
}
