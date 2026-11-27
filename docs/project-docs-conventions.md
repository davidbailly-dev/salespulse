---
paths:
  - "docs/vision.md"
  - "docs/stack.md"
---

# Documents de cadrage : vision et stack

Règles de tenue de `docs/vision.md` (ce que le produit est et n'est pas) et de `docs/stack.md`
(pourquoi chaque technologie a été choisie). Ce fichier est **générique** : il peut être copié tel
quel dans n'importe quel projet. Le contenu propre à un projet vit dans `vision.md` et `stack.md`,
pas ici.

---

## Rôle des deux documents

| Document          | Question à laquelle il répond                       | Évolue                                   |
| ----------------- | --------------------------------------------------- | ---------------------------------------- |
| `docs/vision.md`  | Que fait le produit, pour qui, et que ne fait-il pas ? | Rarement : quand le produit change de nature. |
| `docs/stack.md`   | Quel outil répond à quel principe, et pourquoi ?    | À chaque choix technique structurant.    |

La vision est **en amont** : elle énonce des besoins, des contraintes et des principes. La stack
est **en aval** : elle dit quel outil y répond. Remplacer une bibliothèque change la stack, jamais
la vision.

Ils ne reprennent pas le contenu d'autres documents : le README décrit l'usage (voir
`docs/readme.md`), la roadmap planifie le travail (voir `docs/roadmap-conventions.md`), les
instructions d'agent (`CLAUDE.md`, règles) décrivent l'architecture et les conventions de code.

---

## `docs/vision.md`

Il décrit le **produit**, rien d'autre. Il est lisible par quelqu'un qui ne connaît pas le code.

### Contenu

Dans cet ordre :

1. **Problème** : la difficulté de l'utilisateur que le produit résout.
2. **Utilisateurs** : qui se sert du produit, ce que chacun y cherche. Un utilisateur = un besoin
   distinct, pas un titre de poste de plus.
3. **Proposition de valeur** : ce que le produit apporte, en quelques phrases.
4. **Non-objectifs** : ce que le produit ne fait **pas** et ne fera pas. Chaque non-objectif
   donne sa raison. C'est la section qui empêche de proposer une fonctionnalité hors périmètre.
5. **Contraintes et principes techniques** : les exigences durables qui orientent les choix
   (fonctionner sans service externe, état partagé par lien, langue, appareils pris en charge…).
   Chaque principe est numéroté ou titré pour que `stack.md` puisse y renvoyer.

### Règles de rédaction

- **Aucune bibliothèque, aucun framework, aucun outil nommé** : un principe dit *ce qui doit
  être vrai*, pas *avec quoi*. Exemple : « l'état de l'interface se partage par lien », pas « les
  filtres sont dans les paramètres d'URL gérés par telle bibliothèque ».
- Distinguer un **non-objectif** (exclusion assumée, liée à la nature du produit) d'une **piste
  future** (évolution possible, à planifier). Les pistes futures vivent dans les « Jalons futurs »
  de la roadmap, pas dans la vision.
- Phrases courtes, même langue que l'interface du projet.

---

## `docs/stack.md`

Il justifie les **technologies structurantes**.

### Technologie structurante

Une technologie est structurante quand la remplacer obligerait à réécrire une part importante du
code ou à changer la façon de le concevoir : framework, langage, bibliothèque de données, de
validation, de style, de graphiques, de tests, service externe, base de données.

Ne sont **pas** structurantes (pas d'entrée) : les utilitaires interchangeables à l'échelle d'un
fichier, les outils de formatage, les dépendances transitives.

### Format d'une entrée

Une entrée par technologie, avec les mêmes rubriques :

- **Rôle** : ce qu'elle fait dans le projet, en une phrase.
- **Pourquoi** : la raison du choix, rattachée à un besoin réel du projet.
- **Alternatives écartées** : ce qui a été envisagé ou utilisé avant, et pourquoi on ne l'a pas
  gardé. « Aucune étudiée » est une réponse honnête.
- **Principe servi** : le ou les principes de `docs/vision.md` auxquels elle répond. Une
  technologie qui ne sert aucun principe est un signal : la retirer, ou compléter la vision.

### Règles de rédaction

- Le **pourquoi** est écrit par la personne qui a fait le choix, ou validé par elle. Une
  justification déduite du code ou de l'historique est marquée `(à confirmer)` tant qu'elle n'est
  pas validée ; le marqueur disparaît à la validation.
- Pas de comparatif exhaustif ni d'argumentaire marketing : les raisons propres au projet
  suffisent.
- Si le README affiche la stack sous forme de badges, chaque badge a une entrée ici.

---

## Quand les mettre à jour

| Mettre à jour                                                            | Fichier      |
| ------------------------------------------------------------------------ | ------------ |
| Le produit change de public, de problème ou de périmètre                 | `vision.md`  |
| Un non-objectif devient un objectif (ou l'inverse)                       | `vision.md`  |
| Un principe technique est ajouté, modifié ou abandonné                   | `vision.md`  |
| Une technologie structurante est ajoutée                                 | `stack.md`   |
| Une technologie structurante est remplacée : l'ancienne passe dans les alternatives écartées de la nouvelle | `stack.md` |
| Une technologie structurante est retirée                                 | `stack.md`   |
| La raison d'un choix change, ou un principe de la vision auquel elle renvoie change | `stack.md` |

Ne pas y toucher pour : une mise à jour de version sans changement de rôle, un refactor, un
utilitaire non structurant, une fonctionnalité qui reste dans le périmètre.

La mise à jour se fait **sur la branche du changement, avant son merge**, dans le même commit que
le changement quand il est petit, sinon dans un commit `docs:` dédié.

Une décision d'un jalon qui dépasse le jalon (nouveau principe, nouvelle technologie) est reportée
ici ; le Bilan du jalon le signale.

---

## Règles pour un agent IA

- **Avant de proposer une fonctionnalité**, lire `docs/vision.md` : ne pas proposer ce qui touche
  un non-objectif sans le signaler explicitement à l'utilisateur.
- **Avant d'ajouter, de remplacer ou de retirer une dépendance structurante**, lire
  `docs/stack.md` : vérifier qu'aucune alternative écartée n'est réintroduite sans raison nouvelle,
  et que le changement respecte les principes de la vision.
- Après un tel changement, mettre à jour `stack.md` (et `vision.md` si un principe bouge) **sans
  attendre qu'on le demande**, selon le tableau ci-dessus.
- Ne pas inventer la raison d'un choix : si elle n'est écrite nulle part, la marquer
  `(à confirmer)` et la faire valider par l'utilisateur.
- Ne jamais nommer de bibliothèque dans `vision.md`.
- Ne jamais ajouter de contenu propre à un projet dans ce fichier : le placer dans `vision.md`,
  `stack.md` ou les instructions d'agent (`CLAUDE.md`, règles).
