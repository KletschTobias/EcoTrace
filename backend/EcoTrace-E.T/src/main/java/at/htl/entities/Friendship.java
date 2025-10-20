package at.htl.entities;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "friendships", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "friend_id"})
})
public class Friendship extends PanacheEntity {

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    public User user;

    @ManyToOne
    @JoinColumn(name = "friend_id", nullable = false)
    public User friend;

    @Column(nullable = false)
    public String status = "accepted"; // pending, accepted, declined

    @Column(name = "created_date")
    public LocalDateTime createdDate;

    @PrePersist
    public void prePersist() {
        this.createdDate = LocalDateTime.now();
    }

    // Static methods for queries
    public static long countFriendsByUserId(Long userId) {
        return count("user.id = ?1 and status = 'accepted'", userId);
    }

    public static Friendship findByUserAndFriend(Long userId, Long friendId) {
        return find("(user.id = ?1 and friend.id = ?2) or (user.id = ?2 and friend.id = ?1)", 
                    userId, friendId).firstResult();
    }
}
