package at.htl.entities.consumptions;

import jakarta.persistence.Entity;

@Entity
public class MonthlyConsumption extends Consumption {

    @Override
    public void carConsumption(double km, int days) {
        setCo2Consumption(carCO2Coefficient * km * days);
        setWaterConsumption(carWaterCoefficient * km * days);
        setElectricityConsumption(carElectricityCoefficient * km * days);
    }

    @Override
    public void electricCarConsumption(double km, int days) {
        setCo2Consumption(electricCarCO2Coefficient * km * days);
        setWaterConsumption(electricCarWaterCoefficient * km * days);
        setElectricityConsumption(electricCarElectricityCoefficient * km * days);
    }

    @Override
    public void showerConsumption(double minutes, int days) {
        setCo2Consumption(showerCO2Coefficient * minutes * days);
        setWaterConsumption(showerWaterCoefficient * minutes *days);
        setElectricityConsumption(showerElectricityCoefficient * minutes *days);
    }

    @Override
    public void gamingConsumption(double hours, int days) {
        setCo2Consumption(gamingCO2Coefficient * hours * days);
        setWaterConsumption(gamingWaterCoefficient * hours * days);
        setElectricityConsumption(gamingElectricityCoefficient * hours * days);
    }

    @Override
    public void streamingConsumption(double hours, int days) {
        setCo2Consumption(streamingCO2Coefficient * hours * days);
        setWaterConsumption(streamingWaterCoefficient * hours * days);
        setElectricityConsumption(streamingElectricityCoefficient * hours * days);
    }
}