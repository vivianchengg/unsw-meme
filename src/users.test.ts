import request from 'sync-request';
import config from './config.json';

const port = config.port;
const url = config.url;

const ERROR = { error: expect.any(String) };
const SERVER = `${url}:${port}`;

let user: any;

const postRequest = (url: string, data: any) => {
  const res = request(
    'POST',
    SERVER + url,
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
    SERVER + url,
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
    SERVER + url,
    {
      qs: data,
    }
  );
  const body = JSON.parse(res.getBody() as string);
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

    const param = {
      token: user.token,
      email: user2.email
    };

    expect(putRequest('/user/profile/setemail/v1', param)).toStrictEqual(ERROR);
  });

  test('Invalid token', () => {
    const param = {
      token: user.token,
      email: 'jake23@unsw.edu.au'
    };

    expect(putRequest('/user/profile/setemail/v1', param)).toStrictEqual({});
  });
});
