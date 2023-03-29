import request from 'sync-request';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const ERROR = { error: expect.any(String) };

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

let creatorUser: any;
let user: any;
let dm: any;

beforeEach(() => {
  deleteRequest('/clear/v1', {});

  const creatorUserData = {
    email: 'rp@unsw.edu.au',
    password: 'pASSWORD',
    nameFirst: 'Random',
    nameLast: 'Person'
  };

  creatorUser = postRequest('/auth/register/v2', creatorUserData);

  const userData = {
    email: 'jr@unsw.edu.au',
    password: 'password',
    nameFirst: 'Jake',
    nameLast: 'Renzella'
  };

  user = postRequest('/auth/register/v2', userData);

  const dmData = {
    token: creatorUser.token,
    uIds: [user.authUserId]
  };

  dm = postRequest('/dm/create/v1', dmData);
});

describe('dmLeaveV1 Test', () => {
  test('Invalid token', () => {
    const detailRequest = {
      token: '',
      dmId: dm.dmId
    };

    expect(postRequest('/dm/leave/v1', detailRequest)).toStrictEqual(ERROR);
  });

  test('Invalid dmId', () => {
    const detailRequest = {
      token: user.token,
      dmId: dm.dmId + 1
    };

    expect(postRequest('/dm/leave/v1', detailRequest)).toStrictEqual(ERROR);
  });

  test('Valid dmId but user not member of DM', () => {
    const user2Data = {
      email: 'yj@unsw.edu.au',
      password: 'PASSWORD',
      nameFirst: 'Yuchao',
      nameLast: 'Jiang'
    };

    const user2 = postRequest('/auth/register/v2', user2Data);

    const detailRequest = {
      token: user2.token,
      dmId: dm.dmId
    };

    expect(postRequest('/dm/leave/v1', detailRequest)).toStrictEqual(ERROR);
  });

  test('Basic functionality', () => {
    const detailRequest = {
      token: user.token,
      dmId: dm.dmId
    };

    expect(postRequest('/dm/leave/v1', detailRequest)).toStrictEqual({});
  });
});
