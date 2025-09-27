import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="hero-section">
      <div class="animated-background">
        <div class="floating-particles">
          <div class="particle" *ngFor="let particle of particles; trackBy: trackParticle" 
               [style.left.px]="particle.x" 
               [style.top.px]="particle.y"
               [style.animation-delay.s]="particle.delay">
          </div>
        </div>
        <div class="wave-animation">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" class="wave-path"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" class="wave-path"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" class="wave-path"></path>
          </svg>
        </div>
      </div>
      
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            <span class="eco">Eco</span><span class="trace">Trace</span>
          </h1>
          <p class="hero-subtitle">Track Your Environmental Impact</p>
          <p class="hero-description">
            Discover your carbon footprint, monitor water usage, and track electricity consumption. 
            Join the movement towards a sustainable future with real-time environmental insights.
          </p>
          <div class="cta-buttons">
            <button class="btn-primary">Start Tracking</button>
          </div>
        </div>
        
        <div class="hero-stats">
          <div class="stat-card co2">
            <div class="stat-icon">🌍</div>
            <div class="stat-content">
              <h3>Global CO₂</h3>
              <div class="stat-value">{{ globalStats.co2 | number:'1.0-0' }}</div>
              <span class="stat-unit">tons this year</span>
              <div class="stat-trend" [class.increasing]="true">↗ Live</div>
            </div>
          </div>
          
          <div class="stat-card electricity">
            <div class="stat-icon">⚡</div>
            <div class="stat-content">
              <h3>Energy Usage</h3>
              <div class="stat-value">{{ globalStats.electricity | number:'1.2-2' }}</div>
              <span class="stat-unit">TWh this year</span>
              <div class="stat-trend" [class.increasing]="true">↗ Live</div>
            </div>
          </div>
          
          <div class="stat-card water">
            <div class="stat-icon">💧</div>
            <div class="stat-content">
              <h3>Water Consumption</h3>
              <div class="stat-value">{{ globalStats.water | number:'1.0-0' }}</div>
              <span class="stat-unit">liters this year</span>
              <div class="stat-trend" [class.increasing]="true">↗ Live</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero-section {
      position: relative;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .animated-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
    }

    .floating-particles {
      position: absolute;
      width: 100%;
      height: 100%;
    }

    .particle {
      position: absolute;
      width: 4px;
      height: 4px;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 50%;
      animation: float 6s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
      50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
    }

    .wave-animation {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 120px;
    }

    .wave-animation svg {
      width: 100%;
      height: 100%;
    }

    .wave-path {
      fill: rgba(255, 255, 255, 0.1);
      animation: wave 3s ease-in-out infinite;
    }

    @keyframes wave {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(-25px); }
    }

    .hero-content {
      position: relative;
      z-index: 2;
      max-width: 1200px;
      width: 100%;
      padding: 0 2rem;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
    }

    .hero-text {
      color: white;
    }

    .hero-title {
      font-size: 4rem;
      font-weight: 800;
      margin-bottom: 1rem;
      line-height: 1.1;
    }

    .eco {
      color: #4ade80;
      text-shadow: 0 0 20px rgba(74, 222, 128, 0.5);
    }

    .trace {
      color: #60a5fa;
      text-shadow: 0 0 20px rgba(96, 165, 250, 0.5);
    }

    .hero-subtitle {
      font-size: 1.5rem;
      font-weight: 300;
      margin-bottom: 1.5rem;
      opacity: 0.9;
    }

    .hero-description {
      font-size: 1.1rem;
      line-height: 1.6;
      margin-bottom: 2.5rem;
      opacity: 0.8;
    }

    .cta-buttons {
      display: flex;
      justify-content: flex-start;
    }

    .btn-primary, .btn-secondary {
      padding: 1rem 2rem;
      border: none;
      border-radius: 50px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .btn-primary {
      background: linear-gradient(45deg, #4ade80, #22c55e);
      color: white;
      box-shadow: 0 4px 15px rgba(74, 222, 128, 0.4);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(74, 222, 128, 0.6);
    }

    .hero-stats {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s ease;
      animation: slideInRight 0.8s ease-out;
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }

    .stat-card.co2 { animation-delay: 0.2s; }
    .stat-card.electricity { animation-delay: 0.4s; }
    .stat-card.water { animation-delay: 0.6s; }

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(50px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .stat-icon {
      font-size: 2.5rem;
      filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
    }

    .stat-content {
      flex: 1;
      color: white;
    }

    .stat-content h3 {
      font-size: 0.9rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 0.25rem;
    }

    .stat-unit {
      font-size: 0.8rem;
      opacity: 0.7;
      margin-left: 0.5rem;
    }

    .stat-trend {
      font-size: 0.8rem;
      font-weight: 600;
      margin-top: 0.5rem;
    }

    .stat-trend.increasing {
      color: #fbbf24;
    }

    .stat-trend.decreasing {
      color: #4ade80;
    }

    @media (max-width: 768px) {
      .hero-content {
        grid-template-columns: 1fr;
        gap: 2rem;
        text-align: center;
      }

      .hero-title {
        font-size: 3rem;
      }

      .cta-buttons {
        justify-content: center;
      }
    }
  `]
})
export class HeroComponent implements OnInit, OnDestroy {
  particles: Array<{x: number, y: number, delay: number}> = [];
  globalStats = {
    co2: 0,
    electricity: 0,
    water: 0
  };

  // Real-world yearly consumption averages (based on actual global data)
  private readonly YEARLY_AVERAGES = {
    co2: 36800000000, // ~36.8 billion tons CO₂ globally per year (IEA data)
    electricity: 25000, // ~25,000 TWh globally per year (IEA data)
    water: 4000000000000 // ~4 trillion liters globally per year (based on Worldometers ~4B cubic meters)
  };
  
  private subscription?: Subscription;

  ngOnInit() {
    this.generateParticles();
    this.startStatsAnimation();
    this.initializeTodaysData();
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  initializeTodaysData() {
    const now = new Date();
    
    // Calculate progress through the year (0-1)
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const msElapsedThisYear = now.getTime() - startOfYear.getTime();
    const secondsElapsedThisYear = msElapsedThisYear / 1000;
    const secondsInYear = 365 * 24 * 60 * 60;
    
    // Calculate realistic accumulated consumption for this year up to now
    const co2PerSecond = this.YEARLY_AVERAGES.co2 / secondsInYear;
    const electricityPerSecond = this.YEARLY_AVERAGES.electricity / secondsInYear;
    const waterPerSecond = this.YEARLY_AVERAGES.water / secondsInYear;
    
    // Start with realistic values for how much has been consumed so far this year
    this.globalStats.co2 = Math.floor(co2PerSecond * secondsElapsedThisYear);
    this.globalStats.electricity = Math.round((electricityPerSecond * secondsElapsedThisYear) * 100) / 100;
    this.globalStats.water = Math.floor(waterPerSecond * secondsElapsedThisYear);
  }

  private getConsumptionPattern(date: Date): number {
    const hour = date.getHours();
    
    // Realistic consumption patterns throughout the day
    // Peak hours: 8-18 (business hours), Lower at night: 22-6
    if (hour >= 8 && hour <= 18) {
      return 1.2; // 20% higher during business hours
    } else if (hour >= 19 && hour <= 21) {
      return 1.1; // Evening peak
    } else if (hour >= 22 || hour <= 5) {
      return 0.7; // 30% lower during night
    } else {
      return 1.0; // Normal consumption
    }
  }

  startStatsAnimation() {
    // Update every 100ms for smooth real-time animation
    this.subscription = interval(100).subscribe(() => {
      const now = new Date();
      
      // Calculate realistic per-second increments based on yearly consumption
      const secondsInYear = 365 * 24 * 60 * 60; // ~31.5 million seconds
      const co2PerSecond = this.YEARLY_AVERAGES.co2 / secondsInYear; // ~1,167 tons per second
      const electricityPerSecond = this.YEARLY_AVERAGES.electricity / secondsInYear; // ~0.00079 TWh per second
      const waterPerSecond = this.YEARLY_AVERAGES.water / secondsInYear; // ~126,839 liters per second
      
      // Apply time-based consumption patterns
      const consumptionMultiplier = this.getConsumptionPattern(now);
      
      // Add realistic increments every 100ms (0.1 second)
      const timeIncrement = 0.1; // 100ms = 0.1 seconds
      
      // Calculate and add increments with some randomization for realistic variation
      const co2Increment = co2PerSecond * timeIncrement * consumptionMultiplier * (0.9 + Math.random() * 0.2);
      const electricityIncrement = electricityPerSecond * timeIncrement * consumptionMultiplier * (0.9 + Math.random() * 0.2);
      const waterIncrement = waterPerSecond * timeIncrement * consumptionMultiplier * (0.9 + Math.random() * 0.2);
      
      this.globalStats.co2 += Math.floor(co2Increment);
      this.globalStats.electricity += electricityIncrement;
      this.globalStats.water += Math.floor(waterIncrement);
      
      // Ensure values stay realistic and don't go negative
      this.globalStats.co2 = Math.max(0, this.globalStats.co2);
      this.globalStats.electricity = Math.max(0, Math.round(this.globalStats.electricity * 100) / 100); // Round to 2 decimals
      this.globalStats.water = Math.max(0, this.globalStats.water);
    });
  }

  generateParticles() {
    for (let i = 0; i < 50; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        delay: Math.random() * 6
      });
    }
  }

  trackParticle(index: number, particle: any) {
    return index;
  }
}