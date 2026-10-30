The production dashboard is a DigitalOcean App Platform static site. Main pushes
trigger a fresh provider build from the configured main branch and CI waits for
an ACTIVE deployment whose source commit matches that push. This replaces the
manual container publishing workflow, which did not update the static site.

Install the launcher in `~/.local/lib/opensensor-hosting/` and the service/timer
in `~/.config/systemd/user/` on the existing hosting operator account, then run
`systemctl --user daemon-reload` and
`systemctl --user enable --now opensensor-dashboard-release.timer`.
The agent uses that account's existing `gh` and `doctl` access. It changes no app
settings or credentials. Deployment IDs are checkpointed so a restart observes
the existing build rather than creating duplicate deployments.
