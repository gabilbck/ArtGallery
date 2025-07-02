CREATE DATABASE artg
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;


USE artg


DROP TABLE IF EXISTS `categoria`;

CREATE TABLE `categoria` (
  `id_cat` int(11) NOT NULL AUTO_INCREMENT,
  `nome_cat` varchar(255) NOT NULL,
  `descricao_cat` text DEFAULT NULL,
  `foto_cat` varchar(255) DEFAULT "/uploads/imagem.png",
  PRIMARY KEY (`id_cat`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


LOCK TABLES `categoria` WRITE;
UNLOCK TABLES;


DROP TABLE IF EXISTS `usuario`;

CREATE TABLE `usuario` (
  `id_usu` int(11) NOT NULL AUTO_INCREMENT,
  `nome_usu` varchar(20) NOT NULL,
  `nome_comp` varchar(255) NOT NULL,
  `email_usu` varchar(255) DEFAULT NULL,
  `senha_usu` varchar(255) DEFAULT NULL,
  `foto_usu` varchar(255) DEFAULT "/uploads/imagem.png",
  `bio_usu` text DEFAULT NULL,
  `tipo_usu` varchar(3) NOT NULL DEFAULT 'apr',
  `advertencia_usu` smallint(2) DEFAULT 0,
  `ban_usu` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id_usu`),
  UNIQUE KEY `email_usu` (`email_usu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


LOCK TABLES `usuario` WRITE;
UNLOCK TABLES;


DROP TABLE IF EXISTS `artista`;

CREATE TABLE `artista` (
  `id_art` int(11) NOT NULL AUTO_INCREMENT,
  `nome_usu` varchar(255) NOT NULL,
  `nome_comp` varchar(255) NOT NULL,
  `bio_art` text DEFAULT NULL,
  `foto_art` varchar(255) DEFAULT "/uploads/imagem.png",
  `id_usu` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_art`),
  UNIQUE KEY `id_usu` (`id_usu`),
  CONSTRAINT `artista_ibfk_1` FOREIGN KEY (`id_usu`) REFERENCES `usuario` (`id_usu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


LOCK TABLES `artista` WRITE;
UNLOCK TABLES;


DROP TABLE IF EXISTS `obra`;

CREATE TABLE `obra` (
  `id_obr` int(11) NOT NULL AUTO_INCREMENT,
  `titulo_obr` varchar(255) NOT NULL,
  `descricao_obr` text DEFAULT NULL,
  `situacao_obr` tinyint(1) NOT NULL DEFAULT 1,
  `foto_obr` varchar(255) DEFAULT "/uploads/imagem.png",
  `id_cat` int(11) DEFAULT NULL,
  `id_art` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_obr`),
  KEY `id_cat` (`id_cat`),
  KEY `id_art` (`id_art`),
  CONSTRAINT `obra_ibfk_1` FOREIGN KEY (`id_cat`) REFERENCES `categoria` (`id_cat`),
  CONSTRAINT `obra_ibfk_2` FOREIGN KEY (`id_art`) REFERENCES `artista` (`id_art`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


LOCK TABLES `obra` WRITE;
UNLOCK TABLES;


DROP TABLE IF EXISTS `colecao`;

CREATE TABLE `colecao` (
  `id_col` int(11) NOT NULL AUTO_INCREMENT,
  `nome_col` varchar(255) NOT NULL,
  `id_usu` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_col`),
  KEY `id_usu` (`id_usu`),
  CONSTRAINT `colecao_ibfk_1` FOREIGN KEY (`id_usu`) REFERENCES `usuario` (`id_usu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


LOCK TABLES `colecao` WRITE;
UNLOCK TABLES;


DROP TABLE IF EXISTS `obra_colecao`;

CREATE TABLE `obra_colecao` (
  `id_obr` int(11) NOT NULL,
  `id_col` int(11) NOT NULL,
  PRIMARY KEY (`id_obr`,`id_col`),
  KEY `id_col` (`id_col`),
  CONSTRAINT `obra_colecao_ibfk_1` FOREIGN KEY (`id_obr`) REFERENCES `obra` (`id_obr`),
  CONSTRAINT `obra_colecao_ibfk_2` FOREIGN KEY (`id_col`) REFERENCES `colecao` (`id_col`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


LOCK TABLES `obra_colecao` WRITE;
UNLOCK TABLES;


DROP TABLE IF EXISTS `comentario`;

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


LOCK TABLES `comentario` WRITE;
UNLOCK TABLES;


DROP TABLE IF EXISTS `favorito_obra`;

CREATE TABLE `favorito_obra` (
  `id_usu` int(11) NOT NULL,
  `id_obr` int(11) NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_usu`,`id_obr`),
  KEY `id_obr` (`id_obr`),
  CONSTRAINT `favorito_obra_ibfk_1` FOREIGN KEY (`id_usu`) REFERENCES `usuario` (`id_usu`),
  CONSTRAINT `favorito_obra_ibfk_2` FOREIGN KEY (`id_obr`) REFERENCES `obra` (`id_obr`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


LOCK TABLES `favorito_obra` WRITE;
UNLOCK TABLES;


 


DROP TABLE IF EXISTS `seguidor_artista`;

CREATE TABLE `seguidor_artista` (
  `id_seguidor` int(11) NOT NULL,
  `id_artista` int(11) NOT NULL,
  PRIMARY KEY (`id_seguidor`,`id_artista`),
  KEY `id_artista` (`id_artista`),
  CONSTRAINT `seguidor_artista_ibfk_1` FOREIGN KEY (`id_seguidor`) REFERENCES `usuario` (`id_usu`),
  CONSTRAINT `seguidor_artista_ibfk_2` FOREIGN KEY (`id_artista`) REFERENCES `artista` (`id_art`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


LOCK TABLES `seguidor_artista` WRITE;
UNLOCK TABLES;


DROP TABLE IF EXISTS `suporte`;

CREATE TABLE `suporte` (
  `id_sup` int(11) NOT NULL AUTO_INCREMENT,
  `email_sup` varchar(255) NOT NULL,
  `assunto_sup` varchar(255) NOT NULL,
  `descricao_sup` text NOT NULL,
  PRIMARY KEY (`id_sup`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


LOCK TABLES `suporte` WRITE;
UNLOCK TABLES;


CREATE TABLE seguidores (
  seguidor_id INT(11) NOT NULL,
  seguido_id INT(11) NOT NULL,
  PRIMARY KEY (seguidor_id, seguido_id),
  CONSTRAINT fk_seguidor FOREIGN KEY (seguidor_id) REFERENCES usuario(id_usu) ON DELETE CASCADE,
  CONSTRAINT fk_seguido FOREIGN KEY (seguido_id) REFERENCES usuario(id_usu) ON DELETE CASCADE
);

CREATE TABLE qtd_seguidores (
  id_usu INT PRIMARY KEY,
  total_seguidores BIGINT DEFAULT 0,
  FOREIGN KEY (id_usu) REFERENCES usuario(id_usu) ON DELETE CASCADE
);

CREATE TABLE qtd_seguindo (
  id_usu INT PRIMARY KEY,
  total_seguindo BIGINT DEFAULT 0,
  FOREIGN KEY (id_usu) REFERENCES usuario(id_usu) ON DELETE CASCADE
);