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


INSERT INTO categoria (nome_cat, descricao_cat)
VALUES
('Pintura', 'Obras feitas com tinta'),
('Escultura', 'Obras em 3D esculpidas'),
('Fotografia', 'Capturas fotográficas'),
('Arte Digital', 'Obras criadas digitalmente'),
('Desenho', 'Obras em grafite/lápis'),
('Abstrata', 'Arte não figurativa'),
('Surrealismo', 'Obras surreais e oníricas'),
('Retrato', 'Foco em pessoas'),
('Paisagem', 'Foco em cenários naturais'),
('Minimalista', 'Composições simples');


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


INSERT INTO favorito_obra (id_usu, id_obr)
VALUES
(1, 3),
(2, 4),
(3, 5),
(4, 1),
(5, 2),
(6, 6),
(7, 7),
(8, 8),
(9, 9),
(10, 10);


INSERT INTO liberacao_artista (status_lib, id_art)
VALUES
('aprovado', 1),
('aprovado', 2),
('pendente', 3),
('aprovado', 4),
('rejeitado', 5),
('pendente', 6),
('aprovado', 7),
('pendente', 8),
('aprovado', 9),
('aprovado', 10);


INSERT INTO seguidor_artista (id_seguidor, id_seguindo)
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







