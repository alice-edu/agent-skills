#!/usr/bin/env bash
# Links these skills into Claude Code and Codex, from this checkout:
#   ~/.agents/skills/<name> -> <repo>/skills/<name>   (Codex reads these)
#   ~/.agents/pr-flow       -> <repo>/pr-flow          (the shared rules)
#   ~/.claude/skills/<name> -> ~/.agents/skills/<name> (Claude Code)
# Safe to run again. Anything else already at those paths is moved to
# ~/.agents/backup-<time>/ first. Update later with `git pull`.
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
agents="$HOME/.agents"
backup="$agents/backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$agents/skills" "$HOME/.claude/skills"

link() { # link <target> <path>
  if [ -L "$2" ] && [ "$(readlink "$2")" = "$1" ]; then return; fi
  if [ -e "$2" ] || [ -L "$2" ]; then
    mkdir -p "$backup"
    mv "$2" "$backup/$(basename "$(dirname "$2")")-$(basename "$2")"
  fi
  ln -s "$1" "$2"
}

link "$here/pr-flow" "$agents/pr-flow"
for dir in "$here"/skills/*/; do
  s=$(basename "$dir")
  link "$here/skills/$s" "$agents/skills/$s"
  link "$agents/skills/$s" "$HOME/.claude/skills/$s"
done

me="$here/pr-flow/me.md"
if [ ! -f "$me" ]; then
  default_gh=$(gh api user --jq .login 2>/dev/null || true)
  read -r -p "Your name (as teammates know you): " name
  read -r -p "Your Slack member ID (Slack: your profile > ⋯ > Copy member ID): " slack_id
  read -r -p "Your GitHub login [${default_gh}]: " github
  github=${github:-$default_gh}
  sed -e "s|__NAME__|$name|" -e "s|__SLACK_ID__|$slack_id|" -e "s|__GITHUB__|$github|" \
    "$here/pr-flow/me.example.md" > "$me"
fi

echo "Linked $(ls "$here/skills" | wc -l | tr -d ' ') skills and the shared rules from $here."
[ -d "$backup" ] && echo "Earlier copies moved to $backup."
echo "Restart Claude Code and Codex to pick them up."
