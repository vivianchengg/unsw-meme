import request from 'sync-request';
import { port, url } from './config.json';

const ERROR = { error: expect.any(String) };
const SERVER_URL = `${url}:${port}`;

const getRequest = (url: string, data: any) => {
  const res = request(
    'GET',
    SERVER_URL + url,
    {
      qs: data,
    }
  );
  const body = JSON.parse(res.getBody() as string);
  return body;
};

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
let channel: any;

beforeEach(() => {
  deleteRequest('/clear/v1', null);

  const person = {
    email: 'jr@unsw.edu.au',
    password: 'password',
    nameFirst: 'Jake',
    nameLast: 'Renzella'
  };
  user = postRequest('/auth/register/v2', person);

  const channelData = {
    token: user.token,
    name: 'COMP1531',
    isPublic: true,
  };
  channel = postRequest('/channels/create/v2', channelData);
});

describe('HTTP - channelsListV2 Tests', () => {
  test('Testing valid input', () => {
    const param = {
      token: user.token,
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
      token: user.token + 'yay!',
    };

    expect(getRequest('/channels/list/v2', param)).toStrictEqual(ERROR);
  });
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
