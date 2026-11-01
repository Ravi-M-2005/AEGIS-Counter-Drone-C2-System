package com.aegis.drone;
public class DroneNotFoundException extends RuntimeException {
    public DroneNotFoundException(String id) { super("Drone not found: " + id); }
}
