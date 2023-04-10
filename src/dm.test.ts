import { requestHelper } from './request';

let owner: any;
let user: any;
let dm1: any;
let tokenData: any;

beforeEach(() => {
  requestHelper('DELETE', '/clear/v1', {}, {});

  const ownerData = {
    email: 'vc@unsw.edu.au',
    password: 'password',
    nameFirst: 'Vivian',
    nameLast: 'Cheng'
  };
  owner = requestHelper('POST', '/auth/register/v3', {}, ownerData);

  const userData = {
    email: 'jr@unsw.edu.au',
    password: 'password',
    nameFirst: 'Jake',
    nameLast: 'Renzella'
  };

  user = requestHelper('POST', '/auth/register/v3', {}, userData);

  const dm1Data = {
    uIds: [user.authUserId]
  };

  tokenData = {
    token: user.token,
  };

  dm1 = requestHelper('POST', '/dm/create/v3', tokenData, dm1Data);
});

afterAll(() => {
  requestHelper('DELETE', '/clear/v1', {}, {});
});

describe('dmLeaveV1 Test', () => {
  test('Invalid token', () => {
    const detailRequest = {
      dmId: dm1.dmId
    };

    tokenData.token = user.token + 'yay';

    expect(() => requestHelper('POST', '/dm/leave/v2', tokenData, detailRequest)).toThrow(Error);
  });

  test('Invalid dmId', () => {
    const detailRequest = {
      dmId: dm1.dmId + 1
    };

    expect(() => requestHelper('POST', '/dm/leave/v2', tokenData, detailRequest)).toThrow(Error);
  });

  test('authUser not member of dm', () => {
    const user2Data = {
      email: 'yj@unsw.edu.au',
      password: 'PASSWORD',
      nameFirst: 'Yuchao',
      nameLast: 'Jiang'
    };

    const user2 = postRequest('/auth/register/v3', user2Data);

    const detailRequest = {
      dmId: dm1.dmId
    };

    tokenData.token = user2.token;
    expect(() => requestHelper('POST', '/dm/leave/v2', tokenData, detailRequest)).toThrow(Error);
  });

  test('Basic functionality: member', () => {
    const detailRequest = {
      dmId: dm1.dmId
    };

    expect(requestHelper('POST', '/dm/leave/v2', tokenData, detailRequest)).toStrictEqual({});
  });

  test('Basic functionality: owner', () => {
    const detailRequest = {
      dmId: dm1.dmId
    };
    tokenData.token = owner.token;
    expect(requestHelper('POST', '/dm/leave/v2', tokenData, detailRequest)).toStrictEqual({});
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
    const user1 = requestHelper('POST', '/auth/register/v3', {}, user1Data);

    const user2Data = {
      email: 'vc2@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const user2 = requestHelper('POST', '/auth/register/v3', {}, user2Data);

    const dmData = {
      uIds: [user1.authUserId, user2.authUserId, user2.authUserId + 1]
    };
    tokenData.token = owner.token;
    expect(() => requestHelper('POST', '/dm/create/v2', tokenData, dmData)).toThrow(Error);
  });

  test('duplicate uId exists', () => {
    const user1Data = {
      email: 'vc1@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const user1 = requestHelper('POST', '/auth/register/v3', {}, user1Data);

    const user2Data = {
      email: 'vc2@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const user2 = requestHelper('POST', '/auth/register/v3', {}, user2Data);

    const dmData = {
      uIds: [user1.authUserId, user2.authUserId, user2.authUserId]
    };
    tokenData.token = owner.token;
    expect(() => requestHelper('POST', '/dm/create/v2', tokenData, dmData)).toThrow(Error);
  });

  test('invalid token', () => {
    const user1Data = {
      email: 'vc1@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const user1 = requestHelper('POST', '/auth/register/v3', {}, user1Data);

    const user2Data = {
      email: 'vc2@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const user2 = requestHelper('POST', '/auth/register/v3', {}, user2Data);

    const dmData = {
      uIds: [user1.authUserId, user2.authUserId]
    };
    tokenData.token = owner.token + '1';
    expect(requestHelper('POST', '/dm/create/v2', tokenData, dmData)).toThrow(Error);
  });

  test('test valid dm create', () => {
    const user1Data = {
      email: 'vc1@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const user1 = requestHelper('POST', '/auth/register/v3', {}, user1Data);

    const user2Data = {
      email: 'vc2@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const user2 = requestHelper('POST', '/auth/register/v3', {}, user2Data);

    const dmData = {
      uIds: [user1.authUserId, user2.authUserId]
    };
    tokenData.token = owner.token;
    const dm = requestHelper('POST', '/dm/create/v2', tokenData, dmData);

    const dmRemoveData = {
      dmId: dm.dmId
    };

    expect(requestHelper('DELETE', '/dm/remove/v2', tokenData, dmRemoveData)).toStrictEqual({});
  });

  test('test valid dm create: empty uId', () => {
    const dmData = {
      uIds: [] as number[]
    };
    tokenData.token = owner.token;
    const dm = postRequest('POST', '/dm/create/v2', tokenData, dmData);

    const dmRemoveData = {
      dmId: dm.dmId
    };
    expect(requestHelper('DELETE', '/dm/remove/v2', tokenData, dmRemoveData)).toStrictEqual({});
  });
});

describe('dm remove tests', () => {
  test('Dm does not refer to valid dm', () => {
    const param = {
      dmId: dm1.dmId + 1,
    };
    tokenData.token = owner.token;
    expect(() => requestHelper('DELETE', '/dm/remove/v2', tokenData, param)).toThrow(Error);
  });

  test('Dm is valid but User is not CREATOR', () => {
    const param = {
      dmId: dm1.dmId,
    };
    expect(() => requestHelper('DELETE', '/dm/remove/v2', tokenData, param)).toThrow(Error);
  });

  test('Dm is valid but Creator is not longer in Dm', () => {
    const detail = {
      dmId: dm1.dmId,
    };
    tokenData.token = owner.token;
    requestHelper('POST', '/dm/leave/v2', tokenData, detail);

    const param = {
      dmId: dm1.dmId
    };
    expect(() => requestHelper('DELETE', '/dm/remove/v2', tokenData, param)).toThrow(Error);
  });

  test('Invalid token', () => {
    const param = {
      dmId: dm1.dmId,
    };
    tokenData.token = owner.token + 'lol';
    expect(() => requestHelper('DELETE', '/dm/remove/v2', tokenData, param)).toThrow(Error);
  });

  test('Valid input', () => {
    const param = {
      dmId: dm1.dmId,
    };
    tokenData.token = owner.token;
    expect(requestHelper('DELETE', '/dm/remove/v2', tokenData, param)).toStrictEqual({});
  });
});

describe('HTTP - /dm/list/v1 tests', () => {
  test('Invalid token', () => {
    tokenData.token = owner.token + 'lol';
    expect(() => requestHelper('GET', '/dm/list/v2', tokenData, {})).toThrow(Error);
  });

  test('Valid input', () => {
    const userData = {
      email: 'cc@unsw.edu.au',
      password: 'password',
      nameFirst: 'chu',
      nameLast: 'chuut'
  };
  const user2 = requestHelper('POST', '/auth/register/v3', {}, userData);

    const dm2Data = {
      uIds: [user2.authUserId],
    };
    requestHelper('POST', '/dm/create/v2', tokenData, dm2Data);

    tokenData.token = owner.token;
    expect(requestHelper('GET', '/dm/list/v2', tokenData, {}).dms).toStrictEqual(expect.arrayContaining([
      expect.objectContaining({
        dmId: dm1.dmId
      })
    ]));
  });
});

describe('dmMessagesV1 test', () => {
  test('dmId does not refer to a valid DM', () => {
    const param = {
      dmId: dm1.dmId + 1,
      start: 0
    };
    tokenData.token = owner.token;
    expect(() => requestHelper('GET', '/dm/messages/v2', tokenData, param)).toThrow(Error);
  });

  test('start is greater than the total number of messages in the channel', () => {
    const param = {
      dmId: dm1.dmId,
      start: 20
    };
    tokenData.token = owner.token;
    expect(() => requestHelper('GET', '/dm/messages/v2', tokenData, param)).toThrow(Error);
  });

  test('dmId is valid and the authorised user is not a member of the DM', () => {
    const person = {
      email: 'cc@unsw.edu.au',
      password: 'password',
      nameFirst: 'kenny',
      nameLast: 'farzie'
    };
    const nonMember = requestHelper('POST', '/auth/register/v3', {}, person);

    const param2 = {
      dmId: dm1.dmId,
      start: 0
    };
    tokenData.token = nonMember.token;
    expect(() => requestHelper('GET', '/dm/messages/v2', tokenData, param2)).toThrow(Error);
  });

  test('token is invalid', () => {
    const param = {
      dmId: dm1.dmId,
      start: 0
    };
    tokenData.token = owner.token + 'yay';
    expect(() => requestHelper('GET', '/dm/messages/v2', tokenData, param)).toThrow(Error);
  });

  test('valid input with 50+ messages', () => {
    const msgData = {
      dmId: dm1.dmId,
      message: 'lol',
    };
    tokenData.token = owner.token;

    let count = 0;
    while (count < 52) {
      requestHelper('POST', '/message/senddm/v2', tokenData, msgData);
      count++;
    }

    const param = {
      dmId: dm1.dmId,
      start: 0
    };
    const result = requestHelper('GET', '/dm/messages/v2', tokenData, param);
    expect(result.messages).toEqual(expect.arrayContaining([]));
    expect(result.start).toStrictEqual(0);
    expect(result.end).toStrictEqual(50);
  });

  test('valid input', () => {
    const param = {
      dmId: dm1.dmId,
      start: 0
    };
    tokenData.token = owner.token;
    const result = requestHelper('GET', '/dm/messages/v2', tokenData, param);
    expect(result.messages).toEqual(expect.arrayContaining([]));
    expect(result.start).toStrictEqual(0);
    expect(result.end).toStrictEqual(-1);
  });
});

describe('dmDetailsV1 Test', () => {
  test('Invalid token', () => {
    const detailRequest = {
      dmId: dm1.dmId
    };
    tokenData.token = owner.token + 'yay';
    expect(() => requestHelper('GET', '/dm/details/v2', tokenData, detailRequest)).toThrow(Error);
  });

  test('Invalid dmId', () => {
    const detailRequest = {
      dmId: dm1.dmId + 1
    };
    tokenData.token = owner.token;
    expect(() => requestHelper('GET', '/dm/details/v2', tokenData, detailRequest)).toThrow(Error);
  });

  test('Valid dmId but user not member of DM', () => {
    const user2Data = {
      email: 'yj@unsw.edu.au',
      password: 'PASSWORD',
      nameFirst: 'Yuchao',
      nameLast: 'Jiang'
    };

    const user2 = requestHelper('POST', '/auth/register/v3', {}, user2Data);

    const detailRequest = {
      dmId: dm1.dmId
    };
    tokenData.token = user2.token;
    expect(() => requestHelper('GET', '/dm/details/v2', tokenData, detailRequest)).toThrow(Error);
  });

  test('Basic functionality', () => {
    const detailRequest = {
      dmId: dm1.dmId
    };
    tokenData.token = owner.token;
    const result = requestHelper('GET', '/dm/details/v2', tokenData, detailRequest);

    const ownerProfileData = {
      uId: owner.authUserId
    };
    const ownerProfile = requestHelper('GET', '/user/profile/v3', tokenData, ownerProfileData);

    expect(result.members).toEqual(expect.arrayContaining([ownerProfile.user]));
  });
});
