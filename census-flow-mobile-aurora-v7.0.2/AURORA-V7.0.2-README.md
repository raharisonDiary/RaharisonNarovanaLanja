# Aurora Civic V7.0.2

Correctif ciblé pour Census Flow Mobile Aurora Civic V7.0.1.

## Corrections

- remplace le cercle SVG sur Expo Web par un cercle CSS compatible Edge/Chrome ;
- supprime l'erreur liée à `transform-origin` dans `ProgressRing` ;
- ajoute un bouton **Connexion** immédiatement visible dans l'en-tête public ;
- renomme le grand bouton d'accès public en **Se connecter** ;
- ne modifie aucune API, route métier, donnée PostgreSQL ou variable `.env`.

## Installation

Depuis `D:\projetmemoFF-complet` :

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
.\census-flow-mobile-aurora-v7.0.2\install-aurora-v7.0.2.ps1
```

Puis :

```powershell
Set-Location D:\projetmemoFF-complet\mobile
npx expo start -c
```
