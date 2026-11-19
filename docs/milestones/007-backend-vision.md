# Jalon 007 — Vision du backend ✅

Branche : `feature/backend-vision` (depuis `develop`). Livré dans : —

## Objectif

`docs/vision.md` décrit SalesPulse comme un service en ligne multi-commerçant, sur abonnement,
qui synchronise les boutiques de chaque commerçant. `docs/stack.md` et `docs/roadmap.md` sont
alignés sur cette vision, et la roadmap découpe le backend en jalons ordonnés, prêts à être
démarrés un par un.

## Contexte

- La vision du jalon 005 décrit un produit de démonstration : un seul commerçant, des données
  générées, aucun service externe (P1) et une interface qui ne change pas quand on branche un
  backend (P2). Le non-objectif « multi-commerçant » exclut les comptes distincts.
- Le jalon futur « Backend réel » fixe déjà des choix techniques (Express dans `apps/api`,
  PostgreSQL, Zod partagé via `@salespulse/contracts`, connecteurs WooCommerce puis Shopify et
  PrestaShop, déploiement Render + Neon). En revanche, le produit visé n'est écrit nulle part :
  qui se connecte, qui paie, comment les données arrivent, ce qu'on fait des données
  personnelles.
- Un brainstorm avec l'utilisateur (2026-11-19) a tranché ces questions. Plusieurs réponses
  changent la nature du produit, et donc la vision.

## Décisions

- **D1 (2026-11-19) — SaaS multi-commerçant** : chaque commerçant a son organisation, avec ses
  boutiques, ses membres et des données isolées de celles des autres. Le non-objectif
  « multi-commerçant » du jalon 005 (D6) est supprimé : c'est désormais le cœur du produit.
- **D2 (2026-11-19) — Inscription libre et abonnement payant** : n'importe qui crée son
  organisation, avec un essai gratuit puis un abonnement. Le modèle tarifaire (par boutique,
  par volume, par plan) sera tranché au jalon Facturation, et la vision ne le fixe pas.
- **D3 (2026-11-19) — Rôles Propriétaire / Administrateur / Lecteur** : le propriétaire gère
  l'organisation, les membres et l'abonnement ; l'administrateur gère les boutiques et les
  synchronisations ; le lecteur consulte. Les rôles portent sur la gestion, pas sur la
  visibilité : pas d'accès restreint par boutique, ce qui devient un non-objectif. Raison : la
  visibilité par boutique toucherait chaque filtre et chaque calcul.
- **D4 (2026-11-19) — Connexion par e-mail et mot de passe** : adresse vérifiée et
  réinitialisation du mot de passe, sans fournisseur d'identité externe. La connexion par
  compte Google et la double authentification pourront venir plus tard.
- **D5 (2026-11-19) — Démonstration = organisation fictive** : les générateurs actuels
  deviennent une plateforme de démonstration, branchée sur la même chaîne de synchronisation
  que les vraies plateformes. Un bouton « Voir la démo » sur la page de connexion ouvre une
  session en lecture seule, sans compte. P1 est réécrit dans ce sens.
- **D6 (2026-11-19) — Synchronisation périodique et manuelle** : synchronisation incrémentale
  planifiée, relançable à la demande, et import de l'historique au branchement. Les webhooks
  sont écartés pour l'instant, car il faudrait une adresse publique et une vérification des
  signatures, et ils sont plus difficiles à tester en local. Le non-objectif « temps réel » est
  conservé.
- **D7 (2026-11-19) — Pseudonymisation des clients finaux** : seuls l'identifiant externe et une
  empreinte de l'e-mail sont stockés, plus une localisation (pays, ville) quand un indicateur en
  a besoin. Pas de nom, d'e-mail ni d'adresse en clair. Le fichier client nominatif devient un
  non-objectif.
- **D8 (2026-11-19) — Calculs côté serveur dès le départ** : l'API expose des indicateurs et des
  séries agrégées, plus des listes brutes renvoyées au navigateur. Raison : le volume réel d'un
  commerçant (des dizaines de milliers de commandes) ne tient pas dans le navigateur. P2
  (« interface inchangée ») est abandonné dans sa forme actuelle et remplacé par « une
  plateforme se branche sans toucher au reste ». P6 précise que les règles s'exécutent côté
  serveur. Les hooks et une partie des composants seront réécrits.
