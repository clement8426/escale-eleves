# Escale - mon atelier UX avec l’IA

**Six petites missions. Aucun besoin de savoir coder seul.** Vous essayez une boutique fictive, vous comprenez une difficulté et vous demandez une correction à votre Codex ou Claude Code.

## Commencer

Suivre [DEMARRER.md](DEMARRER.md). Le dépôt peut être cloné ou téléchargé en ZIP. Prérequis : Node.js 24 LTS et votre propre agent avec accès au projet local. Aucun abonnement supplémentaire ou clé API pour l’atelier.

Message à copier dans votre agent :

> Lis DEMARRER.md. Prépare l’atelier Escale sur mon ordinateur, démarre le parcours et donne-moi son lien. Accompagne-moi comme une personne débutante. Ne corrige rien pour le moment et ne fais pas toutes les missions à ma place.

Le lancement manuel fonctionne sur Mac, Windows et Linux :

```sh
node atelier.mjs
```

## Ce que vous allez faire

1. **Cohérence** : comparer les boutons et les espaces.
2. **Friction** : conserver les informations après une erreur de formulaire.
3. **Accessibilité** : comprendre le cœur, lire le prix et utiliser le clavier.
4. **Comportement** : discuter les raisons possibles d’un abandon, sans inventer de données.
5. **Microcopie** : savoir quel bouton garde ou annule la commande.
6. **Performances** : mesurer le poids et le cache d’une image, puis distinguer vitesse réelle et retour pendant l’attente.

Chaque mission suit cinq étapes : essayer → comprendre → mesurer → corriger → vérifier. Des indices et des consignes pour votre agent sont disponibles. Vous écrivez votre propre explication à la fin.

Dans « Je mesure », commencez par les gestes expliqués pour l’outil. Le bouton « Vérifier automatiquement mes observations » lance ensuite un script local dont les actions sont décrites à l’écran. Il n’appelle ni une IA ni un MCP. La demande pour votre agent est une seconde option, à copier dans votre conversation.

## Essayer sans perdre son travail

- Une copie indépendante par mission dans `travail/bloc-N/`.
- Une sauvegarde avant la correction ; bouton pour la retrouver.
- Possibilité de recommencer une mission sans toucher aux autres.
- L’essai remplacé reste archivé dans `.atelier/essais-conserves/`.
- Les preuves et la progression restent dans `.atelier/` sur cet ordinateur.

Il n’y a aucun bouton « Tout corriger » ni version corrigée dans ce dépôt. L’agent doit modifier réellement le code. Les vérificateurs restent à l’extérieur des copies de travail.

## Les outils

Playwright, axe-core et Lighthouse sont utilisés par les scripts. Deux connexions MCP officielles sont préparées pour les agents : Chrome DevTools et Playwright. La confiance dans le projet et les connexions restent à valider dans votre client. Les scripts permettent de continuer si un MCP est indisponible.

Les captures sont prises en 2×. Un contrôle technique ne mesure pas à lui seul toute l’UX ni la compréhension des utilisateurs. La mission 4 reste théorique ; aucun traceur n’est installé.

## Maintenance

```sh
npm test
npm run test:e2e
```

Les tests d’intégration utilisent un espace isolé ; ils ne modifient pas vos missions.

Le workflow GitHub vérifie le démarrage et les missions sur macOS 14, Windows Server 2022 et Ubuntu 24.04. Ses résultats réels sont dans l’onglet Actions.

Le modèle initial est dans `modele/`. L’atelier est dans `app/` et `components/`. Les outils, sauvegardes et contrôles sont dans `outils/`. Les fichiers de connexion locaux, les essais et les dépendances ne sont jamais ajoutés à Git.

Cours : https://plateforme-cours-three.vercel.app/ux/ux-ia/demos/escale/

Sources : [Playwright](https://playwright.dev/docs/intro), [axe-core avec Playwright](https://playwright.dev/docs/accessibility-testing), [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview), [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp), [Playwright MCP](https://github.com/microsoft/playwright-mcp), [Codex MCP](https://learn.chatgpt.com/docs/extend/mcp?surface=cli), [Claude Code MCP](https://code.claude.com/docs/en/mcp).

Les produits, comptes et commandes sont fictifs. Crédits et licence de la police dans `modele/public/`. Aucun contenu du dépôt professeur privé n’est publié, à l’exception du socle de boutique déjà utilisé dans le cours : ce dépôt a son propre historique et ne contient pas les corrections du professeur.
