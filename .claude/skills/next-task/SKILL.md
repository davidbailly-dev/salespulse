---
name: next-task
description: Détermine la prochaine tâche de développement du projet à partir de la roadmap, des jalons et de la branche git courante, puis la propose sans rien modifier.
disable-model-invocation: true
allowed-tools: Bash(git branch:*), Bash(git status:*), Bash(git log:*), Bash(ls:*), Bash(grep:*), Bash(sed:*), Bash(head:*), Bash(cat:*), Read, Grep, Glob
---

# Prochaine tâche

Tu dois déterminer sur quoi travailler ensuite, le proposer à l'utilisateur et attendre sa
validation. Cette commande est en **lecture seule** : ne modifie aucun fichier, ne crée aucune
branche, ne commite rien.

## État actuel du projet

Branche courante :

!`git branch --show-current`

Fichiers modifiés (vide = arbre propre) :

!`git status --short`

Derniers commits :

!`git log --oneline -5`

Jalon associé à la branche courante, avec ses phases et les cases restant à cocher
(le jalon porte le nom de la branche sans son préfixe) :

!`f=$(ls docs/milestones/*-$(git branch --show-current | sed 's|^[^/]*/||').md 2>/dev/null | head -1); if [ -n "$f" ]; then echo "$f"; grep -nE '^# |^## Phase|^- \[ \]' "$f"; else echo "Aucun jalon associé à la branche courante."; fi`

Roadmap (index) :

!`cat docs/roadmap.md`

## Méthode

Applique le premier cas qui correspond, dans cet ordre :

1. **Travail non commité** (`git status` non vide) : signale-le en premier. La tâche suivante est
   de terminer ce travail ; rattache-le au jalon concerné s'il y en a un.
2. **Branche `feature/*` ou `hotfix/*` avec un jalon associé** : lis le fichier du jalon en entier
   (Journal et Décisions compris), puis propose la première case `- [ ]` de la première phase 🔄
   ou ⬜. Si toutes les cases sont cochées, la tâche suivante est la clôture du jalon (Bilan,
   passage à ✅, déplacement dans « Terminés » de l'index).
3. **Branche `feature/*` sans jalon** : c'est un petit changement sans jalon (voir
   `docs/roadmap-conventions.md`). Déduis la tâche du nom de la branche et des derniers commits.
4. **Sur `develop` avec un jalon dans « En cours »** : propose de reprendre ce jalon. Indique la
   branche à rejoindre et la première case restante (lis le fichier du jalon).
5. **Sur `develop` ou `main`, aucun jalon en cours** :
   - si des jalons terminés sont marqués `non publié`, propose d'abord une release, avec la
     version SemVer suggérée (mineure s'il y a des fonctionnalités, correctif sinon) ;
   - sinon, propose le jalon futur le plus prioritaire de l'index et rappelle qu'il faut d'abord
     rédiger son fichier de jalon et le faire valider (cycle « Planifier »). Cite les alternatives
     en une ligne chacune.

## Réponse attendue

Réponds en français, avec le tutoiement, de façon concise :

- **Situation** : branche, état de l'arbre, jalon concerné.
- **Tâche proposée** : une seule, précise (fichier et comportement attendu quand c'est une case
  de phase).
- **Marche à suivre** : branche à créer ou à rejoindre, et les règles qui s'appliquent
  (TDD : test rouge d'abord et sortie montrée ; suite complète avant tout commit ; aucun commit,
  merge ou push sans confirmation explicite).
- **Alternatives** : seulement s'il y a un vrai choix.

Termine en demandant à l'utilisateur s'il valide la tâche. Ne commence rien avant sa réponse.
