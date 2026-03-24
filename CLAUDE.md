# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GTD + 碎碎锚 (Sui Sui Mao) task management application for high-sensitivity/ADHD/INFP individuals. Combines GTD methodology with powderization task decomposition.

## Architecture

- **Backend**: Spring Boot 2.x + MyBatis-Plus + MySQL + Redis
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Mind Map**: mind-elixir library for task visualization

### Directory Structure

```
/backend           # Java Spring Boot API
/frontend          # Vue 3 legacy frontend
/frontend-react    # React 19 current frontend (active development)
```

## Commands

### Frontend (React)

```bash
cd frontend-react
npm run dev      # Start dev server at http://localhost:5173
npm run build    # Production build
```

### Backend

```bash
cd backend
mvn spring-boot:run  # Start at http://localhost:8081
```

### Docker

```bash
docker-compose up -d   # Start all services
docker-compose logs -f # View logs
docker-compose down    # Stop services
```

## Key Features

- **4-level task hierarchy**: Root (1) → Milestone (≤3) → Module (≤5) → Powder (unlimited)
- **5-minute minimum action validation** for powder nodes
- **Gentle design**: No deadlines, no pressure, positive feedback only

## API Endpoints

| Service | Address |
|---------|---------|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8081 |
| MySQL | localhost:3306 |
| Redis | localhost:6379 |

## Current Development

The frontend-react folder contains the active React 19 implementation using mind-elixir for mind map visualization. Key components:
- `MindmapElixir.tsx` - Mind map rendering
- `ProjectList.tsx` - Project management with GTD logic

---

*灵感已锚定，不会丢啦 ✨*
