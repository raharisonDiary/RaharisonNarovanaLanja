# Plateforme numérique de recensement de population

Monorepo complet comprenant une API ASP.NET Core, une application web React et une application mobile React Native/Expo.

## Dossiers

```text
projetmemoFF-complet/
├── back/       API ASP.NET Core 10, PostgreSQL/PostGIS, JWT, refresh tokens, audit
├── web/        Application d’administration React + TypeScript + Vite
├── mobile/     Application terrain React Native + Expo Router + SQLite hors ligne
├── docs/       Architecture, sécurité, API et wireframe de référence
├── scripts/    Scripts PowerShell de démarrage
└── compose.full.yaml
```

## Fonctionnalités livrées

### Backend

- authentification JWT et refresh tokens avec rotation ;
- révocation, déconnexion simple et globale ;
- utilisateurs, rôles et zones administratives ;
- campagnes de recensement ;
- habitations géolocalisées ;
- ménages et personnes ;
- workflows brouillon, soumission, validation et rejet ;
- tableau de bord par campagne ;
- journal d’audit consultable et paginé ;
- exports CSV par campagne ;
- rate limiting, en-têtes de sécurité et CORS configurable ;
- nettoyage périodique des sessions expirées ;
- migrations Entity Framework Core ;
- script de vérification fonctionnelle.

### Application web

- écran de connexion conforme au wireframe ;
- tableau de bord, graphiques et indicateurs ;
- gestion des utilisateurs, campagnes et territoires ;
- listes et formulaires des habitations, ménages et personnes ;
- carte OpenStreetMap/Leaflet ;
- fiche citoyen et QR code ;
- statistiques, rapports CSV et journal d’audit ;
- interface responsive ;
- styles et animations séparés dans `web/src/styles` et `web/src/animations`.

### Application mobile

- authentification sécurisée avec SecureStore ;
- tableau de bord agent ;
- collecte en trois étapes : habitation, ménage, membre ;
- GPS et photo d’habitation ;
- stockage SQLite et file de synchronisation hors ligne ;
- carte des habitations ;
- synchronisation manuelle avec suivi des erreurs ;
- scan QR code ;
- styles et animations séparés dans `mobile/src/styles` et `mobile/src/animations`.

## 1. Préparer les secrets locaux

Copier `.env.example` vers `.env` à la racine et remplacer toutes les valeurs factices.

PowerShell pour générer une clé JWT :

```powershell
[Convert]::ToBase64String(
  [Security.Cryptography.RandomNumberGenerator]::GetBytes(64)
)
```

Ne jamais envoyer le fichier `.env`, le mot de passe administrateur ou les jetons dans un dépôt Git.

## 2. Démarrer le backend en développement

Prérequis : Docker Desktop, .NET SDK 10 et PowerShell.

```powershell
Copy-Item .env.example .env
# Modifier .env, puis :
.\scripts\start-backend.ps1
```

API :

```text
https://localhost:7001
http://localhost:5001
```

OpenAPI en développement :

```text
https://localhost:7001/openapi/v1.json
```

## 3. Démarrer le web

```powershell
Copy-Item .\web\.env.example .\web\.env.local
.\scripts\start-web.ps1
```

Application web : `http://localhost:5173`.

## 4. Démarrer le mobile

Dans `mobile/.env`, utiliser l’adresse IP locale du PC, et non `localhost`, pour un téléphone physique :

```text
EXPO_PUBLIC_API_URL=http://192.168.1.10:5001/api/v1
```

Puis :

```powershell
.\scripts\start-mobile.ps1
```

Pour l’émulateur Android, `http://10.0.2.2:5001/api/v1` pointe vers le PC hôte.

## 5. Déploiement Docker web + API + base

```powershell
Copy-Item .env.example .env
# Modifier .env

docker compose -f compose.full.yaml up --build -d
```

Avant un premier déploiement sur une base vide, appliquer les migrations :

```powershell
Set-Location .\back

dotnet ef database update `
  --project .\src\Census.Infrastructure\Census.Infrastructure.csproj `
  --startup-project .\src\Census.Api\Census.Api.csproj `
  --context CensusDbContext
```

Web Docker : `http://localhost:8080`  
API Docker : `http://localhost:5001`

## Vérification globale après extraction

```powershell
.\scripts\verify-all.ps1
```

Le détail de ce qui a été vérifié est disponible dans `VALIDATION.md`.

## Vérifications effectuées dans le pack

- `web`: `npm run build` réussi ;
- `mobile`: `npm run typecheck` réussi ;
- backend fourni à partir de la version déjà compilée et testée par l’utilisateur, puis complété avec les endpoints d’audit/export et le nettoyage des sessions.

Le backend doit être recompilé localement après extraction, car le runtime de génération du pack ne contient pas le SDK .NET.

## Census Flow V3

La V3 ajoute un portail public, la création hiérarchique des comptes, l’envoi WhatsApp des identifiants, les campagnes programmables, la cartographie, la collecte mobile hors ligne guidée, la synchronisation globale, les statistiques validées, les exports, trois langues et les thèmes clair/sombre.

Documentation :

- `docs/v3/CDC_FONCTIONNEL_V3.md`
- `docs/v3/GUIDE_INSTALLATION_V3.md`
- `docs/v3/WHATSAPP_CONFIGURATION.md`

Après installation, lancez `scripts\verify-all.ps1` puis réalisez les scénarios fonctionnels du CDC.
