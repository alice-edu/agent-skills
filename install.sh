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
    mv "$2" "$backup/$(echo "${2#"$HOME"/}" | tr / -)"
  fi
  ln -s "$1" "$2"
}

link "$here/pr-flow" "$agents/pr-flow"
# Every Claude Code setup: ~/.claude, and others beside it (~/.claude-second, for a second
# account run with CLAUDE_CONFIG_DIR) that have a skills folder.
claudes=("$HOME/.claude/skills")
for d in "$HOME"/.claude-*/skills; do [ -d "$d" ] && [ ! -L "$d" ] && claudes+=("$d"); done
for dir in "$here"/skills/*/; do
  s=$(basename "$dir")
  link "$here/skills/$s" "$agents/skills/$s"
  for c in "${claudes[@]}"; do link "$agents/skills/$s" "$c/$s"; done
done
# A skill that's been removed from here leaves broken links: clear them.
for d in "$agents/skills" "${claudes[@]}"; do
  for l in "$d"/*; do
    if [ -L "$l" ] && [ ! -e "$l" ]; then
      case "$(readlink "$l")" in "$here"/* | "$agents"/* | "$HOME/.claude/skills"/*) rm "$l" ;; esac
    fi
  done
done

# A skill's scripts with their own dependencies get them installed.
for pkg in "$here"/skills/*/scripts/package.json; do
  [ -f "$pkg" ] || continue
  if command -v npm >/dev/null; then
    (cd "$(dirname "$pkg")" && npm install --silent --no-audit --no-fund &&
      if grep -q '"playwright"' package.json; then npx --no-install playwright install chromium >/dev/null; fi) ||
      echo "Couldn't install $(dirname "$pkg")'s dependencies: run npm install and npx playwright install chromium there."
  else
    echo "npm not found: run npm install in $(dirname "$pkg") for that skill's script."
  fi
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
