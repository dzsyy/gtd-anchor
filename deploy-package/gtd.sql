-- MySQL dump 10.13  Distrib 8.0.31, for macos12 (arm64)
--
-- Host: localhost    Database: gtd
-- ------------------------------------------------------
-- Server version	8.0.31

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `t_achievement`
--

DROP TABLE IF EXISTS `t_achievement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_achievement`
--

LOCK TABLES `t_achievement` WRITE;
/*!40000 ALTER TABLE `t_achievement` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_achievement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_inspiration`
--

DROP TABLE IF EXISTS `t_inspiration`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_inspiration`
--

LOCK TABLES `t_inspiration` WRITE;
/*!40000 ALTER TABLE `t_inspiration` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_inspiration` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_material`
--

DROP TABLE IF EXISTS `t_material`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_material`
--

LOCK TABLES `t_material` WRITE;
/*!40000 ALTER TABLE `t_material` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_material` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_skill_particle`
--

DROP TABLE IF EXISTS `t_skill_particle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_skill_particle`
--

LOCK TABLES `t_skill_particle` WRITE;
/*!40000 ALTER TABLE `t_skill_particle` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_skill_particle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES (1,NULL,'2026-03-18 22:00:13.646181',NULL,NULL,NULL,NULL,NULL,NULL,'DONE','我的任务','2026-03-18 22:00:19.400724',NULL),(2,NULL,'2026-03-18 22:00:25.762729',NULL,NULL,NULL,NULL,NULL,NULL,'PROJECT','新任务','2026-03-18 22:00:56.735890',NULL);
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-19  1:55:08
