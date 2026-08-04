# Cahier des charges fonctionnel — Census Flow V3

## 1. Vision

Census Flow V3 est une plateforme publique et professionnelle de recensement. La page d’accueil est accessible sans compte. Les fonctions de collecte, de supervision et d’administration exigent une connexion et sont limitées par rôle et territoire.

## 2. Utilisateurs et responsabilités

### Administrateur national

- crée les comptes des chefs de région ;
- affecte chaque chef à une région ;
- crée et pilote les campagnes ;
- consulte la carte et les statistiques nationales ;
- supervise les données, les utilisateurs et l’audit.

### Chef de région

- consulte uniquement sa région et ses descendants ;
- crée les comptes des agents de sa région ;
- affecte chaque agent à une commune, un fokontany ou une zone de dénombrement ;
- contrôle et valide les données synchronisées ;
- consulte les statistiques régionales.

### Agent recenseur

- collecte les habitations, ménages et citoyens sur mobile ;
- capture le GPS et les photos ;
- enregistre les données localement sans réseau ;
- modifie, consulte ou supprime un brouillon local ;
- déclenche la synchronisation globale lorsque le réseau revient.

## 3. Création de comptes et WhatsApp

Le formulaire de création exige le nom, les prénoms, le numéro WhatsApp, le rôle et le territoire d’affectation. Un e-mail unique et un mot de passe temporaire robuste sont générés. Le serveur peut transmettre les identifiants par WhatsApp Cloud API. Sans configuration Meta, l’application fournit un lien de prévisualisation `wa.me` afin de ne pas bloquer les tests.

Hiérarchie imposée :

- administrateur national → chef de région ;
- chef de région → agent recenseur dans sa région.

## 4. Campagnes

Une page dédiée permet de renseigner :

- nom et code ;
- dates de début et de fin ;
- description ;
- pays, région, district ou commune ;
- portée nationale ou territoriale ;
- lancement immédiat, programmation ou brouillon.

Un service d’arrière-plan active automatiquement les campagnes programmées à la date de début et les clôture après la date de fin.

## 5. Référentiel géographique

La hiérarchie utilisée est :

`Pays → Région → District → Commune → Fokontany → Zone de dénombrement`.

Un script idempotent importe Madagascar, ses régions, districts, communes et fokontany dans la base via l’API.

## 6. Carte

La carte commence au niveau mondial. Après sélection de Madagascar et d’une campagne, elle affiche :

- les régions concernées ;
- les régions non démarrées, en cours ou terminées ;
- les habitations synchronisées et leurs statuts ;
- une recherche de campagne.

## 7. Collecte mobile hors ligne

Le parcours de collecte est guidé en sept étapes :

1. campagne, pays, région, district, commune, fokontany, GPS, adresse et photo de l’habitation ;
2. informations du ménage ;
3. liste des citoyens du ménage ;
4. photo du citoyen ;
5. identité ;
6. naissance et calcul/qualification automatique de l’âge ;
7. CIN conditionnelle, situation familiale, enfants, relation avec le chef, profession et téléphone.

Les dates de naissance peuvent être exactes, limitées à l’année, remplacées par un âge déclaré ou marquées inconnues. Les questions CIN ne s’affichent que pour les adultes et restent facultatives lorsqu’ils n’en possèdent pas.

Les brouillons sont stockés localement avec GPS, photos et citoyens. Ils peuvent être consultés, modifiés ou supprimés. La synchronisation crée sur le serveur l’habitation, le ménage et les citoyens. Les données locales non synchronisées ne participent jamais aux statistiques centrales.

## 8. Validation et statistiques

Les statistiques utilisent exclusivement les dossiers synchronisés puis validés. Elles sont filtrables par campagne et territoire. Elles présentent :

- habitations, ménages et citoyens ;
- femmes et hommes ;
- enfants, jeunes, adultes et personnes âgées ;
- élèves/étudiants ;
- cinq zones filles les plus peuplées.

Le niveau de classement s’adapte : régions pour un pays, districts pour une région, communes pour un district et fokontany pour une commune. Le web permet l’impression en PDF et l’export en image SVG.

## 9. Expérience utilisateur

- page publique avant connexion ;
- navigation différente selon le rôle ;
- formulaires courts et progressifs ;
- recherche, filtres, détail, modification et suppression ;
- responsive mobile, tablette et ordinateur ;
- thèmes clair, sombre et système ;
- français, malagasy et anglais ;
- profil avec photo, nom, rôle, WhatsApp, e-mail et préférences.

## 10. Sécurité

- mots de passe hachés ;
- jetons JWT et sessions révocables ;
- OTP de récupération avec durée et nombre d’essais limités ;
- autorisations par rôle et territoire ;
- statistiques limitées aux données validées ;
- journal d’audit ;
- mot de passe temporaire à remplacer après la première transmission.

## 11. Critères d’acceptation

La V3 est acceptée lorsque :

1. la compilation backend, web et mobile réussit ;
2. l’administrateur crée un chef de région et obtient le statut d’envoi WhatsApp ;
3. le chef crée un agent uniquement dans sa région ;
4. une campagne peut être créée en brouillon, programmée ou active ;
5. un ménage complet est enregistré hors ligne puis synchronisé ;
6. les données non validées sont absentes des statistiques ;
7. les filtres hiérarchiques et exports fonctionnent ;
8. les trois langues et les deux thèmes sont utilisables ;
9. la page publique reste accessible sans authentification.
