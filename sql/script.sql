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
  CONSTRAINT usuario_idperfil_FK FOREIGN KEY (idperfil) REFERENCES perfil (id) ON DELETE RESTRICT ON UPDATE RESTRICT
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

DROP TABLE IF EXISTS questionario, questionario_departamento, questionario_publico, questionario_arquetipo;

-- DROP TABLE IF EXISTS questionario;
CREATE TABLE questionario(
  id int NOT NULL AUTO_INCREMENT,
  nome varchar(100) NOT NULL,
  nomeexterno varchar(100) NOT NULL,
  iddisponibilidade int NOT NULL,
  anonimo boolean NOT NULL,
  url varchar(100) NOT NULL,
  descricao varchar(255) NOT NULL,
  corfundopagina char(7) NOT NULL,
  corfundocard char(7) NOT NULL,
  cordestaque char(7) NOT NULL,
  cortextocard char(7) NOT NULL,
  cortextodestaque char(7) NOT NULL,
  criacao datetime NOT NULL,
  textointroducao text,
  questoes JSON,
  PRIMARY KEY (id),
  UNIQUE KEY questionario_nome_UN (nome),
  KEY questionario_iddisponibilidade_FK_IX (iddisponibilidade),
  CONSTRAINT usuario_iddisponibilidade_FK FOREIGN KEY (iddisponibilidade) REFERENCES disponibilidade (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

-- DROP TABLE IF EXISTS questionario_departamento;
CREATE TABLE questionario_departamento(
  id int NOT NULL AUTO_INCREMENT,
  idquestionario int NOT NULL,
  iddepartamento int NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY questionario_idquestionario_FK_IX (idquestionario, iddepartamento),
  KEY questionario_iddepartamento_FK_IX (iddepartamento),
  CONSTRAINT questionario_idquestionario_FK FOREIGN KEY (idquestionario) REFERENCES questionario (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT questionario_iddepartamento_FK FOREIGN KEY (iddepartamento) REFERENCES departamento (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

-- DROP TABLE IF EXISTS questionario_publico;
CREATE TABLE questionario_publico(
  id int NOT NULL AUTO_INCREMENT,
  idquestionario int NOT NULL,
  idpublico int NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY questionario_idquestionario_FK_IX (idquestionario, idpublico),
  KEY questionario_idpublico_FK_IX (idpublico),
  CONSTRAINT questionario_publico_idquestionario_FK FOREIGN KEY (idquestionario) REFERENCES questionario (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT questionario_idpublico_FK FOREIGN KEY (idpublico) REFERENCES publico (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

-- DROP TABLE IF EXISTS questionario_arquetipo;
CREATE TABLE questionario_arquetipo(
  id int NOT NULL AUTO_INCREMENT,
  idquestionario int NOT NULL,
  idarquetipo int NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY questionario_idquestionario_FK_IX (idquestionario, idarquetipo),
  KEY questionario_idarquetipo_FK_IX (idarquetipo),
  CONSTRAINT questionario_idquestionario_FK_2 FOREIGN KEY (idquestionario) REFERENCES questionario (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT questionario_idarquetipo_FK FOREIGN KEY (idarquetipo) REFERENCES arquetipo (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);