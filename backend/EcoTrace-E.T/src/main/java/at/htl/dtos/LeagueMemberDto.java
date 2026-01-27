package at.htl.dtos;

import at.htl.entities.LeagueMember;
import java.time.LocalDateTime;

public class LeagueMemberDto {
    public Long id;
    public UserDto user;
    public String status;
    public LocalDateTime joinedAt;
    public LocalDateTime lastActivity;
    public Double totalCo2;
    public Double totalWater;
    public Double totalElectricity;
    public Double score;
    public Integer rank;

    public static LeagueMemberDto from(LeagueMember member) {
        LeagueMemberDto dto = new LeagueMemberDto();
        dto.id = member.id;
        dto.user = UserDto.from(member.user);
        dto.status = member.status.name();
        dto.joinedAt = member.joinedAt;
        dto.lastActivity = member.lastActivity;
        dto.totalCo2 = member.totalCo2;
        dto.totalWater = member.totalWater;
        dto.totalElectricity = member.totalElectricity;
        dto.score = member.score;
        return dto;
    }
}
