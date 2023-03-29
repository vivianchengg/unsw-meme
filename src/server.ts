import express, { json, Request, Response } from 'express';
import { dmMessagesV1 } from './dm';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

app.get('/dm/messages/v1', (req: Request, res: Response, next) => {
  const { token, uIds } = req.query;
  res.json(dmMessagesV1(token, uIds));
});

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
