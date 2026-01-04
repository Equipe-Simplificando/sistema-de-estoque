// ==========================================
// --- ROTAS DE MATERIAIS (ATUALIZADO) ---
// ==========================================

app.post('/api/cadastrar', upload.single('arquivo'), (req, res) => {
    // Adicionado campo 'quantidade'
    const { item, destino, projeto, observacoes, quantidade } = req.body;
    const arquivoDados = req.file ? req.file.buffer : null;
    const arquivoTipo = req.file ? req.file.mimetype : null;
    const arquivoNome = req.file ? req.file.originalname : null;
    
    // Se não vier quantidade, define como 1
    const qtdFinal = quantidade ? parseInt(quantidade) : 1;

    if (!item) return res.status(400).json({ error: 'Nome do item é obrigatório' });

    const queryIDs = 'SELECT id FROM materiais ORDER BY id ASC';
    db.query(queryIDs, (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro no banco' });

        let novoId = 1;
        const idsExistentes = results.map(r => r.id);
        while (idsExistentes.includes(novoId)) novoId++;

        // SQL atualizado com quantidade
        const sqlInsert = `INSERT INTO materiais (id, nome_item, destino, projeto, observacoes, quantidade, arquivo_dados, arquivo_tipo, arquivo_nome) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        db.query(sqlInsert, [novoId, item, destino, projeto, observacoes, qtdFinal, arquivoDados, arquivoTipo, arquivoNome], (err, result) => {
            if (err) return res.status(500).json({ error: 'Erro ao salvar' });
            res.json({ success: true, id: novoId });
        });
    });
});

app.put('/api/atualizar', upload.single('arquivo'), (req, res) => {
    // Adicionado campo 'quantidade'
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
    // Adicionado campo 'quantidade' no SELECT
    const sql = 'SELECT id, nome_item, destino, projeto, observacoes, quantidade, arquivo_nome, arquivo_tipo FROM materiais ORDER BY id ASC';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar dados' });
        res.json(results);
    });
});