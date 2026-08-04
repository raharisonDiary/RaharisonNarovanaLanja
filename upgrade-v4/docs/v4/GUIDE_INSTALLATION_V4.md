# Installation de Census Flow V4

## Prérequis

La V3 doit être fonctionnelle. Docker Desktop et PostgreSQL doivent être conservés. Ne lancez pas `docker compose down -v`.

## Installation du correctif

1. Arrêter le backend, le web et Expo avec `Ctrl + C`.
2. Extraire `upgrade-v4` dans la racine du projet.
3. Exécuter :

```powershell
Set-Location D:\projetmemoFF-complet
Set-ExecutionPolicy -Scope Process Bypass
.\upgrade-v4\install-v4.ps1
```

Le programme d’installation sauvegarde chaque fichier remplacé dans un dossier `backup-before-v4-*`.

## Démarrage

```powershell
.\scripts\start-backend.ps1
```

La migration citoyen est appliquée automatiquement. Dans un autre terminal :

```powershell
.\scripts\start-web.ps1
```

Puis, pour le mobile :

```powershell
.\scripts\start-mobile.ps1
```

## Contrôle

```powershell
.\scripts\verify-all.ps1
```

Tests fonctionnels recommandés : création d’une habitation, création du ménage, choix « ajouter un citoyen maintenant », questionnaire citoyen, enregistrement local mobile, modification du brouillon, synchronisation et vérification des statistiques après validation.
