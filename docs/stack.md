# Stack

Les technologies structurantes de SalesPulse, pourquoi elles ont été choisies et quel principe de
`docs/vision.md` (P1 à P10) elles servent. Règles de tenue : `docs/project-docs-conventions.md`.

Une entrée par badge du README. Les utilitaires non structurants (icônes, configuration du
linter) n'ont pas d'entrée.

---

## Next.js

- **Rôle** : framework de l'interface. Il fournit le routage par dossiers et les pages rendues
  côté serveur. Tant que le backend n'existe pas, il porte aussi la couche d'API de démonstration
  (routes `/api/...`) et le démarrage du serveur qui prépare les données.
- **Pourquoi** :
  - rendu côté serveur et composants exécutés côté serveur : les pages se construisent sur le
    serveur, qui garde l'accès aux données ;
  - Route Handlers et Server Actions : le serveur expose sa propre couche d'API. Tant qu'il n'y a
    pas de backend, un seul projet sert l'interface et l'API de démonstration, sans service à
    installer à côté. Un backend sera développé plus tard : ces routes sont provisoires et seront
    remplacées par lui, l'interface n'ayant pas à changer (P2) ;
  - référencement et performances de base fournis par le framework ;
  - routage par fichiers : une page est un dossier, et les paramètres d'adresse (boutique,
    période, comparaison) se conservent d'une page à l'autre (P5).
- **Alternatives écartées** :
  - Vite + React en application monopage, avec un backend à part : pas de rendu serveur ni de
    composants serveur, routage et couche d'API à assembler soi-même, et un service de plus à
    lancer pour la démonstration (P1) ;
  - backend séparé dès le départ : il n'existe pas encore, et le produit doit se démontrer sans
    lui (P1, P2).
- **Principe servi** : P1, P2, P5.

## React

- **Rôle** : bibliothèque d'interface. Chaque indicateur est un composant qui combine un hook de
  données et une fonction de calcul.
- **Pourquoi** :
  - Next.js est construit sur React : choisir l'un impose l'autre, et ses composants serveur
    reposent sur ce modèle ;
  - le modèle de composants réutilise les mêmes briques (cartes, indicateurs, évolutions) sur
    toutes les pages (P8) ;
  - les bibliothèques du projet, comme Recharts et TanStack Query, sont écrites pour React.
- **Alternatives écartées** :
  - Vue (avec Nuxt) : même famille de framework, mais le choix de Next.js impose React, et
    Recharts n'existe que pour React ;
  - Svelte (avec SvelteKit) : même raison, avec un écosystème plus petit pour les graphiques et
    les données ;
  - Angular : framework complet et plus structuré, plus lourd que ce que demande un dashboard en
    lecture seule.
- **Principe servi** : P8, P10.

## TypeScript

- **Rôle** : langage de tout le projet, interface, calculs et routes d'API.
- **Pourquoi** :
  - un seul langage pour tout le projet, côté serveur comme côté interface : le futur backend
    sera lui aussi en TypeScript (décidé), ce qui permettra de partager les types et les schémas
    de données avec l'interface ;
  - les mêmes types décrivent les données de bout en bout, de la source à l'affichage (P7), et
    le compilateur signale une dérive du format avant l'exécution (P4).
- **Mode strict** : `strict: true`, pour que la vérification de types tienne ce que le choix du
  langage promet. Activé le 2026-11-18 après correction des 32 erreurs de type que le mode
  non strict laissait passer.
- **Alternatives écartées** :
  - JavaScript seul : pas de vérification de types, une dérive du format de données (P4)
    apparaît à l'exécution plutôt qu'à la compilation ;
  - PHP, Java ou Go pour le serveur : contraire à la raison du choix, un seul langage pour le
    back et le front.
- **Principe servi** : P7, P4.

## TanStack Query

- **Rôle** : récupération et cache des données côté navigateur. Un hook par source de données lit
  la boutique et la période dans l'adresse, puis appelle la route d'API correspondante.
- **Pourquoi** :
  - il compense l'absence de backend aujourd'hui : l'API de démonstration renvoie des listes
    brutes (commandes, trafic…) et les indicateurs sont calculés côté navigateur. Plusieurs
    indicateurs d'une page réclament les mêmes listes, et le cache les partage au lieu de les
    recharger ;
  - les états de chargement et d'erreur sont gérés au même endroit ;
  - les composants ne connaissent pas l'adresse de la source : remplacer le backend ne touche que
    ces hooks (P2).
