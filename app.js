import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import http from "http";
import router from './backend/router.js';

const app = express();

// init middleware
app.use(cors());

// define routes
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api', router);
app.use('/api/getTL87Text', router);

app.use(express.static(path.join(__dirname, "frontend", "build")));
app.get("/*", (_, res) => {
  res.sendFile(path.join(__dirname, "frontend", "build", "index.html"));
});

// define server
const port = process.env.PORT || 4000;
const address = '0.0.0.0'
const httpServer = http.createServer(app);
httpServer.listen(port, address, () => {
  console.log(`🚀 Server Ready at ${address}:${port}! 🚀`);
});