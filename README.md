# leytonh.com

My personal site — a single, minimal page. Hand-built Jekyll (no theme),
deployed to GitHub Pages, domain via Cloudflare.

## Editing

- `index.html` — the whole page (bio + sections: About, Writing, Work, Bookshelf)
- `assets/css/style.css` — the minimal stylesheet
- `_config.yml` — site title + social handles

## Writing a post (optional)

Add a Markdown file to `_posts/` named `YYYY-MM-DD-slug.md`:

```markdown
---
layout: post
title: "Your title"
date: 2026-06-01 09:00:00 -0500
---

Your post in Markdown.
```

Posts automatically appear under the **Writing** section on the homepage.

## Local preview

```bash
bundle exec jekyll serve --livereload
# → http://localhost:4000
```

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and
deploys to GitHub Pages. Custom domain is set via the `CNAME` file + Cloudflare DNS.
