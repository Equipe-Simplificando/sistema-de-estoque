require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');

// 1. INICIALIZAÇÃO
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 2. CONFIGURAÇÃO UPLOAD
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 16 * 1024 * 1024 } // 16MB
});

// 3. BANCO DE DADOS
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
// --- ROTAS DE ARQUIVOS ---
// ==========================================
app.get('/api/materiais/arquivo/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT arquivo_dados, arquivo_tipo FROM materiais WHERE id = ?';
    
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Erro ao buscar arquivo:', err);
            return res.status(500).send('Erro interno');
        }
        if (results.length === 0 || !results[0].arquivo_dados) {
            return res.status(404).send('Arquivo não encontrado');
        }

        const material = results[0];
        res.setHeader('Content-Type', material.arquivo_tipo);
        res.send(material.arquivo_dados);
    });
});

// ==========================================
// --- ROTAS DE PROJETOS ---
// ==========================================

app.get('/api/projetos/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM projetos WHERE id = ?';
    
    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar projeto' });
        if (results.length === 0) return res.status(404).json({ error: 'Projeto não encontrado' });
        res.json(results[0]);
    });
});

// --- ROTA DE CADASTRO (CORRIGIDA E REFORÇADA) ---
app.post('/api/cadastrar-projeto', (req, res) => {
    const { item, destino, observacoes, preco, materiais } = req.body;
    
    if (!item) return res.status(400).json({ error: 'Nome do projeto é obrigatório' });

    // Trata o preço
    const precoFinal = preco ? parseFloat(preco.replace(',', '.')) : 0.00;

    // 1. Cria o Projeto
    const sqlProjeto = `INSERT INTO projetos (nome_projeto, setor, observacoes, preco) VALUES (?, ?, ?, ?)`;
    
    db.query(sqlProjeto, [item, destino, observacoes, precoFinal], (err, result) => {
        if (err) {
            console.error("Erro ao inserir projeto:", err);
            return res.status(500).json({ error: 'Erro ao cadastrar projeto' });
        }

        const novoProjetoId = result.insertId;

        // 2. Vincula os Materiais (Se houver)
        if (materiais && Array.isArray(materiais) && materiais.length > 0) {
            // Log para debug no terminal
            console.log(`Vinculando materiais [${materiais}] ao projeto ID: ${novoProjetoId}`);

            const sqlUpdateMateriais = `UPDATE materiais SET projeto = ? WHERE id IN (?)`;
            
            db.query(sqlUpdateMateriais, [novoProjetoId, materiais], (errMat) => {
                if (errMat) {
                    console.error("Erro ao vincular materiais:", errMat);
                } else {
                    console.log("Materiais vinculados com sucesso.");
                }
                // Responde sucesso mesmo se falhar o vínculo (para não travar o front)
                res.json({ success: true, id: novoProjetoId });
            });
        } else {
            res.json({ success: true, id: novoProjetoId });
        }
    });
});

app.put('/api/atualizar-projeto', (req, res) => {
    const { id, item, destino, observacoes } = req.body;
    if (!id || !item) return res.status(400).json({ error: 'ID e Nome são obrigatórios' });

    const sql = `UPDATE projetos SET nome_projeto = ?, setor = ?, observacoes = ? WHERE id = ?`;
    db.query(sql, [item, destino, observacoes, id], (err) => {
        if (err) return res.status(500).json({ error: 'Erro ao atualizar' });
        res.json({ success: true });
    });
});

app.get('/api/projetos', (req, res) => {
    // Garante que buscamos todos os campos necessários
    db.query('SELECT id, nome_projeto, setor, preco FROM projetos ORDER BY nome_projeto ASC', (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro ao listar' });
        res.json(results);
    });
});

// ==========================================
// --- ROTAS DE MATERIAIS ---
// ==========================================

app.post('/api/cadastrar', upload.single('arquivo'), (req, res) => {
    const { item, destino, projeto, observacoes, quantidade } = req.body;
    const arquivoDados = req.file ? req.file.buffer : null;
    const arquivoTipo = req.file ? req.file.mimetype : null;
    const arquivoNome = req.file ? req.file.originalname : null;
    
    const qtdFinal = quantidade ? parseInt(quantidade) : 1;

    if (!item) return res.status(400).json({ error: 'Nome do item é obrigatório' });

    const queryIDs = 'SELECT id FROM materiais ORDER BY id ASC';
    db.query(queryIDs, (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro no banco' });

        let novoId = 1;
        const idsExistentes = results.map(r => r.id);
        while (idsExistentes.includes(novoId)) novoId++;

        const sqlInsert = `INSERT INTO materiais (id, nome_item, destino, projeto, observacoes, quantidade, arquivo_dados, arquivo_tipo, arquivo_nome) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        db.query(sqlInsert, [novoId, item, destino, projeto, observacoes, qtdFinal, arquivoDados, arquivoTipo, arquivoNome], (err, result) => {
            if (err) return res.status(500).json({ error: 'Erro ao salvar' });
            res.json({ success: true, id: novoId });
        });
    });
});

app.put('/api/atualizar', upload.single('arquivo'), (req, res) => {
    const { id, item, destino, projeto, observacoes, quantidade } = req.body;
    if (!id || !item) return res.status(400).json({ error: 'ID e Nome são obrigatórios' });

    let sql, params;

    if (req.file) {
        sql = `UPDATE materiais SET nome_item = ?, destino = ?, projeto = ?, observacoes = ?, quantidade = ?, arquivo_dados = ?, arquivo_tipo = ?, arquivo_nome = ? WHERE id = ?`;
        params = [item, destino, projeto, observacoes, quantidade, req.file.buffer, req.file.mimetype, req.file.originalname, id];
    } else {
        sql = `UPDATE materiais SET nome_item = ?, destino = ?, projeto = ?, observacoes = ?, quantidade = ? WHERE id = ?`;
        params = [item, destino, projeto, observacoes, quantidade, id];
    }
    
    db.query(sql, params, (err) => {
        if (err) return res.status(500).json({ error: 'Erro ao atualizar' });
        res.json({ success: true });
    });
});

app.get('/api/materiais', (req, res) => {
    const sql = 'SELECT id, nome_item, destino, projeto, observacoes, quantidade, arquivo_nome, arquivo_tipo FROM materiais ORDER BY id ASC';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar dados' });
        res.json(results);
    });
});

app.delete('/api/deletar/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM materiais WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: 'Erro ao deletar' });
        res.json({ success: true });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});