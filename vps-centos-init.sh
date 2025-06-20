#!/usr/bin/env bash
set -e

echo "🔧 Updating system..."
yum update -y
yum install -y epel-release nginx git curl

echo "📦 Installing Node.js 18.x"
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

echo "📁 Cloning nova backend..."
cd /root
rm -rf nova-ai-backend
git clone https://github.com/jarvisnova/nova-ai-backend.git
cd nova-ai-backend

echo "📦 Installing dependencies..."
cd api
npm install
cd ../frontend
npm install

echo "🚀 Starting backend and frontend"
cd /root/nova-ai-backend/api
nohup node index.js > api.log 2>&1 &

cd /root/nova-ai-backend/frontend
nohup npm run start > frontend.log 2>&1 &

echo "🌐 Configuring nginx..."
cat > /etc/nginx/conf.d/nova.conf <<EOL
server {
    listen 80;
    server_name novaai.co.in vps.novaai.co.in;

    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location / {
        proxy_pass http://127.0.0.1:8080/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

systemctl enable nginx
systemctl restart nginx

echo "✅ All done! NOVA backend is live."
