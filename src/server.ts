import express, { Request, Response, Express } from 'express';
import fs from 'fs';
import path from 'path';

const server: Express = express();

server.use(express.json());

server.get('/messages', (req: Request, res: Response) => {
  try {
    const filePath = 'C:\\Users\\Augus\\Projects\\chat-extractor\\database\\messages.json';
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(fileData);
    res.status(200).json(jsonData);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

server.use(express.static(path.join(__dirname, 'public')));

server.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

export { server };
