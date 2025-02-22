const express = require("express");
const path = require("path");

const app = express();

// Servir os arquivos do Verbo Vivo
app.use(express.static(path.join(__dirname, "public")));

// Redirecionar todas as rotas para o React
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));