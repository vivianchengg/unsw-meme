
import request from 'sync-request';
import config from './config.json';

const ERROR = { error: expect.any(String) };
const port = config.port;
const url = config.url;
const SERVERurl = `${url}:${port}`;

let user : any;
let channel : any;

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

const getRequest = (url: string, data: any) => {
  const res = request('GET', SERVERurl + url, { qs: data });
  const body = JSON.parse(String(res.getBody()));
  return body;
};

beforeEach(() => {
  deleteRequest('/clear/v1', {});
  const person = {
    email: 'bridgetcosta@gmail.com',
    password: 'daffodil',
    nameFirst: 'bridget',
    nameLast: 'costa'
  };
  user = postRequest('/auth/register/v2', person);
});

describe('channelMessengesV2 function testing', () => {
  test('channelId does not refer to a valid channel', () => {
    const param1 = {
      token: user.token,
      name: 'music',
      isPublic: false
    };
    channel = postRequest('/channels/create/v2', param1);
    const param2 = {
      token: user.token,
      channelId: channel.channelId + 1,
      start: 0
    };
    expect(getRequest('/channel/messages/v2', param2)).toStrictEqual(ERROR);
  });

  test('start is greater than the total number of messages in the channe', () => {
    const param1 = {
      token: user.token,
      name: 'sports',
      isPublic: false
    };
    const channel = postRequest('/channel/create/v2', param1);
    const param2 = {
      token: user.token,
      channelId: channel.channelId,
      start: 1
    };
    expect(getRequest('/channel/messages/v2', param2)).toStrictEqual(ERROR);
  });

  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const param1 = {
      token: user.token,
      name: 'bird watching',
      isPublic: true
    };
    channel = postRequest('/channels/create/v2', param1);
    const param2 = {
      email: 'amychan@gmail.com',
      password: 'dini',
      nameFirst: 'amy',
      nameLast: 'chan'
    };
    const user2 = postRequest('/auth/register/v2', param2);
    const param3 = {
      token: user2.token,
      channelId: channel.channelId,
      start: 0
    };
    expect(getRequest('/channel/messages/v2', param3)).toStrictEqual(ERROR);
  });

  test('token is invalid', () => {
    const param1 = {
      token: user.token,
      name: 'sports',
      isPublic: false
    };
    channel = postRequest('/channel/create/v2', param1);
    const param2 = {
      token: user.token + 1,
      channelId: channel.channelId,
      start: 0
    };
    expect(getRequest('/channel/messages/v2', param2)).toStrictEqual(ERROR);
  });

  test('valid input', () => {
    const param1 = {
      token: user.token,
      name: 'sports',
      isPublic: false
    };
    channel = postRequest('/channel/create/v2', param1);
    const param2 = {
      token: user.token,
      channelId: channel.channelId,
      start: 0
    };
    const expectedRet = {
      messages: {},
      start: 0,
      end: 50
    };

    expect(getRequest('/channel/messages/v2', param2)).toStrictEqual(expectedRet);
  });
});
