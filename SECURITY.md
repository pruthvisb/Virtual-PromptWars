# Security Policy - EcoVerse

This document details the security posture, credentials setup, environment variables configuration, and remediation guidelines for the **EcoVerse** application.

---

## 🔒 Security Principles

1. **Zero Secret Storage in Source Control**: 
   - No private Firebase configurations, PostgreSQL passwords, or OAuth tokens are allowed inside the tracked Git repository files.
2. **Environment Variable Injection**: 
   - Public-facing and private backend credentials must be injected dynamically at compile-time or runtime using `.env` configurations.
3. **Local Database Hardening**: 
   - Production/development database connections must read passwords through environment parameters rather than hardcoded configuration blocks.

---

## 🔑 Environment Configuration

A template file [.`env.example`](file:///c:/Users/AstroCluster/Desktop/physics/.env.example) is provided in the repository root showing all necessary configuration keys:

- **Frontend Variables (Vite)**: Labeled with `VITE_` prefix to make them accessible to client-side code during compilation.
- **Backend Variables (PHP/Node)**: Read via `process.env` in Express or `getenv()` in PHP.

### Credentials Sanitization Checklist
- [x] Verify `.env` is ignored by Git in [`.gitignore`](file:///c:/Users/AstroCluster/Desktop/physics/.gitignore).
- [x] Verify Firebase service accounts (`firebase-service-account.json`) are git-ignored.
- [x] Verify local development logs and npm trace caches are ignored.

---

## 🧹 Git History Remediation

If a credential is accidentally committed to a public branch:
1. **Rotate Keys**: Immediately invalidate and rotate the compromised credential in the respective provider console (e.g. Google Cloud / Firebase console).
2. **Scrub History**: Use Git rewrite commands to completely purge the secret from all past commits:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch path/to/file" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. **Force Push**: Force push the clean branch to origin:
   ```bash
   git push origin main --force
   ```
