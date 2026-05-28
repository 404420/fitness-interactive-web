# Admin CMS Prototype

The current Admin CMS is a frontend-only local prototype. It is intentionally disabled in normal builds with:

```js
const ENABLE_LOCAL_ADMIN_PROTOTYPE = false;
```

This prototype is not production-ready. It has no real backend auth, no database, no server-side authorization, no object storage, and no RLS/access-policy layer.

## Current Mitigation

- Admin menu entry is hidden while `ENABLE_LOCAL_ADMIN_PROTOTYPE` is `false`.
- Directly opening the Admin page shows a locked warning.
- No default admin PIN is shipped in `defaultData`.
- Local admin content is not applied to the public app while the prototype flag is disabled.

## Private Local Testing

For local/private testing only:

1. Change `ENABLE_LOCAL_ADMIN_PROTOTYPE` to `true` in `index.html`.
2. Set `appData.adminPin` locally before logging in, for example through an imported local backup or browser console.
3. Do not deploy that change publicly.

The local test script enables the prototype in a VM-only replacement and sets a test PIN during execution. That does not change the production build.

## What The Prototype Can Manage

When explicitly enabled for private testing, the UI can edit local browser data for:

- exercises
- exercise animations
- training plans
- foods
- recipes
- meal templates
- nutrition rules

Changes are stored in `localStorage` under `eliteFitnessData`.

## Upload Validation

The prototype validates uploads in the browser only:

- Images: PNG, JPG, WebP, GIF
- Motion: GIF, MP4, WebM
- Max size: 2 MB

Uploaded files are stored as data URLs in local browser data. Larger videos should be placed in `assets/exercise-animations/` and referenced by URL during local testing.

## Production Requirements

A production Admin CMS must replace this prototype with:

- backend authentication
- persisted admin roles
- database schema and migrations
- server-side CRUD endpoints
- server-side input validation and sanitization
- object storage for images/videos
- access policies or RLS so admins can manage content and normal users can only read published content
- audit logging and a publish/draft workflow
- environment variables documented in `.env.example`

Do not treat the current local prototype as a secure production CMS.
