
import request from 'sync-request';
import config from './config.json';

const ERROR = { error: expect.any(String) };
const port = config.port;
const url = config.url;
const SERVERurl = `${url}:${port}`;

const postRequest = (url: string, data: any) => {
  const res = request('POST', SERVERurl + url, { json: data });
  const body = JSON.parse(String(res.getBody()));
  return body;
};

const deleteRequest = (url: string, data: any) => {
  const res = request('DELETE', SERVERurl + url, { qs: data });
  const body = JSON.parse(String(res.getBody()));
  return body;
};

let user : any;
let channel : any;

beforeEach(() => {
  deleteRequest('DELETE', SERVERurl + '/clear', { json: {} });
  const person = {
    email: 'bridgetcosta@gmail.com',
    password: 'daffodil',
    nameFirst: 'bridget',
    nameLast: 'costa'
  };
  user = postRequest('/auth/register/v2', person);
});

describe('HTTP tests using Jest for channelInviteV2', () => {
  beforeEach(() => {
    const param1 = {
      email: 'arialee@gmail.com',
      password: 'dynamite',
      nameFirst: 'aria',
      nameLast: 'lee'
    };
    let invitedUser = any;
    invitedUser = postRequest('/auth/register/v2', param1);
  });

  test('channelId does not refer to a valid channel', () => {
    const param1 = {
      token: user.token,
      name: 'holidays',
      isPublic: true
    };
    channel = postRequest('/channels/create/v2', param1);
    const param2 = {
      token: user.token,
      channelId: channel.channelId + 1,
      uId: invitedUser.authUserId
    };
    expect(postRequest('/channel/invite/v2', param2).toStrictEqual(ERROR));
  });
  test('uId does not refer to a valid user', () => {
    const param1 = {
      token: user.token,
      name: 'holidays',
      isPublic: false
    };
    channel = postRequest('/channels/create/v2', param1);
    const param2 = {
      token: user.token,
      channelId: channel.channelId,
      uId: invitedUser.authUserId + 1
    };
    expect(postRequest('/channel/invite/v2', param2).toStrictEqual(ERROR));
  });
  test('uId refers to a user who is already a member of the channel', () => {
    const param1 = {
      token: user.token,
      name: 'holidays',
      isPublic: false
    };
    channel = postRequest('/channels/create/v2', param1);
    const param2 = {
      token: invitedUser.token,
      channelId: channel.channelId,
    };
    postRequest('/channel/join/v2', param2);
    const param3 = {
      token: user.token,
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    expect(postRequest('/channel/invite/v2', param3)).toStrictEqual(ERROR);
  });
  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const param1 = {
      token: user.token,
      name: 'holidays',
      isPublic: false
    };
    channel = postRequest('/channels/create/v2', param1);
    const param2 = {
      email: 'dianahazea@gmail.com',
      password: 'january',
      nameFirst: 'diana',
      nameLast: 'haze'
    };
    const user2 = postRequest('/auth/register/v2', param2);
    const param3 = {
      token: user2.token,
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    expect(postRequest('/channel/invite/v2', param3)).toStrictEqual(ERROR);
  });
  test('token is invalid', () => {
    const param1 = {
      token: user.token,
      name: 'holidays',
      isPublic: false
    };
    channel = postRequest('/channels/create/v2', param1);
    const param2 = {
      token: user.token + 1,
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    expect(postRequest('/channel/invite/v2', param2)).toStrictEqual(ERROR);
  });
  test('valid channelInviteV2', () => {
    const param1 = {
      token: user.token,
      name: 'holidays',
      isPublic: false
    };
    channel = postRequest('/channels/create/v2', param1);
    const param2 = {
      token: user.token,
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    expect(postRequest('/channel/invite/v2', param2)).toStrictEqual({});
  });
});
