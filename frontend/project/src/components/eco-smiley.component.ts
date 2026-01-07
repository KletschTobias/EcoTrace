import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SmileyStatus = 'good' | 'neutral' | 'bad';

@Component({
  selector: 'app-eco-smiley',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="smiley-container" [ngClass]="status" [title]="tooltipText">
      <!-- Happy / Good (Green) -->
      <svg *ngIf="status === 'good'" viewBox="0 0 100 100" class="smiley">
        <circle cx="50" cy="50" r="45" fill="#10B981" stroke="#059669" stroke-width="3"/>
        <!-- Eyes -->
        <circle cx="35" cy="40" r="5" fill="#064E3B"/>
        <circle cx="65" cy="40" r="5" fill="#064E3B"/>
        <!-- Smile -->
        <path d="M 30 60 Q 50 80 70 60" stroke="#064E3B" stroke-width="4" fill="none" stroke-linecap="round"/>
        <!-- Leaf -->
        <path d="M 50 5 Q 65 20 50 35 Q 35 20 50 5" fill="#34D399" stroke="#064E3B" stroke-width="2"/>
      </svg>

      <!-- Neutral / Average (Yellow) -->
      <svg *ngIf="status === 'neutral'" viewBox="0 0 100 100" class="smiley">
        <circle cx="50" cy="50" r="45" fill="#FBBF24" stroke="#D97706" stroke-width="3"/>
        <!-- Eyes -->
        <circle cx="35" cy="40" r="5" fill="#78350F"/>
        <circle cx="65" cy="40" r="5" fill="#78350F"/>
        <!-- Mouth -->
        <line x1="35" y1="65" x2="65" y2="65" stroke="#78350F" stroke-width="4" stroke-linecap="round"/>
      </svg>

      <!-- Angry / Bad (Red) -->
      <svg *ngIf="status === 'bad'" viewBox="0 0 100 100" class="smiley">
        <circle cx="50" cy="50" r="45" fill="#EF4444" stroke="#B91C1C" stroke-width="3"/>
        <!-- Eyes (Angry) -->
        <path d="M 25 35 L 40 45" stroke="#7F1D1D" stroke-width="4" stroke-linecap="round"/>
        <path d="M 75 35 L 60 45" stroke="#7F1D1D" stroke-width="4" stroke-linecap="round"/>
        <circle cx="35" cy="50" r="4" fill="#7F1D1D"/>
        <circle cx="65" cy="50" r="4" fill="#7F1D1D"/>
        <!-- Mouth (Frown) -->
        <path d="M 35 75 Q 50 60 65 75" stroke="#7F1D1D" stroke-width="4" fill="none" stroke-linecap="round"/>
      </svg>
    </div>
  `,
  styles: [`
    .smiley-container {
      width: 40px;
      height: 40px;
      display: inline-block;
      transition: transform 0.3s ease;
    }
    
    .smiley-container:hover {
      transform: scale(1.1);
    }

    .smiley {
      width: 100%;
      height: 100%;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
    }
  `]
})
export class EcoSmileyComponent {
  @Input() status: SmileyStatus = 'neutral';
  
  get tooltipText(): string {
    switch (this.status) {
      case 'good': return 'Great job! Your consumption is low.';
      case 'neutral': return 'Average consumption. Room for improvement!';
      case 'bad': return 'High consumption! Try to reduce your impact.';
      default: return '';
    }
  }
}
