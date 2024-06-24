const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');

const SECRET_KEY = 'secretpassword'; // Chave secreta para JWT

// Rota: POST /api/register
// Desc: Registrar um novo usuário
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Verifica se o usuário já existe
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }

    // Cria um novo usuário
    user = new User({
      name,
      email,
      password,
    });

    // Criptografa a senha
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    res.status(201).json({ message: 'Usuário registrado com sucesso' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Rota: POST /api/login
// Desc: Login do usuário
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verifica se o usuário existe
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    // Verifica a senha
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    // Gera o token JWT
    const payload = {
      user: {
        id: user.id,
      }
    };

    jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

module.exports = router;
