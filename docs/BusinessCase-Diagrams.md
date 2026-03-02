# EcoTrace Business Case - Visualisierungen

## 1. Finanzprojektionen (5 Jahre)

```mermaid
graph TB
    subgraph "Umsatzentwicklung"
    Y1[Jahr 1: €120K] --> Y2[Jahr 2: €850K]
    Y2 --> Y3[Jahr 3: €3.2M]
    Y3 --> Y4[Jahr 4: €9.5M]
    Y4 --> Y5[Jahr 5: €25M]
    end
    
    subgraph "Break-Even"
    BE[Monat 18: Break-Even erreicht]
    end
    
    subgraph "Profitabilität"
    P1[Jahr 3: €600K Gewinn] --> P2[Jahr 4: €4.2M Gewinn]
    P2 --> P3[Jahr 5: €22M Gewinn]
    end
```

## 2. User Growth Timeline

```mermaid
gantt
    title EcoTrace User Acquisition Plan
    dateFormat YYYY-MM
    axisFormat %Y-%m
    
    section Beta Phase
    Closed Beta (500 Users)           :2026-01, 2026-03
    
    section Launch Phase
    Public Launch (10K Users)         :2026-03, 2026-06
    Marketing Campaign                :2026-04, 2026-09
    
    section Growth Phase
    Scale to 100K Users              :2026-06, 2026-12
    B2B Partnerships                 :2026-09, 2027-03
    
    section Expansion Phase
    1M Users Target                  :2027-01, 2028-01
    Enterprise Rollout               :2027-06, 2028-06
    
    section Scale Phase
    5M+ Users                        :2028-01, 2030-12
    International Expansion          :2028-06, 2030-12
```

## 3. Marktpositionierung & Wettbewerb

```mermaid
quadrantChart
    title Competitive Positioning Matrix
    x-axis Low Engagement --> High Engagement
    y-axis Basic Features --> Advanced Features
    quadrant-1 Market Leaders
    quadrant-2 Feature Rich
    quadrant-3 Basic Solutions
    quadrant-4 High Potential
    
    EcoTrace: [0.75, 0.80]
    MyClimate: [0.40, 0.50]
    Carbon Footprint App: [0.35, 0.30]
    Oroeco: [0.45, 0.60]
    JouleBug: [0.60, 0.40]
    Klima: [0.55, 0.55]
```

## 4. Revenue Streams Breakdown

```mermaid
pie title Revenue Distribution (Jahr 5)
    "Premium Subscriptions (€4.99/mo)" : 45
    "Enterprise Licenses (€99/mo)" : 35
    "API Partnerships" : 12
    "In-App Purchases" : 5
    "Consulting Services" : 3
```

## 5. Technologie-Architektur

```mermaid
graph TD
    A[Mobile App - Angular PWA] --> B[API Gateway]
    B --> C[Backend - Quarkus REST]
    C --> D[PostgreSQL Database]
    C --> E[Redis Cache]
    
    C --> F[External Services]
    F --> G[CO2 APIs]
    F --> H[Weather APIs]
    F --> I[Transport APIs]
    
    C --> J[Analytics]
    J --> K[User Behavior]
    J --> L[Carbon Tracking]
    
    M[Admin Dashboard] --> B
    
    style A fill:#4CAF50
    style C fill:#2196F3
    style D fill:#FF9800
    style F fill:#9C27B0
```

## 6. Go-to-Market Strategie Timeline

```mermaid
timeline
    title GTM Strategy Roadmap
    
    section Q1 2026
        MVP Launch : Closed Beta
                  : 500 Test Users
                  : Bug Fixes
    
    section Q2 2026
        Public Launch : App Store & Play Store
                     : PR Campaign
                     : 10K Users Target
    
    section Q3-Q4 2026
        Growth Phase : Influencer Marketing
                    : B2C Focus
                    : 100K Users
    
    section 2027
        Scale Phase : B2B Partnerships
                   : Corporate Wellness
                   : 500K Users
    
    section 2028-2030
        Expansion : International Markets
                 : Enterprise Solutions
                 : 5M+ Users
```

## 7. Funding & Milestones

```mermaid
graph LR
    A[Seed Round<br/>€250K] --> B[Development<br/>6 Monate]
    B --> C[Beta Launch<br/>500 Users]
    C --> D[Series A<br/>€2M]
    D --> E[Public Launch<br/>10K Users]
    E --> F[Series B<br/>€8M]
    F --> G[Scale Phase<br/>500K Users]
    G --> H[Exit/IPO<br/>€50-100M]
    
    style A fill:#FFC107
    style D fill:#FF9800
    style F fill:#FF5722
    style H fill:#4CAF50
```

## 8. Feature Rollout Plan

```mermaid
gantt
    title Product Development Roadmap
    dateFormat YYYY-MM
    
    section Core Features
    User Registration & Auth        :done, 2025-09, 2025-11
    Activity Tracking               :done, 2025-11, 2025-12
    CO2 Calculation                 :done, 2025-12, 2026-01
    
    section Social Features
    Friends System                  :active, 2026-01, 2026-02
    Leaderboards                    :2026-02, 2026-03
    Challenges                      :2026-03, 2026-04
    
    section Gamification
    Achievements System             :done, 2025-12, 2026-01
    Badges & Rewards                :2026-02, 2026-03
    Streak Tracking                 :2026-03, 2026-04
    
    section Premium Features
    Advanced Analytics              :2026-04, 2026-06
    Carbon Offsetting               :2026-06, 2026-08
    Personal Coach AI               :2026-08, 2026-10
    
    section Enterprise
    Team Management                 :2026-09, 2026-11
    Corporate Dashboard             :2026-11, 2027-01
    Custom Reporting                :2027-01, 2027-03
```

