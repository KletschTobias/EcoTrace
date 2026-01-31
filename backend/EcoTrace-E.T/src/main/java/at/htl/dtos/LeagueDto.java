package at.htl.dtos;

import at.htl.entities.League;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class LeagueDto {
    public Long id;
    public String name;
    public String description;
    public String leagueType;
    public UserDto host;
    public LocalDate startDate;
    public LocalDate endDate;
    public Integer maxParticipants;
    public Integer currentMembers;
    public Boolean isPermanent;
    public Boolean isActive;
    public Boolean isFull;
    public Boolean isUserMember;
    public LocalDateTime createdAt;

    public static LeagueDto from(League league) {
        return from(league, false);
    }

    public static LeagueDto from(League league, boolean isUserMember) {
        LeagueDto dto = new LeagueDto();
        dto.id = league.id;
        dto.name = league.name;
        dto.description = league.description;
        dto.leagueType = league.leagueType.name();
        dto.host = UserDto.from(league.host);
        dto.startDate = league.startDate;
        dto.endDate = league.endDate;
        dto.maxParticipants = league.maxParticipants;
        dto.currentMembers = (int) League.countMembers(league.id);
        dto.isPermanent = league.isPermanent;
        dto.isActive = league.isActive();
        dto.isFull = league.isFull();
        dto.isUserMember = isUserMember;
        dto.createdAt = league.createdAt;
        return dto;
    }
}
