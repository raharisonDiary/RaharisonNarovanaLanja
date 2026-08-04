# Census Flow — Nebula Civic V8.0.0

Refonte coordonnee du site React et de l'application Expo.

## Direction visuelle

- Structure du tableau de bord conservee et clarifiee.
- Palette bleu nuit, ultraviolet, corail electrique, menthe glacier et ambre.
- Modes clair et sombre contrastes.
- Sidebar responsive sur web, drawer anime sur mobile.
- Cartes, boutons, formulaires et etats harmonises.
- Transitions de pages, apparition progressive des cartes et micro-interactions.
- Visuels Census Flow integres aux pages publiques et d'authentification.
- Mise en page adaptee au telephone, tablette, ordinateur portable et grand ecran.

## Installation

Depuis `D:\projetmemoFF-complet` :

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
.\census-flow-nebula-civic-v8.0.0\install-nebula-civic-v8.0.0.ps1
```

## Verification

L'installateur lance :

- `mobile\npm run typecheck`
- `web\npm run build`

En cas d'echec, les fichiers precedents sont restaures automatiquement.

## Restauration manuelle

```powershell
.\census-flow-nebula-civic-v8.0.0\restore-nebula-civic-v8.0.0.ps1
```

Les fichiers `.env`, les API, PostgreSQL, l'OTP et les donnees metier ne sont pas modifies.
