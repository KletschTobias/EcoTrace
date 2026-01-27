package at.htl.entities;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User extends PanacheEntity {

    @Column(unique = true, nullable = false)
    public String externalId;

    @Column(unique = true)
    public String username;

    @Column(name = "full_name")
    public String fullName;

    @Column(name = "email", unique = true)
    public String email;

    @Column(name = "avatar_color")
    public String avatarColor;

    @Column(name = "profile_image_url")
    public String profileImageUrl;

    @Column(name = "biography", length = 500)
    public String biography;

    @Column(name = "has_solar_panels")
    public Boolean hasSolarPanels = false;

    @Column(name = "has_heat_pump")
    public Boolean hasHeatPump = false;

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

    public static User findByEmail(String email) {
        return find("email", email).firstResult();
    }

    public static User findByUsername(String username) {
        return find("username", username).firstResult();
    }
}