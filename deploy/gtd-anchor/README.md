# GTD + 锚点 部署包

## 文件结构

```
deploy/
├── gtd.sql              # 数据库脚本
├── backend/
│   └── gtd-backend-1.0.0.jar  # 后端服务
└── frontend/            # 前端静态文件
```

## 部署步骤

### 1. 数据库初始化

```bash
mysql -u root -p12345678 < gtd.sql
```

### 2. 启动后端

```bash
cd backend
java -jar gtd-backend-1.0.0.jar
```

后端端口: 8081

### 3. 部署前端

使用任意 Web 服务器托管 `frontend` 目录，例如:

**Nginx:**
```nginx
server {
    listen 80;
    server_name localhost;
    root /path/to/frontend;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
    location /api {
        proxy_pass http://localhost:8081;
    }
}
```

**Python:**
```bash
cd frontend
python3 -m http.server 80
```

**Node:**
```bash
npm install -g serve
serve -s frontend -p 80
```

## 访问地址

- 前端: http://localhost
- 后端API: http://localhost:8081/api
