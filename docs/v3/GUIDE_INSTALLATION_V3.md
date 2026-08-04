# Guide d’installation et de test — Census Flow V3

## 1. Prérequis

- Docker Desktop opérationnel ;
- .NET SDK 10 ;
- Node.js et npm ;
- VS Code ;
- Android Studio ou Expo Go pour le mobile.

## 2. Installation du correctif

Depuis la racine du projet :

```powershell
Set-Location D:\projetmemoFF-complet
Set-ExecutionPolicy -Scope Process Bypass
.\upgrade-v3\install-v3.ps1
```

Le script sauvegarde chaque fichier remplacé. Il ne modifie pas `.env` et ne supprime pas la base.

## 3. Backend

```powershell
.\scripts\start-backend.ps1
```

Contrôle :

```powershell
curl.exe -k https://localhost:7001/api/v1/system/status
```

## 4. Import géographique Madagascar

L’API doit être démarrée. Dans un autre terminal :

```powershell
.\scripts\import-madagascar-geography.ps1 -Email "admin@gmail.com" -Password "VOTRE_MOT_DE_PASSE"
```

Pour un premier essai rapide sans les fokontany :

```powershell
.\scripts\import-madagascar-geography.ps1 -Email "admin@gmail.com" -Password "VOTRE_MOT_DE_PASSE" -SkipFokontany
```

Le script est idempotent : il réutilise les zones déjà présentes.

## 5. Web

```powershell
.\scripts\start-web.ps1
```

Ouvrir `http://localhost:5174`.

## 6. Mobile

Configurer `mobile\.env` :

```env
EXPO_PUBLIC_API_URL=http://ADRESSE_IP_DU_PC:5001/api/v1
```

Puis :

```powershell
.\scripts\start-mobile.ps1
```

## 7. WhatsApp

Compléter `.env` :

```env
WHATSAPP_ENABLED=true
WHATSAPP_GRAPH_API_VERSION=v24.0
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_TEMPLATE_NAME=census_credentials
WHATSAPP_TEMPLATE_LANGUAGE=fr
```

Le modèle Meta recommandé contient trois variables dans le corps : nom complet, e-mail et mot de passe temporaire. Sans ces paramètres, l’application retourne un lien `wa.me` de prévisualisation.

## 8. Vérification complète

```powershell
.\scripts\verify-all.ps1
```

Puis effectuer les scénarios fonctionnels du CDC : comptes, campagne, collecte hors ligne, synchronisation, validation, statistiques, export, langues et thèmes.

## 9. Règles de prudence

Ne pas exécuter `docker compose down -v` sur une base contenant des données utiles. Ne pas relancer un ancien installateur V2 après installation de la V3.
