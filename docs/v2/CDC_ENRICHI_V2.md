# Cahier des charges enrichi — Census Flow V2

## 1. Vision du produit
Census Flow est une plateforme web et mobile de recensement conçue pour réduire le temps de collecte, fiabiliser les données et rendre le pilotage accessible aux agents de terrain comme aux responsables nationaux. La simplicité d’usage est une exigence fonctionnelle, pas un simple choix graphique.

## 2. Principes de conception
- Une action principale visible par écran.
- Parcours constant : habitation → ménage → personnes → contrôle → synchronisation.
- Formulaires découpés en étapes courtes, avec validation immédiate.
- Fonctionnement hors ligne sur mobile et synchronisation explicite.
- Navigation adaptée au rôle : agent, superviseur, analyste ou administrateur.
- Accessibilité : contraste, zones tactiles, messages compréhensibles, navigation clavier web.
- Conservation des fonctionnalités métier existantes.

## 3. Utilisateurs et droits
### Administrateur système
Utilisateurs, rôles, paramètres de sécurité, audit, supervision globale et maintenance.

### Coordinateur national
Campagnes, territoires, données nationales, validation, statistiques et rapports.

### Superviseur régional
Agents de sa zone, contrôle qualité, validation et rapports régionaux.

### Agent recenseur
Collecte terrain, modification des brouillons, soumission et synchronisation.

### Analyste
Lecture des données validées, tableaux de bord, statistiques et export.

## 4. Modules fonctionnels
### 4.1 Authentification et sécurité
- Connexion par e-mail et mot de passe.
- Sessions avec access token et refresh token.
- Déconnexion d’un appareil ou de tous les appareils.
- Mot de passe oublié par OTP à six chiffres.
- OTP limité dans le temps et nombre de tentatives limité.
- Jeton de réinitialisation à usage unique.
- Fermeture des anciennes sessions après changement de mot de passe.
- Envoi par SMTP configurable ; code visible uniquement en environnement de développement.
- Journalisation des actions sensibles.

### 4.2 Collecte guidée
- Création d’une habitation avec GPS, adresse et photo facultative.
- Création du ménage rattaché.
- Enregistrement du chef puis des autres membres.
- Brouillon, soumission, validation ou rejet motivé.
- Détection de doublons à préciser par identifiant national, identité et contexte du ménage.

### 4.3 Mobile hors ligne
- Stockage local chiffrable selon la cible de déploiement.
- File de synchronisation visible.
- Reprise sur erreur et absence de perte des formulaires.
- Indication claire : synchronisé, en attente ou en erreur.

### 4.4 Cartographie
- Position des habitations.
- Filtres par campagne, territoire et état.
- Progression des zones recensées.
- Contrôle des coordonnées incohérentes.

### 4.5 Pilotage et analyse
- Population, ménages et habitations.
- Répartition par sexe, âge et territoire.
- Taux de validation et éléments rejetés.
- Activité des agents.
- Exports CSV et rapports administratifs.

## 5. Exigences UI/UX
- Palette V2 : indigo minéral, jade numérique, corail et fond neutre.
- Interface web responsive, navigation latérale groupée et barre mobile simplifiée.
- Tableau de bord orienté actions, non orienté uniquement statistiques.
- Animations courtes de 150 à 300 ms, jamais bloquantes.
- Écrans de chargement, états vides et messages d’erreur explicites.
- Minimum tactile mobile recommandé : 44 × 44 px.

## 6. Exigences non fonctionnelles
- API versionnée `/api/v1`.
- PostgreSQL/PostGIS.
- Contrôle d’accès par rôle et territoire.
- HTTPS, CORS explicite, en-têtes de sécurité et limitation de débit.
- Sauvegarde de la base et procédure de restauration documentées.
- Logs structurés et identifiant de trace pour les erreurs.
- Architecture évolutive .NET, React et Expo/React Native.

## 7. Critères d’acceptation
1. Un agent peut enregistrer un ménage complet en suivant trois étapes sans consulter un manuel.
2. Une collecte hors ligne reste disponible après fermeture de l’application et peut être synchronisée.
3. Un utilisateur peut réinitialiser son mot de passe avec un OTP valide ; un OTP expiré ou incorrect est refusé.
4. Les anciennes sessions sont révoquées après réinitialisation.
5. Le web reste utilisable à 360 px, tablette et écran de bureau.
6. Les fonctionnalités existantes restent accessibles selon les rôles.
7. Les migrations de base s’appliquent sans suppression des données existantes.

## 8. Limites et décisions nécessaires avant production
- Choisir le fournisseur SMTP ou SMS réel.
- Définir les règles nationales précises de détection de doublons.
- Définir la politique légale de conservation et d’anonymisation.
- Réaliser un audit de sécurité et des tests utilisateurs terrain.
- Prévoir sauvegarde, supervision, domaine, certificats et hébergement de production.
