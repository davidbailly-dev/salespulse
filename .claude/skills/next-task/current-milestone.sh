#!/usr/bin/env bash
# Affiche le jalon associé à la branche courante : son chemin, puis son titre, ses phases et les
# cases restant à cocher. Le jalon porte le nom de la branche sans son préfixe
# (feature/xxx -> docs/milestones/NNN-xxx.md).
# Script séparé du SKILL.md : une commande `!` avec substitutions imbriquées ne peut pas être
# vérifiée par le contrôle de permissions de Claude Code.
set -u

cd "$(git rev-parse --show-toplevel)" || exit 1

branch=$(git branch --show-current)
name=${branch#*/}

if [ -n "$name" ]; then
    for file in docs/milestones/*-"$name".md; do
        if [ -f "$file" ]; then
            echo "$file"
            grep -nE '^# |^## Phase|^- \[ \]' "$file"
            exit 0
        fi
    done
fi

echo "Aucun jalon associé à la branche courante."
