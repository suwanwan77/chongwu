const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 8080;
const FRONTEND_DIR = path.join(__dirname, 'frontend');

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

const server = http.createServer((req, res) => {
  let filePath = path.join(FRONTEND_DIR, req.url === '/' ? 'index.html' : req.url);
  
  // Remove query parameters
  filePath = filePath.split('?')[0];
  
  // Security check - prevent directory traversal
  if (!filePath.startsWith(FRONTEND_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      // File not found, try index.html in the directory
      if (req.url.endsWith('/') || !path.extname(req.url)) {
        const indexPath = path.join(filePath, 'index.html');
        fs.stat(indexPath, (indexErr, indexStats) => {
          if (indexErr) {
            res.writeHead(404);
            res.end('File not found');
          } else {
            serveFile(indexPath, res);
          }
        });
      } else {
        res.writeHead(404);
        res.end('File not found');
      }
    } else if (stats.isDirectory()) {
      const indexPath = path.join(filePath, 'index.html');
      fs.stat(indexPath, (indexErr, indexStats) => {
        if (indexErr) {
          // List directory contents
          fs.readdir(filePath, (dirErr, files) => {
            if (dirErr) {
              res.writeHead(500);
              res.end('Server error');
            } else {
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(generateDirectoryListing(req.url, files));
            }
          });
        } else {
          serveFile(indexPath, res);
        }
      });
    } else {
      serveFile(filePath, res);
    }
  });
});

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Server error');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
}

function generateDirectoryListing(url, files) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Directory listing for ${url}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #333; }
        ul { list-style-type: none; padding: 0; }
        li { margin: 5px 0; }
        a { text-decoration: none; color: #0066cc; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <h1>Directory listing for ${url}</h1>
      <ul>
        ${url !== '/' ? '<li><a href="../">../</a></li>' : ''}
        ${files.map(file => `<li><a href="${url}${url.endsWith('/') ? '' : '/'}${file}">${file}</a></li>`).join('')}
      </ul>
    </body>
    </html>
  `;
  return html;
}

server.listen(PORT, () => {
  console.log(`🚀 宠物口粮官网服务器已启动！`);
  console.log(`📱 本地访问地址: http://localhost:${PORT}`);
  console.log(`🌐 网络访问地址: http://127.0.0.1:${PORT}`);
  console.log(`📁 服务目录: ${FRONTEND_DIR}`);
  console.log(`⏹️  按 Ctrl+C 停止服务器`);
  
  // 自动打开浏览器
  const start = (process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open');
  exec(`${start} http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ 端口 ${PORT} 已被占用，请尝试其他端口`);
  } else {
    console.log('❌ 服务器启动失败:', err);
  }
});
