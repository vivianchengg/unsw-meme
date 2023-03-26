import { authRegisterV1, authLoginV1 } from './auth';
import { clearV1 } from './other';
import { userProfileV1 } from './users';

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

beforeEach(() => {
  clearV1();
});

describe('authLoginV1 Test', () => {
  test('email entered does not belong to a user', () => {
    expect(authLoginV1('vc@unsw.edu.au', 'password')).toStrictEqual(ERROR);

    authRegisterV1('vc@unsw.edu.au', 'password', 'Vivian', 'Cheng');
    expect(authLoginV1('vc1@unsw.edu.au', 'password')).toStrictEqual(ERROR);
  });

  test('password is not correct', () => {
    authRegisterV1('vc@unsw.edu.au', 'password', 'Vivian', 'Cheng');
    expect(authLoginV1('vc@unsw.edu.au', 'pwd')).toStrictEqual(ERROR);
  });

  test('test login', () => {
    const reg = authRegisterV1('vc@unsw.edu.au', 'password', 'Vivian', 'Cheng');
    const user = authLoginV1('vc@unsw.edu.au', 'password');
    expect(user.authUserId).toStrictEqual(reg.authUserId);
  });
});

describe('authRegisterV1 Test', () => {
  test('invalid email', () => {
    expect(authRegisterV1('email', 'password', 'Vivian', 'Cheng')).toStrictEqual(ERROR);
  });

  test('email already taken', () => {
    authRegisterV1('vc@unsw.edu.au', 'password', 'Vivian', 'Cheng');
    expect(authRegisterV1('vc@unsw.edu.au', 'password', 'Vivian', 'Cheng')).toStrictEqual(ERROR);
  });

  test('invalid password length', () => {
    expect(authRegisterV1('vc@unsw.edu.au', 'pwd', 'Vivian', 'Cheng')).toStrictEqual(ERROR);
  });

  test('invalid firstname length', () => {
    expect(authRegisterV1('vc@unsw.edu.au', 'password', '', 'Cheng')).toStrictEqual(ERROR);
  });

  test('invalid lastname length', () => {
    expect(authRegisterV1('vc@unsw.edu.au', 'password', 'Vivian', '')).toStrictEqual(ERROR);
  });

  test('check handle: basic', () => {
    const user = authRegisterV1('vc@unsw.edu.au', 'password', 'Vivian', 'Cheng');
    const person = userProfileV1(user.authUserId, user.authUserId);
    const handle = person.user.handleStr;
    expect(handle).toStrictEqual('viviancheng');
  });

  test('check handle: remove non-alphanumeric characters', () => {
    const user = authRegisterV1('vc@unsw.edu.au', 'password', 'V@ivi,an', 'Ch#eng!');
    const person = userProfileV1(user.authUserId, user.authUserId);
    const handle = person.user.handleStr;
    expect(handle).toStrictEqual('viviancheng');
  });

  test('check handle: add number if handle taken', () => {
    const user1 = authRegisterV1('vc1@unsw.edu.au', 'password', 'Vivian', 'Cheng');
    const user2 = authRegisterV1('vc2@unsw.edu.au', 'password', 'Vivian', 'Cheng');
    const user3 = authRegisterV1('vc3@unsw.edu.au', 'password', 'Vivian', 'Cheng');

    const person1 = userProfileV1(user1.authUserId, user1.authUserId);
    const handle1 = person1.user.handleStr;
    expect(handle1).toStrictEqual('viviancheng');
    const person2 = userProfileV1(user2.authUserId, user2.authUserId);
    const handle2 = person2.user.handleStr;
    expect(handle2).toStrictEqual('viviancheng0');
    const person3 = userProfileV1(user3.authUserId, user3.authUserId);
    const handle3 = person3.user.handleStr;
    expect(handle3).toStrictEqual('viviancheng1');
  });

  test('check handle: cut off at length 20', () => {
    const user = authRegisterV1('vc@unsw.edu.au', 'password', 'Vivian1234', 'Cheng123456');
    const person = userProfileV1(user.authUserId, user.authUserId);
    const handle = person.user.handleStr;
    expect(handle).toStrictEqual('vivian1234cheng12345');
  });

  test('duplicate handles generated correctly', () => {
    authRegisterV1('blah3@email.com', 'password1', 'abc', 'def');
    const user1 = authRegisterV1('blah1@email.com', 'password1', 'abcdefghij', 'klmnopqrs');
    const handle1 = userProfileV1(user1.authUserId, user1.authUserId).user.handleStr;
    expect(handle1).toEqual('abcdefghijklmnopqrs');

    const user2 = authRegisterV1('blah2@email.com', 'password1', 'abcdefghij', 'klmnopqrs');
    const handle2 = userProfileV1(user2.authUserId, user2.authUserId).user.handleStr;
    expect(handle2).toEqual('abcdefghijklmnopqrs0');
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
    expect(postRequest('/auth/logout/v1', token1 + '1')).toStrictEqual(ERROR);
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
      email: 'vc@unsw.edu.au',
      password: 'password',
    };
    const token = postRequest('/auth/login/v2', loginData).token;
    expect(postRequest('/auth/logout/v1', token)).toStrictEqual({});
  });
});
