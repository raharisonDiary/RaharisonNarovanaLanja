# Architecture full-stack

## Backend

Clean Architecture en quatre projets :

- `Census.Domain` : entités et règles métier ;
- `Census.Application` : modèles, interfaces, services et politiques ;
- `Census.Infrastructure` : EF Core, PostgreSQL, sécurité et implémentations ;
- `Census.Api` : contrôleurs, middleware et contrats HTTP.

## Web

Architecture orientée fonctionnalités :

- `app` : routage ;
- `api` : client HTTP et ressources ;
- `auth` : session utilisateur ;
- `components` : composants communs et layout ;
- `pages` : écrans métier ;
- `styles` : design tokens, base, layout, composants et pages ;
- `animations` : animations CSS indépendantes.

## Mobile

- `app` : routes Expo Router ;
- `src/api` : accès à l’API ;
- `src/auth` : contexte d’authentification ;
- `src/storage` : SecureStore et SQLite ;
- `src/sync` : moteur de synchronisation ;
- `src/components` : composants réutilisables ;
- `src/styles` et `src/animations` : présentation séparée.

## Mode hors ligne

Une collecte complète est stockée dans SQLite sous forme d’opération atomique `create-census-bundle`. À la synchronisation, l’application crée successivement l’habitation, le ménage et le premier membre, puis supprime l’opération locale seulement après succès complet.
