import request from 'sync-request';
import config from './config.json';

const port = config.port;
const url = config.url;

const ERROR = { error: expect.any(String) };
const SERVER_URL = `${url}:${port}`;

const postRequest = (url: string, data: any) => {
  const res = request(
    'POST',
    SERVER_URL + url,
    {
      json: data,
    }
  );
  const body = JSON.parse(res.getBody() as string);
  return body;
};

const deleteRequest = (url: string, data: any) => {
  const res = request(
    'DELETE',
    SERVER_URL + url,
    {
      qs: data,
    }
  );
  const body = JSON.parse(res.getBody() as string);
  return body;
};

let user: any;
beforeEach(() => {
  deleteRequest('/clear/v1', null);
  const person = {
    email: 'jr@unsw.edu.au',
    password: 'password',
    nameFirst: 'Jake',
    nameLast: 'Renzella'
  };

  user = postRequest('/auth/register/v2', person);
});

describe('HTTP - channelsCreateV2 Tests', () => {
  test('Testing valid token + name', () => {
    const param = {
      token: user.token,
      name: 'pewpewpew!',
      isPublic: true,
    };
    const channelId = postRequest('/channels/create/v2', param);
    expect(channelId).toStrictEqual({ channelId: expect.any(Number) });
  });

  test('Testing invalid token', () => {
    const param = {
      token: user.token + 'yay!',
      name: 'pewpewpew!',
      isPublic: true,
    };
    const channelId = postRequest('/channels/create/v2', param);
    expect(channelId).toStrictEqual(ERROR);
  });

  test('Testing 20+ name length', () => {
    const param = {
      token: user.token,
      name: 'verycoolchannelname1234567891011121314151617181920',
      isPublic: true,
    };
    const channelId = postRequest('/channels/create/v2', param);
    expect(channelId).toStrictEqual(ERROR);
  });

  test('Testing 0 name length', () => {
    const param = {
      token: user.token,
      name: '',
      isPublic: true,
    };
    const channelId = postRequest('/channels/create/v2', param);
    expect(channelId).toStrictEqual(ERROR);
  });
});
