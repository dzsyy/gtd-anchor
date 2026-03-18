# 部署说明

## 环境要求
- Docker
- Docker Compose

## 快速部署

```bash
# 1. 进入项目目录
cd /path/to/gtd

# 2. 构建并启动所有服务
docker-compose up -d

# 3. 查看日志
docker-compose logs -f

# 4. 停止服务
docker-compose down
```

## 服务地址

| 服务 | 地址 |
|------|------|
| 前端 | http://localhost |
| 后端API | http://localhost/api |
| MySQL | localhost:3306 |
| Redis | localhost:6379 |

## 常用命令

```bash
# 重启所有服务
docker-compose restart

# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f backend

# 重新构建
docker-compose build --no-cache
```

## 注意事项

1. 首次启动会创建数据库和表
2. 数据持久化在docker volumes中
3. 如需修改端口，修改docker-compose.yml
