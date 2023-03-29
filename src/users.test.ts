import request from 'sync-request';
import config from './config.json';

const port = config.port;
const url = config.url;

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

const putRequest = (url: string, data: any) => {
  const res = request(
    'PUT',
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

describe('userProfileSetEmailV1 tests', () => {
  test('Invalid token', () => {
    const param = {
      token: user.token + 'buffer',
      email: 'jake23@unsw.edu.au'
    };

    expect(putRequest('/user/profile/setemail/v1', param)).toStrictEqual(ERROR);
  });

  test('Invalid email', () => {
    const param = {
      token: user.token,
      email: 'buffer'
    };

    expect(putRequest('/user/profile/setemail/v1', param)).toStrictEqual(ERROR);
  });

  test('Email already taken', () => {
    const person2 = {
      email: 'yj@unsw.edu.au',
      password: 'PASSWORD',
      nameFirst: 'Yuchao',
      nameLast: 'Jiang'
    };

    const user2 = postRequest('/auth/register/v2', person2);

    const profileParam = {
      token: user2.token,
      uId: user2.authUserId
    };

    const user2Profile = getRequest('/user/profile/v2', profileParam);

    const param = {
      token: user.token,
      email: user2Profile.email
    };

    expect(putRequest('/user/profile/setemail/v1', param)).toStrictEqual(ERROR);
  });

  test('Basic functionality', () => {
    const param = {
      token: user.token,
      email: 'JR@unsw.edu.au'
    };

    expect(putRequest('/user/profile/setemail/v1', param)).toStrictEqual({});
  });
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
