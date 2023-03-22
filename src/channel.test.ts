
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
let channelId : number;

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

describe('HTTP tests using Jest for channelJoinV2', () => {
  test('channelId does not refer to a valid channel', () => {
    const param1 = {
      token: user.token,
      name: 'holidays',
      isPublic: true
    };
    channel = postRequest('/channel/create/v2', param1);
    const param2 = {
      token: channel.token,
      channelId: channel.channelId + 1
    };
    expect(postRequest('/channel/Join/v2', param2).toStrictEqual(ERROR));
  });
  test('the authorised user is already a member of the channel', () => {
    const param1 = {
      token: user.token,
      name: 'games',
      isPublic: true
    };
    channel = postRequest('/channel/create/v2', param1);
    const param2 = {
      token: channel.token,
      channelId: channel.channelId
    };
    postRequest('/channel/join/v2', param2);
    expect(postRequest('/channel/Join/v2', param2).toStrictEqual(ERROR));
  });

  test('channelId refers to a channel that is private, when the authorised user is not already a channel member and is not a global owner', () => {
    const param1 = {
      token: user.token,
      name: 'sports',
      isPublic: false
    };
    channel = postRequest('/channel/create/v2', param1);
    const param2 = {
      email: 'dianahazea@gmail.com',
      password: 'january',
      nameFirst: 'diana',
      nameLast: 'haze'
    };
    const user2 = postRequest('/auth/register/v2', param2);
    const param3 = {
      token: user2.token,
      channelId: channel.channelId
    };
    expect(postRequest('/channel/join/v2', param3).toStrictEqual(ERROR));
  });

  test('token is invalid', () => {
    const param1 = {
      token: user.token + 1,
      channelId: channelId
    };
    expect(postRequest('/channel/join/v2', param1).toStrictEqual(ERROR));
  });

  test('test sucessful channelJoinV2', () => {
    const param1 = {
      token: user.token,
      name: 'games',
      isPublic: true
    };
    channel = (postRequest('/channels/create/v2', param1).toStrictEqual(ERROR));
    expect(postRequest('/channel/join/v2', param1).toStrictEqual(ERROR));
  });
});
