CREATE DATABASE IF NOT EXISTS sistemaquestionarios DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_0900_ai_ci;
USE sistemaquestionarios;

-- DROP TABLE IF EXISTS perfil;
CREATE TABLE perfil (
  id int NOT NULL,
  nome varchar(50) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY nome_UN (nome)
);

-- DROP TABLE IF EXISTS disponibilidade;
CREATE TABLE disponibilidade (
  id int NOT NULL,
  nome varchar(50) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY disponibilidade_nome_UN (nome)
);

-- DROP TABLE IF EXISTS publico;
CREATE TABLE publico (
  id int NOT NULL,
  nome varchar(50) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY publico_nome_UN (nome)
);

-- Manter sincronizado com enums/disponibilidade.ts e models/disponibilidade.ts
INSERT INTO disponibilidade (id, nome) VALUES (1, 'Público'), (2, 'Privado'), (3, 'Oculto');

-- Manter sincronizado com enums/publico.ts e models/publico.ts
INSERT INTO publico (id, nome) VALUES (1, 'Aluno'), (2, 'Funcionário'), (3, 'Externo');

-- Manter sincronizado com enums/perfil.ts e models/perfil.ts
INSERT INTO perfil (id, nome) VALUES (1, 'Administrador'), (2, 'Diretor'), (3, 'Comum');

