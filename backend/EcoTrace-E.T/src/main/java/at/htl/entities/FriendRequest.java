package at.htl.entities;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "friend_requests", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"sender_id", "receiver_id"})
})
public class FriendRequest extends PanacheEntity {

    public enum Status {
        PENDING, ACCEPTED, REJECTED
    }

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    public User sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id", nullable = false)
    public User receiver;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public Status status = Status.PENDING;

    @Column(name = "created_at")
    public LocalDateTime createdAt;

    @Column(name = "updated_at")
    public LocalDateTime updatedAt;

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
    public static FriendRequest findBySenderAndReceiver(Long senderId, Long receiverId) {
        return find("sender.id = ?1 and receiver.id = ?2", senderId, receiverId).firstResult();
    }

    public static FriendRequest findByUsers(Long user1Id, Long user2Id) {
        return find("(sender.id = ?1 and receiver.id = ?2) or (sender.id = ?2 and receiver.id = ?1)", 
                    user1Id, user2Id).firstResult();
    }

    public static long countPendingRequestsForUser(Long userId) {
        return count("receiver.id = ?1 and status = ?2", userId, Status.PENDING);
    }
}
