# Pack de finalisation du backend Census

Ce pack complète le cœur fonctionnel du backend avant le développement du frontend.

Il ajoute :

- API complète des habitations ;
- ménages ;
- personnes recensées ;
- soumission, validation et rejet ;
- contrôle des rôles et du périmètre territorial pour les écritures ;
- tableau de bord par campagne ;
- politique CORS pour React, Vite et Expo ;
- script de test fonctionnel de bout en bout.

## Installation

Depuis PowerShell :

```powershell
Set-ExecutionPolicy -Scope Process Bypass

.\apply-backend-completion.ps1 `
  -ProjectRoot "E:\projetmemoFF\back"
```

Le script crée une sauvegarde de `Program.cs`, copie les fichiers et ajoute les appels nécessaires.

Ensuite :

```powershell
Set-Location E:\projetmemoFF\back

dotnet clean Census.sln
dotnet build Census.sln

dotnet ef migrations add CompleteCensusCore `
  --project .\src\Census.Infrastructure\Census.Infrastructure.csproj `
  --startup-project .\src\Census.Api\Census.Api.csproj `
  --context CensusDbContext `
  --output-dir Persistence\Migrations

dotnet ef database update `
  --project .\src\Census.Infrastructure\Census.Infrastructure.csproj `
  --startup-project .\src\Census.Api\Census.Api.csproj `
  --context CensusDbContext
```

Démarrage :

```powershell
dotnet run `
  --project .\src\Census.Api\Census.Api.csproj `
  --launch-profile https
```

Dans un second terminal :

```powershell
.\verify-backend-core.ps1 `
  -ApiBaseUrl "https://localhost:7001"
```

Ne partagez jamais les mots de passe ni les jetons conservés dans les variables PowerShell.

## Portée

Ce pack termine le MVP backend nécessaire au frontend. Les fonctions avancées de production restent séparées : jetons de rafraîchissement, stockage de fichiers, synchronisation hors ligne avec résolution de conflits, audit complet, observabilité centralisée et batterie de tests CI.
