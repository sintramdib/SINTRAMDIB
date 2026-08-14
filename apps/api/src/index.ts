import express from 'express';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  return res.json({ status: 'API rodando perfeitamente!' });
});

// Pega a porta injetada pelo Render ou usa 3333 localmente
const PORT = Number(process.env.PORT) || 3333;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[OK] Servidor escutando na porta ${PORT}`);
});