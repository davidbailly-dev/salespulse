# Stack

Les technologies structurantes de SalesPulse, pourquoi elles ont été choisies et quel principe de
`docs/vision.md` (P1 à P21) elles servent. Règles de tenue : `docs/project-docs-conventions.md`.

Une entrée par badge du README, plus les technologies déjà décidées pour le backend mais pas
encore en place. Ces dernières portent la mention **Statut : prévu**, avec le jalon qui les
introduit, et leur badge rejoindra le README quand elles seront dans le code. Les utilitaires non
structurants (icônes, configuration du linter) n'ont pas d'entrée.

---

## Next.js

- **Rôle** : framework de l'interface. Il fournit le routage par dossiers et les pages rendues
  côté serveur. Tant que le backend n'existe pas, il porte aussi la couche d'API de démonstration
  (routes `/api/...`) et le démarrage du serveur qui prépare les données. Ces routes
  disparaîtront au profit de `apps/api`. En phase gratuite, Next.js est servi par un serveur
  personnalisé, dans le même processus que l'API (jalon 007, D22).
- **Pourquoi** :
  - rendu côté serveur et composants exécutés côté serveur : les pages se construisent sur le
    serveur, qui garde l'accès aux données ;
  - Route Handlers et Server Actions : le serveur expose sa propre couche d'API. Tant qu'il n'y a
    pas de backend, un seul projet sert l'interface et l'API de démonstration, sans service à
    installer à côté. Ces routes sont provisoires : le backend les remplacera ;
  - référencement et performances de base fournis par le framework ;
  - routage par fichiers : une page est un dossier, et les paramètres d'adresse (boutique,
    période, comparaison) se conservent d'une page à l'autre (P5) ;
  - le serveur personnalisé permet de servir l'interface et l'API depuis un seul service
    gratuit : un seul réveil à froid, et une seule origine pour le cookie de session. L'optimisation
    statique automatique qu'il désactive ne sert pas, le dashboard étant entièrement dynamique.
- **Alternatives écartées** :
  - Vite + React en application monopage, avec un backend à part : pas de rendu serveur ni de
    composants serveur, et routage et couche d'API à assembler soi-même ;
  - backend entièrement dans les Route Handlers de Next.js, sans `apps/api` : la synchronisation,
    l'authentification et le rate limit demandent un serveur qui vit hors des requêtes de
    l'interface, et qu'on puisse séparer en service propre au passage en plan payant.
- **Principe servi** : P1, P5.

## React

- **Rôle** : bibliothèque d'interface. Chaque indicateur est un composant qui combine un hook de
  données et l'affichage d'un résultat calculé par le serveur.
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

- **Rôle** : langage de tout le projet : interface, backend (`apps/api`), connecteurs, calculs et
  contrats partagés.
- **Pourquoi** :
  - un seul langage pour tout le projet, côté serveur comme côté interface : le backend est lui
    aussi en TypeScript (décidé), ce qui permet de partager les types et les schémas de données
    avec l'interface ;
  - les types du format d'échange sont partagés par le serveur et l'interface (P7), ceux du
    modèle métier par les connecteurs et les calculs du serveur, et le compilateur signale une
    dérive du format avant l'exécution (P4).
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

- **Rôle** : récupération et cache des données côté navigateur. Un hook par source lit la
  boutique et la période dans l'adresse, puis appelle l'API. Avec le backend, les hooks chargent
  des indicateurs et des séries déjà calculés par le serveur, au lieu de listes brutes (jalon
  007, D8).
- **Pourquoi** :
  - plusieurs composants d'une page affichent les mêmes résultats : le cache les partage au lieu
    de les recharger, et la réponse d'une combinaison de filtres déjà vue revient sans attendre ;
  - les états de chargement et d'erreur sont gérés au même endroit ;
  - une requête se désactive simplement, ce que demande la comparaison N-1 tant que
    l'interrupteur est éteint ;
  - les composants ne connaissent pas l'adresse de la source : le passage des listes brutes aux
    agrégats du serveur ne touche que ces hooks, pas les pages.
- **Alternatives écartées** :
  - SWR : même idée en plus léger, mais moins complet, notamment pour désactiver une requête ;
  - `fetch` avec `useEffect` : chaque hook réécrirait le cache, le chargement et l'erreur, sans
    cache partagé entre indicateurs ;
  - Server Components seuls : les données seraient chargées sur le serveur, mais les filtres
    (boutique, période, comparaison) changent côté navigateur et obligeraient à recharger la page.
    **À réévaluer après le MVP** : les filtres sont dans l'adresse (P5), les indicateurs seront
    calculés par le serveur (P6) et le service unique permet d'appeler l'API dans le même
    processus. Une page pourrait alors lire ses paramètres d'adresse et afficher les résultats
    sans cache côté navigateur, le changement de filtre devenant une navigation douce. Écarté
    pour le MVP : il faudrait repasser les 55 composants d'indicateurs du client au serveur ;
  - retirer TanStack Query pour le MVP (discuté le 2026-11-19) : il faudrait recoder dans
    chaque hook la déduplication, l'abandon des réponses périmées quand un filtre change vite
    (sinon un indicateur ne correspond plus au filtre affiché), la désactivation de la
    comparaison et les nouvelles tentatives au réveil à froid du serveur, pour un gain faible
    (une dépendance de moins).
