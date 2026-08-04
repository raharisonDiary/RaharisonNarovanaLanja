# Correctif Census Flow V6.1

1. Arrêter Expo avec `Ctrl + C`.
2. Placer ce dossier à la racine du projet.
3. Exécuter :

```powershell
Set-Location D:\projetmemoFF-complet
Set-ExecutionPolicy -Scope Process Bypass
.\census-flow-upgrade-v6.1\install-v6.1.ps1
```

4. Vérifier puis relancer :

```powershell
Set-Location D:\projetmemoFF-complet\mobile
npm run typecheck
npx expo start -c
```
