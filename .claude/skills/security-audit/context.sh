#!/usr/bin/env bash
# Contexte injecté au lancement de /security-audit : dépôt, branche de base, changements, stack,
# documents d'exigences, outils disponibles et audits de dépendances.
# Générique : ne suppose rien du projet, chaque section s'adapte à ce qu'elle trouve.
# Script séparé du SKILL.md : une commande `!` avec substitutions imbriquées ne peut pas être
# vérifiée par le contrôle de permissions de Claude Code.
set -u

cd "$(git rev-parse --show-toplevel 2>/dev/null)" || {
    echo "Hors dépôt Git : mode diff indisponible, seul le mode full a un sens."
    exit 0
}

section() { printf '\n### %s\n\n' "$1"; }

# --- Dépôt et branche de base -------------------------------------------------------------------

section "Dépôt"

branch=$(git branch --show-current)
echo "Branche courante : ${branch:-(HEAD détachée)}"

# Branche de base : parmi develop, main et master (hors branche courante), celle dont HEAD est le
# moins en avance, puis le moins en retard (une hotfix partie de main n'a aucun retard sur main).
base=""
best=""
for candidate in develop main master; do
    [ "$candidate" = "$branch" ] && continue
    git rev-parse --verify --quiet "$candidate" >/dev/null || continue
    ahead=$(git rev-list --count "$candidate..HEAD")
    behind=$(git rev-list --count "HEAD..$candidate")
    score=$(printf '%08d%08d' "$ahead" "$behind")
    if [ -z "$best" ] || [[ "$score" < "$best" ]]; then
        best=$score
        base=$candidate
    fi
done

if [ -n "$base" ]; then
    merge_base=$(git merge-base "$base" HEAD)
    echo "Branche de base détectée : $base (point de divergence ${merge_base:0:9})"
else
    echo "Aucune branche de base détectée (develop, main, master) : préciser \`diff <branche>\`."
fi

# --- Changements par rapport à la base ----------------------------------------------------------

section "Changements depuis la base (commits et arbre de travail)"

if [ -n "$base" ]; then
    echo "Commits :"
    git log --oneline "$merge_base..HEAD" | head -n 30
    echo
    echo "Fichiers modifiés (point de divergence → arbre de travail) :"
    git diff --stat=100 "$merge_base" | tail -n 60
fi
untracked=$(git ls-files --others --exclude-standard | head -n 30)
if [ -n "$untracked" ]; then
    echo
    echo "Fichiers non suivis :"
    echo "$untracked"
fi

# --- Stack et configuration ---------------------------------------------------------------------

section "Manifestes, configuration et déploiement suivis par Git"

git ls-files | grep -E '(^|/)(package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|composer\.(json|lock)|pyproject\.toml|requirements[^/]*\.txt|Pipfile(\.lock)?|poetry\.lock|go\.(mod|sum)|Cargo\.(toml|lock)|Gemfile(\.lock)?|pom\.xml|build\.gradle(\.kts)?|[^/]+\.csproj|Dockerfile[^/]*|(docker-)?compose[^/]*\.ya?ml|\.gitlab-ci\.yml|render\.yaml|vercel\.json|netlify\.toml|fly\.toml|[^/]+\.tf|\.env[^/]*|\.npmrc|\.gitignore|\.node-version|\.nvmrc)$|^\.github/(workflows/[^/]+|dependabot\.ya?ml|CODEOWNERS)$|^\.claude/|\.mcp\.json$' \
    | grep -v '/node_modules/' | head -n 80

# --- Exigences documentées ----------------------------------------------------------------------

section "Documents d'exigences candidats (sécurité, vision, menaces, architecture)"

docs=$(git ls-files | grep -iE '^README\.md$|(^|/)(CLAUDE|AGENTS|SECURITY)\.md$|(^|/)docs?/[^/]*(secur|vision|threat|menace|privacy|confidential|rgpd|gdpr|architecture|domain)[^/]*\.md$' | head -n 30)
echo "${docs:-Aucun.}"

# --- Outils d'analyse disponibles ---------------------------------------------------------------

section "Outils d'analyse disponibles"

for tool in gitleaks semgrep osv-scanner trivy pip-audit composer cargo-audit; do
    if command -v "$tool" >/dev/null 2>&1; then
        echo "- $tool : disponible"
    else
        echo "- $tool : absent"
    fi
done

# --- Audits de dépendances ----------------------------------------------------------------------

if [ -f package-lock.json ] && command -v npm >/dev/null 2>&1; then
    section "npm audit, dépendances de production (--omit=dev)"
    npm audit --omit=dev 2>&1 | tail -n 40
    section "npm audit, toutes dépendances (total)"
    npm audit 2>&1 | tail -n 4
fi

if [ -f composer.lock ] && command -v composer >/dev/null 2>&1; then
    section "composer audit"
    composer audit --no-interaction 2>&1 | tail -n 40
fi

exit 0
