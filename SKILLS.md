# Skills 文档

## 概述

本项目配置了多个 Claude Code Skills，用于辅助开发、测试、调试等场景。

## 已安装 Skills（30 个）

### 浏览器 & 测试
| Skill | 用途 | 触发关键词 |
|-------|------|-----------|
| `agent-browser` | 浏览器自动化 - 打开网页、填表、截图 | "打开网站", "截图", "自动化浏览器" |
| `qa` | QA 测试 - 全面测试并修复 bug | "qa", "测试", "找 bug" |

### 调试 & 排查
| Skill | 用途 | 触发关键词 |
|-------|------|-----------|
| `investigate` | 系统化调试 - 根因分析 | "debug", "排查", "修复 bug" |

### 代码审查
| Skill | 用途 | 触发关键词 |
|-------|------|-----------|
| `codex` | 独立代码审查 + 对抗模式 | "codex review", "第二意见" |
| `review` | PR 审查 - SQL 安全、边界检查 | "review", "代码审查" |

### 前端开发
| Skill | 用途 | 触发关键词 |
|-------|------|-----------|
| `frontend-design` | 创建高质量前端界面 | "前端", "UI", "组件" |
| `design-review` | 视觉 QA - 修复设计问题 | "设计审查", "视觉" |

### 后端开发
| Skill | 用途 | 触发关键词 |
|-------|------|-----------|
| `spring-boot-engineer` | Spring Boot 3.x 开发 | "Spring Boot", "Spring Security", "Spring Data JPA" |
| `java-performance` | JVM 性能调优 | "JVM", "性能", "GC" |

### 部署 & 发布
| Skill | 用途 | 触发关键词 |
|-------|------|-----------|
| `ship` | 部署工作流 - 合并、测试、发布 | "ship", "部署", "创建 PR" |

### 计划评审
| Skill | 用途 | 触发关键词 |
|-------|------|-----------|
| `plan-ceo-review` | CEO/创始人视角评审 | "战略", "扩展", "think bigger" |
| `plan-eng-review` | 工程视角评审 - 架构锁定 | "架构", "工程评审" |
| `plan-design-review` | 设计视角评审 | "设计计划" |

### 工程管理
| Skill | 用途 | 触发关键词 |
|-------|------|-----------|
| `office-hours` | YC Office Hours - 创业咨询 | "brainstorm", "想法", "是否值得做" |
| `retro` | 周工程回顾 | "retro", "回顾" |

### 设计 & 咨询
| Skill | 用途 | 触发关键词 |
|-------|------|-----------|
| `design-consultation` | 设计咨询 - 创建设计系统 | "设计系统", "品牌" |

### 安全 & 限制
| Skill | 用途 | 触发关键词 |
|-------|------|-----------|
| `careful` | 危险命令警告 | "小心", "安全模式" |
| `guard` | 完整安全模式 - 警告 + 目录限制 | "guard mode", "最大安全" |
| `unfreeze` | 解除编辑限制 | "unfreeze", "解除限制" |

### 文档 & 文件
| Skill | 用途 | 触发关键词 |
|-------|------|-----------|
| `document-release` | 发布后文档更新 | "更新文档" |
| `file-organization` | 文件整理 | "整理文件", "清理" |

### 搜索 & 工具
| Skill | 用途 | 触发关键词 |
|-------|------|-----------|
| `find-skills` | 搜索安装新 skills | "找 skill", "安装" |
| `tavily-search` | AI 搜索 | "搜索", "查找" |
| `setup-browser-cookies` | 导入浏览器 Cookie | "导入 cookies", "登录" |

### 文本处理
| Skill | 用途 | 触发关键词 |
|-------|------|-----------|
| `text-summarizer` | 文本摘要 | "摘要", "总结" |

### 其他
| Skill | 用途 |
|-------|------|
| `remotion-best-practices` | Remotion 视频制作最佳实践 |
| `self-improving-agent` | 自我进化 agent（会话结束自动触发） |
| `using-superpowers` | 使用技能说明 |
| `clawhub-skill-vetting` | ClawHub skill 审核 |

## 使用方法

### 手动调用
```
/skill-name
```
例如：`/qa`, `/investigate`, `/review`

### 自动触发
在对话中提到相关关键词时，Skills 会自动触发。

### 安装新 Skill
1. 搜索：`npx skills find [关键词]`
2. 下载后放到 `~/.claude/skills/`

## 配置

- Skills 目录：`~/.claude/skills/`
- 配置文件：`~/.claude/settings.json`
- Hook 配置：session-end 自动触发 `self-improving-agent`

## 相关文档

- [CLAUDE.md](./CLAUDE.md) - 项目开发指南
- [gtd-mindmap.drawio](./gtd-mindmap.drawio) - 思维导图架构
