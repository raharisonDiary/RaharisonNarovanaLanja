# Configuration WhatsApp Cloud API

Census Flow utilise l’API WhatsApp Cloud de Meta. Deux modes sont prévus :

1. **Prévisualisation** : `WHATSAPP_ENABLED=false`, le serveur génère un lien `wa.me` contenant les identifiants temporaires.
2. **Envoi réel** : `WHATSAPP_ENABLED=true`, numéro d’émetteur et jeton Meta configurés.

Pour un message initié par la plateforme, utilisez de préférence un modèle approuvé, par exemple `census_credentials`, avec ce corps :

```text
Bonjour {{1}}, votre compte Census Flow est prêt.
Identifiant : {{2}}
Mot de passe temporaire : {{3}}
Connectez-vous et changez immédiatement ce mot de passe.
```

Le code utilise automatiquement le modèle lorsque `WHATSAPP_TEMPLATE_NAME` est renseigné. Le texte libre reste disponible pour les conversations autorisées par les règles de messagerie Meta.
