import request from 'sync-request';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const ERROR = { error: expect.any(String) };

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

describe('userProfileV2 tests', () => {
  test('Testing valid token + uId', () => {
    const param = {
      token: user.token,
      uId: user.authUserId,
    };
    const profile = getRequest('/user/profile/v2', param);

    expect(profile).toStrictEqual({
      user: {
        uId: user.authUserId,
        email: 'jr@unsw.edu.au',
        nameFirst: 'Jake',
        nameLast: 'Renzella',
        handleStr: 'jakerenzella',
      }
    });
  });

  test('Testing invalid token', () => {
    const param = {
      token: user.token + '1',
      uId: user.authUserId,
    };
    const profile = getRequest('/user/profile/v2', param);
    expect(profile).toStrictEqual(ERROR);
  });

  test('Testing invalid uId', () => {
    const param = {
      token: user.token,
      uId: user.authUserId + 1,
    };
    const profile = getRequest('/user/profile/v2', param);
    expect(profile).toStrictEqual(ERROR);
  });
});
