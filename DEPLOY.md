# 🚀 Deploy LavaRand - React SPA

## 🔑 Información del Servidor

**Servidor:** 18.184.20.26  
**Usuario:** ec2-user  
**SSH Key:** Requiere clave SSH privada  
**Dominio:** https://lavarand.dev.dreamsite.es  
**Puerto interno:** 3006  
**Puerto público:** 443 (HTTPS) / 80 (HTTP → redirect)

---

## 📋 Resumen de la Infraestructura

### Stack Tecnológico
- **Frontend:** React 19.2.0 + TypeScript 5.8 + Vite 6.2.0
- **Runtime:** Node.js 18.20.8
- **Process Manager:** PM2 6.0.11
- **Static Server:** serve 14.2.5
- **Reverse Proxy:** Nginx 1.28.0
- **SSL:** Let's Encrypt (certbot 2.6.0)

### Arquitectura del Deployment
```
Internet (HTTPS:443)
    ↓
Nginx (reverse proxy + SSL termination)
    ↓
serve (localhost:3006)
    ↓
Static Files (/var/www/lavarand/dist)
```

---

## 📦 Setup Inicial (Solo una vez)

### Paso 1: Preparar el Servidor

```bash
# Conectar al servidor
ssh -i /ruta/a/tu/clave.pem ec2-user@18.184.20.26

# Verificar/Instalar Node.js 18+
node -v  # Debe ser >= 18.0.0

# Instalar herramientas globales
sudo npm install -g pm2 serve
pm2 startup  # Configurar PM2 para auto-inicio

# Instalar certbot para SSL (si no está instalado)
sudo dnf install -y certbot python3-certbot-nginx

### Paso 2: Crear Estructura de Directorios

```bash
# Crear directorios necesarios
sudo mkdir -p /var/repo/lavarand.git /var/www/lavarand /var/log/lavarand
sudo chown -R ec2-user:ec2-user /var/repo/lavarand.git /var/www/lavarand /var/log/lavarand

# Inicializar repositorio Git bare
cd /var/repo/lavarand.git && git init --bare

# Crear archivo de variables de entorno (opcional)
cat > /var/www/lavarand/.env << 'EOF'
VITE_APP_URL=https://lavarand.dev.dreamsite.es
NODE_ENV=production
EOF
chmod 600 /var/www/lavarand/.env
```

### Paso 3: Configurar Git Hook para Auto-Deploy

```bash
# Crear hook post-receive
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
    log "📦 Install (all deps)" && npm install --include=dev || exit 1
    log "🔨 Build" && npm run build || exit 1
    
    # PM2 reload con ecosystem.config.cjs
    log "🔄 PM2" 
    pm2 reload ecosystem.config.cjs || pm2 start ecosystem.config.cjs
    pm2 save && log "✅ Deploy OK"
  fi
done
HOOK
chmod +x /var/repo/lavarand.git/hooks/post-receive
```

**Notas importantes sobre el hook:**
- Usa `npm install --include=dev` para instalar todas las dependencias (incluidas devDependencies necesarias para el build)
- El build con Vite requiere las devDependencies instaladas
- PM2 usa el archivo `ecosystem.config.cjs` del repositorio para la configuración

### Paso 4: Configurar Nginx (Reverse Proxy)

```bash
# Crear configuración Nginx temporal (HTTP solo)
sudo tee /etc/nginx/conf.d/lavarand.conf > /dev/null << 'NGINX'
# Configuración para lavarand.dev.dreamsite.es
server {
    listen 80;
    server_name lavarand.dev.dreamsite.es;
    
    # Logs
    access_log /var/log/nginx/lavarand-access.log;
    error_log /var/log/nginx/lavarand-error.log;
    
    # Proxy to serve on port 3006
    location / {
        proxy_pass http://localhost:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Headers necesarios para cámara web
        add_header Permissions-Policy "camera=self" always;
    }
}
NGINX

# Verificar configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
```

### Paso 5: Generar Certificados SSL

```bash
# Generar certificado Let's Encrypt
sudo certbot certonly \
  --nginx \
  --non-interactive \
  --agree-tos \
  --email tu-email@ejemplo.com \
  -d lavarand.dev.dreamsite.es

