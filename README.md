Sistema de Estoque - Simplificando
Este é um sistema web de Gerenciamento de Estoque desenvolvido para facilitar o controle de materiais e projetos. O projeto utiliza uma arquitetura cliente-servidor com Node.js e Express no backend e MySQL para persistência de dados, permitindo o cadastro de itens com suporte a upload de imagens e vídeos.

🚀 Funcionalidades
Autenticação Simples: Login diferenciado para Administradores e Logística.

Gestão de Projetos: Cadastro e edição de projetos/setores.

Gestão de Materiais:

Cadastro completo de materiais vinculados a projetos.

Upload de Arquivos: Suporte para anexar imagens ou vídeos aos materiais.

Geração de etiquetas (visualização simples).

Listagem, edição e exclusão de itens.

Interface Intuitiva: Frontend responsivo utilizando HTML, CSS e JavaScript puro.

🛠️ Tecnologias Utilizadas
Backend:

Node.js

Express (Framework web)

MySQL2 (Driver de banco de dados)

Multer (Upload de arquivos/blobs)

Cors (Segurança de requisições)

Dotenv (Variáveis de ambiente)

Frontend: HTML5, CSS3, JavaScript (ES6+).

Banco de Dados: MySQL.

📋 Pré-requisitos
Antes de começar, você precisa ter instalado em sua máquina:

Node.js (Recomendado v14 ou superior)

MySQL Server

🔧 Instalação e Configuração1. Clone o RepositórioBashgit clone https://github.com/seu-usuario/sistema-de-estoque.git
cd sistema-de-estoque
2. Instale as DependênciasAbra o terminal na pasta raiz do projeto e execute:Bashnpm install
3. Configuração do Banco de DadosAcesse seu cliente MySQL (Workbench, DBeaver ou Terminal) e execute o script SQL abaixo para criar o banco e as tabelas necessárias:SQLCREATE DATABASE IF NOT EXISTS sistemadeestoque CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sistemadeestoque;

-- Tabela de Materiais (Suporte a arquivos BLOB)
CREATE TABLE IF NOT EXISTS materiais (
    id INT PRIMARY KEY, 
    nome_item VARCHAR(255) NOT NULL,
    destino VARCHAR(50),
    projeto VARCHAR(255),
    observacoes TEXT,
    arquivo_dados LONGBLOB,
    arquivo_tipo VARCHAR(50),
    arquivo_nome VARCHAR(255),
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
    ALTER TABLE materiais ADD COLUMN quantidade INT DEFAULT 1;
);

-- Tabela de Projetos
CREATE TABLE IF NOT EXISTS projetos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome_projeto VARCHAR(150) NOT NULL,
    cliente VARCHAR(150),
    setor VARCHAR(50),
    observacoes TEXT
);

-- Tabela de Usuários (Estrutura futura)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome_usuario VARCHAR(100) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    tipo_perfil ENUM('ADMINISTRADOR', 'LOGISTICO') NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
);
4. Variáveis de Ambiente (.env)O sistema já possui um arquivo .env configurado por padrão (conforme verificado nos arquivos), mas certifique-se de que ele contém os dados corretos do seu banco local:Snippet de códigoDB_HOST=localhost
DB_USER=root
DB_PASSWORD=1234  # Altere para a senha do seu MySQL
DB_NAME=sistemadeestoque
5. Rodando o ProjetoInicie o servidor backend:Bashnode server.js
O servidor rodará na porta 3000.Para acessar a aplicação, abra o arquivo index.html ou pages/auth/login.html no seu navegador (ou utilize um servidor local como o Live Server do VSCode).🔐 Acesso ao Sistema (Login)Atualmente, o sistema utiliza uma validação simplificada no frontend (login.js). Utilize as credenciais abaixo para testar:PerfilUsuárioSenhaAdministradoradminadminLogísticologistico1234📂 Estrutura de Pastassistema-de-estoque/
├── assets/              # Estilos (CSS), Scripts (JS) e Ícones
├── node_modules/        # Dependências do Node.js
├── pages/               # Páginas HTML (Login, Home, Materiais, Projetos)
├── .env                 # Configurações de ambiente
├── server.js            # Servidor Principal (API e Lógica Backend)
├── package.json         # Manifesto do projeto
└── README.md            # Documentação
📝 Rotas da API (Backend)
POST /api/cadastrar: Cadastra um novo material (suporta multipart/form-data).
GET /api/materiais: Lista todos os materiais (metadados).
GET /api/materiais/arquivo/:id: Retorna a imagem/vídeo do material.
PUT /api/atualizar: Atualiza dados de um material.
DELETE /api/deletar/:id: Remove um material.POST /api/cadastrar-projeto: Cria um novo projeto.
GET /api/projetos: Lista projetos para o dropdown.

Desenvolvido pela Equipe Simplificando