- **Principe servi** : P5, P6.

## Zod

- **Rôle** : schémas de validation des données aux frontières. Dans `@salespulse/contracts`, ils
  décrivent le format échangé entre l'API et l'interface et valident chaque réponse côté serveur
  puis côté interface ; ils décrivent aujourd'hui les routes de démonstration (commandes,
  produits, clients, analytics), demain les indicateurs et séries calculés par le serveur. Dans
  le backend, ils valident les données reçues des plateformes, les requêtes entrantes et la
  configuration au démarrage. Le domaine du backend n'en dépend pas : ses invariants sont
  vérifiés par ses value objects, sans bibliothèque (jalon 010, D3).
- **Pourquoi** :
  - le schéma est écrit une seule fois et les types TypeScript en sont déduits (P7) ;
  - une donnée qui ne respecte pas le contrat est refusée là où elle apparaît (P4). Les
    connecteurs valident ce que renvoie une plateforme avant de le traduire vers le modèle
    commun : une plateforme qui change son format est détectée à la synchronisation, pas dans
    un indicateur faux (P2) ;
  - les schémas du format d'échange vivent dans le paquet `packages/contracts` (jalon 006),
    seul code partagé par l'API et l'interface, une application n'important jamais depuis
    l'autre (jalon 010, D5). Ils portent le format, pas les règles métier : un schéma est nommé
    par son usage (`RevenueKpi`), jamais d'après une entity du domaine.
- **Alternatives écartées** :
  - types TypeScript seuls, sans validation : les types disparaissent à la compilation, une
    réponse hors contrat ne serait pas détectée à l'exécution (P4) ;
  - schémas dans `apps/web` : l'API ne pourrait pas les importer (jalon 010, D5) ;
  - spécification OpenAPI générée, avec un client généré : outillage et étape de build utiles
    surtout entre dépôts séparés (D5) ;
  - tRPC ou ts-rest : dépendance structurante qui figerait la façon d'appeler l'API (D5).
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
  trafic), avec une graine fixe par générateur. Avec le backend, il alimente la plateforme de
  démonstration : un connecteur fictif qui passe par la même chaîne de synchronisation que les
  vraies plateformes (jalon 007, D5).
- **Pourquoi** :
  - produit des données variées et vraisemblables sans source réelle, et une graine fixe donne
    les mêmes chiffres à chaque lancement, ce qui permet de calibrer les indicateurs et de tester
    les générateurs par invariants ;
  - en alimentant un connecteur fictif plutôt qu'un jeu de données à part, la démonstration
    exerce toute la chaîne (synchronisation, stockage, calculs) sans boutique ni compte chez une
    plateforme (P1).
- **Dépendance d'exécution** : il est aujourd'hui rangé en `devDependencies` alors que le
  serveur s'en sert à l'exécution. Quand les générateurs passeront dans le backend (jalon
  « Synchronisation »), il deviendra une dépendance d'exécution du paquet qui les porte.
- **Alternatives écartées** (discuté le 2026-11-19) :
  - générateur pseudo-aléatoire maison avec listes en dur : réécrire tous les tirages changerait
    toute la séquence, donc toutes les données et tous les indicateurs déjà calibrés, pour un
    gain d'une dépendance (`SimpleFaker` n'embarque déjà aucune donnée de langue et ne tourne
    que côté serveur) ;
  - jeu de données figé dans le dépôt : volumineux, et ses dates figées feraient vieillir la
    démonstration ;
  - pas de démonstration : contraire à P1, et l'analytics reste de toute façon simulé tant
    qu'il n'a pas de vraie source.
- **Principe servi** : P1, P3.

## Vitest

- **Rôle** : lanceur de tous les tests : calculs d'indicateurs, filtres, invariants des
  générateurs et routes API en environnement `node`, composants et hooks dans un DOM simulé
  (jalon 009, avec Testing Library et jsdom) ; dans le backend, value objects du domaine
  (`apps/api`, jalon 010), puis use cases avec des adapters en mémoire, connecteurs et isolation
  entre organisations.