- **D9 (2026-11-19) — Conformité** : hébergement dans l'Union européenne, identifiants des
  boutiques chiffrés et jamais renvoyés à l'interface, journal d'audit des actions sensibles.
  S'y ajoute l'effacement des données à la résiliation : en tant que sous-traitant RGPD des
  commerçants, SalesPulse y est tenu. L'export des données n'est pas retenu comme principe et
  reste dans la piste « Exports ».
- **D10 (2026-11-19) — Fin d'essai et impayé** : le tableau de bord reste consultable, mais la
  synchronisation est suspendue. Les données sont supprimées après un délai annoncé, dont la
  durée sera fixée au jalon Facturation.
- **D11 (2026-11-19) — Boutiques hors euros refusées** : le non-objectif « multi-devises » est
  conservé, et une boutique qui ne vend pas en euros ne peut pas être connectée.
- **D12 (2026-11-19) — Plateformes non nommées dans la vision** : `docs/vision.md` parle des
  « plateformes de boutique en ligne » sans les citer. Raison : la règle « aucun outil nommé »
  de `docs/project-docs-conventions.md`. La liste des plateformes et leur ordre sont dans la
  roadmap.
- **D13 (2026-11-19) — Identifiants des principes** : P1 à P10 gardent leur numéro. P1, P2, P3,
  P4, P6 et P7 changent de contenu, et P11 à P19 sont ajoutés. Les champs « Principe servi » de
  `docs/stack.md` sont revus en phase B.
- **D14 (2026-11-19) — Outils tranchés dans leur propre jalon** : bibliothèque
  d'authentification, accès à la base, planification des synchronisations, envoi d'e-mails et
  service de paiement sont choisis dans le jalon qui en a besoin. Ce jalon ne documente que les
  choix déjà faits : Express et PostgreSQL.
- **D15 (2026-11-19) — Vision du produit visé** : `docs/vision.md` décrit le produit cible. Une
  note de son introduction signale que l'implémentation (données de démonstration, sans
  comptes) est en transition, avec un renvoi à la roadmap. La note disparaîtra quand le backend
  sera livré.
