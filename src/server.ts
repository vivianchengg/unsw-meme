import express, { json, Request, Response } from 'express';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import { echo } from './echo';
import { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1, channelLeaveV1, channelAddOwnerV1, channelRemoveOwnerV1 } from './channel';
import { channelsCreateV1, channelsListV1, channelsListAllV1 } from './channels';
import { clearV1 } from './other';
import { userProfileV1, userProfileSetName, userProfileSetHandleV1, userProfileSetEmailV1 } from './users';
import { authRegisterV1, authLoginV1, authLogoutV1 } from './auth';
import { dmCreateV1, dmRemoveV1, dmLeaveV1, dmMessagesV1, dmListV1 } from './dm';

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

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

app.delete('/clear/v1', (req: Request, res: Response) => {
  const result = clearV1();
  return res.json(result);
});

app.post('/auth/login/v2', (req: Request, res: Response) => {
  const { email, password } = req.body;
  return res.json(authLoginV1(email, password));
});

app.post('/auth/register/v2', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  return res.json(authRegisterV1(email, password, nameFirst, nameLast));
});

app.post('/auth/logout/v1', (req: Request, res: Response) => {
  const { token } = req.body;
  return res.json(authLogoutV1(token));
});

app.get('/user/profile/v2', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const uId = parseInt(req.query.uId as string);
  return res.json(userProfileV1(token, uId));
});

app.post('/channels/create/v2', (req: Request, res: Response) => {
  const { token, name, isPublic } = req.body;
  return res.json(channelsCreateV1(token, name, isPublic));
});

app.get('/channel/details/v2', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const channelId = parseInt(req.query.channelId as string);
  return res.json(channelDetailsV1(token, channelId));
});

app.post('/channel/join/v2', (req: Request, res: Response) => {
  const { token, channelId } = req.body;
  return res.json(channelJoinV1(token, channelId));
});

app.post('/channel/invite/v2', (req: Request, res: Response) => {
  const { token, channelId, uId } = req.body;
  res.json(channelInviteV1(token, channelId, uId));
});

app.get('/channel/messages/v2', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const channelId = parseInt(req.query.channelId as string);
  const start = parseInt(req.query.start as string);
  return res.json(channelMessagesV1(token, channelId, start));
});

app.get('/channels/list/v2', (req: Request, res: Response) => {
  const token = req.query.token as string;
  return res.json(channelsListV1(token));
});

app.get('/channels/listall/v2', (req: Request, res: Response) => {
  const token = req.query.token as string;
  return res.json(channelsListAllV1(token));
});

app.post('/channel/leave/v1', (req: Request, res: Response) => {
  const { token, channelId } = req.body;
  return res.json(channelLeaveV1(token, channelId));
});

app.post('/channel/addowner/v1', (req: Request, res: Response) => {
  const { token, channelId, uId } = req.body;
  return res.json(channelAddOwnerV1(token, channelId, uId));
});

app.post('/channel/removeowner/v1', (req: Request, res: Response) => {
  const { token, channelId, uId } = req.body;
  return res.json(channelRemoveOwnerV1(token, channelId, uId));
});

app.put('/user/profile/sethandle/v1', (req: Request, res: Response) => {
  const { token, handleStr } = req.body;
  return res.json(userProfileSetHandleV1(token, handleStr));
});

app.put('/user/profile/setemail/v1', (req: Request, res: Response) => {
  const { token, email } = req.body;
  return res.json(userProfileSetEmailV1(token, email));
});

app.post('/dm/create/v1', (req: Request, res: Response) => {
  const { token, uIds } = req.body;
  return res.json(dmCreateV1(token, uIds));
});

app.get('/dm/messages/v1', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const dmId = parseInt(req.query.dmId as string);
  const start = parseInt(req.query.start as string);
  res.json(dmMessagesV1(token, dmId, start));
});

app.delete('/dm/remove/v1', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const dmId = parseInt(req.query.dmId as string);
  return res.json(dmRemoveV1(token, dmId));
});

app.post('/dm/leave/v1', (req: Request, res: Response) => {
  const { token, dmId } = req.body;
  return res.json(dmLeaveV1(token, dmId));
});

app.get('/dm/list/v1', (req: Request, res: Response, next) => {
  const token = req.query.token as string;
  return res.json(dmListV1(token));
});

app.put('/user/profile/setname/v1', (req: Request, res: Response) => {
  const { token, nameFirst, nameLast } = req.body;
  return res.json(userProfileSetName(token, nameFirst, nameLast));
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
