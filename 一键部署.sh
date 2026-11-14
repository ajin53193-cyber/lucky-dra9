#!/bin/bash
# GSET RWA 抽奖网站 - Docker 一键部署
# 用法: bash 一键部署.sh

set -e
echo "===== GSET RWA Docker 一键部署 ====="

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "安装 Docker..."
    curl -fsSL https://get.docker.com | bash
    systemctl start docker
    systemctl enable docker
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "安装 Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

cd "$(dirname "$0")"

echo "启动服务..."
docker compose up -d --build 2>/dev/null || docker-compose up -d --build

echo ""
echo "===== 部署完成 ====="
echo "用户端: http://你的IP:8001"
echo "后台:   http://你的IP:8001/admin/login"
echo "密码:   aa554288"
echo ""
echo "如需绑定域名+HTTPS，在宝塔面板添加站点反向代理到 127.0.0.1:8001 即可"
