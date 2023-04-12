import { requestHelper } from './request';

beforeEach(() => {
  requestHelper('DELETE', '/clear/v1', {}, {});
});

afterAll(() => {
  requestHelper('DELETE', '/clear/v1', {}, {});
});

describe('authLoginV1 Test', () => {
  test('email entered does not belong to a user', () => {
    const user1Data = {
      email: 'vc@unsw.edu.au',
      password: 'password'
    };

    expect(requestHelper('POST', '/auth/login/v3', {}, user1Data)).toEqual(400);

    const regData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };

    requestHelper('POST', '/auth/register/v3', {}, regData);

    const user2Data = {
      email: 'vc1@unsw.edu.au',
      password: 'password'
    };

    expect(requestHelper('POST', '/auth/login/v3', {}, user2Data)).toEqual(400);
  });

  test('password is not correct', () => {
    const regData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };

    requestHelper('POST', '/auth/register/v3', {}, regData);

    const userData = {
      email: 'vc@unsw.edu.au',
      password: 'pwd'
    };

    expect(requestHelper('POST', '/auth/login/v3', {}, userData)).toEqual(400);
  });

  test('test login', () => {
    const regData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };

    const userData = {
      email: 'vc@unsw.edu.au',
      password: 'password'
    };

    const reg = requestHelper('POST', '/auth/register/v3', {}, regData);
    let user = requestHelper('POST', '/auth/login/v3', {}, userData);
    expect(user.authUserId).toStrictEqual(reg.authUserId);

    for (let i = 0; i < 500; i++) {
      user = requestHelper('POST', '/auth/login/v3', {}, userData);
    }
    expect(user.authUserId).toStrictEqual(reg.authUserId);
  });
});

describe('authRegisterV1 Test', () => {
  test('invalid email', () => {
    const userData = {
      email: 'email',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };

    expect(requestHelper('POST', '/auth/register/v3', {}, userData)).toEqual(400);
  });

  test('email already taken', () => {
    const userData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };

    requestHelper('POST', '/auth/register/v3', {}, userData);
    expect(requestHelper('POST', '/auth/register/v3', {}, userData)).toEqual(400);
  });

  test('invalid password length', () => {
    const userData = {
      email: 'vc@unsw.edu.au',
      password: 'pwd',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };

    expect(requestHelper('POST', '/auth/register/v3', {}, userData)).toEqual(400);
  });

  test('invalid firstname length', () => {
    const userData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: '',
      nameLast: 'Cheng'
    };

    expect(requestHelper('POST', '/auth/register/v3', {}, userData)).toEqual(400);
  });

  test('invalid lastname length', () => {
    const userData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: ''
    };

    expect(requestHelper('POST', '/auth/register/v3', {}, userData)).toEqual(400);
  });

  test('check handle: basic', () => {
    const userData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };

    const user = requestHelper('POST', '/auth/register/v3', {}, userData);

    const profileData = {
      uId: user.authUserId
    };

    const headerData = {
      token: user.token
    };

    const person = requestHelper('GET', '/user/profile/v3', headerData, profileData);
    expect(person.user.handleStr).toStrictEqual('viviancheng');
  });

  test('check handle: remove non-alphanumeric characters', () => {
    const userData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'V@ivi,an',
      nameLast: 'Ch#eng!'
    };

    const user = requestHelper('POST', '/auth/register/v3', {}, userData);

    const profileData = {
      uId: user.authUserId
    };

    const headerData = {
      token: user.token
    };

    const person = requestHelper('GET', '/user/profile/v3', headerData, profileData);
    expect(person.user.handleStr).toStrictEqual('viviancheng');
  });

  test('check handle: add number if handle taken', () => {
    // user 1
    const user1Data = {
      email: 'vc1@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };

    const user1 = requestHelper('POST', '/auth/register/v3', {}, user1Data);

    const profile1Data = {
      uId: user1.authUserId
    };

    const header1Data = {
      token: user1.token
    };

    const person1 = requestHelper('GET', '/user/profile/v3', header1Data, profile1Data);

    // user 2
    const user2Data = {
      email: 'vc2@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };

    const user2 = requestHelper('POST', '/auth/register/v3', {}, user2Data);

    const profile2Data = {
      uId: user2.authUserId
    };

    const header2Data = {
      token: user2.token
    };

    const person2 = requestHelper('GET', '/user/profile/v3', header2Data, profile2Data);

    // user 3
    const user3Data = {
      email: 'vc3@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };

    const user3 = requestHelper('POST', '/auth/register/v3', {}, user3Data);

    const profile3Data = {
      uId: user3.authUserId
    };

    const header3Data = {
      token: user3.token
    };

    const person3 = requestHelper('GET', '/user/profile/v3', header3Data, profile3Data);

    expect(person1.user.handleStr).toStrictEqual('viviancheng');
    expect(person2.user.handleStr).toStrictEqual('viviancheng0');
    expect(person3.user.handleStr).toStrictEqual('viviancheng1');
  });

  test('check handle: cut off at length 20', () => {
    const userData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian1234',
      nameLast: 'Cheng123456'
    };

    const user = requestHelper('POST', '/auth/register/v3', {}, userData);

    const profileData = {
      uId: user.authUserId
    };

    const headerData = {
      token: user.token
    };

    const person = requestHelper('GET', '/user/profile/v3', headerData, profileData);
    expect(person.user.handleStr).toStrictEqual('vivian1234cheng12345');
  });

  test('duplicate handles generated correctly', () => {
    const user1Data = {
      email: 'blah3@email.com',
      password: 'password1',
      nameFirst: 'abc',
      nameLast: 'def'
    };

    requestHelper('POST', '/auth/register/v3', {}, user1Data);

    const user2Data = {
      email: 'blah1@email.com',
      password: 'password1',
      nameFirst: 'abcdefghij',
      nameLast: 'klmnopqrs'
    };

    const user2 = requestHelper('POST', '/auth/register/v3', {}, user2Data);

    const profile2Data = {
      uId: user2.authUserId
    };

    const header2Data = {
      token: user2.token
    };

    const person2 = requestHelper('GET', '/user/profile/v3', header2Data, profile2Data);
    expect(person2.user.handleStr).toEqual('abcdefghijklmnopqrs');

    const user3Data = {
      email: 'blah2@email.com',
      password: 'password1',
      nameFirst: 'abcdefghij',
      nameLast: 'klmnopqrs'
    };

    const user3 = requestHelper('POST', '/auth/register/v3', {}, user3Data);

    const profile3Data = {
      uId: user3.authUserId
    };

    const header3Data = {
      token: user3.token
    };

    const person3 = requestHelper('GET', '/user/profile/v3', header3Data, profile3Data);
    expect(person3.user.handleStr).toEqual('abcdefghijklmnopqrs0');
  });
});

describe('authLogout Test', () => {
  test('invalid token', () => {
    const user1Data = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const token1 = requestHelper('POST', '/auth/register/v3', {}, user1Data).token;

    const logoutData = {
      token: token1 + 'yay'
    };
    expect(requestHelper('POST', '/auth/logout/v2', logoutData, {})).toEqual(400);
  });

  test('test valid logout', () => {
    const userData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    requestHelper('POST', '/auth/register/v3', {}, userData);

    const loginData = {
      email: userData.email,
      password: userData.password
    };
    const token = requestHelper('POST', '/auth/login/v3', {}, loginData).token;

    const logoutData = {
      token: token
    };
    expect(requestHelper('POST', '/auth/logout/v2', logoutData, {})).toStrictEqual({});
  });
});
