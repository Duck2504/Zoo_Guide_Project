# Graph Report - Zoo_Guide_Project  (2026-11-04)

## Corpus Check
- Corpus is ~14,291 words - fits in a single context window. You may not need a graph.

## Summary
- 594 nodes · 1152 edges · 29 communities (23 shown, 6 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 95 edges (avg confidence: 0.8)
- Token cost: 65,885 input · 0 output

## Community Hubs (Navigation)
- API Controllers & Location DTOs
- Animal & Zone CRUD Endpoints
- Zone Model & Write Endpoints
- EF Core Entity Models
- DbContext & Migrations
- Frontend CI Workflow
- Narration Pipeline Interfaces
- Frontend Build Tooling
- Statistics Dashboard API
- Backend CI Workflow
- Supabase Audio Storage
- TTS & Translator Services
- Narration Service Host & Test Fakes
- Frontend Runtime Dependencies
- Admin Pages
- Visitor Pages & Context
- Narration Launch Settings
- Narration CI Workflow
- Narration Generator Core
- Backend Project Packages
- Geofence & QR Scanning
- Narration API Tests
- Narration Project Packages
- API Launch Settings
- Docs: Web Shell & Narration Overview
- npm Scripts
- Backend Unit Test Stub
- Gemini Translator

## God Nodes (most connected - your core abstractions)
1. `Zone` - 23 edges
2. `Animal` - 21 edges
3. `AnimalDto` - 20 edges
4. `ZooAudioGuide.API.DTOs` - 18 edges
5. `ZooDbContext` - 18 edges
6. `ScanLog` - 16 edges
7. `ZooAudioGuide.API.Models` - 15 edges
8. `AnimalContent` - 15 edges
9. `react` - 15 edges
10. `ZoneDto` - 14 edges

## Surprising Connections (you probably didn't know these)
- `GeminiTranslator` --implements--> `ITranslator`  [EXTRACTED]
  MicroServices/ZooAudioGuide.NarrationService/Services.cs → Backend_core/ZooAudioGuide.API/Services/AudioServices.cs
- `FakeTranslator` --implements--> `ITranslator`  [EXTRACTED]
  MicroServices/ZooAudioGuide.NarrationService.Tests/NarrationApiTests.cs → Backend_core/ZooAudioGuide.API/Services/AudioServices.cs
- `EdgeTtsService` --implements--> `ITtsService`  [EXTRACTED]
  MicroServices/ZooAudioGuide.NarrationService/Services.cs → Backend_core/ZooAudioGuide.API/Services/AudioServices.cs
- `SupabaseAudioStore` --implements--> `IAudioStore`  [EXTRACTED]
  MicroServices/ZooAudioGuide.NarrationService/CloudAudioStore.cs → Backend_core/ZooAudioGuide.API/Services/CloudAudioStore.cs
- `FakeStore` --implements--> `IAudioStore`  [EXTRACTED]
  MicroServices/ZooAudioGuide.NarrationService.Tests/NarrationApiTests.cs → Backend_core/ZooAudioGuide.API/Services/CloudAudioStore.cs

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Narration service build and deploy flow** — microservices_readme_narrationservice, microservices_readme_ci_cd, microservices_readme_narration_service_docker_image [EXTRACTED 1.00]

## Communities (29 total, 6 thin omitted)

### Community 0 - "API Controllers & Location DTOs"
Cohesion: 0.05
Nodes (34): ScanLogsController, LocationRequestDto, LanguageCode, Latitude, Longitude, NearbyZoneResponseDto, AudioUrl, AvatarUrl (+26 more)

### Community 1 - "Animal & Zone CRUD Endpoints"
Cohesion: 0.07
Nodes (27): AnimalsController, ZonesController, AnimalCreateDto, AvatarUrl, LocalName, ScientificName, ScriptText, ZoneId (+19 more)

### Community 2 - "Zone Model & Write Endpoints"
Cohesion: 0.08
Nodes (15): ZoneCreateDto, Latitude, Longitude, Radius, ZoneCode, Zone, Animals, Id (+7 more)

### Community 3 - "EF Core Entity Models"
Cohesion: 0.06
Nodes (28): ZooDbContext, AnimalContents, Animals, Languages, ScanLogs, Zones, Animal, AnimalContents (+20 more)

### Community 4 - "DbContext & Migrations"
Cohesion: 0.09
Nodes (9): InitialCreate, AddScanLogsTable, ZooDbContextModelSnapshot, GenerateRequest, NarrationRequest, LangResult, ZooAudioGuide.API.Migrations, ZooAudioGuide.API.Data (+1 more)

### Community 5 - "Frontend CI Workflow"
Cohesion: 0.08
Nodes (23): runs-on, steps, jobs, build-and-deploy, name, on, push, workflow_dispatch (+15 more)

### Community 7 - "Frontend Build Tooling"
Cohesion: 0.12
Nodes (20): description, devDependencies, autoprefixer@^10.6.2, postcss@^8.5.32, tailwindcss@^4.3.3, @tailwindcss/postcss@^4.3.3, @tailwindcss/vite@^4.3.3, vite@^5.1.4 (+12 more)

### Community 8 - "Statistics Dashboard API"
Cohesion: 0.13
Nodes (15): StatisticsController, DailyStatDto, Count, Date, DashboardOverviewDto, DailyStats, OnlineUsers, TopAnimals (+7 more)

### Community 9 - "Backend CI Workflow"
Cohesion: 0.10
Nodes (20): defaults, runs-on, steps, run, jobs, build-and-test, name, on (+12 more)

### Community 11 - "TTS & Translator Services"
Cohesion: 0.16
Nodes (4): EdgeTtsService, EdgeTtsService, ITranslator, ITtsService

### Community 12 - "Narration Service Host & Test Fakes"
Cohesion: 0.13
Nodes (8): GenerateRequest, NarrationRequest, Program, FakeStore, FakeTranslator, NarrationFactory, Store, Translator

### Community 13 - "Frontend Runtime Dependencies"
Cohesion: 0.12
Nodes (17): dependencies, html5-qrcode@^2.3.8, leaflet@^1.9.4, lucide-react@^0.344.0, react@^18.2.0, react-dom@^18.2.0, react-ga4@^3.0.1, react-leaflet@^4.2.1 (+9 more)

### Community 14 - "Admin Pages"
Cohesion: 0.23
Nodes (10): qrcode.react@^4.2.0, App(), AdminLayout(), AnimalManager(), ContentModal(), AdminDashboard(), HomeAccessManager(), ZoneManager() (+2 more)

### Community 15 - "Visitor Pages & Context"
Cohesion: 0.18
Nodes (11): useVisitor(), VisitorContext, VisitorProvider(), AnimalDetail(), formatTime(), translations, Home(), translations (+3 more)

### Community 16 - "Narration Launch Settings"
Cohesion: 0.13
Nodes (15): ASPNETCORE_ENVIRONMENT, applicationUrl, commandName, dotnetRunMessages, environmentVariables, launchBrowser, applicationUrl, commandName (+7 more)

### Community 17 - "Narration CI Workflow"
Cohesion: 0.13
Nodes (14): runs-on, steps, jobs, build-and-test, name, on, pull_request, push (+6 more)

### Community 18 - "Narration Generator Core"
Cohesion: 0.27
Nodes (6): ITranslator, ITtsService, IAudioStore, NarrationGenerator, NarrationGenerator, FakeTts

### Community 19 - "Backend Project Packages"
Cohesion: 0.15
Nodes (11): ZooAudioGuide.API, net10.0, Microsoft.NET.Sdk.Web, net10.0, Microsoft.NET.Sdk, Microsoft.AspNetCore.OpenApi (10.0.12), Microsoft.EntityFrameworkCore.SqlServer (10.0.13), Microsoft.EntityFrameworkCore.SqlServer.NetTopologySuite (10.0.13) (+3 more)

### Community 20 - "Geofence & QR Scanning"
Cohesion: 0.30
Nodes (7): GeofenceController(), QRScannerModal(), useGeolocation(), translations, VisitorLayout(), calculateDistance(), react-router-dom

### Community 22 - "Narration Project Packages"
Cohesion: 0.18
Nodes (9): net10.0, Microsoft.NET.Sdk, net10.0, Microsoft.NET.Sdk.Web, coverlet.collector (6.0.4), Microsoft.AspNetCore.Mvc.Testing (10.0.13), Microsoft.NET.Test.Sdk (17.14.1), xunit (2.9.3) (+1 more)

### Community 23 - "API Launch Settings"
Cohesion: 0.20
Nodes (9): ASPNETCORE_ENVIRONMENT, applicationUrl, commandName, dotnetRunMessages, environmentVariables, launchBrowser, profiles, http (+1 more)

### Community 24 - "Docs: Web Shell & Narration Overview"
Cohesion: 0.25
Nodes (8): Leaflet 1.9.4 map library, /src/main.jsx entry module, Zoo Auto-Narration Web App Shell (index.html), #root mount div, narration-service Docker image (port 8080), Narration Service (translate + TTS), POST /api/narration (returns audio/mpeg; 400/502 errors), Supported languages vi/en/ja/ko

### Community 25 - "npm Scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, preview, test

## Knowledge Gaps
- **103 isolated node(s):** `ZoneId`, `ScientificName`, `AvatarUrl`, `LocalName`, `ScriptText` (+98 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 201 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Zone` connect `Zone Model & Write Endpoints` to `EF Core Entity Models`, `DbContext & Migrations`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **What connects `ZoneId`, `ScientificName`, `AvatarUrl` to the rest of the system?**
  _103 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `API Controllers & Location DTOs` be split into smaller, more focused modules?**
  _Cohesion score 0.054987212276214836 - nodes in this community are weakly interconnected._
- **Why does `ZooAudioGuide.API.DTOs` connect `API Controllers & Location DTOs` to `Statistics Dashboard API`, `Animal & Zone CRUD Endpoints`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Should `Animal & Zone CRUD Endpoints` be split into smaller, more focused modules?**
  _Cohesion score 0.06857142857142857 - nodes in this community are weakly interconnected._
- **Why does `ScanLog` connect `API Controllers & Location DTOs` to `EF Core Entity Models`, `DbContext & Migrations`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Should `Zone Model & Write Endpoints` be split into smaller, more focused modules?**
  _Cohesion score 0.08383838383838384 - nodes in this community are weakly interconnected._