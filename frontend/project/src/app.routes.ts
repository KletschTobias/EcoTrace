import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { HeroComponent } from './components/hero.component';
import { LayoutComponent } from './components/layout.component';
import { DashboardComponent } from './pages/dashboard.component';
import { ActivitiesComponent } from './pages/activities.component';
import { FriendsNewComponent } from './pages/friends-new.component';
import { ProfileComponent } from './pages/profile.component';
import { FriendDetailComponent } from './pages/friend-detail.component';
import { AchievementsComponent } from './pages/achievements.component';
import { LeaguesComponent } from './pages/leagues.component';
import { LeagueDetailComponent } from './pages/league-detail.component';

export const routes: Routes = [
  {
    path: '',
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
    canActivate: [authGuard],
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
        component: FriendsNewComponent
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
    path: 'achievements',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: AchievementsComponent
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
    path: 'leagues',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: LeaguesComponent
      }
    ]
  },
  {
    path: 'league/:id',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: LeagueDetailComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];
