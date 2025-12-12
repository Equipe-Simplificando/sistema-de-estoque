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
// Rota para Cadastrar Material com ID Sequencial (Tapa-buracos)
app.post('/api/cadastrar', (req, res) => {
    const { item, destino, projeto, observacoes } = req.body;

    // Validação simples
    if (!item || !destino) {
        return res.status(400).json({ success: false, error: 'Campos obrigatórios faltando.' });
    }

    // 1. Busca todos os IDs existentes em ordem crescente
    const queryIds = 'SELECT id FROM materiais ORDER BY id ASC';

    db.query(queryIds, (err, results) => {
        if (err) {
            console.error('Erro ao verificar IDs:', err);
            return res.status(500).json({ success: false, error: 'Erro no banco de dados' });
        }

        // 2. Lógica para encontrar o primeiro ID livre (buraco)
        let novoId = 1; // Começa tentando o 1
        for (const row of results) {
            if (row.id === novoId) {
                novoId++; // Se o ID existe, tenta o próximo
            } else {
                break; // Se encontrou um buraco (ex: tem 1 e 3, novoId é 2), para aqui
            }
        }

        // 3. Insere o material forçando o ID encontrado
        const sqlInsert = `INSERT INTO materiais (id, nome_item, destino, projeto, observacoes) VALUES (?, ?, ?, ?, ?)`;
        
        db.query(sqlInsert, [novoId, item, destino, projeto, observacoes], (err, result) => {
            if (err) {
                console.error('Erro ao inserir:', err);
                // Tratamento especial para chave duplicada (caso raro de concorrência)
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ success: false, error: 'O ID foi ocupado durante o processo. Tente novamente.' });
                }
                return res.status(500).json({ success: false, error: 'Erro no banco de dados' });
            }
            
            res.json({ 
                success: true, 
                message: 'Material cadastrado com sucesso!',
                id: novoId // Retorna o ID que calculamos
            });
        });
    });
});

// Rota para Atualizar Material
app.put('/api/atualizar', (req, res) => {
    const { id, item, destino, projeto, observacoes } = req.body;

    if (!id || !item || !destino) {
        return res.status(400).json({ success: false, error: 'Dados obrigatórios faltando.' });
    }

    const sqlUpdate = `
        UPDATE materiais 
        SET nome_item = ?, destino = ?, projeto = ?, observacoes = ?
        WHERE id = ?
    `;

    db.query(sqlUpdate, [item, destino, projeto, observacoes, id], (err, result) => {
        if (err) {
            console.error('Erro ao atualizar:', err);
            return res.status(500).json({ success: false, error: 'Erro no banco de dados' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Material não encontrado para atualização.' });
        }

        res.json({ success: true, message: 'Material atualizado!' });
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