
import { requestHelper } from './request';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  requestHelper('DELETE', '/clear/v1', {}, null);
});

afterAll(() => {
  requestHelper('DELETE', '/clear/v1', {}, null);
});

describe('authLoginV1 Test', () => {
  test('email entered does not belong to a user', () => {
    const user1Data = {
      email: 'vc@unsw.edu.au',
      password: 'password'
    };

    expect(requestHelper('POST', '/auth/login/v2', {}, user1Data)).toStrictEqual(ERROR);
  });
    /*
    const regData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };

    requestHelper('POST', '/auth/register/v2', {}, regData);

    const user2Data = {
      email: 'vc1@unsw.edu.au',
      password: 'password'
    };

    expect(requestHelper('POST', '/auth/login/v2', {}, user2Data)).toStrictEqual(ERROR);
  });

  test('password is not correct', () => {
    const regData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };

    requestHelper('POST', '/auth/register/v2', {}, regData);

    const userData = {
      email: 'vc@unsw.edu.au',
      password: 'pwd'
    };

    expect(requestHelper('POST', '/auth/login/v2', {}, userData)).toStrictEqual(ERROR);
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

    const reg = requestHelper('POST', '/auth/register/v2', {}, regData);
    let user = requestHelper('POST', '/auth/login/v2', {}, userData);
    expect(user.authUserId).toStrictEqual(reg.authUserId);

    for (let i = 0; i < 500; i++) {
      user = requestHelper('POST', '/auth/login/v2', {}, userData);
    }
    expect(user.authUserId).toStrictEqual(reg.authUserId);
  });
  */
});
/*
describe('authRegisterV1 Test', () => {
  test('invalid email', () => {
    const userData = {
      email: 'email',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };

    expect(postRequest('/auth/register/v2', {}, userData)).toStrictEqual(ERROR);
  });

  test('email already taken', () => {
    const userData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };

    postRequest('/auth/register/v2', {}, userData);
    expect(postRequest('/auth/register/v2', {}, userData)).toStrictEqual(ERROR);
  });

  test('invalid password length', () => {
    const userData = {
      email: 'vc@unsw.edu.au',
      password: 'pwd',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };

    expect(postRequest('/auth/register/v2', {}, userData)).toStrictEqual(ERROR);
  });

  test('invalid firstname length', () => {
    const userData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: '',
      nameLast: 'Cheng'
    };

    expect(postRequest('/auth/register/v2', {}, userData)).toStrictEqual(ERROR);
  });

  test('invalid lastname length', () => {
    const userData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: ''
    };

    expect(postRequest('/auth/register/v2', {}, userData)).toStrictEqual(ERROR);
  });

  test('check handle: basic', () => {
    const userData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };

    const user = postRequest('/auth/register/v2', {}, userData);

    const profileData = {
      uId: user.authUserId,
    };

    const tokenData = {
      token: user.token
    }

    const person = getRequest('/user/profile/v2', tokenData, profileData);
    expect(person.user.handleStr).toStrictEqual('viviancheng');
  });

  test('check handle: remove non-alphanumeric characters', () => {
    const userData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'V@ivi,an',
      nameLast: 'Ch#eng!'
    };

    const user = postRequest('/auth/register/v2', userData);

    const profileData = {
      token: user.token,
      uId: user.authUserId,
    };

    const person = getRequest('/user/profile/v2', profileData);
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

    const user1 = postRequest('/auth/register/v2', user1Data);

    const profile1Data = {
      token: user1.token,
      uId: user1.authUserId,
    };

    const person1 = getRequest('/user/profile/v2', profile1Data);

    // user 2
    const user2Data = {
      email: 'vc2@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };

    const user2 = postRequest('/auth/register/v2', user2Data);

    const profile2Data = {
      token: user2.token,
      uId: user2.authUserId,
    };

    const person2 = getRequest('/user/profile/v2', profile2Data);

    // user 3
    const user3Data = {
      email: 'vc3@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };

    const user3 = postRequest('/auth/register/v2', user3Data);

    const profile3Data = {
      token: user3.token,
      uId: user3.authUserId,
    };

    const person3 = getRequest('/user/profile/v2', profile3Data);

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

    const user = postRequest('/auth/register/v2', userData);

    const profileData = {
      token: user.token,
      uId: user.authUserId,
    };

    const person = getRequest('/user/profile/v2', profileData);
    expect(person.user.handleStr).toStrictEqual('vivian1234cheng12345');
  });

  test('duplicate handles generated correctly', () => {
    const user1Data = {
      email: 'blah3@email.com',
      password: 'password1',
      nameFirst: 'abc',
      nameLast: 'def'
    };

    postRequest('/auth/register/v2', user1Data);

    const user2Data = {
      email: 'blah1@email.com',
      password: 'password1',
      nameFirst: 'abcdefghij',
      nameLast: 'klmnopqrs'
    };

    const user2 = postRequest('/auth/register/v2', user2Data);

    const profile2Data = {
      token: user2.token,
      uId: user2.authUserId,
    };

    const person2 = getRequest('/user/profile/v2', profile2Data);
    expect(person2.user.handleStr).toEqual('abcdefghijklmnopqrs');

    const user3Data = {
      email: 'blah2@email.com',
      password: 'password1',
      nameFirst: 'abcdefghij',
      nameLast: 'klmnopqrs'
    };

    const user3 = postRequest('/auth/register/v2', user3Data);

    const profile3Data = {
      token: user3.token,
      uId: user3.authUserId,
    };

    const person3 = getRequest('/user/profile/v2', profile3Data);
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
    const token1 = postRequest('/auth/register/v2', user1Data).token;

    const logoutData = {
      token: token1 + 'yay'
    };
    expect(postRequest('/auth/logout/v1', logoutData)).toStrictEqual(ERROR);
  });

  test('test valid logout', () => {
    const userData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    postRequest('/auth/register/v2', userData);

    const loginData = {
      email: userData.email,
      password: userData.password
    };
    const token = postRequest('/auth/login/v2', loginData).token;

    const logoutData = {
      token: token
    };
    expect(postRequest('/auth/logout/v1', logoutData)).toStrictEqual({});
  });
});
*/