- **Pourquoi** : fonctionne avec TypeScript sans configuration lourde, se lance en un fichier ou
  en suite complète, et permet d'écrire les tests avant le code. Ses `projects` choisissent
  l'environnement par type de fichier : la logique pure garde la vitesse de `node`.
- **Alternatives écartées** : aucune étudiée, Vitest répond très bien au besoin.
- **Principe servi** : P3, P6, P11, P21.

## Testing Library et jsdom

- **Rôle** : tests des composants React et des hooks (jalon 009). Testing Library affiche un
  composant ou exécute un hook (`render`, `renderHook`) et interroge le résultat comme le ferait
  l'utilisateur (`screen.getByText`) ; jsdom fournit le DOM simulé dans lequel ces tests
  tournent, sous Vitest.
- **Pourquoi** :
  - le TDD s'arrêtait à la logique pure : le branchement des hooks (lecture de l'adresse,
    `queryKey` stable, états de chargement et d'erreur, comparaison N-1) n'était jamais vérifié,
    alors que le jalon « Indicateurs côté serveur » réécrira tous les hooks ;
  - Testing Library teste ce que voit l'utilisateur plutôt que l'implémentation : ses tests
    survivent aux refactors ;
  - jsdom est le DOM simulé le plus complet et le plus documenté.
- **Alternatives écartées** (jalon 009, D1) :
  - happy-dom : plus rapide, mais moins fidèle ; interchangeable en une ligne si la vitesse
    devient gênante ;
  - Vitest Browser Mode (vrai navigateur) : fidélité totale, mais navigateurs à installer en
    local et dans l'intégration continue, pour un gain limité aux graphiques ;
  - `react-test-renderer` (déprécié depuis React 19) et Enzyme (abandonné, sans React 18 ni
    19) ;
  - les tests de bout en bout (Playwright, Cypress) sont complémentaires, pas une alternative.
- **Principe servi** : P5, P21.

## Express

- **Statut** : prévu (jalon « Serveur API »).
- **Rôle** : framework HTTP du backend (`apps/api`) : routes de l'API, authentification, rate
  limit, validation des requêtes. En phase gratuite, il est le point d'entrée du service unique
  et délègue à Next.js tout ce qui n'est pas l'API (jalon 007, D22).
- **Pourquoi** :
  - framework minimal et très répandu : un middleware par préoccupation transverse
    (session, organisation courante, rôle, rate limit, en-têtes de sécurité), ce qui place
    l'isolation des commerçants et la protection contre les abus en un seul endroit (P11, P12,
    P20) ;
  - il peut monter Next.js comme gestionnaire de requêtes, ce qui rend possible le service
    unique de la phase gratuite, puis se déploie seul au passage en plan payant sans changer le
    code de l'API ;
  - les schémas Zod partagés s'y branchent en middleware de validation (P4).
- **Alternatives écartées** :
  - Fastify : plus rapide et avec validation intégrée, mais la performance brute n'est pas un
    besoin, et sa validation repose sur JSON Schema plutôt que sur les schémas Zod partagés ;
  - NestJS : structure imposée (modules, décorateurs, injection de dépendances), plus lourde que
    ce que demande un développeur seul ; le découpage DDD se fait par dossiers sans framework.
    Réexaminé au jalon 010 et laissé écarté : l'architecture hexagonale cantonne le framework
    HTTP à l'infrastructure, et le branchement des adapters s'écrit dans un seul module, sans
    conteneur d'injection (D19) ;
  - backend dans les Route Handlers de Next.js : voir l'entrée Next.js.
- **Principe servi** : P4, P11, P12, P20.

## PostgreSQL

- **Statut** : prévu (jalon « Base de données »).
- **Rôle** : base de données du backend : organisations, membres, boutiques, commandes, produits,
  clients pseudonymisés, tâches de synchronisation, journal d'audit. Neon en production, région
  Frankfurt, et une base Docker en local.
- **Pourquoi** :
  - modèle relationnel adapté aux commandes, à leurs lignes et à leurs agrégats : les indicateurs
    s'agrègent côté serveur en SQL (P6), à partir de champs calculés par le domaine à
    l'écriture, pour qu'aucune règle métier ne s'écrive deux fois (jalon 010, D38) ;
  - transactions et contraintes : une synchronisation s'écrit en entier ou pas du tout, et
    l'organisation propriétaire de chaque ligne peut être imposée par la base, jusqu'à la
    sécurité au niveau des lignes si besoin (P11) ;
  - la table des tâches de synchronisation sert de file d'attente reprenable sans service de
    plus (jalon 007, D16) (P13, P14) ;
  - Neon : offre gratuite sans date d'expiration, région UE (P17), branches de base possibles
    pour les tests ; une base Docker locale suffit au développement, sans compte chez un service
    tiers (P1).
