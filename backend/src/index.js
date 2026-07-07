import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes.js';
import { initDb } from './db.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', router);

const port = process.env.PORT || 3000;

initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend rodando em http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Erro ao inicializar banco de dados:', error);
    process.exit(1);
  });
