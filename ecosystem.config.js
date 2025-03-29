module.exports = {
  apps: [{
    name: 'mu-bot',
    script: './dist/bot.js',
    watch: false,
    max_memory_restart: '300M',
    exp_backoff_restart_delay: 100,
    instances: 1,
    autorestart: true,
    max_restarts: 10,
    restart_delay: 3000,
    env: {
      NODE_ENV: 'production'
    }
  }]
}; 