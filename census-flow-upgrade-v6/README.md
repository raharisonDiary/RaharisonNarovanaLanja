# Census Flow V6 — Parité fonctionnelle Web/Mobile

Ce correctif rend les modules métier du web accessibles dans l’application mobile avec une navigation adaptée aux petits écrans.

## Modules mobiles

- accueil public, connexion, OTP et profil ;
- tableau de bord ;
- campagnes ;
- territoires ;
- habitations ;
- ménages locaux et synchronisés ;
- citoyens avec caméra/import d’image ;
- carte ;
- statistiques ;
- rapports CSV ;
- gestion des utilisateurs selon le rôle ;
- journal d’audit pour les rôles autorisés ;
- synchronisation hors ligne.

## Corrections techniques

- file hors ligne AsyncStorage multiplateforme, avec migration automatique des brouillons SQLite existants sur Android/iOS ;
- suppression du crash `wa-sqlite.wasm` ;
- suppression des nœuds texte invalides dans la carte Web ;
- conservation de SecureStore sur Android/iOS et localStorage sur le Web ;
- animations compatibles avec React Native Web.

Aucune migration PostgreSQL n’est requise.
