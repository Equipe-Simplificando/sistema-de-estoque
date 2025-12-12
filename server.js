// server.js
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'sistemadeestoque'
});

db.connect((err) => {
    if (err) console.error('Erro MySQL:', err);
    else console.log('Conectado ao MySQL');
});

// --- ROTAS DE PROJETOS ---

// Cadastrar
app.post('/api/cadastrar-projeto', (req, res) => {
    const { item, destino, observacoes } = req.body;
    if (!item) return res.status(400).json({ error: 'Nome obrigatório' });

    const sql = `INSERT INTO projetos (nome_projeto, setor, observacoes) VALUES (?, ?, ?)`;
    db.query(sql, [item, destino, observacoes], (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao cadastrar' });
        res.json({ success: true, id: result.insertId });
    });
});

// Atualizar
app.put('/api/atualizar-projeto', (req, res) => {
    const { id, item, destino, observacoes } = req.body;
    if (!id || !item) return res.status(400).json({ error: 'ID e Nome obrigatórios' });

    const sql = `UPDATE projetos SET nome_projeto = ?, setor = ?, observacoes = ? WHERE id = ?`;
    db.query(sql, [item, destino, observacoes, id], (err) => {
        if (err) return res.status(500).json({ error: 'Erro ao atualizar' });
        res.json({ success: true });
    });
});

// Listar (para selects)
app.get('/api/projetos', (req, res) => {
    db.query('SELECT id, nome_projeto FROM projetos ORDER BY nome_projeto ASC', (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro ao listar' });
        res.json(results);
    });
});

// --- ROTAS DE MATERIAIS (Resumidas para contexto) ---
app.post('/api/cadastrar', (req, res) => { /* ... código existente ... */ });
app.put('/api/atualizar', (req, res) => { /* ... código existente ... */ });
app.get('/api/materiais', (req, res) => { /* ... código existente ... */ });

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});