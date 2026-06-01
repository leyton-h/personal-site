# leytonh.com

My personal site + blog. Hand-built Jekyll (no theme), deployed to GitHub Pages,
domain via Cloudflare.

## Writing a new post

Add a Markdown file to `_posts/` named `YYYY-MM-DD-slug.md`:

```markdown
---
layout: post
title: "Your title"
subtitle: "Optional one-liner under the title"
date: 2026-06-01 09:00:00 -0500
tags: [building, medicine]
reading_time: 4 min read
---

Your post in Markdown.
```

Push to `main` and GitHub Actions builds + deploys automatically.

## Editing pages

- `about.md` — bio + contact
- `projects.md` — work
- `bookshelf.md` — reading list
- `index.html` — homepage hero + sections
- `_config.yml` — site title, email, social handles

## Local preview

```bash
bundle install
bundle exec jekyll serve --livereload
# → http://localhost:4000
```

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`. In the repo:
**Settings → Pages → Source → GitHub Actions** (one-time).

Custom domain is set via the `CNAME` file (`leytonh.com`) + Cloudflare DNS.