-- DROP TABLE IF EXISTS usuario;
CREATE TABLE usuario (
  id int NOT NULL AUTO_INCREMENT,
  email varchar(100) NOT NULL,
  nome varchar(100) NOT NULL,
  idperfil int NOT NULL,
  token char(32) DEFAULT NULL,
  exclusao datetime NULL,
  criacao datetime NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY usuario_email_UN (email),
  KEY usuario_exclusao_IX (exclusao),
  KEY usuario_idperfil_FK_IX (idperfil),
  CONSTRAINT usuario_idperfil_FK FOREIGN KEY (idperfil) REFERENCES perfil(id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

INSERT INTO usuario (email, nome, idperfil, token, criacao) VALUES ('admin@espm.br', 'Administrador', 1, NULL, NOW());


-- DROP TABLE IF EXISTS departamento;
CREATE TABLE departamento (
  id int NOT NULL AUTO_INCREMENT,
  nome varchar(100) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY departamento_nome_UN (nome)
);

-- DROP TABLE IF EXISTS usuario_departamento;
CREATE TABLE usuario_departamento (
  id int NOT NULL AUTO_INCREMENT,
  idusuario int NOT NULL,
  iddepartamento int NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY usuario_idusuario_FK_IX (idusuario, iddepartamento),
  KEY usuario_iddepartamento_FK_IX (iddepartamento),
  CONSTRAINT usuario_idusuario_FK FOREIGN KEY (idusuario) REFERENCES usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT usuario_iddepartamento_FK FOREIGN KEY (iddepartamento) REFERENCES departamento (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

DROP TABLE IF EXISTS arquetipo_departamento, questionario_arquetipo, arquetipo;

-- DROP TABLE IF EXISTS arquetipo;
CREATE TABLE arquetipo (
  id int NOT NULL AUTO_INCREMENT,
  nome varchar(100) NOT NULL,
  nomeexterno varchar(100) NOT NULL,
  descricaocurta varchar(255) NOT NULL,
  descricaocompleta text NOT NULL,
  versao int NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY arquetipo_nome_UN (nome)
);

-- DROP TABLE IF EXISTS arquetipo_departamento;
CREATE TABLE arquetipo_departamento (
  id int NOT NULL AUTO_INCREMENT,
  idarquetipo int NOT NULL,
  iddepartamento int NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY arquetipo_idarquetipo_FK_IX (idarquetipo, iddepartamento),
  KEY arquetipo_iddepartamento_FK_IX (iddepartamento),
  CONSTRAINT arquetipo_idarquetipo_FK FOREIGN KEY (idarquetipo) REFERENCES arquetipo (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  -- Perguntar: é nescessario ser RESTRICT nesse caso
  CONSTRAINT arquetipo_iddepartamento_FK FOREIGN KEY (iddepartamento) REFERENCES departamento (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

-- DROP TABLE IF EXISTS questionario_departamento, questionario_publicoalvo, questionario_arquetipo, questionario, submissao;

-- DROP TABLE IF EXISTS questionario;
CREATE TABLE questionario (
  id INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  nomeexterno VARCHAR(100) NOT NULL,
  iddisponibilidade INT NOT NULL,
  anonimo BOOLEAN NOT NULL,
  url VARCHAR(100) NOT NULL,
  descricao TEXT NOT NULL,
  corfundopagina VARCHAR(7) NOT NULL,
  corfundocard VARCHAR(7) NOT NULL,
  cordestaque VARCHAR(7) NOT NULL,
  cortextocard VARCHAR(7) NOT NULL,
  cortextodestaque VARCHAR(7) NOT NULL,
  criacao DATETIME NULL,
  textointroducao TEXT NULL,
  questoes JSON,
  versaointroducao INT NOT NULL DEFAULT 0,
  versaoquestionario INT NOT NULL DEFAULT 0,
  versaologo INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY questionario_nome_UN (nome),
  UNIQUE KEY questionario_nomeexterno_UN (nomeexterno),
  UNIQUE KEY questionario_url_UN (url),
  CONSTRAINT questionario_iddisponibilidade_fk FOREIGN KEY (iddisponibilidade) REFERENCES disponibilidade(id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

-- DROP TABLE IF EXISTS questionario_departamento;
CREATE TABLE questionario_departamento (
  id INT NOT NULL AUTO_INCREMENT,
  idquestionario INT NOT NULL,
  iddepartamento INT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_questionario_departamento (idquestionario, iddepartamento),
  CONSTRAINT fk_qd_questionario FOREIGN KEY (idquestionario) REFERENCES questionario(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_qd_departamento FOREIGN KEY (iddepartamento) REFERENCES departamento(id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

-- DROP TABLE IF EXISTS questionario_publicoalvo;
CREATE TABLE questionario_publicoalvo (
  id INT NOT NULL AUTO_INCREMENT,
  idquestionario INT NOT NULL,
  idpublicoalvo INT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_questionario_publicoalvo (idquestionario, idpublicoalvo),
  CONSTRAINT fk_qp_questionario FOREIGN KEY (idquestionario) REFERENCES questionario(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_qp_publicoalvo FOREIGN KEY (idpublicoalvo) REFERENCES publico(id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

-- DROP TABLE IF EXISTS questionario_arquetipo;
CREATE TABLE questionario_arquetipo (
  id INT NOT NULL AUTO_INCREMENT,
  idquestionario INT NOT NULL,
  idarquetipo INT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_questionario_arquetipo (idquestionario, idarquetipo),
  CONSTRAINT fk_qa_questionario FOREIGN KEY (idquestionario) REFERENCES questionario(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_qa_arquetipo FOREIGN KEY (idarquetipo) REFERENCES arquetipo(id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

-- DROP TABLE IF EXISTS submissao;
CREATE TABLE submissao (
  id INT NOT NULL AUTO_INCREMENT,
  idquestionario INT NOT NULL,
  idarquetipo INT NOT NULL,
  idpublicoalvo INT NOT NULL,
  data datetime NOT NULL,
  nome VARCHAR(255),
  telefone VARCHAR(15),
  email VARCHAR(255),
  resposta JSON NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY submissao_email_UN(email, idquestionario),
  CONSTRAINT fk_qs_questionario_FK FOREIGN KEY (idquestionario) REFERENCES questionario(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_ps_publicoalvo FOREIGN KEY (idpublicoalvo) REFERENCES publico(id) ON DELETE RESTRICT ON UPDATE RESTRICT
);
