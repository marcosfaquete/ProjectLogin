const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Banco de Dados
const db = new sqlite3.Database("./database.sqlite");

// Criação da tabela de usuários
db.run(
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT
  )`
);

// Rota de cadastro
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  db.run(query, [name, email, hashedPassword], (err) => {
    if (err) {
      return res.status(400).json({ message: "Erro ao cadastrar usuário!" });
    }
    res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
  });
});

// Rota de login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const query = "SELECT * FROM users WHERE email = ?";
  db.get(query, [email], async (err, user) => {
    if (err || !user) {
      return res.status(404).json({ message: "Usuário não encontrado!" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Senha incorreta!" });
    }

    res.status(200).json({ message: "Login bem-sucedido!", user });
  });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
