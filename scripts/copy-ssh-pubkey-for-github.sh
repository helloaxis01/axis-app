#!/usr/bin/env bash
# One-shot: copy OpenSSH public key to clipboard for GitHub → Settings → SSH keys → New SSH key.
set -euo pipefail
PUB="${HOME}/.ssh/id_ed25519.pub"
if [[ ! -f "$PUB" ]]; then
  echo "No key at $PUB"
  echo "Create one with:"
  echo "  ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N \"\""
  exit 1
fi
lines=$(wc -l < "$PUB" | tr -d ' ')
if [[ "$lines" != "1" ]]; then
  echo "Expected exactly one line in $PUB (found $lines). Open the file and remove extra blank lines, or regenerate the key."
  exit 1
fi
if ! grep -q '^ssh-ed25519 ' "$PUB"; then
  echo "$PUB must start with: ssh-ed25519 "
  exit 1
fi
tr -d '\r\n' < "$PUB" | pbcopy
echo "Copied to clipboard."
echo ""
echo "Next (do these in order):"
echo "  1. GitHub.com → your profile (top right) → Settings"
echo "  2. SSH and GPG keys → New SSH key"
echo "  3. Title: anything (e.g. Mac)"
echo "  4. Key type: Authentication Key"
echo "  5. Click in the Key box → Paste (Cmd+V) ONCE — no spaces before the line"
echo "  6. Add SSH key"
echo ""
echo "Then in Terminal:"
echo "  ssh -T git@github.com"
echo "  cd \"$(dirname "$0")/..\""
echo "  git push axis-app-beryl main"
