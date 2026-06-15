# Politique de confidentialité

ChatGPT Conversation Export est conçu pour exporter localement une conversation ChatGPT ouverte dans Firefox.

## Données traitées

L’extension peut lire :

- le contenu de la conversation ChatGPT ouverte ;
- les métadonnées de conversation disponibles dans la réponse de ChatGPT ;
- les références de sources, images et fichiers joints lorsqu’elles sont présentes ;
- les paramètres locaux de l’extension.

## Utilisation du token de session

Pour récupérer la conversation, l’extension utilise la session ChatGPT déjà active dans l’onglet de l’utilisateur.

Le token de session est utilisé uniquement en mémoire, pendant la requête d’export. Il n’est pas stocké par l’extension, n’est pas transmis à un serveur tiers et n’est pas écrit dans les fichiers exportés.

## Stockage local

L’extension utilise la permission `storage` uniquement pour enregistrer ses paramètres locaux, par exemple :

- le mode d’export par défaut ;
- le format par défaut ;
- la langue ;
- le thème ;
- la position du bouton intégré ;
- les actions visibles dans le menu.

## Absence de serveur tiers

L’extension n’exploite aucun serveur propre.

Elle n’envoie pas les conversations, fichiers, métadonnées, paramètres ou tokens à un serveur tiers.

Les fichiers exportés sont générés localement par le navigateur et téléchargés sur l’appareil de l’utilisateur.

## Images et liens externes

Les exports HTML peuvent contenir des liens vers des images ou sources web déjà présentes dans les données de ChatGPT.

Lorsque l’utilisateur ouvre un export HTML contenant des images distantes, le navigateur peut charger ces images depuis leurs domaines d’origine. Ce chargement dépend du fichier exporté et du comportement normal du navigateur, pas d’un envoi de données par l’extension vers un serveur propre.

## Permissions

L’extension demande :

```json
[
  "storage",
  "https://chatgpt.com/*"
]
```

`storage` sert uniquement aux paramètres locaux de l’extension.

L’accès à `https://chatgpt.com/*` est nécessaire pour lire la conversation ChatGPT ouverte et appeler les API de ChatGPT depuis cette page.

## Indépendance

ChatGPT Conversation Export est une extension non officielle. Elle n’est pas développée, approuvée ni affiliée à OpenAI.
