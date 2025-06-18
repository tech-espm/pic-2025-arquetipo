CREATE DATABASE IF NOT EXISTS sistemaquestionarios DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_0900_ai_ci;
USE sistemaquestionarios;

-- DROP TABLE IF EXISTS perfil;
CREATE TABLE perfil (
  id int NOT NULL,
  nome varchar(50) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY nome_UN (nome)
);

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