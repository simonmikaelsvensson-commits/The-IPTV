Deployment guide (VPS) — Docker Compose

This guide boots Postgres and the TheIPTV backend in Docker on a fresh VPS (Ubuntu 22.04+ recommended).

1) Install Docker & Compose
- sudo apt update && sudo apt install -y ca-certificates curl gnupg lsb-release
- curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
- echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
- sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
- sudo usermod -aG docker $USER  # log out/in for group to apply

2) Copy repository to VPS (git clone or rsync)
- git clone <your-repo-url>
- cd The-IPTV

3) Configure environment
- Copy backend/.env.example to backend/.env and edit values:
  * DATABASE_URL=postgresql://theiptv:changeme@db:5432/theiptv
  * SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM
  * JWT_SECRET (set strong secret)
  * SERVER_URL=https://your.domain
  * APP_DEEP_LINK=theiptv://auth
  * FRONTEND_DOWNLOAD_URL=https://your.domain/download

4) Start services and run migrations
- sudo docker compose up -d
- Run migrations once: sudo docker compose run --rm migrate

5) Verify
- curl http://localhost:3000/  => {"status":"ok"}
- curl http://localhost:3000/users => [] (after migrations)

6) (Optional) Reverse proxy & HTTPS
- Install nginx and configure a reverse proxy for / to backend at http://127.0.0.1:3000 and serve TLS via certbot.

7) Troubleshooting
- View logs: sudo docker compose logs -f backend
- Check container status: sudo docker ps

Security notes
- Replace default DB password and JWT_SECRET.
- Lock down SMTP credentials and firewall (ufw allow ssh,http,https only).

Systemd auto-update (optional)

To enable automatic updates using systemd, copy the provided unit and timer files to /etc/systemd/system, make the update script executable, and enable the timer:

sudo cp deploy/systemd/theiptv-update.service /etc/systemd/system/
sudo cp deploy/systemd/theiptv-update.timer /etc/systemd/system/
sudo chmod +x /opt/theiptv/scripts/update_and_restart.sh
sudo systemctl daemon-reload
sudo systemctl enable --now theiptv-update.timer

This installs a timer that runs the update script 10 minutes after boot and daily at 03:00. The update script performs a git pull, rebuilds the Docker Compose stack, and runs migrations.

If you'd rather not auto-update, skip enabling the timer and run the script manually when deploying updates.

If you want, I can make the update script run as a non-root deploy user and manage permissions — say the word and specify a username.

If you want, I can also create a systemd service to watch the Docker Compose stack and restart it if containers crash.

If you want, I can run the above commands on your VPS if you provide output or run the script and paste any errors.

If you want, I can also add a GitHub Actions workflow to push updates to the VPS via SSH instead of relying on a periodic timer.

If you want help choosing a schedule, recommend daily at 03:00 or on-boot plus daily. Schedule can be tuned in deploy/systemd/theiptv-update.timer.
