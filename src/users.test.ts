import request from 'sync-request';
import config from './config.json';

const port = config.port;
const url = config.url;

const ERROR = { error: expect.any(String) };
const SERVER_URL = `${url}:${port}`;

let user: any;

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

describe('userProfileSetHandleV1 tests', () => {
  test('Invalid token', () => {
    const param = {
      token: user.token + 'buffer',
      handleStr: 'theJAKErenzella'
    };

    expect(putRequest('/user/profile/sethandle/v1', param)).toStrictEqual(ERROR);
  });

  test('New handle not between 3-20 characters', () => {
    const param = {
      token: user.token,
      handleStr: 'ohmygodILOVECOMP1531!!'
    };

    expect(putRequest('/user/profile/sethandle/v1', param)).toStrictEqual(ERROR);
  });

  test('New handle contains non-alphanumeric characters', () => {
    const param = {
      token: user.token,
      handleStr: 'やったCOMP1531が大好き!'
    };

    expect(putRequest('/user/profile/sethandle/v1', param)).toStrictEqual(ERROR);
  });

  test('New handle already taken', () => {
    const person2 = {
      email: 'yj@unsw.edu.au',
      password: 'PASSWORD',
      nameFirst: 'Yuchao',
      nameLast: 'Jiang'
    };

    const user2 = postRequest('/auth/register/v2', person2);

    const param = {
      token: user.token,
      handleStr: user2.handleStr
    };

    expect(putRequest('/user/profile/setemail/v1', param)).toStrictEqual(ERROR);
  });

  test('Basic functionality', () => {
    const param = {
      token: user.token,
      handleStr: 'theJAKErenzella'
    };

    expect(putRequest('/user/profile/setemail/v1', param)).toStrictEqual({});
  });
});