- **D16 (2026-11-19) — Hébergement gratuit tant que le projet n'est pas prêt** : jusqu'à
  l'ouverture commerciale, le projet reste sur les plans gratuits de Render et de Neon, avec la
  démonstration en ligne et un accès pour des utilisateurs testeurs. Le plan gratuit de Render
  endort un service après 15 minutes sans requête et n'offre ni worker en arrière-plan ni tâche
  planifiée. La synchronisation est donc conçue comme des tâches enregistrées en base et
  reprenables (un curseur par tâche), indépendantes de l'endroit où elles s'exécutent. Trois
  déclencheurs gratuits : à la demande (bouton, branchement d'une boutique), à la visite quand la
  dernière synchronisation est trop ancienne, et en option un planificateur externe gratuit qui
  appelle un point d'accès protégé. Le passage en plan payant (worker et tâche planifiée)
  accompagne l'ouverture commerciale et n'ajoute qu'un déclencheur, sans changer le code métier.
  La vision ne change pas : P13 décrit le produit visé, pas l'hébergement de la phase de test.
- **D17 (2026-11-19) — Multi-devises prévu, pas livré** : le modèle de données est prêt pour
  plusieurs devises dès le socle API. Chaque montant est un entier en unités mineures avec son
  code ISO 4217, et l'organisation a une devise de référence, fixée à l'euro pour l'instant.
  Jusqu'au MVP compris, les boutiques hors euros restent refusées (D11). Un jalon futur
  « Multi-devises » ajoutera la conversion, au taux du jour de la commande et figé à la synchro
  (taux de référence quotidiens de la Banque centrale européenne, gratuits et sans clé), le
  choix de la devise de référence et la levée du refus. Raison : changer le modèle de données
  après coup obligerait à migrer toutes les données, alors que l'outillage de conversion peut
  attendre. Conséquences dans la vision : le multi-devises n'est plus un non-objectif mais une
  piste de la roadmap. Le non-objectif devient « Multilingue » seul, et P9 dit que chaque
  montant est conservé avec sa devise.
- **D18 (2026-11-19) — Inscription sur invitation pendant la phase de test** : tant que le projet
  reste en plan gratuit (D16), on ne s'inscrit qu'avec un code d'invitation ou un e-mail en
  liste blanche. Raison : le spam devient impossible, et l'on sait qui teste avec de vraies
  boutiques. L'inscription libre (D2) arrive à l'ouverture commerciale, avec ses protections
  (D19).
- **D19 (2026-11-19) — Rate limit et anti-spam** : réponse 429 avec `Retry-After`, et IP réelle
  lue derrière le proxy de l'hébergeur. Les limites :
  - globale par IP ;
  - connexion par IP et par e-mail, avec un délai progressif plutôt qu'un verrouillage dur, qui
    permettrait de bloquer un utilisateur ;
  - inscription par IP ;
  - réinitialisation du mot de passe et renvoi de vérification par e-mail et par IP ;
  - synchronisation manuelle et test de connexion d'une boutique par organisation ;
  - session de démonstration par IP.

  Le compteur est en mémoire tant qu'il n'y a qu'une instance, derrière une interface
  remplaçable par un stockage partagé. Contre le spam de comptes :
  - e-mail vérifié obligatoire, et compte non vérifié supprimé après 48 h ;
  - piège à robots (champ caché et délai minimal de soumission) ;
  - liste de domaines d'e-mails jetables ;
  - défi anti-robot par preuve de travail auto-hébergée (du type ALTCHA), sans service tiers
    (P1, P17) ;
  - réponses identiques que le compte existe ou non ;
  - quotas d'essai (nombre de boutiques, historique importé), qui protègent aussi le stockage
    gratuit.

  Les connecteurs respectent de leur côté les quotas des plateformes (ralentissement et
  nouvelles tentatives avec un délai croissant). Seuils et bibliothèques sont tranchés au jalon
  Authentification (D14). Cloudflare Turnstile est écarté : c'est un service tiers hors UE.
- **D20 (2026-11-19) — Principe P20** : la protection contre les abus entre dans la vision
  (P20, bloc « Confiance et conformité »), sans seuil ni outil nommé.
- **D21 (2026-11-19) — Pas d'e-mail transactionnel pendant la phase de test** : aucun envoi
  d'e-mail tant que l'inscription se fait sur invitation (D18).
  - Les codes d'invitation sont transmis à la main par l'administrateur de la plateforme.
  - Le code d'invitation tient lieu de vérification de l'adresse.
  - Un mot de passe oublié se réinitialise par un lien à usage unique, généré depuis le
    back-office et transmis à la main.

  La vérification par e-mail (P12, D19) et les e-mails de réinitialisation arrivent avec
  l'inscription libre, à l'ouverture commerciale. Le nom de domaine, nécessaire aux e-mails,
  peut donc attendre lui aussi, sauf s'il sert à partager le cookie de session entre
  l'interface et l'API. La vision ne change pas : P12 décrit le produit visé.
- **D22 (2026-11-19) — Un seul service web en phase gratuite** : un seul processus Node sert
  l'API et l'interface. `apps/api` exporte une application Express, qui monte les routes de
  l'API et délègue le reste à Next.js (serveur personnalisé). La synchronisation (D16) tourne
  dans ce même processus.
  - Raisons : avec deux services gratuits, le réveil à froid se fait en cascade (jusqu'à environ
    2 minutes pour la première page de la démonstration) et le quota de 750 heures est consommé
    deux fois. Un seul service, c'est un seul réveil, et l'interface et l'API partagent la même
    origine. Or `onrender.com` est sur la *Public Suffix List*, ce qui empêche de partager un
    cookie de session entre deux sous-domaines.
  - Coût accepté : le serveur personnalisé fait perdre l'optimisation statique automatique de
    Next.js, mais le dashboard est déjà entièrement dynamique.
  - Le service est décrit dans un `render.yaml` versionné, en région Frankfurt (P17). La base
    reste chez Neon, car la base gratuite de Render expire au bout de 30 jours.
  - La commande de pré-déploiement de Render étant payante, les migrations s'appliquent au
    démarrage.
  - Au passage en plan payant, l'API devient un service séparé, appelé par Next.js en proxy
    sur `/api`. Le code de l'API ne change pas, seul le point d'entrée change.
  - Alternative écartée pour la phase gratuite : deux services web (Next.js et API).
- **D23 (2026-11-19) — Intégration continue** : aujourd'hui, Render déploie `main` à chaque
  commit (déploiement continu), mais rien ne lance les tests automatiquement, et une release
  part même si un test échoue.
  - Un workflow GitHub Actions lance `npm ci`, `npm run lint`, `npm run typecheck` et
    `npm test` à chaque push et à chaque pull request.
  - L'auto-déploiement de Render passe de *On Commit* à *After CI Checks Pass* : pas de
    déploiement si les vérifications échouent.
  - Quand la base arrivera, le workflow lancera aussi les tests d'intégration sur une
    PostgreSQL jetable.
  - Utile dès maintenant et indépendant du backend, ce jalon peut passer avant le socle API.
- **D24 (2026-11-19) — Observabilité** : quatre éléments dès le déploiement en phase gratuite,
  pour savoir si quelque chose casse, pourquoi, et si les synchronisations vont bien, sans
  surcoût et sans donnée personnelle.
  - **Suivi des erreurs avec Sentry**, offre gratuite et région UE (P17), côté API et côté
    navigateur. Masquage des données personnelles activé (P15), aucun secret transmis (P16).
    Désactivé quand la variable de configuration est absente, donc en local et dans les tests
    (P1). Sentry est à déclarer parmi les sous-traitants ultérieurs.
  - **Journaux JSON structurés** : un identifiant par requête, l'organisation et la route, et
    jamais d'e-mail, de mot de passe, de jeton ni d'identifiant de boutique (P15, P16).
  - **Suivi des synchronisations en base** : la table des tâches (D16) garde le statut, la
    durée, le volume et l'erreur. Elle s'affiche dans l'interface (P13) et dans le back-office.
  - **Point d'accès `/health`** : il vérifie le processus et la base, et Render s'en sert pour
    ne basculer vers une nouvelle version que si elle répond.

  Les journaux ne sont pas conservés au-delà de la rétention de Render : ils servent à enquêter
  sur un problème récent, et l'historique durable est en base (tâches de synchronisation,
  journal d'audit P18). Écartés en phase gratuite : un service de journaux externe (un
  sous-traitant de plus), un outil de surveillance de disponibilité externe (il réveille le
  service et consomme le quota d'heures) et une stack de métriques (disproportionnée pour un
  développeur seul).
