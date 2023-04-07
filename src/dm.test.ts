import { getRequest, postRequest, deleteRequest } from './dataStore';

const ERROR = { error: expect.any(String) };

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

describe('dmMessagesV1 test', () => {
  test('dmId does not refer to a valid DM', () => {
    const param = {
      token: owner.token,
      dmId: dm1.dmId + 1,
      start: 0
    };
    expect(getRequest('/dm/messages/v1', param)).toStrictEqual(ERROR);
  });

  test('start is greater than the total number of messages in the channel', () => {
    const param = {
      token: owner.token,
      dmId: dm1.dmId,
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
      dmId: dm1.dmId,
      start: 0
    };
    expect(getRequest('/dm/messages/v1', param2)).toStrictEqual(ERROR);
  });

  test('token is invalid', () => {
    const param = {
      token: owner.token + 'yay',
      dmId: dm1.dmId,
      start: 0
    };
    expect(getRequest('/dm/messages/v1', param)).toStrictEqual(ERROR);
  });

  test('valid input', () => {
    const param = {
      token: owner.token,
      dmId: dm1.dmId,
      start: 0
    };

    const result = getRequest('/dm/messages/v1', param);
    expect(result.messages).toEqual(expect.arrayContaining([]));
    expect(result.start).toStrictEqual(0);
    expect(result.end).toStrictEqual(-1);
  });
});

describe('dmDetailsV1 Test', () => {
  test('Invalid token', () => {
    const detailRequest = {
      token: owner.token + 'yay',
      dmId: dm1.dmId
    };

    expect(getRequest('/dm/details/v1', detailRequest)).toStrictEqual(ERROR);
  });

  test('Invalid dmId', () => {
    const detailRequest = {
      token: owner.token,
      dmId: dm1.dmId + 1
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
      dmId: dm1.dmId
    };

    expect(getRequest('/dm/details/v1', detailRequest)).toStrictEqual(ERROR);
  });

  test('Basic functionality', () => {
    const detailRequest = {
      token: owner.token,
      dmId: dm1.dmId
    };

    const result = getRequest('/dm/details/v1', detailRequest);

    const ownerProfileData = {
      token: owner.token,
      uId: owner.authUserId
    };
    const ownerProfile = getRequest('/user/profile/v2', ownerProfileData);

    expect(result.members).toEqual(expect.arrayContaining([ownerProfile.user]));
  });
});
