---
paths:
  - "changelog.txt"
  - "/package.json"
  - "docs/roadmap.md"
---

# Version et changelog

Spécificités du projet pour les passages de version (`docs/gitflow.md`) et la convention
`docs/changelog.md`.

- La version est portée par le `package.json` **racine** et son `package-lock.json` (`npm version X.Y.Z --no-git-tag-version`, lancé à la racine) et par la ligne « Version actuelle » de `docs/roadmap.md` : les trois changent dans le commit de passage de version, avec l'ajout de l'entrée de la version dans `changelog.txt`. Les paquets des workspaces restent à `0.0.0`.
- Changelog en français, comme l'interface.