## 9. User Acquisition Funnel

```mermaid
graph TB
    A[1,000,000 Impressions] --> B[100,000 Website Visits]
    B --> C[20,000 App Downloads]
    C --> D[10,000 Registrations]
    D --> E[5,000 Active Users]
    E --> F[500 Premium Users]
    
    B -->|10% CTR| C
    C -->|50% Completion| D
    D -->|50% Activation| E
    E -->|10% Conversion| F
    
    style A fill:#E3F2FD
    style B fill:#BBDEFB
    style C fill:#90CAF9
    style D fill:#64B5F6
    style E fill:#42A5F5
    style F fill:#4CAF50
```

## 10. Cost Structure Breakdown

```mermaid
pie title Operational Costs Distribution (Jahr 2)
    "Mitarbeiter (6 FTE)" : 40
    "Cloud Infrastructure" : 15
    "Marketing & Sales" : 25
    "Office & Equipment" : 8
    "Legal & Admin" : 7
    "R&D" : 5
```

## 11. Achievement System Flow

```mermaid
stateDiagram-v2
    [*] --> ActivityTracked: User logs activity
    ActivityTracked --> CalculateProgress: Update CO2/Stats
    CalculateProgress --> CheckAchievements: Run achievement checks
    
    CheckAchievements --> Locked: Conditions not met
    CheckAchievements --> Unlocked: Conditions met
    
    Unlocked --> NotifyUser: Push notification
    NotifyUser --> ShowBadge: Display in app
    ShowBadge --> MarkViewed: User views achievement
    
    Locked --> [*]
    MarkViewed --> [*]
```

## 12. Business Model Canvas (Simplified)

```mermaid
graph TB
    subgraph "Value Proposition"
    VP[Track Carbon Footprint<br/>Gamified Experience<br/>Social Competition]
    end
    
    subgraph "Customer Segments"
    CS1[Eco-Conscious Millennials]
    CS2[Gen Z Digital Natives]
    CS3[Corporate Wellness Programs]
    end
    
    subgraph "Revenue Streams"
    RS1[Freemium Subscriptions]
    RS2[Enterprise B2B]
    RS3[API Licensing]
    end
    
    subgraph "Key Resources"
    KR1[Tech Platform]
    KR2[CO2 Database]
    KR3[Development Team]
    end
    
    VP --> CS1
    VP --> CS2
    VP --> CS3
    
    CS1 --> RS1
    CS2 --> RS1
    CS3 --> RS2
    
    RS1 --> KR1
    RS2 --> KR1
    RS3 --> KR2
    
    style VP fill:#4CAF50
    style RS1 fill:#2196F3
    style RS2 fill:#2196F3
    style RS3 fill:#2196F3
```

## 13. Risk Mitigation Strategy

```mermaid
mindmap
  root((Risk Management))
    Market Risks
      Competition
        Differentiation through gamification
        Superior UX
      Market Adoption
        Influencer partnerships
        Free tier
    Technical Risks
      Scalability
        Cloud infrastructure
        Microservices architecture
      Data Security
        GDPR compliance
        Regular audits
    Financial Risks
      Burn Rate
        Lean operations
        Revenue milestones
      Funding
        Multiple investor pipeline
        Bootstrapping option
    Operational Risks
      Team
        Key person insurance
        Knowledge documentation
      Legal
        IP protection
        Terms of Service
```

## 14. Customer Journey Map

```mermaid
journey
    title User Journey - First Week
    section Discovery
      See social media ad: 5: User
      Visit website: 4: User
      Download app: 5: User
    section Onboarding
      Create account: 5: User
      Complete tutorial: 4: User
      Log first activity: 5: User
    section Engagement
      Earn first achievement: 5: User
      Add friends: 4: User
      Check leaderboard: 5: User
    section Retention
      Daily streak (Day 3): 4: User
      Unlock badge: 5: User
      Consider premium: 3: User
```

## 15. Exit Strategy Timeline

```mermaid
timeline
    title Exit Strategy Options
    
    section Year 2-3
        Strategic Interest : Carbon credit companies
                          : Climate tech VCs
                          : Initial valuations
    
    section Year 3-4
        Acquisition Talks : Google/Apple Health integration
                         : Corporate wellness platforms
                         : Valuation: €20-50M
    
    section Year 4-5
        Major Exit : Tech giants (Google, Apple, Microsoft)
                  : Climate conglomerates
                  : Valuation: €50-100M
    
    section Year 5+
        IPO Option : 5M+ active users
                  : Strong revenue growth
                  : Valuation: €100M+
```

---

## Verwendung der Diagramme

Diese Mermaid-Diagramme können in folgenden Tools direkt gerendert werden:

- **GitHub/GitLab**: Automatische Darstellung in README.md
- **VS Code**: Mit Mermaid-Extension
- **Notion, Confluence**: Native Mermaid-Support
- **PowerPoint**: Export über mermaid.live
- **Präsentationen**: Screenshots oder Live-Render

**Tipp**: Öffne diese Datei in VS Code mit der Mermaid-Extension für Live-Preview!
