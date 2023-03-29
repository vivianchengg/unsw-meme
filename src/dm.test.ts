import request from 'sync-request';
import { port, url } from './config.json';
import { getData } from './dataStore';

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
let dm: any;

beforeEach(() => {
  deleteRequest('/clear/v1', {});

  const userData = {
    email: 'jr@unsw.edu.au',
    password: 'password',
    nameFirst: 'Jake',
    nameLast: 'Renzella'
  };

  user = postRequest('/auth/register/v2', userData);

  const dmData = {
    token: user.token,
    uIds: user.authUserId
  };

  dm = postRequest('/dm/create/v1', dmData);
});

describe('dmDetailsV1 Test', () => {
  test('Invalid token', () => {
    const detailRequest = {
      token: '',
      dmId: dm.dmId
    };

    expect(getRequest('/dm/details/v1', detailRequest)).toStrictEqual(ERROR);
  });

  test('Invalid dmId', () => {
    const detailRequest = {
      token: user.token,
      dmId: dm.dmId + 1
    };

    expect(getRequest('/dm/details/v1', detailRequest)).toStrictEqual(ERROR);
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

    expect(getRequest('/dm/details/v1', detailRequest)).toStrictEqual(ERROR);
  });

  test('Basic functionality', () => {
    const detailRequest = {
      token: user.token,
      dmId: dm.dmId
    };

    const data = getData();
    let dmName: any;
    for (const dmDetail of data.dms) {
      if (dmDetail.dmId === dm.dmId) {
        dmName = dmDetail.name;
      }
    }

    expect(getRequest('/dm/details/v1', detailRequest)).toStrictEqual({
      name: dmName,
      members: [{
        uId: user.uId,
        email: user.email,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
        handleStr: user.handleStr
      }]
    });
  });
});
