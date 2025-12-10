package at.htl.entities;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leaderboard_entries", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "period_type", "period_start"}))
public class LeaderboardEntry extends PanacheEntity {

    public enum PeriodType {
        DAILY, WEEKLY, MONTHLY, YEARLY
    }

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    public User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "period_type", nullable = false)
    public PeriodType periodType;

    @Column(name = "period_start", nullable = false)
    public LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    public LocalDate periodEnd;

    // Total impacts for the period
    @Column(name = "total_co2")
    public Double totalCo2 = 0.0;

    @Column(name = "total_water")
    public Double totalWater = 0.0;

    @Column(name = "total_electricity")
    public Double totalElectricity = 0.0;

    // Number of days tracked in this period
    @Column(name = "days_tracked")
    public Integer daysTracked = 0;

    // Number of days required to be eligible
    @Column(name = "days_required")
    public Integer daysRequired = 1;

    // Whether the user is eligible for the leaderboard
    @Column(name = "is_eligible")
    public Boolean isEligible = false;

    // Whether the values are realistic (not disqualified)
    @Column(name = "is_valid")
    public Boolean isValid = true;

    // Disqualification reason if any
    @Column(name = "disqualification_reason")
    public String disqualificationReason;

    // Rank in the leaderboard (calculated, not stored)
    @Transient
    public Integer rank;

    @Column(name = "created_date")
    public LocalDateTime createdDate;

    @Column(name = "updated_date")
    public LocalDateTime updatedDate;

    @PrePersist
    public void prePersist() {
        this.createdDate = LocalDateTime.now();
        this.updatedDate = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedDate = LocalDateTime.now();
    }

    // Convenience method to check eligibility
    public void checkEligibility() {
        this.isEligible = this.daysTracked >= this.daysRequired && this.isValid;
    }
}
