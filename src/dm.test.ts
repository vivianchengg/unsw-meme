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

let user: any;
let user2: any;
let dm: any;

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

  const dmParam = {
    token: user.token[0],
    uIds: [user2.authUserId],
  };
  dm = postRequest('/dm/create/v1', dmParam);
});

describe('HTTP - /dm/remove/v1 tests', () => {
  test('Dm does not refer to valid dm', () => {
    const param = {
      token: user.token[0],
      dmId: dm.dmId - 1,
    };
    expect(deleteRequest('/dm/remove/v1', param)).toStrictEqual(ERROR);
  });

  test('Dm is valid but User is not CREATOR', () => {
    const param = {
      token: user2.token[0],
      dmId: dm.dmId,
    };
    expect(deleteRequest('/dm/remove/v1', param)).toStrictEqual(ERROR);
  });

  test('Dm is valid but Creator is not longer in Dm', () => {
    const detail = {
      token: user.token[0],
      dmId: dm.dmId,
    };
    postRequest('/dm/leave/v1', detail);

    const param = {
      token: user.token[0],
      dmId: dm.dmId
    };
    expect(deleteRequest('/dm/remove/v1', param)).toStrictEqual(ERROR);
  });

  test('Invalid token', () => {
    const param = {
      token: user.token[0] + 1,
      dmId: dm.dmId,
    };
    expect(deleteRequest('/dm/remove/v1', param)).toStrictEqual(ERROR);
  });

  test('Valid input', () => {
    const param = {
      token: user.token[0],
      dmId: dm.dmId,
    };
    deleteRequest('/dm/remove/v1', param);

    const newparam = {
      token: user.token[0],
    };
    expect(getRequest('/dm/list/v1', newparam)).toStrictEqual(ERROR);
  });
});
