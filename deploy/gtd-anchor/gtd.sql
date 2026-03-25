-- MySQL dump
-- 最新版本

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

--
-- Table structure for table `t_achievement`
--
DROP TABLE IF EXISTS `t_achievement`;
CREATE TABLE `t_achievement` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `create_time` datetime(6) DEFAULT NULL,
  `inspiration_id` bigint DEFAULT NULL,
  `is_deleted` int DEFAULT NULL,
  `tag` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `update_time` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `t_inspiration`
--
DROP TABLE IF EXISTS `t_inspiration`;
CREATE TABLE `t_inspiration` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` text COLLATE utf8mb4_unicode_ci,
  `create_time` datetime(6) DEFAULT NULL,
  `is_archived` int DEFAULT NULL,
  `is_deleted` int DEFAULT NULL,
  `tag` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `update_time` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `t_material`
--
DROP TABLE IF EXISTS `t_material`;
CREATE TABLE `t_material` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` text COLLATE utf8mb4_unicode_ci,
  `create_time` datetime(6) DEFAULT NULL,
  `is_deleted` int DEFAULT NULL,
  `title` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `update_time` datetime(6) DEFAULT NULL,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `t_skill_particle`
--
DROP TABLE IF EXISTS `t_skill_particle`;
CREATE TABLE `t_skill_particle` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `create_time` datetime(6) DEFAULT NULL,
  `is_deleted` int DEFAULT NULL,
  `is_mastered` int DEFAULT NULL,
  `mastered_time` datetime(6) DEFAULT NULL,
  `particle_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `particle_tip` text COLLATE utf8mb4_unicode_ci,
  `skill_domain` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `update_time` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `tasks`
--
DROP TABLE IF EXISTS `tasks`;
CREATE TABLE `tasks` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `context_tag` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `due_date` datetime(6) DEFAULT NULL,
  `estimated_time` int DEFAULT NULL,
  `is_project` bit(1) DEFAULT NULL,
  `parent_id` bigint DEFAULT NULL,
  `priority` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `waiting_for` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `node_level` int DEFAULT NULL COMMENT '节点层级: 0-根节点, 1-里程碑, 2-模块, 3-粉末节点',
  `is_completed` bit(1) DEFAULT NULL COMMENT '是否完成',
  `is_submitted` bit(1) DEFAULT NULL COMMENT '是否已提交到执行清单',
  `completed_time` datetime(6) DEFAULT NULL COMMENT '完成时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
