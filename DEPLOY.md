# 🚀 Deploy LavaRand - React SPA

## 🔑 Credenciales

**Servidor:** 18.184.20.26  
**Usuario:** ec2-user  
**SSH Key:** `/home/desarrollo/.ssh/[...]_keypar.pem`  
**Dominio:** https://lavarand.dev.dreamsite.es  
**Puerto:** 3006

---

## 📦 Setup Inicial (Solo una vez)

### En el Servidor

```bash
# Conectar
ssh -i /home/desarrollo/.ssh/[...]_keypar.pem ec2-user@18.184.20.26

# Instalar Node 18+ (si no está)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18 && nvm use 18 && nvm alias default 18

# Instalar pnpm y PM2
npm install -g pnpm pm2 serve
pm2 startup

# Crear estructura
sudo mkdir -p /var/repo/lavarand.git /var/www/lavarand /var/log/lavarand
sudo chown -R ec2-user:ec2-user /var/repo /var/www/lavarand /var/log/lavarand
cd /var/repo/lavarand.git && git init --bare

# Variables de entorno (opcional, todo es client-side)
cat > /var/www/lavarand/.env << 'EOF'
VITE_APP_URL=https://lavarand.dev.dreamsite.es
NODE_ENV=production
EOF
chmod 600 /var/www/lavarand/.env

# Hook post-receive
cat > /var/repo/lavarand.git/hooks/post-receive << 'HOOK'
#!/bin/bash
TARGET="/var/www/lavarand"
GIT_DIR="/var/repo/lavarand.git"

log() { echo "[$(date '+%H:%M:%S')] $1"; }

while read oldrev newrev ref; do
  if [[ $ref =~ .*/main$ ]]; then
    log "🚀 Deploy LavaRand"
    git --work-tree=$TARGET --git-dir=$GIT_DIR checkout -f main || exit 1
    cd $TARGET || exit 1
    [ -f .env ] && export $(cat .env | grep -v '^#' | xargs)
    log "📦 Install" && pnpm install --frozen-lockfile || exit 1
    log " Build" && pnpm build || exit 1
    
    # PM2 para servir estáticos con 'serve'
    if pm2 describe lavarand >/dev/null 2>&1; then
      pm2 reload lavarand
    else
      pm2 start serve --name lavarand -- -s dist -l 3005
    fi
    pm2 save && log "✅ Deploy OK"
  fi
done
HOOK
chmod +x /var/repo/lavarand.git/hooks/post-receive
```

### En tu Máquina Local

```bash
cd /home/desarrollo/source/LavaRand
git remote add production ec2-user@18.184.20.26:/var/repo/lavarand.git
```

---

## 🚀 Deploy

```bash
git add .
git commit -m "feat: cambios"
GIT_SSH_COMMAND='ssh -i /home/desarrollo/.ssh/[...]_keypar.pem' git push production main
```

---

## 🔍 Comandos Útiles

```bash
# Alias para SSH (opcional)
alias lavarand-ssh='ssh -i /home/desarrollo/.ssh/[...]_keypar.pem ec2-user@18.184.20.26'

# Ver logs
lavarand-ssh "pm2 logs lavarand --lines 50"

# Ver estado
lavarand-ssh "pm2 status"

# Reiniciar
lavarand-ssh "pm2 restart lavarand"
```

---

## 🐛 Troubleshooting

**Build falla:**
```bash
ssh -i /home/desarrollo/.ssh/[...]_keypar.pem ec2-user@18.184.20.26
cd /var/www/lavarand
rm -rf node_modules dist
pnpm install && pnpm build
```

**Puerto ocupado:**
```bash
sudo lsof -i :3005
sudo kill -9 <PID>
pm2 restart lavarand
```

**Cámara no funciona:**
Asegúrate de que el dominio tenga certificado SSL válido (HTTPS) y que Nginx tenga los headers correctos:
```nginx
add_header Permissions-Policy "camera=self" always;
```

---

**Stack:** React 19 + Vite + Node 18 + PM2 (serve)  
**Actualizado:** Noviembre 2025
