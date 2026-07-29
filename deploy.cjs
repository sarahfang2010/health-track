// Auto-deploy script: builds locally, uploads to server, restarts PM2
const { execSync } = require('child_process');
const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const HOST = '23.94.203.106';
const USER = 'sarah';
const PASS = 'Fyq20100324';
const REMOTE_DIR = '/var/www/health';

console.log('🔨 Building...');
execSync('npx prisma generate', { stdio: 'inherit', cwd: __dirname });
execSync('npx next build', { stdio: 'inherit', cwd: __dirname });

console.log('📦 Packaging .next...');
const tarFile = path.join(__dirname, '.deploy-next.tar.gz');
execSync(`tar --exclude='./.next/cache' -czf "${tarFile}" .next`, { cwd: __dirname });

const conn = new Client();
conn.on('ready', () => {
  console.log('📤 Uploading...');
  conn.sftp((err, sftp) => {
    if (err) { console.error(err); conn.end(); return; }
    const read = fs.createReadStream(tarFile);
    const write = sftp.createWriteStream('/tmp/.deploy-next.tar.gz');
    write.on('close', () => {
      console.log('📦 Extracting & restarting...');
      const cmds = [
        `cd ${REMOTE_DIR} && rm -rf .next && tar -xzf /tmp/.deploy-next.tar.gz`,
        `cd ${REMOTE_DIR} && npm install --omit=dev --silent 2>&1 | tail -1`,
        'pm2 restart health-track 2>&1 | tail -2',
        'sleep 2 && curl -s -o /dev/null -w "%{http_code}" http://localhost:3000'
      ];
      conn.exec(cmds.join(' && '), (err, stream) => {
        if (err) { console.error(err); conn.end(); return; }
        stream.on('data', d => process.stdout.write(d));
        stream.stderr.on('data', d => process.stderr.write(d));
        stream.on('close', (code) => {
          console.log(code === 0 ? '\n✅ Deploy OK!' : '\n⚠️ Deploy done (check site)');
          fs.unlinkSync(tarFile);
          conn.end();
        });
      });
    });
    read.pipe(write);
  });
});
conn.on('error', e => { console.error('SSH error:', e.message); process.exit(1); });
conn.connect({ host: HOST, port: 22, username: USER, password: PASS, readyTimeout: 10000 });
