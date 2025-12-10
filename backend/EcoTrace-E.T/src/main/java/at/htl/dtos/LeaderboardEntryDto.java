package at.htl.dtos;

import at.htl.entities.LeaderboardEntry.PeriodType;

public class LeaderboardEntryDto {
    public Long id;
    public Long userId;
    public String username;
    public String fullName;
    public String avatarColor;
    public String profileImageUrl;
    public Boolean hasSolarPanels;
    public Boolean hasHeatPump;
    
    public String periodType;
    public String periodStart;
    public String periodEnd;
    
    public Double totalCo2;
    public Double totalWater;
    public Double totalElectricity;
    
    public Integer daysTracked;
    public Integer daysRequired;
    public Boolean isEligible;
    public Boolean isValid;
    public String disqualificationReason;
    
    public Integer rank;
    
    public LeaderboardEntryDto() {}
}
