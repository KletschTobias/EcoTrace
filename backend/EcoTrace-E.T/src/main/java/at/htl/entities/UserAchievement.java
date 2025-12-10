package at.htl.entities;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_achievements", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "achievement_id"})
})
public class UserAchievement extends PanacheEntity {

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    public User user;

    @ManyToOne
    @JoinColumn(name = "achievement_id", nullable = false)
    public Achievement achievement;

    @Column(name = "unlocked_at", nullable = false)
    public LocalDateTime unlockedAt;

    @Column(name = "progress")
    public Integer progress = 0; // Current progress towards achievement (0-100%)

    @Column(name = "is_new")
    public Boolean isNew = true; // Flag to show notification badge

    @PrePersist
    public void prePersist() {
        this.unlockedAt = LocalDateTime.now();
    }

    // Static finder methods
    public static UserAchievement findByUserAndAchievement(Long userId, Long achievementId) {
        return find("user.id = ?1 and achievement.id = ?2", userId, achievementId).firstResult();
    }

    public static long countByUserId(Long userId) {
        return count("user.id", userId);
    }
}