# Verificar certificados creados
sudo ls -la /etc/letsencrypt/live/lavarand.dev.dreamsite.es/
```

### Paso 6: Actualizar Nginx con SSL

```bash
# Actualizar configuración con HTTPS
sudo tee /etc/nginx/conf.d/lavarand.conf > /dev/null << 'NGINX'
# Configuración para lavarand.dev.dreamsite.es
server {
    listen 80;
    server_name lavarand.dev.dreamsite.es;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    http2 on;
    server_name lavarand.dev.dreamsite.es;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/lavarand.dev.dreamsite.es/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lavarand.dev.dreamsite.es/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Logs
    access_log /var/log/nginx/lavarand-access.log;
    error_log /var/log/nginx/lavarand-error.log;
    
    # Proxy to serve on port 3006
    location / {
        proxy_pass http://localhost:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Headers necesarios para cámara web
        add_header Permissions-Policy "camera=self" always;
    }
}
NGINX

# Verificar y recargar
sudo nginx -t
sudo systemctl reload nginx
```

**Nota sobre SSL:**
- Los certificados Let's Encrypt son válidos por 90 días
- Certbot configura auto-renovación automáticamente
- El header `Permissions-Policy: camera=self` es crucial para el acceso a la cámara web

---

## 💻 Configuración en tu Máquina Local

### Añadir Remote de Producción

```bash
cd /ruta/a/LavaRand
git remote add production ec2-user@18.184.20.26:/var/repo/lavarand.git
```

---

## 🚀 Proceso de Deploy

### Deploy Automático

```bash
# 1. Hacer cambios y commitear
git add .
git commit -m "feat: nuevas funcionalidades"

# 2. Push a producción (usa tu clave SSH)
GIT_SSH_COMMAND='ssh -i /ruta/a/tu/clave.pem' git push production main
```

**El hook post-receive ejecutará automáticamente:**
1. ✅ Checkout del código en `/var/www/lavarand`
2. ✅ `npm install --include=dev` (instala todas las dependencias)
3. ✅ `npm run build` (compila con Vite)
4. ✅ `pm2 reload/start ecosystem.config.cjs` (reinicia el servidor)

---

## 🔍 Comandos Útiles de Administración

### SSH y Monitoreo

```bash
# Alias recomendado (añadir a ~/.bashrc)
alias lavarand-ssh='ssh -i /ruta/a/tu/clave.pem ec2-user@18.184.20.26'

# Ver logs de PM2
lavarand-ssh "pm2 logs lavarand --lines 50"

# Ver estado de todos los procesos PM2
lavarand-ssh "pm2 status"

# Reiniciar aplicación
lavarand-ssh "pm2 restart lavarand"

# Ver logs de Nginx
lavarand-ssh "sudo tail -f /var/log/nginx/lavarand-access.log"
lavarand-ssh "sudo tail -f /var/log/nginx/lavarand-error.log"

# Verificar puerto 3006
lavarand-ssh "sudo lsof -i :3006"

# Test local desde el servidor
lavarand-ssh "curl -I http://localhost:3006"
lavarand-ssh "curl -I https://lavarand.dev.dreamsite.es"
```

### PM2 Management

```bash
# Ver información detallada del proceso
pm2 describe lavarand

# Monitoreo en tiempo real
pm2 monit

# Guardar configuración actual
pm2 save

# Eliminar y recrear proceso
pm2 delete lavarand
pm2 start ecosystem.config.cjs
pm2 save
```

---

## 🐛 Troubleshooting

### Error: Build falla con "vite: command not found"

**Problema:** Las devDependencies no están instaladas.

```bash
ssh -i /ruta/a/tu/clave.pem ec2-user@18.184.20.26
cd /var/www/lavarand
rm -rf node_modules dist
npm install --include=dev  # ⚠️ Importante: incluir devDependencies
npm run build
pm2 restart lavarand
```

### Error: Puerto ocupado

**Problema:** El puerto 3006 ya está siendo usado por otro proceso.

```bash
# Ver qué proceso usa el puerto
sudo lsof -i :3006

# Matar el proceso (si es necesario)
sudo kill -9 <PID>

# Reiniciar PM2
pm2 restart lavarand
```

### Error: La cámara no funciona

**Problema:** Los navegadores modernos requieren HTTPS para acceder a la cámara web.

**Solución:**
1. ✅ Verificar que el certificado SSL esté activo
2. ✅ Verificar que el dominio use HTTPS
3. ✅ Verificar que Nginx tenga el header correcto:

```nginx
add_header Permissions-Policy "camera=self" always;
```

```bash
# Verificar configuración Nginx
sudo nginx -t

# Ver certificado SSL
sudo certbot certificates
```

### Error: "502 Bad Gateway" en Nginx

**Problema:** PM2 no está corriendo o el puerto 3006 no responde.

```bash
# Verificar estado PM2
pm2 status

