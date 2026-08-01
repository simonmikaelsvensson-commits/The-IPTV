TheIPTV backend (users API + auth)

Setup
1. Copy .env.example to .env and set DATABASE_URL and SMTP/JWT settings.
2. cd backend
3. npm install
4. npm start

Endpoints
- POST /auth/register       => { username, email }  (creates user and sends magic link email)
- GET /auth/magic/verify?token=... => exchanges magic token for auth JWT or redirects to app deep link
- GET /users                => list all users
- GET /users/:id            => get user by id

Notes
- Magic link flow: POST /auth/register creates a user and sends an email containing a deep link (theiptv://auth?token=...) that will open the app and allow automatic login. If opened in a browser the /auth/magic/verify endpoint redirects to the deep link with an auth token.
- Configure SMTP and JWT_SECRET in .env for production use.
