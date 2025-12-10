package at.htl.dtos;

public class StatsDto {
    public Double co2;
    public Double water;
    public Double electricity;

    public StatsDto() {
        this.co2 = 0.0;
        this.water = 0.0;
        this.electricity = 0.0;
    }

    public StatsDto(Double co2, Double water, Double electricity) {
        this.co2 = co2;
        this.water = water;
        this.electricity = electricity;
    }
}