# Verificar que el puerto esté escuchando
sudo lsof -i :3006

# Si no hay proceso, iniciar
cd /var/www/lavarand
pm2 start ecosystem.config.cjs
pm2 save
```

### Error: npm install falla con EBADENGINE

**Problema:** La versión de Node.js es incompatible.

```bash
# Verificar versión actual
node -v

# Debería ser >= 18.0.0
# Si es necesario actualizar:
nvm install 20
nvm use 20
nvm alias default 20
```

### Verificación Post-Deploy

```bash
# Checklist completo
lavarand-ssh '
echo "=== PM2 Status ==="
pm2 list | grep lavarand

echo -e "\n=== Puerto 3006 ==="
sudo lsof -i :3006

echo -e "\n=== Test HTTP → HTTPS redirect ==="
curl -sL -w "Status: %{http_code}\nURL: %{url_effective}\n" http://lavarand.dev.dreamsite.es -o /dev/null

echo -e "\n=== Test HTTPS ==="
curl -sk https://lavarand.dev.dreamsite.es | head -10

echo -e "\n=== Certificado SSL ==="
sudo certbot certificates | grep -A 3 lavarand
'
```

---

## 📊 Configuración de Archivos Clave

### ecosystem.config.cjs (PM2)

```javascript
module.exports = {
  apps: [{
    name: 'lavarand',
    script: '/usr/bin/serve',  // ⚠️ Ruta completa al binario
    args: '-s dist -p 3006',    // -s = SPA mode, -p = port
    instances: 1,
    exec_mode: 'fork',
    cwd: '/var/www/lavarand',
    env: {
      NODE_ENV: 'production'
    },
    error_file: '/var/log/lavarand/error.log',
    out_file: '/var/log/lavarand/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '200M'
  }]
};
```

**Notas importantes:**
- `script: '/usr/bin/serve'` - Debe usar la ruta completa al binario (no solo `'serve'`)
- `-s` flag - Modo SPA, redirige todas las rutas a index.html
- `-p 3006` - Puerto interno (no `-l` que causa errores)

### Estructura de Directorios en Producción

```
/var/
├── repo/
│   └── lavarand.git/          # Repositorio Git bare
│       └── hooks/
│           └── post-receive   # Hook de auto-deploy
├── www/
│   └── lavarand/              # Código y build
│       ├── dist/              # Build de producción (generado)
│       ├── node_modules/      # Dependencias instaladas
│       ├── ecosystem.config.cjs
│       ├── package.json
│       └── .env               # Variables de entorno
└── log/
    └── lavarand/              # Logs de PM2
        ├── error.log
        └── out.log

/etc/
├── nginx/
│   └── conf.d/
│       └── lavarand.conf      # Configuración Nginx
└── letsencrypt/
    └── live/
        └── lavarand.dev.dreamsite.es/  # Certificados SSL
            ├── fullchain.pem
            └── privkey.pem
```

---

## 🔐 Seguridad y SSL

### Renovación de Certificados

Los certificados Let's Encrypt se renuevan automáticamente via certbot. Para verificar:

```bash
# Ver certificados actuales
sudo certbot certificates

# Test de renovación (dry-run)
sudo certbot renew --dry-run

# Renovación manual (si es necesario)
sudo certbot renew
```

### Headers de Seguridad en Nginx

La configuración incluye headers importantes para seguridad y funcionalidad:

- `Permissions-Policy: camera=self` - Permite acceso a cámara solo desde el mismo origen
- `X-Forwarded-Proto: $scheme` - Mantiene protocolo HTTPS en proxies
- `X-Real-IP` y `X-Forwarded-For` - Preserva IP real del cliente

---

## 📈 Información de Producción

**Dominio:** https://lavarand.dev.dreamsite.es  
**Stack:** React 19 + Vite 6 + Node 18 + PM2 + Nginx + Let's Encrypt  
**Servidor:** AWS EC2 - Amazon Linux 2023  
**Última actualización:** 26 de Noviembre 2025

**Aplicaciones en el servidor:**
- `lavarand` (puerto 3006) - Este proyecto
- `electron-app` (puerto 3001)
- `realstate-app` (puerto 3003)
- `pharmago` (puerto 3004)
- `pharma-g` (puerto 3005)

**Notas finales:**
- Todos los puertos internos son proxeados por Nginx en puerto 443 (HTTPS)
- Los certificados SSL se renuevan automáticamente cada 60 días
- PM2 está configurado para auto-inicio en caso de reinicio del servidor
- Los logs están en `/var/log/lavarand/` y `/var/log/nginx/`
