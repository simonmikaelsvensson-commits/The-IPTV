Certbot (Let's Encrypt) instructions

1. Install certbot and nginx plugin (Ubuntu):

   sudo apt update
   sudo apt install -y certbot python3-certbot-nginx nginx

2. Place the nginx server block (deploy/nginx/theiptv.conf) on the VPS at /etc/nginx/sites-available/theiptv
   and symlink to /etc/nginx/sites-enabled/theiptv. Replace `your.domain.com` with your domain in the file.

   sudo cp deploy/nginx/theiptv.conf /etc/nginx/sites-available/theiptv
   sudo ln -s /etc/nginx/sites-available/theiptv /etc/nginx/sites-enabled/theiptv
   sudo nginx -t && sudo systemctl reload nginx

3. Obtain certificate with certbot (automatically configure nginx):

   sudo certbot --nginx -d your.domain.com -m you@example.com --agree-tos --non-interactive

4. Test renewal (dry-run):

   sudo certbot renew --dry-run

Notes
- If nginx is not running on the host (e.g., you're using Docker for nginx), use certbot with the webroot plugin:
  * add `location /.well-known/acme-challenge/` that serves from /var/www/html in your nginx config
  * ensure Docker Compose maps a volume to /var/www/html on the host, or run certbot on the host with webroot pointing to the host's webroot

- For automatic renewals, certbot installs a systemd timer on most distributions. Check `systemctl list-timers | grep certbot`.
