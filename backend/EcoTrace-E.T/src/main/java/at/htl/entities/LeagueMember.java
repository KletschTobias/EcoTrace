package at.htl.entities;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "league_members", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"league_id", "user_id"})
})
public class LeagueMember extends PanacheEntity {

    public enum MemberStatus {
        INVITED, ACTIVE, KICKED
    }

    @ManyToOne
    @JoinColumn(name = "league_id", nullable = false)
    public League league;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    public User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public MemberStatus status = MemberStatus.ACTIVE;

    @Column(name = "joined_at")
    public LocalDateTime joinedAt;

    @Column(name = "last_activity")
    public LocalDateTime lastActivity;

    // Calculated scores for this league
    @Column(name = "total_co2")
    public Double totalCo2 = 0.0;

    @Column(name = "total_water")
    public Double totalWater = 0.0;

    @Column(name = "total_electricity")
    public Double totalElectricity = 0.0;

    @Column(name = "score")
    public Double score = 0.0;

    @Column(name = "activity_count")
    public Integer activityCount = 0;

    @PrePersist
    public void prePersist() {
        this.joinedAt = LocalDateTime.now();
        this.lastActivity = LocalDateTime.now();
    }

    // Query methods
    public static LeagueMember findByLeagueAndUser(Long leagueId, Long userId) {
        return find("league.id = ?1 and user.id = ?2", leagueId, userId).firstResult();
    }

    public static boolean isUserInLeague(Long leagueId, Long userId) {
        return count("league.id = ?1 and user.id = ?2 and status = ?3", 
                     leagueId, userId, MemberStatus.ACTIVE) > 0;
    }

    public static long countActiveMembers(Long leagueId) {
        return count("league.id = ?1 and status = ?2", leagueId, MemberStatus.ACTIVE);
    }
}
