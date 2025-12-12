# Sistema de Estoque - Simplificando

Este projeto é um sistema de gerenciamento de estoque desenvolvido com Node.js, Express e MySQL. Atualmente, ele suporta o cadastro simplificado de materiais e possui uma estrutura de banco de dados robusta preparada para expansão (controle de componentes, produtos e vendas).

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:
* [Node.js](https://nodejs.org/)
* [MySQL Server](https://dev.mysql.com/downloads/installer/)

## 🚀 Como Rodar o Projeto

### 1. Instalar Dependências
Abra o terminal na pasta do projeto e instale as bibliotecas necessárias:
```bash
npm install

-- ==========================================
-- 1. CRIAÇÃO DO BANCO E TABELA ATUAL
-- ==========================================
CREATE DATABASE IF NOT EXISTS sistemadeestoque CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sistemadeestoque;

-- Tabela utilizada pelo server.js atual (Simples)
CREATE TABLE IF NOT EXISTS materiais (
    id INT PRIMARY KEY, 
    nome_item VARCHAR(255) NOT NULL,
    destino VARCHAR(50),
    projeto VARCHAR(255),
    observacoes TEXT,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. ESTRUTURA PARA EXPANSÃO (USUÁRIOS E LOCAIS)
-- ==========================================

CREATE TABLE IF NOT EXISTS usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome_usuario VARCHAR(100) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    tipo_perfil ENUM('ADMINISTRADOR', 'LOGISTICO') NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categorias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome_categoria VARCHAR(100) NOT NULL
);

-- Locais físicos (Armazéns, Depósitos, Lojas)
CREATE TABLE IF NOT EXISTS locais_estoque (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome_local VARCHAR(150) NOT NULL,
    capacidade_maxima INT NOT NULL DEFAULT 0
);

-- ==========================================
-- 3. DEFINIÇÃO DE ITENS (CATÁLOGO)
-- ==========================================

CREATE TABLE IF NOT EXISTS componentes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    cod_referencia VARCHAR(50) UNIQUE NOT NULL,
    custo_unitario DECIMAL(10, 2) NOT NULL,
    data_registro DATE DEFAULT (CURRENT_DATE),
    categoria_id INT,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

CREATE TABLE IF NOT EXISTS produtos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    cod_produto VARCHAR(50) UNIQUE NOT NULL,
    preco_base DECIMAL(10, 2) NOT NULL,
    categoria_id INT,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- ==========================================
-- 4. QUANTIDADES FÍSICAS (O ESTOQUE REAL)
-- ==========================================

CREATE TABLE IF NOT EXISTS saldo_estoque_componentes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    local_id INT NOT NULL,
    componente_id INT NOT NULL,
    quantidade_atual INT NOT NULL DEFAULT 0,
    FOREIGN KEY (local_id) REFERENCES locais_estoque(id),
    FOREIGN KEY (componente_id) REFERENCES componentes(id),
    UNIQUE(local_id, componente_id)
);

CREATE TABLE IF NOT EXISTS saldo_estoque_produtos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    local_id INT NOT NULL,
    produto_id INT NOT NULL,
    quantidade_atual INT NOT NULL DEFAULT 0,
    FOREIGN KEY (local_id) REFERENCES locais_estoque(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    UNIQUE(local_id, produto_id)
);

-- ==========================================
-- 5. ENGENHARIA DO PRODUTO (RECEITA)
-- ==========================================

CREATE TABLE IF NOT EXISTS composicao_produtos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    produto_id INT NOT NULL,      -- O pai (ex: Bicicleta)
    componente_id INT NOT NULL,   -- O filho (ex: Roda)
    quantidade_necessaria INT NOT NULL DEFAULT 1,
    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    FOREIGN KEY (componente_id) REFERENCES componentes(id)
);

-- ==========================================
-- 6. OPERAÇÕES: PROJETOS E VENDAS
-- ==========================================

CREATE TABLE IF NOT EXISTS projetos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome_projeto VARCHAR(150) NOT NULL,
    cliente VARCHAR(150)
    ADD COLUMN setor VARCHAR(50),
    ADD COLUMN observacoes TEXT;
);

CREATE TABLE IF NOT EXISTS alocacao_projetos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    projeto_id INT NOT NULL,
    componente_id INT NOT NULL,
    quantidade_alocada INT NOT NULL,
    data_alocacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projeto_id) REFERENCES projetos(id),
    FOREIGN KEY (componente_id) REFERENCES componentes(id)
);

CREATE TABLE IF NOT EXISTS vendas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    data_venda DATETIME DEFAULT CURRENT_TIMESTAMP,
    valor_total DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    usuario_id INT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS itens_venda (
    id INT PRIMARY KEY AUTO_INCREMENT,
    venda_id INT NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL,
    preco_negociado DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (venda_id) REFERENCES vendas(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

-- ==========================================
-- 7. AUDITORIA E LOGS (HISTÓRICO)
-- ==========================================

CREATE TABLE IF NOT EXISTS inventarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    data_auditoria DATE NOT NULL,
    descricao VARCHAR(255),
    local_id INT NOT NULL,
    usuario_id INT,
    FOREIGN KEY (local_id) REFERENCES locais_estoque(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS movimentacoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tipo_movimentacao ENUM('COMPRA', 'VENDA', 'PRODUCAO', 'AJUSTE_INVENTARIO', 'ALOCACAO_PROJETO') NOT NULL,
    data_movimentacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    local_id INT NOT NULL,
    produto_id INT NULL,
    componente_id INT NULL,
    quantidade INT NOT NULL, -- Positivo para entrada, Negativo para saída
    usuario_id INT,
    descricao TEXT,
    FOREIGN KEY (local_id) REFERENCES locais_estoque(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    FOREIGN KEY (componente_id) REFERENCES componentes(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT check_item_type CHECK (
        (produto_id IS NOT NULL AND componente_id IS NULL) OR 
        (produto_id IS NULL AND componente_id IS NOT NULL)
    )
);