- **Alternatives écartées** :
  - SWR : même idée en plus léger, mais moins complet, notamment pour désactiver une requête
    (la comparaison N-1 est inactive tant que l'interrupteur est éteint) ;
  - `fetch` avec `useEffect` : chaque hook réécrirait le cache, le chargement et l'erreur, sans
    cache partagé entre indicateurs ;
  - Server Components seuls : les données seraient chargées sur le serveur, mais les filtres
    (boutique, période, comparaison) changent côté navigateur et obligeraient à recharger la page.
- **Principe servi** : P2, P5.

## Zod

- **Rôle** : schémas de validation des données. Ils définissent le format des commandes, produits,
  clients et données analytics, et valident chaque réponse côté serveur puis côté interface.
- **Pourquoi** :
  - le schéma est écrit une seule fois et les types TypeScript en sont déduits (P7) ;
  - une réponse qui ne respecte pas le contrat est refusée là où elle apparaît (P4), ce qui
    sécurise le remplacement des données de démonstration par un vrai backend (P2) ;
  - le futur backend, en TypeScript, validera lui aussi les requêtes et les réponses avec Zod, et
    les schémas seront partagés entre le backend et l'interface (décidé). Ils vivent dans le
    paquet `packages/contracts` du monorepo (jalon 006), que l'interface importe sous le nom
    `@salespulse/contracts` et que le backend importera de la même façon.
- **Alternatives écartées** :
  - types TypeScript seuls, sans validation : les types disparaissent à la compilation, une
    réponse hors contrat ne serait pas détectée à l'exécution (P4).
- **Principe servi** : P4, P7, P2.

## Tailwind CSS

- **Rôle** : mise en forme. Le thème sombre est défini par des jetons (couleurs, surfaces,
  bordures) réutilisés partout.
- **Pourquoi** :
  - rapidité d'écriture : les styles s'écrivent à côté des composants, sans nommer de classes ;
  - le contrôle du rendu reste au projet : pas de composants imposés par une bibliothèque ;
  - les jetons du thème garantissent la cohérence entre les pages (P8) ;
  - les variantes responsives de l'outil servent l'affichage mobile et bureau (P10).
- **Alternatives écartées** :
  - CSS pur : écriture plus lente, avec les noms de classes et l'organisation des feuilles de
    style à gérer soi-même.
- **Principe servi** : P8, P10.

## Recharts

- **Rôle** : graphiques (courbes, jauges) des indicateurs.
- **Pourquoi** : les graphiques sont des composants du même modèle que le reste de l'interface et
  s'adaptent à la largeur de l'écran.
- **Alternatives écartées** : aucune étudiée, Recharts répond au besoin et ne justifie pas de
  comparaison.
- **Principe servi** : P8, P10.

## Faker

- **Rôle** : génération des données de démonstration (boutiques, produits, clients, commandes,
  trafic), avec une graine fixe par générateur.
- **Pourquoi** : produit des données variées et vraisemblables sans source réelle, et une graine
  fixe donne les mêmes chiffres à chaque lancement, ce qui permet de calibrer les indicateurs et
  de tester les générateurs par invariants.
- **Alternatives écartées** : aucune étudiée, Faker convient bien et ne justifie pas de
  comparaison.
- **Principe servi** : P1, P3.

## Vitest

- **Rôle** : tests unitaires des calculs d'indicateurs, des filtres et des générateurs.
- **Pourquoi** : fonctionne avec TypeScript sans configuration lourde, se lance en un fichier ou
  en suite complète, et permet d'écrire les tests avant le code.
- **Alternatives écartées** : aucune étudiée, Vitest répond très bien au besoin.
- **Principe servi** : P6.

---

## Technologie retirée

### MSW (Mock Service Worker)

- **Rôle** (jusqu'en v0.1.1) : simuler l'API dans le navigateur avec des données de démonstration.
- **Pourquoi retiré** : actif en développement seulement, il laissait les appels d'API sans
  réponse (erreur 404) une fois l'application construite et lancée en production. Les routes
  d'API de Next.js appellent directement les données de démonstration et se comportent à
  l'identique en développement et en production, ce qui rendait MSW redondant.
- **Principe en jeu** : P1 (un lancement sans service à côté, quel que soit le mode) et P2 (la
  couche d'API est un vrai point d'accès, remplaçable par un backend).
