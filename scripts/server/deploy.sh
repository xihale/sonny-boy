#!/usr/bin/env bash
# Server-side deploy for sonny-boy.xeed.ink — invoked by the shared gx webhook
# runner (/usr/local/lib/webhook-deploy) or manually:
#   ssh gx, then
#   `runuser -u sonny-boy-ci -- env HOME=/home/sonny-boy-ci bash ~/sonny-boy/scripts/server/deploy.sh refs/heads/main`
#
# Static exhibition site: no build. fetch → checkout → git lfs pull →
# rsync into /srv/sonny-boy (Caddy serves it). Stills/faces/BGM keep stable
# filenames (not content-hashed), so the tree replaces wholesale — no attic.
set -Eeuo pipefail
umask 022
REF="${1:-refs/heads/main}"
BRANCH="${REF#refs/heads/}"
REPO=/home/sonny-boy-ci/sonny-boy
DEST=/srv/sonny-boy
LOCK=/home/sonny-boy-ci/.deploy.lock
RERUN=/home/sonny-boy-ci/.deploy-rerun
say() { printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
die() { say "FATAL: $*"; exit 1; }
cd "$REPO"
# One deploy at a time; a push that lands mid-deploy queues exactly one rerun
# (latest commit wins — the queued rerun fetches the newest sha anyway).
exec 9>"$LOCK"
if ! flock -n 9; then
  touch "$RERUN"
  say "deploy already running — queued one rerun"
  exit 0
fi
# The runner exports the pushed sha as ZP_PUSH_SHA (legacy name, all sites).
say "=== deploy start (${BRANCH}, sha=${ZP_PUSH_SHA:-unknown}) ==="
# The clone is disposable: drop any local drift before fetching.
git reset --hard -q
# Snapshot the running script BEFORE the fetch: bash keeps executing the old
# inode across the checkout, but $0 is just a path and resolves to the new
# file afterwards — path-to-path comparison can never detect the change.
SELF_SNAP=$(mktemp)
cat "$0" > "$SELF_SNAP"
# github.com is intermittently unreachable from this box. Retry until we hold
# the exact pushed commit. `git fetch && git checkout` alone would NOT abort
# under errexit: a failed non-final command of an AND-list is exempt.
WANT="${ZP_PUSH_SHA:-}"
ok=""
for attempt in 1 2 3 4 5; do
  if timeout 60 git fetch --depth=1 origin "$BRANCH"; then
    got=$(git rev-parse -q --verify FETCH_HEAD || true)
    if [ -z "$WANT" ] || [ "$got" = "$WANT" ]; then ok=1; break; fi
    say "fetch got ${got:-nothing}, want $WANT — attempt $attempt"
  else
    say "fetch failed — attempt $attempt"
  fi
  [ "$attempt" = 5 ] || sleep $((attempt * 5))
done
[ -n "$ok" ] || die "could not fetch $BRANCH (want ${WANT:-any tip}) — keeping last good deploy"
git checkout -q -B "$BRANCH" FETCH_HEAD
if ! cmp -s "$SELF_SNAP" "$REPO/scripts/server/deploy.sh"; then
  rm -f "$SELF_SNAP"; say "deploy.sh changed — re-execing"
  exec /bin/bash "$REPO/scripts/server/deploy.sh" "$@"
fi
rm -f "$SELF_SNAP"
# --- media: stills/faces/bgm are Git LFS objects ------------------------------
# Checkout smudges when the user's filters exist; `git lfs pull` is the
# guarantee (and the only path when filters are missing).
ok=""
for attempt in 1 2 3; do
  if timeout 300 git lfs pull; then ok=1; break; fi
  say "git lfs pull failed — attempt $attempt"
  [ "$attempt" = 3 ] || sleep $((attempt * 5))
done
[ -n "$ok" ] || die "git lfs pull failed — keeping last good deploy"
# A pointer file reaching the web root renders a broken image; refuse to publish.
if grep -rlqs 'version https://git-lfs.github.com/spec/v1' assets; then
  die "unsmudged LFS pointers remain under assets/"
fi
# --- publish ----------------------------------------------------------------
rsync -a --delete \
  --exclude=/.git --exclude=/src --exclude=/scripts \
  --exclude=/README.md --exclude=/.gitattributes --exclude=/.nojekyll \
  --chmod=Du=rwx,Dgo=rx,Fu=rw,Fgo=r \
  "$REPO/" "$DEST/"
printf '{"sha":"%s","branch":"%s","deployedAt":"%s"}\n' \
  "$(git rev-parse HEAD)" "$BRANCH" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$DEST/deploy-meta.json"
say "published $(git rev-parse --short HEAD) → $DEST"
say "=== deploy done ==="
if [ -e "$RERUN" ]; then
  rm -f "$RERUN"
  # Latest-wins: drop the pin so the rerun deploys whatever main is at fetch
  # time; the publish line logs the real sha.
  unset ZP_PUSH_SHA
  say "a newer push arrived during this deploy — running again"
  exec /bin/bash "$0" "$REF"
fi
