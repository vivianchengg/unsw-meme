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

const putRequest = (url: string, data: any) => {
  const res = request('PUT', SERVERurl + url, { json: data });
  const body = JSON.parse(String(res.getBody()));
  return body;
};

let user: any;

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

describe('HTTP - /user/profile/setname/v1', () => {
  test('Invalid token', () => {
    const param = {
      token: user.token[0] - 1,
      nameFirst: 'yum',
      nameLast: 'my',
    };
    expect(putRequest('/user/profile/setname/v1', param)).toStrictEqual(ERROR);
  });

  test('Valid input', () => {
    const param = {
      token: user.token[0],
      nameFirst: 'yum',
      nameLast: 'my',
    };
    putRequest('/user/profile/setname/v1', param);

    const newparam = {
      token: user.token[0],
      uId: user.authUserId,
    };
    const details = getRequest('/user/profile/v2', newparam);
    expect(details).toStrictEqual({
      user: {
        uId: details.uId,
        email: details.email,
        nameFirst: 'yum',
        nameLast: 'my',
        handleStr: 'yummy',
      }
    });
  });
});
