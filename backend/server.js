require('dotenv').config();
const express = require('express');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');

const app = express();
app.use(express.json());

app.use('/users', usersRouter);
app.use('/auth', authRouter);

app.get('/', (req, res) => res.json({ status: 'ok' }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`TheIPTV backend listening on ${port}`));
