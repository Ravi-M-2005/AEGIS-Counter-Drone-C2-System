package com.aegis.operator;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "operators", uniqueConstraints = @UniqueConstraint(columnNames = "username"))
public class Operator {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable=false, unique=true, length=80) private String username;
    @Column(nullable=false) private String passwordHash;
    @Column(nullable=false, length=80) private String role;
    @Column(nullable=false) private boolean enabled = true;
    @Column(nullable=false) private Instant createdAt = Instant.now();

    protected Operator() {}
    public Operator(String username, String passwordHash, String role) {
        this.username=username; this.passwordHash=passwordHash; this.role=role;
    }
    public Long getId(){return id;} public String getUsername(){return username;}
    public String getPasswordHash(){return passwordHash;} public String getRole(){return role;}
    public boolean isEnabled(){return enabled;}
    public void setPasswordHash(String passwordHash){this.passwordHash = passwordHash;}
    public void setRole(String role){this.role = role;}
    public void setEnabled(boolean enabled){this.enabled = enabled;}
}
