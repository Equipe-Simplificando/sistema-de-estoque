require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Configuração do Banco de Dados
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

// ==========================================
// --- ROTAS DE PROJETOS ---
// ==========================================

// 1. Cadastrar Projeto
app.post('/api/cadastrar-projeto', (req, res) => {
    const { item, destino, observacoes } = req.body;
    if (!item) return res.status(400).json({ error: 'Nome do projeto é obrigatório' });

    const sql = `INSERT INTO projetos (nome_projeto, setor, observacoes) VALUES (?, ?, ?)`;
    db.query(sql, [item, destino, observacoes], (err, result) => {
        if (err) {
            console.error('Erro ao cadastrar projeto:', err);
            return res.status(500).json({ error: 'Erro ao cadastrar projeto' });
        }
        res.json({ success: true, id: result.insertId });
    });
});

// 2. Atualizar Projeto
app.put('/api/atualizar-projeto', (req, res) => {
    const { id, item, destino, observacoes } = req.body;
    if (!id || !item) return res.status(400).json({ error: 'ID e Nome são obrigatórios' });

    const sql = `UPDATE projetos SET nome_projeto = ?, setor = ?, observacoes = ? WHERE id = ?`;
    db.query(sql, [item, destino, observacoes, id], (err) => {
        if (err) {
            console.error('Erro ao atualizar projeto:', err);
            return res.status(500).json({ error: 'Erro ao atualizar projeto' });
        }
        res.json({ success: true });
    });
});

// 3. Listar Projetos (Para preencher o select na tela de materiais)
app.get('/api/projetos', (req, res) => {
    db.query('SELECT id, nome_projeto FROM projetos ORDER BY nome_projeto ASC', (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro ao listar projetos' });
        res.json(results);
    });
});

// ==========================================
// --- ROTAS DE MATERIAIS ---
// ==========================================

// 1. Cadastrar Material (Com lógica de ID manual para preencher lacunas)
app.post('/api/cadastrar', (req, res) => {
    const { item, destino, projeto, observacoes } = req.body;

    // Validação simples
    if (!item) {
        return res.status(400).json({ error: 'Nome do item é obrigatório' });
    }

    // Lógica para encontrar o menor ID livre (1, 2, 3...)
    const queryIDs = 'SELECT id FROM materiais ORDER BY id ASC';
    
    db.query(queryIDs, (err, results) => {
        if (err) {
            console.error('Erro ao buscar IDs:', err);
            return res.status(500).json({ error: 'Erro no banco de dados' });
        }

        let novoId = 1;
        const idsExistentes = results.map(r => r.id);

        // Loop simples: enquanto o novoId existir na lista, incrementa +1
        while (idsExistentes.includes(novoId)) {
            novoId++;
        }

        // Insere com o ID calculado
        const sqlInsert = `INSERT INTO materiais (id, nome_item, destino, projeto, observacoes) VALUES (?, ?, ?, ?, ?)`;
        
        db.query(sqlInsert, [novoId, item, destino, projeto, observacoes], (err, result) => {
            if (err) {
                console.error('Erro ao cadastrar material:', err);
                return res.status(500).json({ error: 'Erro ao salvar no banco' });
            }
            // Retorna o sucesso e o ID gerado para o frontend criar a etiqueta
            res.json({ success: true, id: novoId });
        });
    });
});

// 2. Atualizar Material
app.put('/api/atualizar', (req, res) => {
    const { id, item, destino, projeto, observacoes } = req.body;

    if (!id || !item) {
        return res.status(400).json({ error: 'ID e Nome são obrigatórios para atualização' });
    }

    const sql = `UPDATE materiais SET nome_item = ?, destino = ?, projeto = ?, observacoes = ? WHERE id = ?`;
    
    db.query(sql, [item, destino, projeto, observacoes, id], (err, result) => {
        if (err) {
            console.error('Erro ao atualizar material:', err);
            return res.status(500).json({ error: 'Erro ao atualizar material' });
        }
        res.json({ success: true });
    });
});

// 3. Listar Materiais (Para a tabela de estoque)
app.get('/api/materiais', (req, res) => {
    // Seleciona tudo e ordena pelo ID
    const sql = 'SELECT * FROM materiais ORDER BY id ASC';
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao listar materiais:', err);
            return res.status(500).json({ error: 'Erro ao buscar dados' });
        }
        res.json(results);
    });
});

// 4. Deletar Material (Opcional, mas útil)
app.delete('/api/deletar/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM materiais WHERE id = ?';
    
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao deletar' });
        res.json({ success: true });
    });
});

// Inicializa o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});