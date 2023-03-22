import request from 'sync-request';
import config from './config.json';

const port = config.port;
const url = config.url;

const ERROR = { error: expect.any(String) };
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

const getRequest = (url: string, data: any) => {
  const res = request('GET', SERVERurl + url, { qs: data });
  const body = JSON.parse(String(res.getBody()));
  return body;
};

let user;

beforeEach(() => {
  deleteRequest('/clear/v1', {});
  const person = {
    email: 'jr@unsw.edu.au',
    password: 'password',
    nameFirst: 'Jake',
    nameLast: 'Renzella'
  };

  user = postRequest('/auth/register/v2', person);
});

describe('HTTP - userProfileV2 tests', () => {
  test('Testing valid token + uId', () => {
    const param = {
      token: user.token[0],
      uId: user.authUserId,
    };
    const profile = getRequest('/user/profile/v2', param);
    expect(profile).toStrictEqual({
      user: {
        uId: user.authUserId,
        email: 'jr@unsw.edu.au',
        nameFirst: 'Jake',
        nameLast: 'Renzella',
        handleStr: 'JakeRenzella',
      }
    });
  });

  test('Testing invalid token', () => {
    const param = {
      token: user.token[0] + 'yay!',
      uId: user.authUserId,
    };
    const profile = getRequest('/user/profile/v2', param);
    expect(profile).toStrictEqual(ERROR);
  });

  test('Testing invalid uId', () => {
    const param = {
      token: user.token[0],
      uId: user.authUserId + 1,
    };
    const profile = getRequest('/user/profile/v2', param);
    expect(profile).toStrictEqual(ERROR);
  });
});
