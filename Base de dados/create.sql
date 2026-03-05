SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS historico_tarefa;
DROP TABLE IF EXISTS historico_parcela;
DROP TABLE IF EXISTS monitorizacao;
DROP TABLE IF EXISTS alerta;
DROP TABLE IF EXISTS tarefa;
DROP TABLE IF EXISTS parcela_cultivo;
DROP TABLE IF EXISTS cultivo;
DROP TABLE IF EXISTS parcela;
DROP TABLE IF EXISTS notificacao;
DROP TABLE IF EXISTS clima;
DROP TABLE IF EXISTS utilizador;
DROP TABLE IF EXISTS cidade;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- CIDADE
-- ============================================

CREATE TABLE cidade (
    cid_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cid_nome VARCHAR(100) NOT NULL
);

-- ============================================
-- UTILIZADOR
-- ============================================

CREATE TABLE utilizador (
    ut_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ut_nome VARCHAR(255) NOT NULL,
    ut_email VARCHAR(255) NOT NULL UNIQUE,
    ut_password VARCHAR(255) NOT NULL,
    ut_datareg DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PARCELA
-- ============================================

CREATE TABLE parcela (
    par_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    par_nome VARCHAR(100) NOT NULL,
    par_area DECIMAL(6,2),
    par_estado VARCHAR(50) NOT NULL, -- Saudável, Atenção, Crítico
    par_ut_id BIGINT NOT NULL,
    CONSTRAINT parcela_fk_utilizador
        FOREIGN KEY (par_ut_id) REFERENCES utilizador(ut_id)
        ON DELETE CASCADE
);

-- ============================================
-- CULTIVO
-- ============================================

CREATE TABLE cultivo (
    cult_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cult_nome VARCHAR(100) NOT NULL,
    cult_descricao TEXT
);

-- ============================================
-- PARCELA_CULTIVO
-- ============================================

CREATE TABLE parcela_cultivo (
    pc_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pc_par_id BIGINT NOT NULL,
    pc_cult_id BIGINT NOT NULL,
    CONSTRAINT pc_fk_parcela
        FOREIGN KEY (pc_par_id) REFERENCES parcela(par_id)
        ON DELETE CASCADE,
    CONSTRAINT pc_fk_cultivo
        FOREIGN KEY (pc_cult_id) REFERENCES cultivo(cult_id)
        ON DELETE CASCADE
);

-- ============================================
-- TAREFA
-- ============================================

CREATE TABLE tarefa (
    tar_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tar_titulo VARCHAR(255) NOT NULL,
    tar_descricao TEXT,
    tar_data_inicio DATE,
    tar_data_fim DATE,
    tar_estado VARCHAR(50) NOT NULL, -- Pendente, Em Progresso, Concluída
    tar_prioridade VARCHAR(50), -- Baixa, Média, Alta
    tar_par_id BIGINT NOT NULL,
    tar_ut_id BIGINT NOT NULL,
    CONSTRAINT tarefa_fk_parcela
        FOREIGN KEY (tar_par_id) REFERENCES parcela(par_id)
        ON DELETE CASCADE,
    CONSTRAINT tarefa_fk_utilizador
        FOREIGN KEY (tar_ut_id) REFERENCES utilizador(ut_id)
        ON DELETE CASCADE
);

-- ============================================
-- HISTORICO_TAREFA
-- ============================================

CREATE TABLE historico_tarefa (
    ht_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ht_tar_id BIGINT NOT NULL,
    ht_estado_anterior VARCHAR(50),
    ht_estado_novo VARCHAR(50),
    ht_data DATETIME DEFAULT CURRENT_TIMESTAMP,
    ht_ut_id BIGINT,
    CONSTRAINT ht_fk_tarefa
        FOREIGN KEY (ht_tar_id) REFERENCES tarefa(tar_id)
        ON DELETE CASCADE,
    CONSTRAINT ht_fk_utilizador
        FOREIGN KEY (ht_ut_id) REFERENCES utilizador(ut_id)
        ON DELETE SET NULL
);

-- ============================================
-- MONITORIZACAO
-- ============================================

CREATE TABLE monitorizacao (
    mon_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mon_par_id BIGINT NOT NULL,
    mon_humidade DECIMAL(5,2),
    mon_temperatura DECIMAL(5,2),
    mon_ph DECIMAL(4,2),
    mon_data DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT mon_fk_parcela
        FOREIGN KEY (mon_par_id) REFERENCES parcela(par_id)
        ON DELETE CASCADE
);

-- ============================================
-- ALERTA
-- ============================================

CREATE TABLE alerta (
    alt_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    alt_tipo VARCHAR(50), -- Crítico, Atenção
    alt_mensagem VARCHAR(255),
    alt_data DATETIME DEFAULT CURRENT_TIMESTAMP,
    alt_par_id BIGINT NOT NULL,
    CONSTRAINT alerta_fk_parcela
        FOREIGN KEY (alt_par_id) REFERENCES parcela(par_id)
        ON DELETE CASCADE
);

-- ============================================
-- HISTORICO_PARCELA
-- ============================================

CREATE TABLE historico_parcela (
    hp_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hp_par_id BIGINT NOT NULL,
    hp_estado_anterior VARCHAR(50),
    hp_estado_novo VARCHAR(50),
    hp_data DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT hp_fk_parcela
        FOREIGN KEY (hp_par_id) REFERENCES parcela(par_id)
        ON DELETE CASCADE
);

-- ============================================
-- NOTIFICACAO
-- ============================================

CREATE TABLE notificacao (
    not_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    not_ut_id BIGINT NOT NULL,
    not_mensagem VARCHAR(255),
    not_lida BOOLEAN DEFAULT FALSE,
    not_data DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT notificacao_fk_utilizador
        FOREIGN KEY (not_ut_id) REFERENCES utilizador(ut_id)
        ON DELETE CASCADE
);


