# Conventions du projet

## Organisation générale

Le projet est divisé en trois applications :

- `back` : API ASP.NET Core ;
- `front-web` : application React ;
- `front-mobile` : application React Native avec Expo.

## Backend

- Les contrôleurs restent courts.
- Les règles métier ne sont pas placées dans les contrôleurs.
- Les entités de base de données ne sont pas retournées directement par l’API.
- Les opérations asynchrones utilisent `CancellationToken`.
- Les valeurs nulles sont traitées explicitement.
- Les dépendances sont injectées par constructeur.
- Les erreurs de l’API utilisent un format uniforme.

## Frontend web

Chaque composant visuel possède ses propres fichiers.

Exemple :

```text
CitizenCard/
├── CitizenCard.tsx
├── CitizenCard.module.css
├── CitizenCard.animations.css
├── CitizenCard.types.ts
├── CitizenCard.test.tsx
└── index.ts