- **Alternatives écartées** :
  - PostgreSQL de Render : la base gratuite expire 30 jours après sa création ;
  - SQLite : un fichier sur disque, or le disque d'un service gratuit Render est éphémère et
    effacé à chaque redéploiement ;
  - MongoDB : les relations (organisation, boutique, commande, client) et les agrégats sont plus
    naturels en SQL.
- **Principe servi** : P1, P6, P11, P13, P14, P17.

## Render

- **Statut** : en place pour la démonstration actuelle, déployée après le passage de
  l'intégration continue (jalon 008) ; service unique interface + API prévu (jalon 007, D22).
- **Rôle** : hébergement. Un seul service web gratuit, en région Frankfurt, sert l'interface et
  l'API, et y exécute la synchronisation. Il est décrit dans un `render.yaml` versionné et
  redéployé à chaque commit sur `main`, une fois l'intégration continue passée.
- **Pourquoi** :
  - offre gratuite suffisante pour la démonstration et la phase de test : un processus Node
    complet, et non des fonctions à la demande, donc capable de faire tourner une
    synchronisation (jalon 007, D16) ;
  - région UE (P17) ;
  - déploiement automatique depuis GitHub, conditionné au succès de l'intégration continue ;
  - infrastructure décrite dans le dépôt (`render.yaml`) plutôt que configurée à la main.
- **Limites acceptées** : endormissement après 15 minutes sans requête (environ une minute de
  réveil), 750 heures d'instance par mois, pas de worker ni de tâche planifiée, pas de commande
  de pré-déploiement en plan gratuit. D'où la synchronisation déclenchée à la demande et à la
  visite (D16) et les migrations au démarrage (D22).
- **Alternatives écartées** :
  - Vercel : orienté fonctions à la demande, pas de processus durable pour la synchronisation
    ni de serveur personnalisé ;
  - deux services Render (interface et API) en phase gratuite : réveils en cascade et quota
    d'heures consommé deux fois (D22).
- **Principe servi** : P1, P17.

## GitHub Actions

- **Statut** : en place (jalon 008) : workflow `.github/workflows/ci.yml`, dont le job `checks`
  est exigé pour merger dans `develop` et `main`.
- **Rôle** : intégration continue. À chaque pull request vers `develop` ou `main` et à chaque
  push sur ces branches : installation, lint, vérification de types, tests et build ; avec le
  backend, tests d'intégration sur une base PostgreSQL jetable.
- **Pourquoi** :
  - le dépôt est sur GitHub : l'intégration continue y est intégrée et gratuite pour l'usage du
    projet ;
  - Render peut attendre le succès de ses vérifications avant de déployer (*After CI Checks
    Pass*) : une release dont un test échoue n'est pas mise en ligne ;
  - les tests écrits avant le code (P6) et les tests d'isolation (P11) ne servent que s'ils
    s'exécutent à chaque changement, pas seulement sur le poste du développeur.
- **Alternatives écartées** :
  - lancer les tests dans la commande de build de Render : bloque le déploiement, mais ne
    vérifie ni les branches ni les pull requests avant le merge.
- **Principe servi** : P6, P11, P21.

## Sentry

- **Statut** : prévu (jalon « Ouverture aux testeurs »).
- **Rôle** : suivi des erreurs, côté API et côté navigateur, en région UE. Désactivé quand sa
  configuration est absente (local, tests).
- **Pourquoi** :
  - avec quelques testeurs, une erreur ne se voit pas dans les journaux : il faut être prévenu,
    avec la pile d'appels et le contexte ;
  - offre gratuite, région UE (P17), masquage des données personnelles (P15) ;
  - désactivable : le produit se lance en local sans compte chez lui (P1).
- **Alternatives écartées** :
  - journaux seuls : pas d'alerte, et une rétention de quelques jours ;
  - outil auto-hébergé : un service de plus à faire tourner, impossible dans l'offre gratuite.
- **Principe servi** : P21, P13.

---

## Technologie retirée

### MSW (Mock Service Worker)

- **Rôle** (jusqu'en v0.1.1) : simuler l'API dans le navigateur avec des données de démonstration.
- **Pourquoi retiré** : actif en développement seulement, il laissait les appels d'API sans
  réponse (erreur 404) une fois l'application construite et lancée en production. Les routes
  d'API de Next.js appellent directement les données de démonstration et se comportent à
  l'identique en développement et en production, ce qui rendait MSW redondant.
- **Principe en jeu** : P1 et P2 dans leur version du jalon 005 (un lancement sans service à
  côté, quel que soit le mode ; une couche d'API qui est un vrai point d'accès, remplaçable par un
  backend).
