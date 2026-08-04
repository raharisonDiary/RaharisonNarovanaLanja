# État de validation du pack

## Vérifié pendant la génération

- application web : `npm run build` réussi ;
- application mobile : `npm run typecheck` réussi ;
- fichiers de configuration sans secret réel ;
- structure séparée `back`, `web`, `mobile`, `styles` et `animations` ;
- wireframe fourni conservé dans `docs/design/wireframe-reference.png`.

## À exécuter sur la machine Windows du projet

Le SDK .NET n'était pas disponible dans l'environnement qui a assemblé ce pack. Après extraction :

```powershell
Set-Location E:\projetmemoFF-complet
.\scripts\verify-all.ps1
```

Puis appliquer les migrations et relancer le test fonctionnel du backend :

```powershell
Set-Location .\back

dotnet ef database update `
  --project .\src\Census.Infrastructure\Census.Infrastructure.csproj `
  --startup-project .\src\Census.Api\Census.Api.csproj `
  --context CensusDbContext

.\verify-backend-core.ps1 `
  -ApiBaseUrl "https://localhost:7001"
```

Le pack constitue une base full-stack fonctionnelle complète pour le MVP. Une qualification de production exige encore les tests métier, de charge, de sécurité, de sauvegarde et de conformité sur l'infrastructure réelle.
