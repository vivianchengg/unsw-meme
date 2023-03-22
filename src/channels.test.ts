import request from 'sync-request';
import config from './config.json';

const port = config.port;
const url = config.url;

const ERROR = { error: expect.any(String) };
const SERVERurl = `${url}:${port}`;

let user;
let channel;

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
    email: 'jr@unsw.edu.au',
    password: 'password',
    nameFirst: 'Jake',
    nameLast: 'Renzella'
  };
  user = postRequest('/auth/register/v2', person);

  const channelParam = {
    token: user.token[0],
    name: 'COMP1531',
    isPublic: true,
  };
  channel = postRequest('/channels/create/v2', channelParam);
});

describe('HTTP - channelsListV2 Tests', () => {
  test('Testing valid input', () => {
    const param = {
      token: user.token[0],
    };
    const channelsList = getRequest('/channels/list/v2', param);
    expect(channelsList).toStrictEqual({
      channels: [{
        channelId: channel.channelId,
        name: 'COMP1531',
      }]
    });
  });

  test('Testing invalid token', () => {
    const param = {
      token: user.token[0] + 'yay!',
    };
    const channelsList = getRequest('/channels/list/v2', param);
    expect(channelsList).toStrictEqual(ERROR);
  });
});