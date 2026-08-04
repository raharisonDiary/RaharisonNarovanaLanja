# Mise à niveau Census Flow V2

## Sauvegarde
Le script d’installation crée une copie datée des fichiers remplacés. Il ne touche ni au fichier `.env`, ni au volume Docker PostgreSQL.

## Installation depuis VS Code
Depuis le dossier racine du projet :

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\upgrade-v2\install-v2.ps1
```

## Redémarrage backend
Le nouveau script charge automatiquement les valeurs du fichier `.env`, attend PostgreSQL puis applique les migrations :

```powershell
.\scripts\start-backend.ps1
```

La migration `AddPasswordRecovery` ajoute les champs OTP aux utilisateurs existants sans supprimer les données.

## Démarrage web

```powershell
Set-Location .\web
npm install --registry=https://registry.npmjs.org/
npm run dev
```

Adresse prévue : `http://localhost:5174`.

## Démarrage mobile

```powershell
Set-Location ..\mobile
npm install --registry=https://registry.npmjs.org/
npx expo start -c
```

## OTP en développement
Sur un environnement `Development`, le code est affiché dans l’écran de récupération et dans les logs du backend. En production, désactivez `ExposeOtpInDevelopment` et configurez `PasswordRecoveryEmail` ou ses variables d’environnement.
