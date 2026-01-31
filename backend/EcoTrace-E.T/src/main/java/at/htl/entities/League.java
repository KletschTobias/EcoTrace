package at.htl.entities;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "leagues")
public class League extends PanacheEntity {

    public enum LeagueType {
        PUBLIC, PRIVATE
    }

    @Column(nullable = false)
    public String name;

    @Column(length = 1000)
    public String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "league_type", nullable = false)
    public LeagueType leagueType;

    @ManyToOne
    @JoinColumn(name = "host_id", nullable = false)
    public User host;

    @Column(name = "start_date", nullable = false)
    public LocalDate startDate;

    @Column(name = "end_date")
    public LocalDate endDate; // null = no end date (permanent)

    @Column(name = "max_participants")
    public Integer maxParticipants = 500;

    @Column(name = "is_permanent")
    public Boolean isPermanent = false; // true for the default public league

    @Column(name = "created_at")
    public LocalDateTime createdAt;

    @Column(name = "updated_at")
    public LocalDateTime updatedAt;

    @OneToMany(mappedBy = "league", cascade = CascadeType.ALL)
    public List<LeagueMember> members;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Query methods
    public static List<League> findPublicLeagues() {
        return list("leagueType = ?1 and (endDate is null or endDate >= ?2)", 
                    LeagueType.PUBLIC, LocalDate.now());
    }

    public static League findPermanentPublicLeague() {
        return find("isPermanent = true and leagueType = ?1", LeagueType.PUBLIC).firstResult();
    }

    public static long countMembers(Long leagueId) {
        return LeagueMember.count("league.id = ?1", leagueId);
    }

    public boolean isFull() {
        return countMembers(this.id) >= this.maxParticipants;
    }

    public boolean isActive() {
        if (isPermanent) return true;
        if (endDate == null) return true;
        return !endDate.isBefore(LocalDate.now());
    }
}
