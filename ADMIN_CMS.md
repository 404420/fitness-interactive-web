# Admin CMS MVP

This project is a static single-page MVP. There is no backend, API server, database migration system, or real auth provider yet. The admin CMS therefore follows the existing architecture: content is stored in `localStorage` inside `eliteFitnessData`.

## Admin access

Open **Admin** from the menu and enter the local admin PIN.

- Default PIN: `2468`
- Role storage: `appData.userRole`
- Session flag: `appData.adminSession`

This is a frontend-only MVP gate. Before production, replace it with backend auth and server-side role checks.

## Manage exercises and animations

Admin can edit:

- name
- description
- muscle group
- `imageUrl`
- `animationUrl`
- `animationType`: `none`, `gif`, `webm`, `mp4`, `lottie`
- `sourceName`, `sourceUrl`, `license`, `attributionText`

Uploaded images/videos are stored as data URLs if they are under 2 MB. Larger videos should be placed in `assets/exercise-animations/` and referenced by URL.

## Manage nutrition content

Admin can edit:

- foods
- recipes
- meal templates
- nutrition rules

Recipes use comma-separated food IDs in the ingredient field. Allergy and diet filtering uses food `tags` and recipe `preferences`.

## Manage training plans

Training plans can be added or edited with:

- `id`
- `cardId`
- `goal`
- summary
- `days` JSON

The `days` JSON follows the existing `trainingPrograms` shape.

## Upload validation

Allowed files:

- Images: PNG, JPG, WebP, GIF
- Motion: GIF, MP4, WebM
- Max size: 2 MB

The app rejects unsupported formats and oversized files in the admin form.

## Production follow-up

For a production CMS, add:

- backend auth and admin roles
- real database tables/migrations
- server-side validation and sanitization
- object storage for images/videos
- audit log and publish/draft workflow
