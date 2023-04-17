import express, { json, Request, Response } from 'express';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import { echo } from './echo';
import { channelDetailsV3, channelJoinV3, channelInviteV3, channelMessagesV3, channelLeaveV2, channelAddOwnerV2, channelRemoveOwnerV2 } from './channel';
import { channelsCreateV1, channelsListV1, channelsListAllV1 } from './channels';
import { clearV1, notificationsGetV1, searchV1, adminuserRemoveV1, adminuserPermChangeV1 } from './other';
import { userProfileV1, userProfileSetName, userProfileSetHandleV1, userProfileSetEmailV1, usersAllV1 } from './users';
import { authRegisterV1, authLoginV1, authLogoutV1, authPasswordRequestV1, authPasswordResetV1 } from './auth';
import { messageSendV1, messageRemoveV1, messageEditV1, messageSendDmV1, messageSendLaterDMV1, messagePinV1, messageUnpinV1, messageReactV1, messageUnreactV1, messageShareV1, messageSendLaterV1 } from './message';
import { dmCreateV1, dmRemoveV1, dmLeaveV1, dmMessagesV1, dmListV1, dmDetailsV1 } from './dm';

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

app.post('/auth/login/v3', (req: Request, res: Response) => {
  const { email, password } = req.body;
  return res.json(authLoginV1(email, password));
});

app.post('/auth/register/v3', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  return res.json(authRegisterV1(email, password, nameFirst, nameLast));
});

app.post('/auth/logout/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  return res.json(authLogoutV1(token));
});

app.get('/user/profile/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const uId = parseInt(req.query.uId as string);
  return res.json(userProfileV1(token, uId));
});

app.post('/channels/create/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const { name, isPublic } = req.body;
  return res.json(channelsCreateV1(token, name, isPublic));
});

app.get('/channel/details/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const channelId = parseInt(req.query.channelId as string);
  return res.json(channelDetailsV3(token, channelId));
});

app.post('/channel/join/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const { channelId } = req.body;
  return res.json(channelJoinV3(token, channelId));
});

app.post('/channel/invite/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const { channelId, uId } = req.body;
  res.json(channelInviteV3(token, channelId, uId));
});

app.get('/channel/messages/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const channelId = parseInt(req.query.channelId as string);
  const start = parseInt(req.query.start as string);
  return res.json(channelMessagesV3(token, channelId, start));
});

app.get('/channels/list/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  return res.json(channelsListV1(token));
});

app.get('/channels/listall/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  return res.json(channelsListAllV1(token));
});

app.post('/channel/leave/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { channelId } = req.body;
  return res.json(channelLeaveV2(token, channelId));
});

app.post('/channel/addowner/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { channelId, uId } = req.body;
  return res.json(channelAddOwnerV2(token, channelId, uId));
});

app.post('/channel/removeowner/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { channelId, uId } = req.body;
  return res.json(channelRemoveOwnerV2(token, channelId, uId));
});

app.post('/dm/create/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { uIds } = req.body;
  return res.json(dmCreateV1(token, uIds));
});

app.get('/dm/list/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  return res.json(dmListV1(token));
});

app.delete('/dm/remove/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const dmId = parseInt(req.query.dmId as string);
  return res.json(dmRemoveV1(token, dmId));
});

app.get('/dm/details/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const dmId = parseInt(req.query.dmId as string);
  return res.json(dmDetailsV1(token, dmId));
});

app.post('/dm/leave/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { dmId } = req.body;
  return res.json(dmLeaveV1(token, dmId));
});

app.get('/dm/messages/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const dmId = parseInt(req.query.dmId as string);
  const start = parseInt(req.query.start as string);
  res.json(dmMessagesV1(token, dmId, start));
});

app.put('/user/profile/setname/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { nameFirst, nameLast } = req.body;
  return res.json(userProfileSetName(token, nameFirst, nameLast));
});

app.put('/user/profile/sethandle/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { handleStr } = req.body;
  return res.json(userProfileSetHandleV1(token, handleStr));
});

app.put('/user/profile/setemail/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { email } = req.body;
  return res.json(userProfileSetEmailV1(token, email));
});

app.get('/users/all/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  return res.json(usersAllV1(token));
});

app.post('/message/send/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { channelId, message } = req.body;
  return res.json(messageSendV1(token, channelId, message));
});

app.delete('/message/remove/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const messageId = parseInt(req.query.messageId as string);
  res.json(messageRemoveV1(token, messageId));
});

app.put('/message/edit/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { messageId, message } = req.body;
  return res.json(messageEditV1(token, messageId, message));
});

app.post('/message/senddm/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { dmId, message } = req.body;
  return res.json(messageSendDmV1(token, dmId, message));
});

app.post('/message/sendlaterdm/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { dmId, message, timeSent } = req.body;
  return res.json(messageSendLaterDMV1(token, dmId, message, timeSent));
});

app.post('/message/sendlater/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { channelId, message, timeSent } = req.body;
  return res.json(messageSendLaterV1(token, channelId, message, timeSent));
});

app.post('/message/pin/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { messageId } = req.body;
  return res.json(messagePinV1(token, messageId));
});

app.post('/message/unpin/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { messageId } = req.body;
  return res.json(messageUnpinV1(token, messageId));
});

app.post('/message/react/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { messageId, reactId } = req.body;
  return res.json(messageReactV1(token, messageId, reactId));
});

app.post('/message/unreact/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { messageId, reactId } = req.body;
  return res.json(messageUnreactV1(token, messageId, reactId));
});

app.post('/message/share/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { ogMessageId, message, channelId, dmId } = req.body;
  return res.json(messageShareV1(token, ogMessageId, message, channelId, dmId));
});

app.get('/search/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const queryStr = req.query.queryStr as string;
  return res.json(searchV1(token, queryStr));
});

app.get('/notifications/get/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  return res.json(notificationsGetV1(token));
});

app.post('/auth/passwordreset/request/v1', (req: Request, res: Response) => {
  const { email } = req.body;
  return res.json(authPasswordRequestV1(email));
});

app.post('/auth/passwordreset/reset/v1', (req: Request, res: Response) => {
  const { resetCode, newPassword } = req.body;
  return res.json(authPasswordResetV1(resetCode, newPassword));
});

app.post('/admin/userpermission/change/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { uId, permissionId } = req.body;
  return res.json(adminuserPermChangeV1(token, uId, permissionId));
});

app.delete('/admin/user/remove/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const uId = parseInt(req.query.uId as string);
  return res.json(adminuserRemoveV1(token, uId));
});

// Keep this BENEATH route definitions
// handles errors nicely
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
