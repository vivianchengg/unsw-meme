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

let user: any;
let user2: any;
let user3: any;
let dm: any;
let dm2: any;

beforeEach(() => {
  deleteRequest('/clear/v1', {});
  let person = {
    email: 'jr@unsw.edu.au',
    password: 'password',
    nameFirst: 'Jake',
    nameLast: 'Renzella'
  };
  user = postRequest('/auth/register/v2', person);

  person = {
    email: 'ab@unsw.edu.au',
    password: 'password',
    nameFirst: 'Abby',
    nameLast: 'Boo'
  };
  user2 = postRequest('/auth/register/v2', person);

  person = {
    email: 'cf@unsw.edu.au',
    password: 'password',
    nameFirst: 'Christine',
    nameLast: 'Food'
  };
  user3 = postRequest('/auth/register/v2', person);

  let dmParam = {
    token: user.token[0],
    uIds: [user2.authUserId, user3.authUserId],
  };
  dm = postRequest('/dm/create/v1', dmParam);

  dmParam = {
    token: user2.token[0],
    uIds: [user.authUserId, user3.authUserId],
  };
  dm2 = postRequest('/dm/create/v1', dmParam);
});

describe('HTTP - /dm/list/v1 tests', () => {
  test('Invalid token', () => {
    const param = {
      token: user3.token[0] + 1,
    };
    expect(getRequest('/dm/list/v1', param)).toStrictEqual(ERROR);
  });

  test('Valid input', () => {
    const param = {
      token: user3.token[0],
    };
    expect(getRequest('/dm/list/v1', param)).toStrictEqual({
      dms:
      [{
        dmId: dm.dmId,
        name: dm.name,
      }, {
        dmId: dm2.dmId,
        name: dm2.name,
      }]
    });
  });
});
