# Sistema de Gerenciamento de Estoque para o Instituto Robótica Sustentável

Este projeto foi desenvolvido pela **Equipe Simplificando** no contexto da disciplina de **Projeto Integrado**, do curso de **Sistemas e Mídias Digitais (Universidade Federal do Ceará – UFC)**.

O sistema atende às necessidades do **Instituto Robótica Sustentável**, uma **organização social sem fins lucrativos**, com sede em **Fortaleza**, que atua na **transformação de resíduos eletrônicos em impacto socioambiental**. A instituição desenvolve ações de **inclusão digital e capacitação tecnológica de jovens**, além de realizar **serviços de manutenção** e **comercialização de equipamentos e componentes reaproveitados**.

---

## Objetivo

Desenvolver um sistema web para gerenciar o estoque, os projetos e as movimentações de materiais do Instituto, contribuindo para a organização, o controle e a rastreabilidade dos componentes utilizados em suas diferentes atividades.

---

## Funcionalidades

* Cadastro e consulta de materiais eletrônicos;
* Gestão de projetos, serviços de manutenção e vendas;
* Leitura de QR Code para identificação rápida de materiais;
* Geração de etiquetas para organização física;
* Controle de acesso por perfis de usuário.

---

## Tecnologias Utilizadas

* Node.js e Express
* MySQL
* JavaScript (Vanilla)
* HTML5 e CSS3
* Multer

---

## Como Rodar o Projeto

Para executar o sistema localmente, é necessário ter **Node.js** e **MySQL** instalados.

### 1. Clone o repositório

```bash
git clone https://github.com/ntyGabriel/sistema-de-estoque.git
cd sistema-de-estoque
```

### 2. Instale as dependências

No terminal, dentro da pasta do projeto:

```bash
npm install
```

### 3. Prepare o banco de dados

Acesse seu cliente MySQL (Workbench, DBeaver ou terminal) e execute os comandos abaixo:

```sql
CREATE DATABASE IF NOT EXISTS sistemadeestoque;
USE sistemadeestoque;

-- Tabela de Materiais
CREATE TABLE IF NOT EXISTS materiais (
    id INT PRIMARY KEY,
    nome_item VARCHAR(255) NOT NULL,
    destino VARCHAR(50),
    projeto VARCHAR(255),
    projeto_id INT,
    observacoes TEXT,
    quantidade INT DEFAULT 1,
    arquivo_dados LONGBLOB,
    arquivo_tipo VARCHAR(50),
    arquivo_nome VARCHAR(255),
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Projetos
CREATE TABLE IF NOT EXISTS projetos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome_projeto VARCHAR(150) NOT NULL,
    cliente VARCHAR(150),
    setor VARCHAR(50),
    observacoes TEXT,
    preco DECIMAL(10, 2) DEFAULT 0.00
);

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome_usuario VARCHAR(100) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    tipo_perfil ENUM('ADMINISTRADOR', 'LOGISTICO') NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Usuários padrão para teste
INSERT INTO usuarios (nome_usuario, senha_hash, tipo_perfil) VALUES 
('admin', 'admin', 'ADMINISTRADOR'),
('logistico', '1234', 'LOGISTICO');
```

### 4. Configure o ambiente (.env)

Crie um arquivo `.env` na raiz do projeto (mesmo nível do `package.json`) com o seguinte conteúdo:

```env
DB_HOST=localhost
DB_USER=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
DB_NAME=sistemadeestoque
PORT=3000
```

### 5. Inicie o servidor

```bash
npm start
```

Acesse no navegador:

```
http://localhost:3000
```

---

## Desenvolvido por

**Equipe Simplificando**

