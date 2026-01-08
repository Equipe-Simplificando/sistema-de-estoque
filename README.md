**📦 Sistema de Estoque – Simplificando**

Este é um sistema web de Gerenciamento de Estoque desenvolvido para facilitar o controle de materiais e projetos.
O projeto utiliza uma arquitetura cliente-servidor, com Node.js e Express no backend e MySQL para persistência de dados.

O sistema permite o cadastro de materiais, incluindo upload de imagens e vídeos, além da organização por projetos/setores.

🚀 Funcionalidades

Autenticação Simples

Login diferenciado para Administrador e Logística

Gestão de Projetos

Cadastro e edição de projetos/setores

Gestão de Materiais

Cadastro completo de materiais vinculados a projetos

Listagem, edição e exclusão de itens

Geração de etiquetas (visualização simples)

Upload de Arquivos

Suporte para anexar imagens ou vídeos aos materiais

Interface Intuitiva

Frontend responsivo utilizando HTML, CSS e JavaScript puro

🛠️ Tecnologias Utilizadas
Backend

Node.js

Express

MySQL2

Multer (upload de arquivos/blobs)

CORS

Dotenv

Frontend

HTML5

CSS3

JavaScript (ES6+)

Banco de Dados

MySQL

📋 Pré-requisitos

Antes de começar, você precisará ter instalado em sua máquina:

Node.js (recomendado v14 ou superior)

MySQL Server

🔧 Instalação e Configuração
1️⃣ Clone o Repositório
git clone https://github.com/seu-usuario/sistema-de-estoque.git
cd sistema-de-estoque

2️⃣ Instale as Dependências
npm install

3️⃣ Configuração do Banco de Dados

Acesse seu cliente MySQL (Workbench, DBeaver ou Terminal) e execute o script abaixo:

CREATE DATABASE IF NOT EXISTS sistemadeestoque
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE sistemadeestoque;

-- Tabela de Materiais

CREATE TABLE IF NOT EXISTS materiais (
    id INT PRIMARY KEY,
    nome_item VARCHAR(255) NOT NULL,
    destino VARCHAR(50),
    projeto VARCHAR(255),
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
    observacoes TEXT
);

-- Tabela de Usuários (estrutura futura)

CREATE TABLE IF NOT EXISTS usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome_usuario VARCHAR(100) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    tipo_perfil ENUM('ADMINISTRADOR', 'LOGISTICO') NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

4️⃣ Variáveis de Ambiente (.env)

O projeto já possui um arquivo .env. Verifique se os dados estão corretos:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=1234   # Altere para a senha do seu MySQL
DB_NAME=sistemadeestoque

5️⃣ Rodando o Projeto

Inicie o servidor backend:

node server.js


O servidor será iniciado na porta 3000.

Para acessar o frontend, abra:

index.html
ou

pages/auth/login.html

💡 Dica: você pode utilizar o Live Server do VS Code para facilitar.

🔐 Acesso ao Sistema (Login)

Atualmente, o sistema utiliza uma validação simplificada no frontend (login.js).

Credenciais para teste:

Perfil	Usuário	Senha
Administrador	admin	admin
Logística	logistico	1234
📂 Estrutura de Pastas
sistema-de-estoque/
├── assets/              # CSS, JavaScript e ícones
├── node_modules/        # Dependências do Node.js
├── pages/               # Páginas HTML (Login, Home, Materiais, Projetos)
├── .env                 # Variáveis de ambiente
├── server.js            # Servidor principal (API Backend)
├── package.json         # Manifesto do projeto
└── README.md            # Documentação

📝 Rotas da API (Backend)
Materiais

POST /api/cadastrar
Cadastra um novo material (multipart/form-data)

GET /api/materiais
Lista todos os materiais (metadados)

GET /api/materiais/arquivo/:id
Retorna a imagem ou vídeo do material

PUT /api/atualizar
Atualiza os dados de um material

DELETE /api/deletar/:id
Remove um material

Projetos

POST /api/cadastrar-projeto
Cadastra um novo projeto

GET /api/projetos
Lista projetos (usado em dropdowns)

👨‍💻 Desenvolvido por

Equipe Simplificando
