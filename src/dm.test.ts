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

let owner: any;
beforeEach(() => {
  deleteRequest('/clear/v1', null);
  const ownerData = {
    email: 'vc@unsw.edu.au',
    password: 'password',
    nameFirst: 'Vivian',
    nameLast: 'Cheng'
  };
  owner = postRequest('/auth/register/v2', ownerData);
});

describe('dmCreateV1 test', () => {
  test('invalid uId exists', () => {
    const user1Data = {
      email: 'vc1@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const user1 = postRequest('/auth/register/v2', user1Data);

    const user2Data = {
      email: 'vc2@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const user2 = postRequest('/auth/register/v2', user2Data);

    const dmData = {
      token: owner.token,
      uIds: [user1.uId, user2.uId, user2.uId + 1]
    };
    expect(postRequest('/dm/create/v1', dmData)).toStrictEqual(ERROR);
  });

  test('duplicate uId exists', () => {
    const user1Data = {
      email: 'vc1@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const user1 = postRequest('/auth/register/v2', user1Data);

    const user2Data = {
      email: 'vc2@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const user2 = postRequest('/auth/register/v2', user2Data);

    const dmData = {
      token: owner.token,
      uIds: [user1.uId, user2.uId, user2.uId]
    };
    expect(postRequest('/dm/create/v1', dmData)).toStrictEqual(ERROR);
  });

  test('invalid token', () => {
    const user1Data = {
      email: 'vc1@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const user1 = postRequest('/auth/register/v2', user1Data);

    const user2Data = {
      email: 'vc2@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const user2 = postRequest('/auth/register/v2', user2Data);

    const dmData = {
      token: owner.token + '1',
      uIds: [user1.uId, user2.uId]
    };
    expect(postRequest('/dm/create/v1', dmData)).toStrictEqual(ERROR);
  });

  test('test valid dm create', () => {
    const user1Data = {
      email: 'vc1@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const user1 = postRequest('/auth/register/v2', user1Data);

    const user2Data = {
      email: 'vc2@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const user2 = postRequest('/auth/register/v2', user2Data);

    const dmData = {
      token: owner.token,
      uIds: [user1.uId, user2.uId]
    };
    const dm = postRequest('/dm/create/v1', dmData);

    const dmRemoveData = {
      token: owner.token,
      dmId: dm.dmId
    };

    expect(postRequest('/dm/remove/v1', dmRemoveData)).toStrictEqual({});
  });

  test('test valid dm create: empty uId', () => {
    const dmData = {
      token: owner.token,
      uIds: []
    };
    const dm = postRequest('/dm/create/v1', dmData);

    const dmRemoveData = {
      token: owner.token,
      dmId: dm.dmId
    };
    expect(postRequest('/dm/remove/v1', dmRemoveData)).toStrictEqual({});
  });
});