- **D25 (2026-11-19) — Principe P21** : Sentry ne servait aucun principe de la vision. Les
  conventions y voient un signal : retirer l'outil, ou compléter la vision. On complète la
  vision avec **P21 — Défauts détectés avant l'utilisateur** : chaque changement est vérifié
  avant sa mise en ligne, et une erreur en production remonte au développeur sans attendre
  qu'un utilisateur la signale. Sentry et GitHub Actions servent P21.

## Phase A — Vision ✅

- [x] `docs/vision.md` : problème (chiffres éparpillés, travail refait par chaque personne qui
      suit l'activité) ; utilisateurs (gérant, analyste, administrateur du compte, visiteur de
      la démo) ; proposition de valeur (service sur abonnement, boutiques branchées en quelques
      minutes, N-1 dès le premier jour, les mêmes chiffres pour toute l'équipe) ; non-objectifs
      (multi-commerçant supprimé, multi-devises sorti des non-objectifs (D17), accès restreint
      par boutique et fichier client nominatif ajoutés) ; principes P1 à P20 (D13, D20), P9 avec les
      montants conservés dans leur devise et les boutiques hors euros refusées tant que la
      conversion n'existe pas. Aucune bibliothèque,
      aucune plateforme ni aucun hébergeur nommé (D12). Note de transition (D15).

## Phase B — Stack ✅

- [x] `docs/stack.md`, Next.js : les routes `/api/...` de démonstration sont provisoires et
      disparaissent au profit de `apps/api` ; principes revus.
- [x] `docs/stack.md`, TanStack Query : nouveau rôle, il charge des agrégats calculés par le
      serveur (D8), le cache est partagé entre indicateurs et les filtres restent dans l'adresse.
- [x] `docs/stack.md`, Zod : il valide aussi la frontière entre une plateforme et le modèle
      commun (P4).
- [x] `docs/stack.md`, Faker : il alimente la plateforme de démonstration (P1, P3).
- [x] `docs/stack.md` : nouvelles entrées Express et PostgreSQL (Neon en production, Docker en
      local). Justifications marquées `(à confirmer)` puis validées avec l'utilisateur.
- [x] `docs/stack.md` : nouvelles entrées pour les services externes structurants, Render
      (hébergement, serveur unique en phase gratuite : D22) et GitHub Actions (intégration
      continue : D23), Sentry (suivi des erreurs : D24). Next.js est servi par un serveur
      personnalisé (D22).
- [x] `docs/stack.md` : chaque « Principe servi » renvoie à un principe existant de la nouvelle
      vision (D13).

## Phase C — Roadmap ✅

- [x] `docs/roadmap.md` : remplacer les pistes « Backend réel » et « Authentification et
      rôles » par la suite ordonnée des jalons du backend : intégration continue (D23), socle
      API, authentification et
      organisations, synchronisation et plateforme de démonstration, indicateurs côté serveur
      et gestion des boutiques, connecteur WooCommerce, déploiement UE et journal d'audit,
      facturation, connecteurs Shopify puis PrestaShop. Chaque piste dit son périmètre et ses
      prérequis.
- [x] `docs/roadmap.md` : le déploiement se fait sur les plans gratuits (démonstration et
      testeurs), avec des tâches de synchronisation reprenables et des déclencheurs gratuits
      (D16). Le passage en plan payant est rattaché à la facturation.
- [x] `docs/roadmap.md` : le socle API inclut des montants en unités mineures avec leur devise
      et une devise de référence par organisation. Nouvelle piste « Multi-devises » (D17) :
      taux quotidiens de la BCE, conversion au taux du jour de la commande figée à la synchro,
      remboursements au taux de la commande d'origine, montant dans la devise de la boutique
      pour les boutiques à plusieurs devises d'encaissement, choix de la devise de référence,
      levée du refus des boutiques hors euros, et en option une comparaison à taux constant.
- [x] `docs/roadmap.md` : la piste Authentification inclut l'inscription sur invitation (D18), le
      rate limit et les protections anti-spam (D19), ainsi que les bases de sécurité (mots de
      passe hachés en argon2id, cookie de session `HttpOnly` / `Secure` / `SameSite`, protection
      CSRF, CORS limité au domaine de l'interface, en-têtes de sécurité). La piste « ouverture
      commerciale » (facturation) inclut l'ouverture de l'inscription libre.
- [x] `docs/roadmap.md` : garder « Analytics réel », et rattacher « Exports » à la réversibilité
      des données (D9).

- [x] `docs/roadmap.md` : rattacher chaque sujet ouvert ci-dessous à la piste où il sera tranché
      (piste visée entre parenthèses), ou en faire une piste à part.
  - **Définitions métier (indicateurs côté serveur)** :
    - le chiffre d'affaires est-il HT ou TTC, et inclut-il la livraison et les remises ?
    - quels statuts de commande comptent (en attente, annulée, remboursée en partie) ?
    - comment traduire les statuts de chaque plateforme vers le modèle commun ?
  - **Fuseaux horaires (socle API)** : un fuseau par organisation (Europe/Paris par défaut) pour
    découper les jours, les semaines et les mois ; changements d'heure ; boutiques réglées sur
    un autre fuseau.
  - **Commandes modifiées ou supprimées côté boutique (synchronisation)** : synchronisation
    incrémentale sur la date de modification, détection des suppressions, rattrapage complet
    périodique.
  - **Architecture interface ↔ API** : tranché par D22 (un seul service, même origine). Reste à
    décider au socle API l'emplacement du point d'entrée du serveur unique.
  - **Nom de domaine (ouverture commerciale)** : nécessaire pour les e-mails (SPF, DKIM, DMARC)
    et la crédibilité. Plus nécessaire pour les cookies depuis D22.
  - **E-mails transactionnels (ouverture commerciale, D21)** : vérification, invitation,
    réinitialisation, échec de synchronisation. Fournisseur avec offre gratuite et hébergé dans
    l'UE, et délivrabilité.
  - **Migrations et données de départ (socle API)** : migrations versionnées, appliquées au
    démarrage du service (D22, pas de commande de pré-déploiement en plan gratuit) ; création
    de l'organisation de démonstration.
  - **Démonstration qui vieillit (synchronisation)** : les données fictives doivent suivre la date
    du jour (fenêtre glissante), et l'organisation de démonstration doit pouvoir se
    réinitialiser.
  - **Stratégie de tests du backend (socle API)** :
    - tests d'intégration sur une vraie base, de façon jetable (Docker) ;
    - tests d'isolation entre organisations (P11) ;
    - connecteurs testés sur des réponses de plateforme enregistrées ;
    - extension des conventions TDD et de la couverture à `apps/api`.
  - **CI/CD** : tranché par D23. Restent en option :
    - une branche de base Neon par branche Git ;
    - **pull requests et protection de branche (jalon Intégration continue)**. Aujourd'hui, le
      merge se fait en local puis on pousse, si bien que le CI détecte un échec après le merge
      dans `develop` (Render protège seulement `main`). Variante légère sans changer d'outil :
      pousser `feature/*`, attendre le vert, puis merger. Variante complète : merger par pull
      request (« Create a merge commit », l'équivalent de `--no-ff`), avec une protection de
      branche qui exige le CI au vert sur `develop` et `main`. C'est gratuit, le dépôt étant
      public. Cette variante demande d'adapter `docs/gitflow.md` (fichier générique).
  - **Observabilité** : tranché par D24. Reste à répartir entre les pistes : journaux et
    `/health` au socle API, suivi des synchronisations au jalon synchronisation, Sentry au
    déploiement. Durée exacte de rétention des journaux Render à vérifier.
  - **Configuration et secrets (socle API)** :
    - variables d'environnement validées au démarrage ;
    - clé de chiffrement des identifiants de boutique et sa rotation (P16) ;
    - séparation développement / production.
  - **Contrat et évolution de l'API (indicateurs côté serveur)** : l'interface et l'API sont
    déployées séparément, donc il faut des changements rétrocompatibles ou versionnés. En option,
    une documentation OpenAPI générée depuis les schémas Zod.
  - **Performance (indicateurs côté serveur)** : index, agrégats journaliers pré-calculés par la
    synchronisation, cache ; réveil de la base Neon après une mise en veille.
  - **Observabilité (déploiement)** :
    - journaux structurés, sans donnée personnelle ni secret (P15, P16) ;
    - suivi des erreurs et point de contrôle de santé ;
    - suivi des synchronisations (durée, volume, échecs) ;
    - alerte en cas d'échec répété.
  - **Sauvegardes et restauration (déploiement)** :
    - rétention de l'offre gratuite de Neon à vérifier ;
    - test de restauration ;
    - les commandes se resynchronisent depuis les boutiques, mais pas les comptes, les
      organisations ni le journal d'audit.
  - **Cycle de vie des comptes (authentification)** : changement d'e-mail, suppression d'un
    utilisateur, transfert de propriété, départ du dernier propriétaire.
  - **Branchement d'une boutique (connecteurs)** :
    - WooCommerce : clés REST en lecture seule ;
    - Shopify : une application publique demande un compte partenaire et une revue, sinon une
      distribution personnalisée boutique par boutique ;
    - PrestaShop : clé de webservice ;
    - test de la connexion et contrôle de la devise (D11).
  - **Back-office plateforme (authentification, puis facturation)** : gestion des invitations
    (D18), vue des organisations et des synchronisations en échec, quotas.
  - **Juridique et RGPD (ouverture commerciale ; une partie dès les testeurs)** :
    - mentions légales, conditions d'utilisation et de vente, politique de confidentialité ;
    - accord de sous-traitance avec les commerçants, liste des sous-traitants ultérieurs
      (hébergeur, base, e-mails), registre des traitements ;
    - procédure en cas de fuite de données (notification à la CNIL sous 72 h) ;
    - cookies limités au strict nécessaire, donc sans bandeau.

## Phase D — CLAUDE.md ✅

- [x] `CLAUDE.md` : le paragraphe « Projet » dit que le dashboard, aujourd'hui alimenté par des
      données de démonstration, est en transition vers un SaaS multi-commerçant, avec un renvoi à
      `docs/vision.md`.

## Journal

- 2026-11-19 : brainstorm de la vision du backend avec l'utilisateur, décisions D1 à D15. Plan
  et nouvelle version de `docs/vision.md` rédigés pour validation.
- 2026-11-19 : vérifié sur render.com que le plan gratuit endort un service web après 15 minutes
  sans requête (redémarrage en une minute environ), plafonne à 750 heures d'instance par mois et
  par espace de travail, et n'offre ni worker en arrière-plan ni tâche cron (payants). D'où D16.
  Le monolithe modulaire (un seul backend découpé par contexte DDD, sans microservices) a été
  évoqué. L'utilisateur ne veut pas l'inscrire pour le moment.
- 2026-11-19 : multi-devises prévu dans le modèle mais pas livré (D17). Sécurité : aucun rate
  limit n'était prévu, d'où D18 à D20 et le principe P20 ajouté à la vision.
- 2026-11-19 : inventaire des sujets ouverts du backend (définitions métier, fuseaux horaires,
  domaine et cookies, tests, CI, observabilité, sauvegardes, juridique…), notés en phase C pour
  être rattachés aux pistes de la roadmap. Constaté au passage : le dépôt n'a ni intégration
  continue ni configuration de déploiement versionnée.
- 2026-11-19 : pas d'e-mail transactionnel pendant la phase de test (D21). Vérifié sur
  render.com :
  - plusieurs services web gratuits sont possibles, mais ils partagent les 750 heures ;
  - la commande de pré-déploiement est réservée aux plans payants ;
  - le réglage *After CI Checks Pass* ne déploie pas si les vérifications GitHub échouent, ni si
    aucune vérification n'est détectée.

  D'où D22 (un seul service web) et D23 (intégration continue). L'observabilité est proposée
  dans les sujets ouverts, sans décision pour l'instant.
- 2026-11-19 : observabilité tranchée (D24) : Sentry en région UE côté API et navigateur,
  journaux JSON structurés, suivi des synchronisations en base, `/health`. Pas de conservation
  des journaux au-delà de Render.
- 2026-11-19 : phase A faite, `docs/vision.md` réécrit (principes P1 à P20). Le grep des
  critères d'acceptation ne trouve aucune bibliothèque, plateforme ni hébergeur dans la vision.
- 2026-11-19 : phase B rédigée. `docs/stack.md` mis à jour (Next.js, React, TypeScript,
  TanStack Query, Zod, Faker, Vitest) et complété par cinq entrées marquées « Statut : prévu »
  (Express, PostgreSQL, Render, GitHub Actions, Sentry). Toutes les justifications nouvelles sont
  marquées `(à confirmer)` en attente de validation.
- 2026-11-19 : discuté le retrait de TanStack Query et de Faker pour le MVP : on garde les deux.
  TanStack Query évite de recoder la déduplication, l'abandon des réponses périmées et les
  nouvelles tentatives dans 55 composants, et les Server Components seront à réévaluer après
  le MVP. Faker reste nécessaire à la démonstration et à l'analytics simulé, et il passera en
  dépendance d'exécution au jalon Synchronisation. Les deux points sont notés dans `docs/stack.md`.
- 2026-11-19 : clarifié que D23 comble le trou du CI (le CD existait déjà avec Render). Pull
  requests et protection de branche notées comme sujet ouvert du jalon Intégration continue.
  P21 ajouté à la vision (D25).
- 2026-11-19 : justifications de `docs/stack.md` validées par l'utilisateur, plus aucun
  `(à confirmer)`. Phase B terminée.
- 2026-11-19 : phase C faite. Les « Jalons futurs » de `docs/roadmap.md` présentent la suite
  ordonnée du backend en 12 jalons : intégration continue, socle API, authentification et
  organisations, synchronisation et démonstration, indicateurs côté serveur et gestion des
  boutiques, WooCommerce, ouverture aux testeurs, facturation, ouverture commerciale, Shopify,
  PrestaShop, multi-devises. Choix de l'utilisateur : un déploiement minimal dans le socle API
  (chaque release sur `main` est redéployée par Render, il faut donc que le backend y soit
  déployable dès la première), et la facturation séparée de l'ouverture commerciale. Chaque
  sujet ouvert est rattaché à un jalon. Les pistes « Backend réel » et « Authentification et
  rôles » sont remplacées. Une piste « Server Components à la place de TanStack Query » est
  ajoutée, issue de la revue de la stack.
- 2026-11-19 : phase D faite, le paragraphe « Projet » de `CLAUDE.md` signale la transition vers
  un SaaS multi-commerçant et renvoie à la roadmap.
- 2026-11-19 : jalon clos. Critères d'acceptation vérifiés, Bilan rempli.

## Workflow Git

Un `docs:` pour ce plan (fichier du jalon et index de la roadmap), un `docs:` pour la vision
(phase A), un `docs:` pour la stack (phase B), un `docs:` pour la roadmap et `CLAUDE.md`
(phases C et D), puis un `docs:` pour clore le jalon.

## Critères d'acceptation

- `grep -niE "next\.js|react|vitest|npm|zod|tanstack|recharts|faker|express|postgres|neon|render|docker|stripe|woocommerce|shopify|prestashop|src/" docs/vision.md`
  ne trouve rien.
- Chaque principe cité dans `docs/stack.md` existe dans `docs/vision.md`, et chaque entrée de la
  stack sert au moins un principe.
- `grep -n "à confirmer" docs/stack.md` ne trouve rien.
- Les jalons futurs du backend dans `docs/roadmap.md` couvrent toutes les décisions D1 à D25.
- `npm test`, `npm run lint` et `npm run typecheck` sans erreur.

## Bilan

Livré :
- `docs/vision.md` réécrit pour un SaaS multi-commerçant sur abonnement :
  - utilisateurs : gérant, analyste, administrateur du compte, visiteur de la démonstration ;
  - non-objectifs revus : multi-commerçant supprimé, multi-devises sorti au profit d'une piste,
    accès restreint par boutique et fichier client nominatif ajoutés ;
  - principes P1 à P21, dont P1, P2, P4, P6 et P7 réécrits.
- `docs/stack.md` aligné :
  - sept entrées revues (Next.js, React, TypeScript, TanStack Query, Zod, Faker, Vitest) ;
  - cinq entrées « Statut : prévu » (Express, PostgreSQL, Render, GitHub Actions, Sentry) ;
  - toutes les justifications validées par l'utilisateur.
- `docs/roadmap.md` : suite ordonnée de 12 jalons du backend, chacun avec ses prérequis, son
  périmètre et ses sujets ouverts, et pistes existantes réorganisées.
- `CLAUDE.md` : le paragraphe « Projet » signale la transition.
- 25 décisions (D1 à D25), issues du brainstorm avec l'utilisateur.

Écarts avec le plan :
- Les décisions D16 à D25 sont nées pendant le jalon, au fil des questions de l'utilisateur :
  - hébergement gratuit et synchronisation par tâches reprenables (D16) ;
  - multi-devises prévu dans le modèle, sans être livré (D17) ;
  - sécurité : inscription sur invitation, rate limit, anti-spam, P20 (D18 à D20) ;
  - pas d'e-mail transactionnel en phase de test (D21) ;
  - serveur unique (D22), intégration continue (D23), observabilité (D24) ;
  - P21 (D25).
- La vision compte 21 principes au lieu des 19 prévus : P20 pour la protection contre les abus,
  P21 pour les défauts détectés avant l'utilisateur, ce dernier ajouté parce que Sentry ne
  servait aucun principe.
- Le multi-devises n'est plus un non-objectif mais une piste de la roadmap (D17). La règle
  « refuser les boutiques hors euros » vit désormais dans P9.
- Phases C et D commitées séparément, alors que le plan les regroupait. Le commit de la vision
  a été amendé pour y inclure la case de la phase A, oubliée par un script en échec (branche
  locale, non poussée).
- Ajout d'une piste « Server Components à la place de TanStack Query », à réévaluer après le
  MVP, issue de la discussion sur la stack.
- Évoqué sans être retenu pour l'instant : le monolithe modulaire (un seul backend découpé par
  contexte DDD, sans microservices).

Vérifications réellement faites le 2026-11-19 :
- le grep de `docs/vision.md` (critère d'acceptation, élargi à Sentry, GitHub, ALTCHA et
  Cloudflare) ne trouve rien ;
- chaque principe cité dans `docs/stack.md` existe dans `docs/vision.md`, et chaque entrée de
  la stack sert au moins un principe ;
- `grep -c "à confirmer" docs/stack.md` renvoie 0 ;
- chaque décision qui a une suite pratique (D1 à D11, D15 à D19, D21 à D24) apparaît dans
  `docs/roadmap.md`. D12 à D14, D20 et D25 sont des règles de documentation, déjà appliquées ;
- les 18 sujets ouverts sont rattachés à un jalon de la roadmap ;
- aucune ligne de plus de 100 caractères dans la roadmap, la vision et la stack ;
- `npm test` (58 fichiers, 620 tests), `npm run lint` et `npm run typecheck` sans erreur.

Non vérifié, à faire dans les jalons concernés : la durée de rétention des journaux sur
l'offre gratuite de Render (environ 7 jours), et celle des sauvegardes sur l'offre gratuite de
Neon.

Décisions reportées dans la documentation durable :
- D1 à D11, D15, D17, D20 et D25 dans `docs/vision.md` ;
- D8, D16 et D22 à D24 dans `docs/stack.md` ;
- toutes les décisions qui ont une suite pratique dans les pistes de `docs/roadmap.md`.

Les règles d'architecture du backend (découpage de `apps/api`, serveur unique) entreront dans
la section « Architecture » de `CLAUDE.md` au jalon Socle API, quand le code existera. Aucun
changement visible pour l'utilisateur : le README reste inchangé, et aucune release n'est
nécessaire.
