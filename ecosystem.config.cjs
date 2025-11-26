// ecosystem.config.cjs - Configuración PM2 para LavaRand (React SPA)
module.exports = {
  apps: [{
    name: 'lavarand',
    script: 'serve',
    args: '-s dist -l 3006', // Servir carpeta dist en puerto 3006 como SPA
    instances: 1,
    exec_mode: 'fork',
    cwd: '/var/www/lavarand',
    
    // Variables de entorno
    env: {
      NODE_ENV: 'production'
    },
    
    // Archivos de log
    error_file: '/var/log/lavarand/error.log',
    out_file: '/var/log/lavarand/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Configuración de reinicio automático
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '200M',
    watch: false
  }]
};
