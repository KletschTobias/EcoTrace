import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { HeroComponent } from './components/hero.component';
import { LayoutComponent } from './components/layout.component';
import { DashboardComponent } from './pages/dashboard.component';
import { ActivitiesComponent } from './pages/activities.component';
import { FriendsComponent } from './pages/friends.component';

export const routes: Routes = [
  {
    path: '',
    component: HeroComponent,
    pathMatch: 'full'
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],  // ✅ Re-enabled: only authenticated users can access
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'activities', component: ActivitiesComponent },
      { path: 'friends', component: FriendsComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
