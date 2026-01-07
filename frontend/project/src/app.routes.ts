import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { HeroComponent } from './components/hero.component';
import { LayoutComponent } from './components/layout.component';
import { DashboardComponent } from './pages/dashboard.component';
import { ActivitiesComponent } from './pages/activities.component';
import { FriendsComponent } from './pages/friends.component';
import { ProfileComponent } from './pages/profile.component';
import { FriendDetailComponent } from './pages/friend-detail.component';

export const routes: Routes = [
  {
    path: '',
    component: HeroComponent,
    pathMatch: 'full'
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HeroComponent
  },
  {
    path: 'dashboard',
    component: LayoutComponent,
    canActivate: [authGuard],  // ✅ Re-enabled: only authenticated users can access
    children: [
      {
        path: '',
        component: DashboardComponent
      }
    ]
  },
  {
    path: 'activities',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: ActivitiesComponent
      }
    ]
  },
  {
    path: 'friends',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: FriendsComponent
      }
    ]
  },
  {
    path: 'profile',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: ProfileComponent
      }
    ]
  },
  {
    path: 'friend/:id',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: FriendDetailComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];
