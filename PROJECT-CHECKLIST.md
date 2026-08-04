# Validation avant mise en production

- [ ] Remplacer tous les secrets d’exemple.
- [ ] Exécuter `dotnet build Census.sln`.
- [ ] Exécuter les migrations sur une base de préproduction.
- [ ] Relancer `verify-backend-core.ps1`.
- [ ] Exécuter `npm ci && npm run build` dans `web`.
- [ ] Exécuter `npm ci --legacy-peer-deps && npm run typecheck` dans `mobile`.
- [ ] Tester les rôles Administrateur, Responsable régional, Agent et Analyste.
- [ ] Tester une collecte hors ligne puis sa synchronisation.
- [ ] Configurer sauvegardes, logs centralisés et supervision.
- [ ] Faire valider les mentions légales et la politique de protection des données.
