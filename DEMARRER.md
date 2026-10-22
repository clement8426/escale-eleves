# Mon premier démarrage

Ce projet s’appelle **Escale**. Il contient une boutique fictive à améliorer et un atelier qui explique quoi faire, étape par étape.

## Pour l’apprenant

1. Installer **Node.js 24 LTS** depuis https://nodejs.org/ si nécessaire.
2. Récupérer ce dépôt : bouton Code → Download ZIP sur GitHub, puis décompresser ; ou le cloner avec Git.
3. Ouvrir le dossier `escale-eleves` dans Codex ou Claude Code, avec l’accès au terminal et aux fichiers locaux.
4. Envoyer ce message :

> Lis DEMARRER.md. Prépare l’atelier Escale sur mon ordinateur, démarre le parcours et donne-moi son lien. Accompagne-moi comme une personne débutante. Ne corrige rien pour le moment et ne fais pas toutes les missions à ma place.

5. Ouvrir le lien donné par l’agent. Choisir **Je commence par le formulaire**.

Gardez deux fenêtres : l’atelier et votre agent. Dans chaque mission, l’atelier vous donne les consignes à copier. Il ne se connecte pas lui-même à votre compte IA.

## Pour l’agent

- Vérifie `node --version`. Node 24 LTS est recommandé ; minimum 22.12. Si Node manque, indique le lien officiel et laisse la personne l’installer.
- Exécute `node atelier.mjs demarrer --sans-ouvrir`. Le lanceur installe les dépendances du projet et Chromium, compile l’atelier, choisit un port libre et affiche son adresse. Cela peut prendre plusieurs minutes au premier usage.
- Donne cette adresse réelle. Ne suppose jamais le port 4210 ou 4211.
- Les fichiers de connexion MCP du projet sont générés : `.mcp.json` et `.codex/config.toml`. Invite à valider ou recharger ces connexions dans le client. Ne prétends pas qu’un MCP est connecté avant de le vérifier. Les scripts de l’atelier restent utilisables sans MCP.
- N’installe pas le plugin Labo UX pendant cet exercice. Il sera présenté plus tard.
- Ne corrige aucune mission à ce stade. Lis AGENTS.md pour la suite.

## Je veux lancer moi-même

Dans un terminal ouvert dans le dossier du projet :

```sh
node atelier.mjs
```

Ou utiliser `LANCER.command` sur Mac, `LANCER.cmd` sur Windows, `./lancer.sh` sur Linux. Si un ZIP a perdu ses droits sur Mac ou Linux : `chmod +x LANCER.command lancer.sh`.

Sous Linux, si le navigateur signale des bibliothèques manquantes après la préparation : `node atelier.mjs dependances-linux`. Cette installation système officielle Playwright peut demander le mot de passe administrateur.

Pour arrêter les deux serveurs : `node atelier.mjs arreter`. Vos fichiers restent conservés.
