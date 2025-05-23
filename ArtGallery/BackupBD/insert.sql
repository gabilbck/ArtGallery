-- CREATE VIEW qtd_seguidores
-- select id_artista e count quantidade de vezes que aparece na tabela seguidor_artista, 
-- o que determina a quantidade total de seguidores do artista

-- CREATE VIEW qtd_seguindo
-- select id_seguidor e count quantidade de vezes que aparece na tabela seguidor_artista, 
-- o que determina a quantidade total de artistas que o apreciador segue

-- CREATE VIEW qtd_favoritos
-- select id_obr na tabela favorito_obra e count quantidade de vezes que aparece na tabela
-- o que determina a quantidade total de favoritos que a obra possui

-- CREATE VIEW qtd_comentarios
-- select id_obr e faz count da quantidade de id_usu registrados na tabela comentario

-- CREATE VIEW comentarios_da_obra
-- select id_obr e retorna os id_usu, texto_com especificos da tabela comentario par adeterminada obra

-- CREATE VIEW oolecoes_usuario
-- select nome_col, id_usu na tabela colecao e id_obr, id_col na tabela obra_colecao
-- e titulo_obr, descricao_obr, situacao_obr, id_cat, id_art
-- 3 inner joins :)

-- CREATE VIEW pesquisar
-- retorna artista ou categoria ou obra

-- CREATE TRIGGER adc_liberacao_de_artista
-- O usuário cadastrado com tipo_usu="art"
-- automaticamente cria-se um registro na tabela liberacao_artista
-- status_lib="pendente", id=(ID-DO-ARTISTA)

-- CREATE TRIGGER adc_artista_apr
-- altera registro de liberação de artista para "aprovado"
-- automaticamente cria-se um registro na tabela artista
-- puxa de usuario nome_usu, nome_comp, bio_art, id_usu
-- bio_art é registrado default "Bem-vindo ao perfil do artista (Nome Completo)!"

-- CREATE TRIGGER obra_ja_favoritada
-- se o usuário cliar outra vez para desfavoritar a obra, ou seja já estiver regitrado, se não ignora
-- se houver: id_usu, id_obr, ativo=1, altera ativo para ativo=0,
-- se houver: id_usu, id_obr, ativo=0, altera ativo para ativo=0

-- CREATE TRIGGER advertencia
-- selecionar id_usu e somar +1 no valor de advertencia_uru

-- CREATE TRIGGER banir
-- se id_usu da tabela usuario atingir 2 na advertencia_usu altera ban_usu=1 

-- Quantidade de seguidores por artista
CREATE VIEW qtd_seguidores AS
SELECT id_artista, COUNT(*) AS total_seguidores
FROM seguidor_artista
GROUP BY id_artista;

-- Quantidade de artistas que cada seguidor segue
CREATE VIEW qtd_seguindo AS
SELECT id_seguidor, COUNT(*) AS total_seguindo
FROM seguidor_artista
GROUP BY id_seguidor;

-- Quantidade de favoritos por obra
CREATE VIEW qtd_favoritos AS
SELECT id_obr, COUNT(*) AS total_favoritos
FROM favorito_obra
WHERE ativo = 1
GROUP BY id_obr;

-- Quantidade de comentários por obra
CREATE VIEW qtd_comentarios AS
SELECT id_obr, COUNT(id_com) AS total_comentarios
FROM comentario
GROUP BY id_obr;

-- Comentários detalhados de cada obra
CREATE VIEW comentarios_da_obra AS
SELECT id_obr, id_usu, texto_com
FROM comentario;

-- Coleções de usuários com detalhes das obras
CREATE VIEW colecoes_usuario AS
SELECT 
    c.nome_col,
    c.id_usu,
    oco.id_obr,
    oco.id_col,
    o.titulo_obr,
    o.descricao_obr,
    o.situacao_obr,
    o.id_cat,
    o.id_art
FROM colecao c
INNER JOIN obra_colecao oco ON c.id_col = oco.id_col
INNER JOIN obra o ON oco.id_obr = o.id_obr;

-- Retornos da barra de pesquisa
CREATE VIEW pesquisar AS
SELECT u.nome_usu, u.nome_comp, NULL AS nome_cat, NULL AS titulo_obr
FROM usuario u
WHERE u.tipo_usu = 'art'
UNION ALL
SELECT NULL, NULL, c.nome_cat, NULL
FROM categoria c
UNION ALL
SELECT NULL, NULL, NULL, o.titulo_obr
FROM obra o;

-- Liberação automática ao cadastrar artista
DELIMITER |
CREATE TRIGGER adc_liberacao_de_artista
AFTER INSERT ON usuario
FOR EACH ROW
BEGIN
    IF NEW.tipo_usu = 'art' THEN
        INSERT INTO liberacao_artista (status_lib, id_art)
        VALUES ('p', NULL); -- será atualizado ao aprovar
    END IF;
