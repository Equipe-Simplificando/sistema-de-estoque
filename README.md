# Sistema de Estoque - Simplificando

Este projeto é um sistema simples de gerenciamento de estoque que permite cadastrar e listar materiais, desenvolvido com Node.js, Express e MySQL.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:
* [Node.js](https://nodejs.org/)
* [MySQL Server](https://dev.mysql.com/downloads/installer/)

## 🚀 Como Rodar o Projeto

### 1. Instalar Dependências
Abra o terminal na pasta do projeto e execute:
```bash
npm install

-- 1. Cria o Banco de Dados (se não existir)
CREATE DATABASE IF NOT EXISTS sistemadeestoque;
USE sistemadeestoque;

-- 2. Cria a tabela principal usada pelo server.js
CREATE TABLE IF NOT EXISTS materiais (
    id INT PRIMARY KEY, -- O ID é gerenciado pelo código (logica de tapa-buracos), não usamos AUTO_INCREMENT aqui
    nome_item VARCHAR(255) NOT NULL,
    destino VARCHAR(255),
    projeto VARCHAR(255),
    observacoes TEXT,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome_usuario VARCHAR(100) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    tipo_perfil ENUM('ADMINISTRADOR', 'LOGISTICO') NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categorias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome_categoria VARCHAR(100) NOT NULL
);

-- Locais físicos (Armazéns, Depósitos, Lojas)
CREATE TABLE locais_estoque (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome_local VARCHAR(150) NOT NULL, -- Ex: "Depósito Central"
    capacidade_maxima INT NOT NULL DEFAULT 0
);

-- ==========================================
-- 2. DEFINIÇÃO DE ITENS (CATÁLOGO)
-- Nota: Aqui NÃO guardamos a quantidade, apenas o que é o item.
-- ==========================================

CREATE TABLE componentes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    cod_referencia VARCHAR(50) UNIQUE NOT NULL,
    custo_unitario DECIMAL(10, 2) NOT NULL, -- DECIMAL é obrigatório para dinheiro
    data_registro DATE DEFAULT (CURRENT_DATE),
    categoria_id INT,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

CREATE TABLE produtos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    cod_produto VARCHAR(50) UNIQUE NOT NULL,
    preco_base DECIMAL(10, 2) NOT NULL,
    categoria_id INT,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- ==========================================
-- 3. QUANTIDADES FÍSICAS (O ESTOQUE REAL)
-- Aqui sabemos QUANTO temos e ONDE está.
-- ==========================================

CREATE TABLE saldo_estoque_componentes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    local_id INT NOT NULL,
    componente_id INT NOT NULL,
    quantidade_atual INT NOT NULL DEFAULT 0,
    FOREIGN KEY (local_id) REFERENCES locais_estoque(id),
    FOREIGN KEY (componente_id) REFERENCES componentes(id),
    UNIQUE(local_id, componente_id) -- Impede duplicidade do mesmo item no mesmo local
);

CREATE TABLE saldo_estoque_produtos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    local_id INT NOT NULL,
    produto_id INT NOT NULL,
    quantidade_atual INT NOT NULL DEFAULT 0,
    FOREIGN KEY (local_id) REFERENCES locais_estoque(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    UNIQUE(local_id, produto_id)
);

-- ==========================================
-- 4. ENGENHARIA DO PRODUTO (RECEITA)
-- ==========================================

CREATE TABLE composicao_produtos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    produto_id INT NOT NULL,     -- O pai (ex: Bicicleta)
    componente_id INT NOT NULL,  -- O filho (ex: Roda)
    quantidade_necessaria INT NOT NULL DEFAULT 1, -- Melhoria Crítica: Quantas rodas?
    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    FOREIGN KEY (componente_id) REFERENCES componentes(id)
);

-- ==========================================
-- 5. OPERAÇÕES: PROJETOS E VENDAS
-- ==========================================

CREATE TABLE projetos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome_projeto VARCHAR(150) NOT NULL,
    cliente VARCHAR(150)
);

CREATE TABLE alocacao_projetos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    projeto_id INT NOT NULL,
    componente_id INT NOT NULL,
    quantidade_alocada INT NOT NULL,
    data_alocacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projeto_id) REFERENCES projetos(id),
    FOREIGN KEY (componente_id) REFERENCES componentes(id)
);

CREATE TABLE vendas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    data_venda DATETIME DEFAULT CURRENT_TIMESTAMP,
    valor_total DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    usuario_id INT, -- Vendedor/Logístico
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE itens_venda (
    id INT PRIMARY KEY AUTO_INCREMENT,
    venda_id INT NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL,
    preco_negociado DECIMAL(10, 2) NOT NULL, -- Pode ser diferente do preço base
    FOREIGN KEY (venda_id) REFERENCES vendas(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

-- ==========================================
-- 6. AUDITORIA E LOGS (HISTÓRICO)
-- ==========================================

CREATE TABLE inventarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    data_auditoria DATE NOT NULL,
    descricao VARCHAR(255),
    local_id INT NOT NULL, -- O inventário é feito em um local específico
    usuario_id INT,
    FOREIGN KEY (local_id) REFERENCES locais_estoque(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabela unificada para rastrear o fluxo de entrada e saída
CREATE TABLE movimentacoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tipo_movimentacao ENUM('COMPRA', 'VENDA', 'PRODUCAO', 'AJUSTE_INVENTARIO', 'ALOCACAO_PROJETO') NOT NULL,
    data_movimentacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    local_id INT NOT NULL, -- Onde ocorreu
    
    -- Campos opcionais (ou é produto ou é componente)
    produto_id INT NULL,
    componente_id INT NULL,
    
    quantidade INT NOT NULL, -- Positivo para entrada, Negativo para saída
    usuario_id INT,
    descricao TEXT,
    
    FOREIGN KEY (local_id) REFERENCES locais_estoque(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    FOREIGN KEY (componente_id) REFERENCES componentes(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    
    -- Garante que a movimentação é de UM ou OUTRO, não ambos
    CONSTRAINT check_item_type CHECK (
        (produto_id IS NOT NULL AND componente_id IS NULL) OR 
        (produto_id IS NULL AND componente_id IS NOT NULL)
    )
);
