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
let user: any;
let dm1: any;

beforeEach(() => {
  deleteRequest('/clear/v1', null);

  const ownerData = {
    email: 'vc@unsw.edu.au',
    password: 'password',
    nameFirst: 'Vivian',
    nameLast: 'Cheng'
  };
  owner = postRequest('/auth/register/v2', ownerData);

  const userData = {
    email: 'jr@unsw.edu.au',
    password: 'password',
    nameFirst: 'Jake',
    nameLast: 'Renzella'
  };

  user = postRequest('/auth/register/v2', userData);

  const dm1Data = {
    token: owner.token,
    uIds: [user.authUserId]
  };

  dm1 = postRequest('/dm/create/v1', dm1Data);
});

describe('dmLeaveV1 Test', () => {
  test('Invalid token', () => {
    const detailRequest = {
      token: user.token + 'yay',
      dmId: dm1.dmId
    };

    expect(postRequest('/dm/leave/v1', detailRequest)).toStrictEqual(ERROR);
  });

  test('Invalid dmId', () => {
    const detailRequest = {
      token: user.token,
      dmId: dm1.dmId + 1
    };

    expect(postRequest('/dm/leave/v1', detailRequest)).toStrictEqual(ERROR);
  });

  test('authUser not member of dm', () => {
    const user2Data = {
      email: 'yj@unsw.edu.au',
      password: 'PASSWORD',
      nameFirst: 'Yuchao',
      nameLast: 'Jiang'
    };

    const user2 = postRequest('/auth/register/v2', user2Data);

    const detailRequest = {
      token: user2.token,
      dmId: dm1.dmId
    };

    expect(postRequest('/dm/leave/v1', detailRequest)).toStrictEqual(ERROR);
  });

  test('Basic functionality: member', () => {
    const detailRequest = {
      token: user.token,
      dmId: dm1.dmId
    };

    expect(postRequest('/dm/leave/v1', detailRequest)).toStrictEqual({});
  });

  test('Basic functionality: owner', () => {
    const detailRequest = {
      token: owner.token,
      dmId: dm1.dmId
    };

    expect(postRequest('/dm/leave/v1', detailRequest)).toStrictEqual({});
  });
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
      uIds: [user1.authUserId, user2.authUserId, user2.authUserId + 1]
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
      uIds: [user1.authUserId, user2.authUserId, user2.authUserId]
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
      uIds: [user1.authUserId, user2.authUserId]
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
      uIds: [user1.authUserId, user2.authUserId]
    };
    const dm = postRequest('/dm/create/v1', dmData);

    const dmRemoveData = {
      token: owner.token,
      dmId: dm.dmId
    };

    expect(deleteRequest('/dm/remove/v1', dmRemoveData)).toStrictEqual({});
  });

  test('test valid dm create: empty uId', () => {
    const dmData = {
      token: owner.token,
      uIds: [] as number[]
    };
    const dm = postRequest('/dm/create/v1', dmData);

    const dmRemoveData = {
      token: owner.token,
      dmId: dm.dmId
    };
    expect(deleteRequest('/dm/remove/v1', dmRemoveData)).toStrictEqual({});
  });
});

describe('dm remove tests', () => {
  test('Dm does not refer to valid dm', () => {
    const param = {
      token: owner.token,
      dmId: dm1.dmId + 1,
    };
    expect(deleteRequest('/dm/remove/v1', param)).toStrictEqual(ERROR);
  });

  test('Dm is valid but User is not CREATOR', () => {
    const param = {
      token: user.token,
      dmId: dm1.dmId,
    };
    expect(deleteRequest('/dm/remove/v1', param)).toStrictEqual(ERROR);
  });

  test('Dm is valid but Creator is not longer in Dm', () => {
    const detail = {
      token: owner.token,
      dmId: dm1.dmId,
    };
    postRequest('/dm/leave/v1', detail);

    const param = {
      token: owner.token,
      dmId: dm1.dmId
    };
    expect(deleteRequest('/dm/remove/v1', param)).toStrictEqual(ERROR);
  });

  test('Invalid token', () => {
    const param = {
      token: owner.token + 'lol',
      dmId: dm1.dmId,
    };
    expect(deleteRequest('/dm/remove/v1', param)).toStrictEqual(ERROR);
  });

  test('Valid input', () => {
    const param = {
      token: owner.token,
      dmId: dm1.dmId,
    };
    expect(deleteRequest('/dm/remove/v1', param)).toStrictEqual({});
  });
});
