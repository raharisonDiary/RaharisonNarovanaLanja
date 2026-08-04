# Census Flow Mobile — Aurora Civic V7.0

Ce correctif redessine l’interface mobile en reprenant le template **Aurora Civic** et la palette du web Census Flow.

## Ce qui change

- page d’accueil publique avec composition civique, progression nationale et statistiques ;
- connexion premium et sécurisée ;
- tableau de bord avec campagne active, synchronisation, actions rapides et indicateurs ;
- navigation inférieure flottante ;
- écrans ménages, citoyens, synchronisation, profil, menu et statistiques harmonisés ;
- formulaires, listes déroulantes, cartes, boutons, statuts et champs modernisés ;
- nouvelle icône et nouvel écran de démarrage ;
- palette web : bleu `#2563EB`, indigo `#6366F1`, teal `#14B8A6`, fond `#F5F7FA`.

## Ce qui ne change pas

- API et routes ;
- authentification ;
- création et modification des données ;
- stockage hors ligne ;
- synchronisation ;
- GPS, caméra et import photo ;
- permissions et rôles ;
- base PostgreSQL ;
- fichiers `.env`.

## Installation

Depuis PowerShell :

```powershell
Set-Location D:\projetmemoFF-complet

Set-ExecutionPolicy `
    -Scope Process `
    -ExecutionPolicy Bypass `
    -Force

.\census-flow-mobile-aurora-v7.0\install-aurora-v7.0.ps1
```

Puis :

```powershell
Set-Location D:\projetmemoFF-complet\mobile
npx expo start -c
```

## Restauration

```powershell
Set-Location D:\projetmemoFF-complet
.\census-flow-mobile-aurora-v7.0\uninstall-aurora-v7.0.ps1
```
