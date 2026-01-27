package at.htl.services;

import at.htl.dtos.CreateLeagueRequest;
import at.htl.dtos.LeagueDto;
import at.htl.dtos.LeagueMemberDto;
import at.htl.entities.League;
import at.htl.entities.LeagueMember;
import at.htl.entities.User;
import at.htl.entities.UserActivity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class LeagueService {

    @Transactional
    public LeagueDto createLeague(Long userId, CreateLeagueRequest request) {
        User user = User.findById(userId);
        if (user == null) {
            throw new NotFoundException("User not found");
        }

        if (request.name == null || request.name.trim().isEmpty()) {
            throw new BadRequestException("League name is required");
        }

        if (request.maxParticipants != null && (request.maxParticipants < 2 || request.maxParticipants > 500)) {
            throw new BadRequestException("Max participants must be between 2 and 500");
        }

        League league = new League();
        league.name = request.name.trim();
        league.description = request.description;
        league.leagueType = League.LeagueType.valueOf(request.leagueType.toUpperCase());
        league.host = user;
        league.startDate = request.startDate != null ? request.startDate : LocalDate.now();
        league.endDate = request.endDate;
        league.maxParticipants = request.maxParticipants != null ? request.maxParticipants : 500;
        league.isPermanent = false;
        league.persist();

        // Automatically add creator as first member
        LeagueMember member = new LeagueMember();
        member.league = league;
        member.user = user;
        member.status = LeagueMember.MemberStatus.ACTIVE;
        member.persist();

        return LeagueDto.from(league, true);
    }

    @Transactional
    public LeagueDto joinLeague(Long userId, Long leagueId) {
        User user = User.findById(userId);
        if (user == null) {
            throw new NotFoundException("User not found");
        }

        League league = League.findById(leagueId);
        if (league == null) {
            throw new NotFoundException("League not found");
        }

        if (league.leagueType == League.LeagueType.PRIVATE) {
            throw new ForbiddenException("Cannot join private league without invitation");
        }

        if (!league.isActive()) {
            throw new BadRequestException("League is no longer active");
        }

        if (league.isFull()) {
            throw new BadRequestException("League is full");
        }

        // Check if already a member
        if (LeagueMember.isUserInLeague(leagueId, userId)) {
            throw new BadRequestException("Already a member of this league");
        }

        LeagueMember member = new LeagueMember();
        member.league = league;
        member.user = user;
        member.status = LeagueMember.MemberStatus.ACTIVE;
        member.persist();

        // Calculate initial stats for this member
        updateMemberStats(member);

        return LeagueDto.from(league, true);
    }

    @Transactional
    public void leaveLeague(Long userId, Long leagueId) {
        LeagueMember member = LeagueMember.findByLeagueAndUser(leagueId, userId);
        if (member == null) {
            throw new NotFoundException("Not a member of this league");
        }

        League league = League.findById(leagueId);
        if (league.host.id.equals(userId) && !league.isPermanent) {
            throw new BadRequestException("Host cannot leave league. Delete it instead or transfer ownership.");
        }

        member.delete();
    }

    @Transactional
    public void inviteToLeague(Long hostId, Long leagueId, String userIdentifier) {
        League league = League.findById(leagueId);
        if (league == null) {
            throw new NotFoundException("League not found");
        }

        if (!league.host.id.equals(hostId)) {
            throw new ForbiddenException("Only the host can invite users");
        }

        if (league.isFull()) {
            throw new BadRequestException("League is full");
        }

        User user = User.findByUsername(userIdentifier);
        if (user == null) {
            user = User.findByEmail(userIdentifier);
        }
        if (user == null) {
            throw new NotFoundException("User not found");
        }

        if (LeagueMember.isUserInLeague(leagueId, user.id)) {
            throw new BadRequestException("User is already a member");
        }

        LeagueMember member = new LeagueMember();
        member.league = league;
        member.user = user;
        member.status = LeagueMember.MemberStatus.INVITED;
        member.persist();
    }

    @Transactional
    public void acceptInvitation(Long userId, Long leagueId) {
        LeagueMember member = LeagueMember.findByLeagueAndUser(leagueId, userId);
        if (member == null || member.status != LeagueMember.MemberStatus.INVITED) {
            throw new NotFoundException("No pending invitation found");
        }

        League league = League.findById(leagueId);
        if (league.isFull()) {
            throw new BadRequestException("League is full");
        }

        member.status = LeagueMember.MemberStatus.ACTIVE;
        member.joinedAt = LocalDateTime.now();
        updateMemberStats(member);
    }

    @Transactional
    public void kickMember(Long hostId, Long leagueId, Long memberId) {
        League league = League.findById(leagueId);
        if (league == null) {
            throw new NotFoundException("League not found");
        }

        if (!league.host.id.equals(hostId)) {
            throw new ForbiddenException("Only the host can kick members");
        }

        LeagueMember member = LeagueMember.findById(memberId);
        if (member == null || !member.league.id.equals(leagueId)) {
            throw new NotFoundException("Member not found in this league");
        }

        if (member.user.id.equals(hostId)) {
            throw new BadRequestException("Cannot kick yourself");
        }

        member.status = LeagueMember.MemberStatus.KICKED;
    }

    public List<LeagueDto> getPublicLeagues(Long userId) {
        List<League> leagues = League.findPublicLeagues();
        return leagues.stream()
                .map(league -> LeagueDto.from(league, LeagueMember.isUserInLeague(league.id, userId)))
                .collect(Collectors.toList());
    }

    public List<LeagueDto> getUserLeagues(Long userId) {
        List<LeagueMember> memberships = LeagueMember.list("user.id = ?1 and status = ?2", 
                userId, LeagueMember.MemberStatus.ACTIVE);
        return memberships.stream()
                .map(m -> LeagueDto.from(m.league, true))
                .collect(Collectors.toList());
    }

    public LeagueDto getLeague(Long leagueId, Long userId) {
        League league = League.findById(leagueId);
        if (league == null) {
            throw new NotFoundException("League not found");
        }

        boolean isMember = LeagueMember.isUserInLeague(leagueId, userId);
        return LeagueDto.from(league, isMember);
    }

    public List<LeagueMemberDto> getLeagueMembers(Long leagueId) {
        List<LeagueMember> members = LeagueMember.list("league.id = ?1 and status = ?2", 
                leagueId, LeagueMember.MemberStatus.ACTIVE);
        
        // Sort by score descending
        members.sort((a, b) -> Double.compare(b.score, a.score));

        List<LeagueMemberDto> dtos = members.stream()
                .map(LeagueMemberDto::from)
                .collect(Collectors.toList());

        // Add rank
        for (int i = 0; i < dtos.size(); i++) {
            dtos.get(i).rank = i + 1;
        }

        return dtos;
    }

    @Transactional
    public void updateMemberStats(LeagueMember member) {
        // Reload member from database to ensure it's managed
        LeagueMember managedMember = LeagueMember.findById(member.id);
        if (managedMember == null) {
            return;
        }
        
        League league = managedMember.league;
        User user = managedMember.user;

        // Calculate totals for ALL user activities (not restricted by date)
        // This makes more sense for tracking overall consumption/activity
        List<UserActivity> activities = UserActivity.list(
                "user.id = ?1", 
                user.id);

        double totalCo2 = 0.0;
        double totalWater = 0.0;
        double totalElectricity = 0.0;

        for (UserActivity activity : activities) {
            totalCo2 += activity.co2Impact != null ? activity.co2Impact : 0.0;
            totalWater += activity.waterImpact != null ? activity.waterImpact : 0.0;
            totalElectricity += activity.electricityImpact != null ? activity.electricityImpact : 0.0;
        }

        // Update using explicit query to ensure database update
        managedMember.update("totalCo2 = ?1, totalWater = ?2, totalElectricity = ?3, activityCount = ?4, score = ?5, lastActivity = ?6 where id = ?7",
                totalCo2, totalWater, totalElectricity, activities.size(), (double)(activities.size() * 5), LocalDateTime.now(), managedMember.id);
    }

    @Transactional
    public void updateAllMemberStatsForLeague(Long leagueId) {
        List<LeagueMember> members = LeagueMember.list("league.id = ?1 and status = ?2", 
                leagueId, LeagueMember.MemberStatus.ACTIVE);
        
        for (LeagueMember member : members) {
            updateMemberStats(member);
        }
    }
}
