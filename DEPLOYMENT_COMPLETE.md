# TheIPTV VPS - Deployment Complete Checklist

## ✓ Deployment Status

**VPS Host:** s4b28e463.fastvps-server.com  
**IP:** 185.4.75.63  
**User:** root  

---

## Backend URLs

Once deployment completes, your backend will be available at:

```
http://s4b28e463.fastvps-server.com:3000
http://185.4.75.63:3000
```

### Quick Tests

```bash
# Get all users (should be empty)
curl http://s4b28e463.fastvps-server.com:3000/users

# Register a user
curl -X POST http://s4b28e463.fastvps-server.com:3000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","username":"testuser"}'

# Check status
curl http://s4b28e463.fastvps-server.com:3000/status
```

---

## Step 2: Configure Email (SMTP)

**SSH into VPS:**
```bash
ssh root@s4b28e463.fastvps-server.com
```

**Edit configuration:**
```bash
nano /root/theiptv/backend/.env
```

**Add email provider credentials:**

### For Gmail:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
EMAIL_FROM=noreply@theiptv.example.com
SERVER_URL=http://s4b28e463.fastvps-server.com
APP_DEEP_LINK=theiptv://auth
```

### For SendGrid:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your-sendgrid-api-key
EMAIL_FROM=noreply@theiptv.example.com
SERVER_URL=http://s4b28e463.fastvps-server.com
```

**Save file:** Ctrl+X, then Y, then Enter

**Restart backend:**
```bash
cd /root/theiptv
docker compose restart backend
```

**Check logs:**
```bash
docker compose logs -f backend
```

---

## Step 3: Test Registration Flow

Once SMTP is configured:

```bash
# Register a user
curl -X POST http://s4b28e463.fastvps-server.com:3000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "email":"your-email@gmail.com",
    "username":"testuser"
  }'

# Check if email was received
# (Magic link will be in the email with theiptv://auth?token=...)
```

---

## Useful Commands

**Check service status:**
```bash
docker compose ps
```

**View all logs:**
```bash
docker compose logs -f
```

**View backend logs only:**
```bash
docker compose logs -f backend
```

**Restart services:**
```bash
docker compose restart backend
docker compose restart db
```

**Stop everything:**
```bash
docker compose down
```

**Start again:**
```bash
docker compose up -d
```

**Access database:**
```bash
docker compose exec db psql -U theiptv -d theiptv
```

---

## Step 4: Setup Domain & HTTPS (Optional)

Once testing is complete, secure your backend with HTTPS:

**Install nginx and certbot:**
```bash
apt-get install -y nginx certbot python3-certbot-nginx
```

**Configure nginx:**
```bash
cp /root/theiptv/deploy/nginx/theiptv.conf /etc/nginx/sites-available/theiptv
ln -s /etc/nginx/sites-available/theiptv /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

**Get SSL certificate:**
```bash
certbot certonly --nginx -d s4b28e463.fastvps-server.com
systemctl restart nginx
```

---

## Step 5: Enable Auto-Updates (Optional)

Set up automatic updates via systemd:

```bash
sudo cp /root/theiptv/deploy/systemd/theiptv-update.service /etc/systemd/system/
sudo cp /root/theiptv/deploy/systemd/theiptv-update.timer /etc/systemd/system/
sudo chmod +x /root/theiptv/scripts/update_and_restart.sh

sudo systemctl daemon-reload
sudo systemctl enable --now theiptv-update.timer
sudo systemctl status theiptv-update.timer
```

---

## Troubleshooting

**Services not starting:**
```bash
docker compose logs backend
docker compose logs db
```

**Database connection error:**
```bash
docker compose ps  # Check if db is running
docker compose restart db
sleep 10
docker compose run --rm migrate
```

**Port 3000 already in use:**
```bash
netstat -tlnp | grep 3000
kill -9 <PID>
```

**View migration SQL files:**
```bash
ls -la /root/theiptv/backend/db/migrations/
```

---

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/users` | List all users |
| GET | `/users/:id` | Get user by ID |
| POST | `/auth/register` | Register new user |
| POST | `/auth/resend` | Resend magic link |
| GET | `/magic/verify` | Verify magic link token |
| GET | `/status` | API health check |

---

## Next: Android App Integration

Once backend is running, update your Android app:

1. Update API base URL in `app/app/src/main/java/com/theiptv/network/ApiClient.kt`:
   ```kotlin
   const val BASE_URL = "http://s4b28e463.fastvps-server.com:3000/"
   ```

2. Update deep-link handler in `MainActivity.kt` to match:
   ```kotlin
   val serverUrl = "http://s4b28e463.fastvps-server.com"
   ```

3. Compile and test registration flow with deep links

---

## Support

SSH Access:
```bash
ssh root@s4b28e463.fastvps-server.com
# Password: piFaBPdY355gu67W
```

Repository:
- https://github.com/simonmikaelsvensson-commits/The-IPTV

Configuration:
- Backend: `/root/theiptv/backend/.env`
- Docker: `/root/theiptv/docker-compose.yml`
- Logs: `/root/theiptv/backend/logs/theiptv.log`
