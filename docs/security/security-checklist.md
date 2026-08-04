# Checklist sécurité

- secrets uniquement dans les variables d’environnement ou User Secrets ;
- mot de passe administrateur de 12 caractères minimum ;
- clé JWT aléatoire d’au moins 64 octets ;
- access token court en production ;
- refresh token haché en base et tourné à chaque utilisation ;
- révocation de toutes les sessions lors d’une réutilisation suspecte ;
- HTTPS obligatoire en production ;
- CORS limité aux origines connues ;
- rate limiting actif ;
- journal d’audit sans corps de requête, mot de passe ni jeton ;
- sauvegardes PostgreSQL chiffrées ;
- revue des droits par rôle avant mise en production ;
- rotation immédiate de tout secret déjà partagé dans une conversation ou un dépôt.