END|
DELIMITER ;

-- Aprovação gera registro na tabela artista
DELIMITER |
CREATE TRIGGER adc_artista_apr
AFTER UPDATE ON liberacao_artista
FOR EACH ROW
BEGIN
    IF NEW.status_lib = 'a' AND OLD.status_lib != 'a' THEN
        INSERT INTO artista (nome_usu, nome_comp, bio_art, id_usu)
        SELECT u.nome_usu, u.nome_comp, 
               CONCAT('Bem-vindo ao perfil do artista ', u.nome_comp, '!'), 
               u.id_usu
        FROM usuario u
        WHERE u.id_usu = (
            SELECT a.id_usu
            FROM artista a
            WHERE a.id_art = NEW.id_art
        );
    END IF;
END|
DELIMITER ;

-- Marcar e desmarcar favoritos
DELIMITER |
CREATE TRIGGER obra_ja_favoritada
BEFORE INSERT ON favorito_obra
FOR EACH ROW
BEGIN
    DECLARE existe INT;
    SELECT COUNT(*) INTO existe
    FROM favorito_obra
    WHERE id_usu = NEW.id_usu AND id_obr = NEW.id_obr;

    IF existe > 0 THEN
        UPDATE favorito_obra
        SET ativo = IF(ativo = 1, 0, 1)
        WHERE id_usu = NEW.id_usu AND id_obr = NEW.id_obr;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Atualizado favorito existente'; -- evita INSERT real
    END IF;
END|
DELIMITER ;

-- Adicionar advertência
DELIMITER |
CREATE TRIGGER advertencia
AFTER INSERT ON comentario
FOR EACH ROW
BEGIN
    UPDATE usuario
    SET advertencia_usu = advertencia_usu + 1
    WHERE id_usu = NEW.id_usu;
END|
DELIMITER ;

-- Banimento automático ao atingir 2 advertências
DELIMITER |
CREATE TRIGGER banir
AFTER UPDATE ON usuario
FOR EACH ROW
BEGIN
    IF NEW.advertencia_usu >= 2 THEN
        UPDATE usuario
        SET ban_usu = 1
        WHERE id_usu = NEW.id_usu;
    END IF;
END|
DELIMITER ;



INSERT INTO usuario (nome_usu, nome_comp, email_usu, senha_usu, tipo_usu)
VALUES
('ana01', 'Ana Souza', 'ana01@email.com', 'senha123', 'apr'),
('bruno02', 'Bruno Lima', 'bruno02@email.com', 'senha123', 'apr'),
('carla03', 'Carla Alves', 'carla03@email.com', 'senha123', 'apr'),
('daniel04', 'Daniel Rocha', 'daniel04@email.com', 'senha123', 'adm'),
('edu05', 'Eduardo Silva', 'edu05@email.com', 'senha123', 'apr'),
('flavia06', 'Flávia Martins', 'flavia06@email.com', 'senha123', 'apr'),
('gabriel07', 'Gabriel Nunes', 'gabriel07@email.com', 'senha123', 'apr'),
('helen08', 'Helen Teixeira', 'helen08@email.com', 'senha123', 'apr'),
('igor09', 'Igor Fernandes', 'igor09@email.com', 'senha123', 'apr'),
('juliana10', 'Juliana Ribeiro', 'juliana10@email.com', 'senha123', 'apr');


INSERT INTO artista (nome_usu, nome_comp, bio_art, id_usu)
VALUES
('ana01', 'Ana Souza', 'Pintora surrealista', 1),
('bruno02', 'Bruno Lima', 'Artista contemporâneo', 2),
('carla03', 'Carla Alves', 'Obras em aquarela', 3),
('edu05', 'Eduardo Silva', 'Escultor moderno', 5),
('flavia06', 'Flávia Martins', 'Retratista', 6),
('gabriel07', 'Gabriel Nunes', 'Arte digital', 7),
('helen08', 'Helen Teixeira', 'Minimalista', 8),
('igor09', 'Igor Fernandes', 'Arte urbana', 9),
('juliana10', 'Juliana Ribeiro', 'Abstracionismo', 10),
('daniel04', 'Daniel Rocha', 'Fotografia artística', 4);


INSERT INTO categoria (nome_cat, descricao_cat, foto)
VALUES
('Pintura', 'Obras feitas com tinta', '/uploads/imagem.png'),
('Escultura', 'Obras em 3D esculpidas', '/uploads/imagem.png'),
('Fotografia', 'Capturas fotográficas', '/uploads/imagem.png'),
('Arte Digital', 'Obras criadas digitalmente', '/uploads/imagem.png'),
('Desenho', 'Obras em grafite/lápis', '/uploads/imagem.png'),
('Abstrata', 'Arte não figurativa', '/uploads/imagem.png'),
('Surrealismo', 'Obras surreais e oníricas', '/uploads/imagem.png'),
('Retrato', 'Foco em pessoas', '/uploads/imagem.png'),
('Paisagem', 'Foco em cenários naturais', '/uploads/imagem.png'),
('Minimalista', 'Composições simples', '/uploads/imagem.png');


