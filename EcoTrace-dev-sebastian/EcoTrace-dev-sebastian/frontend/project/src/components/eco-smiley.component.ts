import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SmileyStatus = 'good' | 'neutral' | 'bad';

@Component({
  selector: 'app-eco-smiley',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="smiley-container" [ngClass]="status" [title]="tooltipText">
      <!-- Happy / Good (Green Smiley) -->
      <svg *ngIf="status === 'good'" viewBox="0 0 36 36" class="smiley">
        <circle cx="18" cy="18" r="17" fill="#4ade80"/>
        <circle cx="18" cy="18" r="17" fill="url(#greenGrad)"/>
        <!-- Eyes -->
        <ellipse cx="12" cy="14" rx="2" ry="2.5" fill="#166534"/>
        <ellipse cx="24" cy="14" rx="2" ry="2.5" fill="#166534"/>
        <!-- Eye shine -->
        <circle cx="12.5" cy="13" r="0.8" fill="white" opacity="0.6"/>
        <circle cx="24.5" cy="13" r="0.8" fill="white" opacity="0.6"/>
        <!-- Happy Smile -->
        <path d="M10 21 Q18 28 26 21" stroke="#166534" stroke-width="2" fill="none" stroke-linecap="round"/>
        <!-- Gradient -->
        <defs>
          <radialGradient id="greenGrad" cx="30%" cy="30%">
            <stop offset="0%" stop-color="#86efac"/>
            <stop offset="100%" stop-color="#22c55e"/>
          </radialGradient>
        </defs>
      </svg>

      <!-- Neutral / Average (Yellow Smiley) -->
      <svg *ngIf="status === 'neutral'" viewBox="0 0 36 36" class="smiley">
        <circle cx="18" cy="18" r="17" fill="url(#yellowGrad)"/>
        <!-- Eyes -->
        <ellipse cx="12" cy="14" rx="2" ry="2.5" fill="#854d0e"/>
        <ellipse cx="24" cy="14" rx="2" ry="2.5" fill="#854d0e"/>
        <!-- Eye shine -->
        <circle cx="12.5" cy="13" r="0.8" fill="white" opacity="0.6"/>
        <circle cx="24.5" cy="13" r="0.8" fill="white" opacity="0.6"/>
        <!-- Neutral Mouth -->
        <line x1="12" y1="23" x2="24" y2="23" stroke="#854d0e" stroke-width="2" stroke-linecap="round"/>
        <!-- Gradient -->
        <defs>
          <radialGradient id="yellowGrad" cx="30%" cy="30%">
            <stop offset="0%" stop-color="#fef08a"/>
            <stop offset="100%" stop-color="#facc15"/>
          </radialGradient>
        </defs>
      </svg>

      <!-- Sad / Bad (Red Smiley) -->
      <svg *ngIf="status === 'bad'" viewBox="0 0 36 36" class="smiley">
        <circle cx="18" cy="18" r="17" fill="url(#redGrad)"/>
        <!-- Eyes -->
        <ellipse cx="12" cy="14" rx="2" ry="2.5" fill="#7f1d1d"/>
        <ellipse cx="24" cy="14" rx="2" ry="2.5" fill="#7f1d1d"/>
        <!-- Eye shine -->
        <circle cx="12.5" cy="13" r="0.8" fill="white" opacity="0.6"/>
        <circle cx="24.5" cy="13" r="0.8" fill="white" opacity="0.6"/>
        <!-- Sad Frown -->
        <path d="M11 25 Q18 20 25 25" stroke="#7f1d1d" stroke-width="2" fill="none" stroke-linecap="round"/>
        <!-- Gradient -->
        <defs>
          <radialGradient id="redGrad" cx="30%" cy="30%">
            <stop offset="0%" stop-color="#fca5a5"/>
            <stop offset="100%" stop-color="#ef4444"/>
          </radialGradient>
        </defs>
      </svg>
    </div>
  `,
  styles: [`
    .smiley-container {
      width: 36px;
      height: 36px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;
    }
    
    .smiley-container:hover {
      transform: scale(1.15);
    }

    .smiley {
      width: 100%;
      height: 100%;
      filter: drop-shadow(0 2px 3px rgba(0,0,0,0.2));
    }
  `]
})
export class EcoSmileyComponent {
  @Input() status: SmileyStatus = 'neutral';
  
  get tooltipText(): string {
    switch (this.status) {
      case 'good': return 'Great job! Below average consumption.';
      case 'neutral': return 'Average consumption.';
      case 'bad': return 'Above average! Try to reduce your impact.';
      default: return '';
    }
  }
}
