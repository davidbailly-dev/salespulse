---
paths:
  - ".github/**"
  - "render.yaml"
---

# Intégration continue et déploiement

- Intégration continue : `.github/workflows/ci.yml` (GitHub Actions) lance `npm ci`, `npm run lint`, `npm run typecheck`, `npm test` et `npm run build`, puis démarre le serveur unique (`/health` doit renvoyer la version du `package.json` racine, puis `SIGTERM` l'arrêter proprement) sur chaque pull request vers `develop` ou `main` et chaque push sur ces branches. Son job `checks` est la vérification exigée par le ruleset GitHub « develop et main » : ne pas le renommer sans mettre à jour le ruleset.
- Render déploie `main` seulement une fois `checks` passé (*After CI Checks Pass*). Les réglages GitHub (ruleset, méthodes de merge, alertes Dependabot) et Render se font dans leurs interfaces, par l'utilisateur, hors dépôt (jalon 008).
- Pousser une modification de `.github/workflows/` demande le scope `workflow` du jeton de `gh` (remote en HTTPS) : `gh auth refresh -h github.com -s workflow`.
