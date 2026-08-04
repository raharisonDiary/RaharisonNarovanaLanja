# Census Flow V4 — Collecte simplifiée

Cette version cible le parcours habitation → ménage → citoyen sans supprimer les fonctions V3.

## Web

- création d’une habitation guidée par campagne, district, commune et fokontany ;
- recherche textuelle dans les sélecteurs ;
- vérification GPS par le navigateur ;
- références habitation et ménage générées automatiquement ;
- ménage rattaché à une habitation existante ;
- proposition immédiate d’ajouter un citoyen après la création du ménage ;
- assistant citoyen en six étapes avec photo, naissance imprécise, filtrage majeur/mineur, CIN facultative, situation familiale et profession ;
- listes des habitations, ménages et citoyens avec recherche, filtres, détail, modification et suppression ;
- formulaire de campagne hiérarchique et carte filtrée par pays/campagne.

## Mobile

- recherche textuelle dans les listes de sélection ;
- parcours terrain hors ligne avec GPS et références automatiques ;
- possibilité d’enregistrer d’abord le ménage puis d’ajouter un citoyen ;
- photo citoyen conservée localement et synchronisée ;
- questionnaire citoyen conditionnel ;
- reprise, modification, détail et suppression des brouillons avant synchronisation.

## Backend

- génération serveur de secours pour les références d’habitation et de ménage ;
- nouveaux champs citoyen : précision de naissance, lieu de naissance, nombre d’enfants, délivrance CIN et photo ;
- migration additive `20260802110000_AddCitizenFieldDetails` ;
- aucune suppression des données V3 ni des 21 190 zones administratives.
