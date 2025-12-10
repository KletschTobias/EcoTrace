package at.htl.entities;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User extends PanacheEntity {

    @Column(unique = true, nullable = false)
    public String externalId;

    @Column(name = "avatar_color")
    public String avatarColor;

    @Column(name = "total_co2")
    public Double totalCo2 = 0.0;

    @Column(name = "total_water")
    public Double totalWater = 0.0;

    @Column(name = "total_electricity")
    public Double totalElectricity = 0.0;

    @Column(name = "created_date")
    public LocalDateTime createdDate;

    @Column(name = "updated_date")
    public LocalDateTime updatedDate;

    @PrePersist
    public void prePersist() {
        this.createdDate = LocalDateTime.now();
        this.updatedDate = LocalDateTime.now();
        
        // Generate random avatar color if not set
        if (this.avatarColor == null) {
            String[] colors = {"#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#EF4444", "#06B6D4"};
            this.avatarColor = colors[(int) (Math.random() * colors.length)];
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedDate = LocalDateTime.now();
    }

    // Static methods for queries
    public static User findByExternalId(String externalId) {
        return find("externalId", externalId).firstResult();
    }
}