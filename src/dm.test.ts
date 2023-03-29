import request from 'sync-request';
import config from './config.json';

const ERROR = { error: expect.any(String) };
const port = config.port;
const url = config.url;
const SERVERurl = `${url}:${port}`;

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
  const res = request('POST', SERVERurl + url, { json: data });
  const body = JSON.parse(res.getBody() as string);
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

let dm : any;
let user1 : any;
let user2 : any;
let user3 : any;

beforeEach(() => {
  deleteRequest('/clear/v1', null);
  const person1 = {
    email: 'bridgetcosta@gmail.com',
    password: 'daffodil',
    nameFirst: 'bridget',
    nameLast: 'costa'
  };
  user1 = postRequest('/auth/register/v2', person1);
  const person2 = {
    email: 'arialee@gmail.com',
    password: 'dynamite',
    nameFirst: 'aria',
    nameLast: 'lee'
  };
  user2 = postRequest('/auth/register/v2', person2);
  const person3 = {
    email: 'arialee@gmail.com',
    password: 'dynamite',
    nameFirst: 'aria',
    nameLast: 'lee'
  };
  user3 = postRequest('/auth/register/v2', person3);
  const uIds = [user2.uId, user3.uId];
  const param = {
    token: user1.token,
    uIds: uIds
  };
  dm = postRequest('/dm/create/v1', param);
});

describe('HTTP tests using Jest for dmMessagesV1', () => {
  test('dmId does not refer to a valid DM', () => {
    const param = {
      token: user1.token,
      dmId: dm.dmId + 1,
      start: 0
    };
    expect(getRequest('/dm/messages/v1', param).toStrictEqual(ERROR));
  });
  test('start is greater than the total number of messages in the channel', () => {
    const param = {
      token: user2.token,
      dmId: dm.dmId,
      start: 20
    };
    expect(getRequest('/dm/messages/v1', param)).toStrictEqual(ERROR);
  });
  test('dmId is valid and the authorised user is not a member of the DM', () => {
    const person = {
      email: 'kennyfarzie@gmail.com',
      password: 'lonis',
      nameFirst: 'kenny',
      nameLast: 'farzie'
    };
    const nonMember = postRequest('/auth/register/v2', person);
    const param2 = {
      token: nonMember.token,
      dmId: dm.dmId,
      start: 0
    };
    expect(getRequest('/dm/messages/v1', param2)).toStrictEqual(ERROR);
  });
  test('token is invalid', () => {
    const param = {
      token: user3.token + 1,
      dmId: dm.dmId,
      start: 0
    };
    expect(getRequest('/dm/messages/v1', param)).toStrictEqual(ERROR);
  });
  test('valid input', () => {
    const param = {
      token: user2.token,
      dmId: dm.dmId,
      start: 0
    };
    const expectedRet = {
      messages: {},
      start: 0,
      end: 50
    };
    expect(getRequest('/dm/messages/v1', param)).toStrictEqual(expectedRet);
  });
});

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

describe('HTTP - /dm/list/v1 tests', () => {
  test('Invalid token', () => {
    const param = {
      token: owner.token + 'lol',
    };
    expect(getRequest('/dm/list/v1', param)).toStrictEqual(ERROR);
  });

  test('Valid input', () => {
    const param = {
      token: owner.token,
    };
    expect(getRequest('/dm/list/v1', param).dms).toStrictEqual(expect.arrayContaining([
      expect.objectContaining({
        dmId: dm1.dmId
      })
    ]));
  });
});
