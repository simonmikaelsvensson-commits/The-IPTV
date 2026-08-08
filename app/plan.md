# TheIPTV Android TV — Implementation Plan

## Problem
Build an Android TV (Smart TV) app named TheIPTV that plays M3U/HLS channels and connects to a backend API to update and edit users.

## Approach
- Android client (Kotlin) targeting Android TV (Leanback) using ExoPlayer for HLS playback.
- M3U playlist parser with channel list and optional EPG support later.
- Backend REST API (Node.js + Express) with PostgreSQL for user management and authentication (JWT tokens).
- Secure endpoints for /users (CRUD) and an admin role for editing/updating users.

## Key components / files
- app/ (Android Kotlin)
  - MainActivity.kt, PlayerActivity.kt, ChannelListFragment.kt
  - data/M3UParser.kt, data/PlaylistRepository.kt
  - network/ApiClient.kt, auth/AuthManager.kt
- backend/ (Node.js)
  - server.js, routes/users.js, controllers/usersController.js, db/
  - migrations/, models/user.js
- docs/README.md (setup and API spec)

## Todos
(Also inserted into session todo DB)
- setup-project: Create Android TV project skeleton and base navigation
- implement-player: Integrate ExoPlayer, HLS playback, M3U parsing
- ui-channel-browser: Build channel list, channel details, and EPG placeholder
- backend-setup: Initialize Node.js backend, DB schema, and migrations
- backend-users-api: Implement /users CRUD endpoints with validation and tests
- integrate-auth: Implement JWT auth, token refresh, and app login flow
- add-config-and-settings: Playlist import, settings, and user management UI
- testing-and-ci: Add basic tests and CI for backend and Android

## Notes / Decisions
- Initial scope: M3U/HLS + user management API. DRM, RTSP, and advanced EPG are out-of-scope for v1.
- Recommend ExoPlayer and a lightweight Express backend for faster iteration.
- Will request choices for auth UX (admin credentials, in-app admin panel) before implementation.
