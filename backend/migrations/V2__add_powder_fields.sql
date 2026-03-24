-- 碎碎锚粉末化拆解功能 - 新增字段
-- 执行方式: mysql -u root -p gtd < migrations/V2__add_powder_fields.sql

ALTER TABLE tasks ADD COLUMN node_level INT DEFAULT 0 COMMENT '节点层级: 0-根节点, 1-里程碑, 2-模块, 3-粉末节点';
ALTER TABLE tasks ADD COLUMN is_completed TINYINT(1) DEFAULT 0 COMMENT '是否完成（仅粉末节点可标记）';
ALTER TABLE tasks ADD COLUMN completed_time DATETIME COMMENT '完成时间';