INSERT INTO obra (titulo_obr, descricao_obr, situacao_obr, id_cat, id_art)
VALUES
('Sonho Azul', 'Pintura surreal', 'disponível', 7, 1),
('Cidade Cinza', 'Grafite urbano', 'vendida', 8, 9),
('Reflexos', 'Foto noturna', 'disponível', 3, 10),
('Rostos', 'Retratos expressivos', 'vendida', 8, 6),
('Natureza Bruta', 'Escultura em pedra', 'disponível', 2, 5),
('Luz e Sombra', 'Arte minimalista', 'em análise', 10, 8),
('Chamas Digitais', 'Arte digital em vermelho', 'disponível', 4, 7),
('Jardim Invisível', 'Pintura surrealista', 'em análise', 1, 1),
('Horizonte Vazio', 'Desenho monocromático', 'disponível', 5, 3),
('Vento Norte', 'Paisagem montanhosa', 'disponível', 9, 2);



INSERT INTO colecao (nome_col, id_usu)
VALUES
('Coleção Aquarela', 3),
('Coleção Urbana', 9),
('Coleção Luzes', 10),
('Coleção Clássica', 5),
('Coleção Sombras', 8),
('Coleção Abstrata', 1),
('Coleção Natureza', 2),
('Coleção Digital', 7),
('Coleção Retrato', 6),
('Coleção Experimental', 4);



INSERT INTO obra_colecao (id_obr, id_col)
VALUES
(1, 6),
(2, 2),
(3, 3),
(4, 9),
(5, 4),
(6, 5),
(7, 8),
(8, 6),
(9, 1),
(10, 7);


INSERT INTO comentario (id_usu, id_obr, texto_com)
VALUES
(2, 1, 'Obra fantástica!'),
(3, 2, 'Muito criativa!'),
(4, 3, 'Adorei a iluminação.'),
(5, 4, 'Incrível retrato.'),
(6, 5, 'Escultura impactante.'),
(7, 6, 'Simples e belo.'),
(8, 7, 'Cores vibrantes.'),
(9, 8, 'Surreal mesmo!'),
(10, 9, 'Muito expressivo.'),
(1, 10, 'Cenário inspirador.');


INSERT INTO favorito_obra (id_usu, id_obr, ativo)
VALUES
(1, 3, 1),
(2, 4, 1),
(3, 5, 1),
(4, 1, 1),
(5, 2, 1),
(6, 6, 1),
(7, 7, 1),
(8, 8, 1),
(9, 9, 1),
(10, 10, 1);


INSERT INTO liberacao_artista (status_lib, id_art)
VALUES
('a', 1),
('a', 2),
('p', 3),
('a', 4),
('r', 5),
('p', 6),
('a', 7),
('p', 8),
('a', 9),
('a', 10);


INSERT INTO seguidor_artista (id_seguidor, id_artista)
VALUES
(1, 2),
(2, 3),
(3, 4),
(4, 5),
(5, 6),
(6, 7),
(7, 8),
(8, 9),
(9, 10),
(10, 1);


INSERT INTO suporte (email_sup, assunto_sup, descricao_sup)
VALUES
('ana01@email.com', 'Erro no login', 'Não consigo acessar minha conta.'),
('bruno02@email.com', 'Obra sumiu', 'Minha obra foi removida.'),
('carla03@email.com', 'Alterar senha', 'Como trocar minha senha?'),
('daniel04@email.com', 'Conta bloqueada', 'Recebi uma advertência injusta.'),
('edu05@email.com', 'Imagem da obra', 'Como faço upload da foto?'),
('flavia06@email.com', 'Problema de carregamento', 'Site muito lento.'),
('gabriel07@email.com', 'Cobrança indevida', 'Fui cobrado indevidamente.'),
('helen08@email.com', 'Dados errados', 'Meu nome está errado.'),
('igor09@email.com', 'Revisar perfil', 'Atualizei o perfil, mas não aparece.'),
('juliana10@email.com', 'Reportar bug', 'Encontrei um erro no envio de obras.');


update categoria set 
foto_cat="\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00\xff\xdb\x00C\x00\x02\x01\x01\x02\x01\x01\x02\x02\x02\x02\x02\x02\x02\x02\x03\x05\x03\x03\x03\x03\x03\x06\x04\x04\x03\x05\x07\x06\x07\x07\x07\x06\x07\x07\x08\t\x0b\t\x08\x08\n\x08\x07\x07\n\r\n\n\x0b\x0c\x0c\x0c\x0c\x07\t\x0e\x0f\r\x0c\x0e\x0b\x0c\x0c\x0c\xff\xdb\x00C\x01\x02\x02\x02\x03\x03\x03"




