package at.htl.dtos;

import java.time.LocalDate;

public class CreateLeagueRequest {
    public String name;
    public String description;
    public String leagueType; // PUBLIC or PRIVATE
    public LocalDate startDate;
    public LocalDate endDate; // optional
    public Integer maxParticipants;
}
