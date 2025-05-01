# Server Deployment Instructions for www.quanthive.in

This guide will help you deploy the QuantHive website to a production server and connect it to your custom domain.

## Option 1: Vercel Deployment (Recommended)

Vercel is the platform created by the developers of Next.js and provides the easiest deployment experience.

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Run the deployment command from your project directory:
```bash
vercel
```

3. Follow the interactive prompts to log in and configure your project.

4. After deployment, connect your custom domain (quanthive.in):
```bash
vercel domains add quanthive.in
```

5. Follow the verification steps to set up your domain's DNS records.

## Option 2: Custom VPS/Server Deployment

### Prerequisites
- A VPS or dedicated server running Ubuntu/Debian or similar
- Domain name (quanthive.in) with DNS access

### Step 1: Server Setup

1. Install Node.js and other dependencies:
```bash
sudo apt update
sudo apt install -y nodejs npm nginx certbot python3-certbot-nginx
sudo npm install -g pm2
```

2. Set up a non-root user (if not already available):
```bash
sudo adduser quanthive
sudo usermod -aG sudo quanthive
su - quanthive
```

### Step 2: Deploy the Application

1. Create a directory for the application:
```bash
mkdir -p ~/quanthive-website
```

2. Copy your built application to the server (from your local machine):
```bash
# Run this on your local machine
scp -r .next package.json package-lock.json next.config.mjs public/ quanthive@your-server-ip:~/quanthive-website/
```

3. Install production dependencies on the server:
```bash
cd ~/quanthive-website
npm install --production
```

4. Set up PM2 to manage the application:
```bash
pm2 start npm --name "quanthive" -- start
pm2 save
pm2 startup
# Run the command PM2 provides to set up startup script
```

### Step 3: Configure Nginx as a Reverse Proxy

1. Create an Nginx configuration file:
```bash
sudo nano /etc/nginx/sites-available/quanthive
```

2. Add the following configuration:
```nginx
server {
    listen 80;
    server_name quanthive.in www.quanthive.in;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. Enable the site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/quanthive /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 4: Set Up SSL with Let's Encrypt

1. Obtain SSL certificate:
```bash
sudo certbot --nginx -d quanthive.in -d www.quanthive.in
```

2. Follow the prompts to complete the setup.

### Step 5: Configure DNS

1. Log in to your domain registrar's DNS management panel
2. Add the following records:
   - A record: `@` pointing to your server's IP address
   - A record: `www` pointing to your server's IP address

### Updating the Website

To update the website in the future:

1. Build the new version locally:
```bash
npm run build
```

2. Copy the new files to the server:
```bash
scp -r .next package.json package-lock.json next.config.mjs public/ quanthive@your-server-ip:~/quanthive-website/
```

3. Install any new dependencies and restart the application:
```bash
cd ~/quanthive-website
npm install --production
pm2 restart quanthive
```

## Option 3: Cloud Platform Deployment

You can also deploy to other cloud platforms:

### AWS Elastic Beanstalk
1. Install the EB CLI
2. Run `eb init` and follow the prompts
3. Run `eb deploy` to deploy

### Google Cloud Run
1. Build a Docker image of your application
2. Push to Google Container Registry
3. Deploy to Cloud Run

### DigitalOcean App Platform
1. Connect your GitHub repository
2. Set up automatic deployments

## Important Notes:

1. **Environment Variables**: Make sure to set up your environment variables for production, especially for the email functionality:
   ```
   MAIL_SERVER_HOST=smtp.gmail.com
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=quanthive@gmail.com
   EMAIL_SERVER_PASSWORD=your-password
   EMAIL_FROM=noreply@quanthive.in
   ```

2. **Database**: If you add a database in the future, ensure it's properly configured and secured.

3. **Monitoring**: Set up monitoring for your application using tools like PM2 Plus or other monitoring services.

4. **Backups**: Regularly back up your application code and any database you might add later.
