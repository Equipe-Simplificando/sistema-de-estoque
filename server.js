// server.js
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Configuração do Middleware
app.use(cors()); // Permite conexões do seu front-end
app.use(express.json()); // Permite leitura de JSON no corpo da requisição

// Configuração da Conexão com Banco de Dados
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'sistemadeestoque'
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err);
        return;
    }
    console.log('Conectado ao banco de dados MySQL');
});

// Rota para Cadastrar Material
app.post('/api/cadastrar', (req, res) => {
    const { item, destino, projeto, observacoes } = req.body;

    // Validação simples
    if (!item || !destino) {
        return res.status(400).json({ success: false, error: 'Campos obrigatórios faltando.' });
    }

    const sql = `INSERT INTO materiais (nome_item, destino, projeto, observacoes) VALUES (?, ?, ?, ?)`;
    
    db.query(sql, [item, destino, projeto, observacoes], (err, result) => {
        if (err) {
            console.error('Erro ao inserir:', err);
            return res.status(500).json({ success: false, error: 'Erro no banco de dados' });
        }
        
        res.json({ 
            success: true, 
            message: 'Material cadastrado com sucesso!',
            id: result.insertId 
        });
    });
});
// Rota para Listar Materiais
app.get('/api/materiais', (req, res) => {
    const sql = 'SELECT * FROM materiais ORDER BY id DESC'; // Pega do mais novo para o mais antigo
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao buscar:', err);
            return res.status(500).json({ error: 'Erro ao buscar dados' });
        }
        res.json(results); // Envia a lista como JSON para o navegador
    });
});
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});