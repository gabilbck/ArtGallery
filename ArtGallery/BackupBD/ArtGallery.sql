-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: ArtGallery
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `artista`
--

DROP TABLE IF EXISTS `artista`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `artista` (
  `id_art` int(11) NOT NULL AUTO_INCREMENT,
  `nome_usu` varchar(255) NOT NULL,
  `nome_comp` varchar(255) NOT NULL,
  `bio_art` text DEFAULT NULL,
  `foto_art` blob DEFAULT NULL,
  `id_usu` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_art`),
  UNIQUE KEY `id_usu` (`id_usu`),
  CONSTRAINT `artista_ibfk_1` FOREIGN KEY (`id_usu`) REFERENCES `usuario` (`id_usu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `artista`
--

LOCK TABLES `artista` WRITE;
/*!40000 ALTER TABLE `artista` DISABLE KEYS */;
/*!40000 ALTER TABLE `artista` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categoria` (
  `id_cat` int(11) NOT NULL AUTO_INCREMENT,
  `nome_cat` varchar(255) NOT NULL,
  `descricao_cat` text DEFAULT NULL,
  `foto_cat` varchar(255) DEFAULT "/uploads/imagem.png",
  PRIMARY KEY (`id_cat`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria`
--

LOCK TABLES `categoria` WRITE;
/*!40000 ALTER TABLE `categoria` DISABLE KEYS */;
/*!40000 ALTER TABLE `categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `colecao`
--

DROP TABLE IF EXISTS `colecao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `colecao` (
  `id_col` int(11) NOT NULL AUTO_INCREMENT,
  `nome_col` varchar(255) NOT NULL,
  `id_usu` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_col`),
  KEY `id_usu` (`id_usu`),
  CONSTRAINT `colecao_ibfk_1` FOREIGN KEY (`id_usu`) REFERENCES `usuario` (`id_usu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `colecao`
--

LOCK TABLES `colecao` WRITE;
/*!40000 ALTER TABLE `colecao` DISABLE KEYS */;
/*!40000 ALTER TABLE `colecao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comentario`
--

DROP TABLE IF EXISTS `comentario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comentario` (
  `id_com` int(11) NOT NULL AUTO_INCREMENT,
  `id_usu` int(11) DEFAULT NULL,
  `id_obr` int(11) DEFAULT NULL,
  `texto_com` text NOT NULL,
  PRIMARY KEY (`id_com`),
  KEY `id_usu` (`id_usu`),
  KEY `id_obr` (`id_obr`),
  CONSTRAINT `comentario_ibfk_1` FOREIGN KEY (`id_usu`) REFERENCES `usuario` (`id_usu`),
  CONSTRAINT `comentario_ibfk_2` FOREIGN KEY (`id_obr`) REFERENCES `obra` (`id_obr`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comentario`
--

LOCK TABLES `comentario` WRITE;
/*!40000 ALTER TABLE `comentario` DISABLE KEYS */;
/*!40000 ALTER TABLE `comentario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorito_obra`
--

DROP TABLE IF EXISTS `favorito_obra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `favorito_obra` (
  `id_usu` int(11) NOT NULL,
  `id_obr` int(11) NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_usu`,`id_obr`),
  KEY `id_obr` (`id_obr`),
  CONSTRAINT `favorito_obra_ibfk_1` FOREIGN KEY (`id_usu`) REFERENCES `usuario` (`id_usu`),
  CONSTRAINT `favorito_obra_ibfk_2` FOREIGN KEY (`id_obr`) REFERENCES `obra` (`id_obr`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorito_obra`
--

LOCK TABLES `favorito_obra` WRITE;
/*!40000 ALTER TABLE `favorito_obra` DISABLE KEYS */;
/*!40000 ALTER TABLE `favorito_obra` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `liberacao_artista`
--

DROP TABLE IF EXISTS `liberacao_artista`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `liberacao_artista` (
  `id_lib` int(11) NOT NULL AUTO_INCREMENT,
  `status_lib` char(1) NOT NULL DEFAULT 'p',
  `id_art` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_lib`),
  UNIQUE KEY `id_art` (`id_art`),
  CONSTRAINT `liberacao_artista_ibfk_1` FOREIGN KEY (`id_art`) REFERENCES `artista` (`id_art`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `liberacao_artista`
--

LOCK TABLES `liberacao_artista` WRITE;
/*!40000 ALTER TABLE `liberacao_artista` DISABLE KEYS */;
/*!40000 ALTER TABLE `liberacao_artista` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `obra`
--

DROP TABLE IF EXISTS `obra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `obra` (
  `id_obr` int(11) NOT NULL AUTO_INCREMENT,
  `titulo_obr` varchar(255) NOT NULL,
  `descricao_obr` text DEFAULT NULL,
  `situacao_obr` varchar(50) NOT NULL,
  `id_cat` int(11) DEFAULT NULL,
  `id_art` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_obr`),
  KEY `id_cat` (`id_cat`),
  KEY `id_art` (`id_art`),
  CONSTRAINT `obra_ibfk_1` FOREIGN KEY (`id_cat`) REFERENCES `categoria` (`id_cat`),
  CONSTRAINT `obra_ibfk_2` FOREIGN KEY (`id_art`) REFERENCES `artista` (`id_art`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `obra`
--

LOCK TABLES `obra` WRITE;
/*!40000 ALTER TABLE `obra` DISABLE KEYS */;
/*!40000 ALTER TABLE `obra` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `obra_colecao`
--

DROP TABLE IF EXISTS `obra_colecao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `obra_colecao` (
  `id_obr` int(11) NOT NULL,
  `id_col` int(11) NOT NULL,
  PRIMARY KEY (`id_obr`,`id_col`),
  KEY `id_col` (`id_col`),
  CONSTRAINT `obra_colecao_ibfk_1` FOREIGN KEY (`id_obr`) REFERENCES `obra` (`id_obr`),
  CONSTRAINT `obra_colecao_ibfk_2` FOREIGN KEY (`id_col`) REFERENCES `colecao` (`id_col`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `obra_colecao`
--

LOCK TABLES `obra_colecao` WRITE;
/*!40000 ALTER TABLE `obra_colecao` DISABLE KEYS */;
/*!40000 ALTER TABLE `obra_colecao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seguidor_artista`
--

DROP TABLE IF EXISTS `seguidor_artista`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `seguidor_artista` (
  `id_seguidor` int(11) NOT NULL,
  `id_artista` int(11) NOT NULL,
  PRIMARY KEY (`id_seguidor`,`id_artista`),
  KEY `id_artista` (`id_artista`),
  CONSTRAINT `seguidor_artista_ibfk_1` FOREIGN KEY (`id_seguidor`) REFERENCES `usuario` (`id_usu`),
  CONSTRAINT `seguidor_artista_ibfk_2` FOREIGN KEY (`id_artista`) REFERENCES `artista` (`id_art`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seguidor_artista`
--

LOCK TABLES `seguidor_artista` WRITE;
/*!40000 ALTER TABLE `seguidor_artista` DISABLE KEYS */;
/*!40000 ALTER TABLE `seguidor_artista` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suporte`
--

DROP TABLE IF EXISTS `suporte`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `suporte` (
  `id_sup` int(11) NOT NULL AUTO_INCREMENT,
  `email_sup` varchar(255) NOT NULL,
  `assunto_sup` varchar(255) NOT NULL,
  `descricao_sup` text NOT NULL,
  PRIMARY KEY (`id_sup`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suporte`
--

LOCK TABLES `suporte` WRITE;
/*!40000 ALTER TABLE `suporte` DISABLE KEYS */;
/*!40000 ALTER TABLE `suporte` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuario` (
  `id_usu` int(11) NOT NULL AUTO_INCREMENT,
  `nome_usu` varchar(20) NOT NULL,
  `nome_comp` varchar(255) NOT NULL,
  `email_usu` varchar(255) DEFAULT NULL,
  `senha_usu` varchar(255) DEFAULT NULL,
  `foto_usu` blob DEFAULT NULL,
  `bio_usu` text DEFAULT NULL,
  `tipo_usu` varchar(3) NOT NULL DEFAULT 'apr',
  `advertencia_usu` smallint(2) DEFAULT 0,
  `ban_usu` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id_usu`),
  UNIQUE KEY `email_usu` (`email_usu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-02 15:51:42
