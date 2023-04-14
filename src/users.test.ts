/* import { requestHelper } from './request';

let user: any;

beforeEach(() => {
  requestHelper('DELETE', '/clear/v1', {}, {});
  const userData = {
    email: 'jr@unsw.edu.au',
    password: 'password',
    nameFirst: 'Jake',
    nameLast: 'Renzella'
  };
  user = requestHelper('POST', '/auth/register/v3', {}, userData);
});

afterAll(() => {
  requestHelper('DELETE', '/clear/v1', {}, {});
});

describe('userProfileSetHandleV1 tests', () => {
  test('Invalid token', () => {
    const param = {
      handleStr: 'theJAKErenzella'
    };

    const headerData = {
      token: user.token + 'buffer'
    };

    expect(requestHelper('PUT', '/user/profile/sethandle/v2', headerData, param)).toEqual(403);
  });

  test('New handle not between 3-20 characters', () => {
    const param = {
      handleStr: 'ohmygodILOVECOMP1531!!'
    };

    const headerData = {
      token: user.token
    };

    expect(requestHelper('PUT', '/user/profile/sethandle/v2', headerData, param)).toEqual(400);
  });

  test('New handle contains non-alphanumeric characters', () => {
    const param = {
      handleStr: 'やったCOMP1531が大好き!'
    };

    const headerData = {
      token: user.token
    };

    expect(requestHelper('PUT', '/user/profile/sethandle/v2', headerData, param)).toEqual(400);
  });

  test('New handle already taken', () => {
    const person2 = {
      email: 'yj@unsw.edu.au',
      password: 'PASSWORD',
      nameFirst: 'Yuchao',
      nameLast: 'Jiang'
    };

    const user2 = requestHelper('POST', '/auth/register/v3', {}, person2);

    const profileParam = {
      uId: user2.authUserId
    };

    const header1Data = {
      token: user2.token
    };

    const user2Profile = requestHelper('GET', '/user/profile/v3', header1Data, profileParam);

    const param = {
      handleStr: user2Profile.user.handleStr
    };

    const header2Data = {
      token: user.token
    };

    expect(requestHelper('PUT', '/user/profile/sethandle/v2', header2Data, param)).toEqual(400);
  });

  test('Basic functionality', () => {
    const param = {
      handleStr: 'theJAKErenzella'
    };

    const headerData = {
      token: user.token
    };

    requestHelper('PUT', '/user/profile/sethandle/v2', headerData, param);

    const userDetailData = {
      uId: user.authUserId
    };

    const header1Data = {
      token: user.token
    };

    const userDetail = requestHelper('GET', '/user/profile/v3', header1Data, userDetailData);
    expect(userDetail.user.handleStr).toStrictEqual('theJAKErenzella');
  });
});

describe('userProfileSetEmailV1 tests', () => {
  test('Invalid token', () => {
    const param = {
      email: 'jake23@unsw.edu.au'
    };

    const headerData = {
      token: user.token + 'buffer'
    };

    expect(requestHelper('PUT', '/user/profile/setemail/v2', headerData, param)).toEqual(403);
  });

  test('Invalid email', () => {
    const param = {
      email: 'buffer'
    };

    const headerData = {
      token: user.token
    };

    expect(requestHelper('PUT', '/user/profile/setemail/v2', headerData, param)).toEqual(400);
  });

  test('Email already taken', () => {
    const person2 = {
      email: 'yj@unsw.edu.au',
      password: 'PASSWORD',
      nameFirst: 'Yuchao',
      nameLast: 'Jiang'
    };

    const user2 = requestHelper('POST', '/auth/register/v3', {}, person2);

    const profileParam = {
      uId: user2.authUserId
    };

    const header1Data = {
      token: user2.token
    };

    const user2Profile = requestHelper('GET', '/user/profile/v3', header1Data, profileParam);

    const param = {
      email: user2Profile.user.email
    };

    const headerData = {
      token: user.token
    };

    expect(requestHelper('PUT', '/user/profile/setemail/v2', headerData, param)).toEqual(400);
  });

  test('Basic functionality', () => {
    const param = {
      email: 'JR@unsw.edu.au'
    };

    const headerData = {
      token: user.token,
    };

    requestHelper('PUT', '/user/profile/setemail/v2', headerData, param);

    const userDetailData = {
      uId: user.authUserId
    };

    const header1Data = {
      token: user.token
    };

    const userDetail = requestHelper('GET', '/user/profile/v3', header1Data, userDetailData);

    expect(userDetail.user.email).toStrictEqual('JR@unsw.edu.au');
  });
});

describe('HTTP - /user/profile/setname/v1', () => {
  test('Invalid token', () => {
    const param = {
      nameFirst: 'yum',
      nameLast: 'my'
    };

    const headerData = {
      token: user.token + '1'
    };

    expect(requestHelper('PUT', '/user/profile/setname/v2', headerData, param)).toEqual(403);
  });

  test('0 length first name', () => {
    const param = {
      nameFirst: '',
      nameLast: 'my'
    };

    const headerData = {
      token: user.token
    };

    expect(requestHelper('PUT', '/user/profile/setname/v2', headerData, param)).toEqual(400);
  });

  test('50+ length first name', () => {
    const param = {
      nameFirst: 'a'.repeat(51),
      nameLast: 'my'
    };

    const headerData = {
      token: user.token
    };

    expect(requestHelper('PUT', '/user/profile/setname/v2', headerData, param)).toEqual(400);
  });

  test('0 length last name', () => {
    const param = {
      nameFirst: 'yum',
      nameLast: ''
    };

    const headerData = {
      token: user.token
    };

    expect(requestHelper('PUT', '/user/profile/setname/v2', headerData, param)).toEqual(400);
  });

  test('50+ length lastname name', () => {
    const param = {
      nameFirst: 'yum',
      nameLast: 'a'.repeat(51),
    };

    const headerData = {
      token: user.token
    };

    expect(requestHelper('PUT', '/user/profile/setname/v2', headerData, param)).toEqual(400);
  });

  test('Valid input', () => {
    const param = {
      nameFirst: 'yum',
      nameLast: 'my',
    };

    const headerData = {
      token: user.token
    };

    requestHelper('PUT', '/user/profile/setname/v2', headerData, param);

    const userDetailData = {
      uId: user.authUserId
    };

    const header1Data = {
      token: user.token
    };

    const userDetail = requestHelper('GET', '/user/profile/v3', header1Data, userDetailData);
    expect(userDetail.user.nameFirst).toStrictEqual('yum');
    expect(userDetail.user.nameLast).toStrictEqual('my');
  });
});

describe('HTTP - /users/all/v1', () => {
  test('Invalid Token', () => {
    const param = {
      token: user.token + 'lol',
    };
    expect(requestHelper('GET', '/users/all/v2', param, {})).toEqual(403);
  });

  test('Valid Token', () => {
    const person = {
      email: 'abc@unsw.edu.au',
      password: 'password',
      nameFirst: 'abby',
      nameLast: 'boo',
    };
    const user3 = requestHelper('POST', '/auth/register/v3', {}, person);

    const param = {
      token: user3.token,
    };

    expect(requestHelper('GET', '/users/all/v2', param, {})).toStrictEqual({
      users: [
        {
          uId: user.authUserId,
          email: 'jr@unsw.edu.au',
          nameFirst: 'Jake',
          nameLast: 'Renzella',
          handleStr: 'jakerenzella'
        }, {
          uId: user3.authUserId,
          email: 'abc@unsw.edu.au',
          nameFirst: 'abby',
          nameLast: 'boo',
          handleStr: 'abbyboo'
        }]
    });
  });
});

describe('userProfileV2 tests', () => {
  test('Testing valid token + uId', () => {
    const userDetailData = {
      uId: user.authUserId
    };

    const header1Data = {
      token: user.token
    };

    const userDetail = requestHelper('GET', '/user/profile/v3', header1Data, userDetailData);

    expect(userDetail).toStrictEqual({
      user: {
        uId: user.authUserId,
        email: 'jr@unsw.edu.au',
        nameFirst: 'Jake',
        nameLast: 'Renzella',
        handleStr: 'jakerenzella',
      }
    });
  });

  test('Testing invalid token', () => {
    const userDetailData = {
      uId: user.authUserId
    };

    const header1Data = {
      token: user.token + 'yay'
    };

    const userDetail = requestHelper('GET', '/user/profile/v3', header1Data, userDetailData);
    expect(userDetail).toEqual(403);
  });

  test('Testing invalid uId', () => {
    const userDetailData = {
      uId: user.authUserId + 189
    };

    const header1Data = {
      token: user.token
    };

    const userDetail = requestHelper('GET', '/user/profile/v3', header1Data, userDetailData);
    expect(userDetail).toEqual(400);
  });
});
*/
