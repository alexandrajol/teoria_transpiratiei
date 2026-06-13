import express from 'express';
import cors from 'cors';
import { articles } from './data/articles.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/api/articles', (req, res) => {
  res.json(articles);
});

app.get('/api/articles/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const article = articles.find(a => a.id === id);

  if (article) {
    res.json(article);
  } else {
    res.status(404).json({ error: 'Article not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
