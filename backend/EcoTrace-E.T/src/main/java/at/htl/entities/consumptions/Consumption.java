package at.htl.entities.consumptions;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;

import java.time.LocalDate;

@MappedSuperclass
public abstract class Consumption {

    @Id
    @GeneratedValue
    private long id;

    private double waterConsumption;
    private double electricityConsumption;
    private double co2Consumption;
    private LocalDate date;
    private String type;

    public final double carWaterCoefficient = 0.20;
    public final double carElectricityCoefficient = 0;
    public final double carCO2Coefficient = 0.15;

    public final double electricCarWaterCoefficient = 0.17;
    public final double electricCarElectricityCoefficient = 0.17;
    public final double electricCarCO2Coefficient = 0.034;

    public final double showerWaterCoefficient = 9;
    public final double showerElectricityCoefficient = 0.315;
    public final double showerCO2Coefficient = 0.063;

    public final double gamingWaterCoefficient = 0.3;
    public final double gamingElectricityCoefficient = 0.3;
    public final double gamingCO2Coefficient = 0.06;

    public final double streamingWaterCoefficient = 0.325;
    public final double streamingElectricityCoefficient = 0.325;
    public final double streamingCO2Coefficient = 0.065;


    public Consumption(long id, double waterConsumption, double electricityConsumption, double co2Consumption, LocalDate date, String type) {
        this.id = id;
        this.waterConsumption = waterConsumption;
        this.electricityConsumption = electricityConsumption;
        this.co2Consumption = co2Consumption;
        this.date = date;
        this.type = type;
    }

    public Consumption() {
    }

    public abstract void carConsumption(double km, int days);

    public abstract void electricCarConsumption(double km, int days);

    public abstract void showerConsumption(double minutes, int days);

    public abstract void gamingConsumption(double hours, int days);

    public abstract void streamingConsumption(double hours, int days);


    public long getId() {
        return id;
    }

    public double getWaterConsumption() {
        return waterConsumption;
    }

    public void setWaterConsumption(double waterConsumption) {
        this.waterConsumption += waterConsumption;
    }

    public double getElectricityConsumption() {
        return electricityConsumption;
    }

    public void setElectricityConsumption(double electricityConsumption) {
        this.electricityConsumption += electricityConsumption;
    }

    public double getCo2Consumption() {
        return co2Consumption;
    }

    public void setCo2Consumption(double co2Consumption) {
        this.co2Consumption += co2Consumption;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}