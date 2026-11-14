#!/bin/bash
# GSET RWA 抽奖网站 - 宝塔一键部署脚本
# 用法: bash deploy_baota.sh

set -e
echo "===== GSET RWA 部署开始 ====="

# 1. 安装依赖
echo "[1/6] 安装后端依赖..."
cd /www/wwwroot/gset-rwa/backend
pip3 install -r requirements.txt

echo "[2/6] 构建前端..."
cd /www/wwwroot/gset-rwa/frontend
yarn install
yarn build

echo "[3/6] 创建 .env 配置..."
cat > /www/wwwroot/gset-rwa/backend/.env << 'ENVEOF'
MONGO_URL="mongodb://127.0.0.1:27017"
DB_NAME="gset_rwa"
CORS_ORIGINS="*"
JWT_SECRET="c5dad5c020ffa997ef986dd10e2ff334b7fff7c140ae93ffa6fc6b03adab1e47"
ADMIN_PASSWORD="aa554288"
ENVEOF

cat > /www/wwwroot/gset-rwa/frontend/.env << 'ENVEOF'
REACT_APP_BACKEND_URL=https://你的域名.com
ENVEOF

echo "[4/6] 启动 MongoDB..."
systemctl start mongod 2>/dev/null || service mongod start 2>/dev/null || echo "请手动启动 MongoDB"

echo "[5/6] 启动后端 (PM2)..."
cd /www/wwwroot/gset-rwa/backend
pm2 delete gset-backend 2>/dev/null || true
pm2 start server.py --name gset-backend --interpreter python3 -- -m uvicorn server:app --host 0.0.0.0 --port 8001
pm2 save

echo "[6/6] 部署完成!"
echo ""
echo "===== 接下来在宝塔面板操作 ====="
echo "1. 网站 → 添加站点，绑定你的域名"
echo "2. 网站设置 → 反向代理：/api → http://127.0.0.1:8001"
echo "3. 网站设置 → 网站目录：指向 /www/wwwroot/gset-rwa/frontend/build"
echo "4. 前端 .env 里的域名改成你的真实域名后重新 yarn build"
echo ""
echo "后台登录: https://你的域名.com/admin/login  密码: aa554288"
