import { authRegisterV1, authLoginV1 } from './auth.js';
import { clearV1 } from './other.js';
import { userProfileV1 } from './users.js';

const ERROR = { error: expect.any(String) };

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
    const handle = person.handleStr;
    expect(handle).toStrictEqual('viviancheng');
  });

  test('check handle: remove non-alphanumeric characters', () => {
    const user = authRegisterV1('vc@unsw.edu.au', 'password', 'V@ivi,an', 'Ch#eng!');
    const person = userProfileV1(user.authUserId, user.authUserId);
    const handle = person.handleStr;
    expect(handle).toStrictEqual('viviancheng');
  });

  test('check handle: add number if handle taken', () => {
    const user1 = authRegisterV1('vc1@unsw.edu.au', 'password', 'Vivian', 'Cheng');
    const user2 = authRegisterV1('vc2@unsw.edu.au', 'password', 'Vivian', 'Cheng');
    const user3 = authRegisterV1('vc3@unsw.edu.au', 'password', 'Vivian', 'Cheng');

    const person1 = userProfileV1(user1.authUserId, user1.authUserId);
    const handle1 = person1.handleStr;
    expect(handle1).toStrictEqual('viviancheng');
    const person2 = userProfileV1(user2.authUserId, user2.authUserId);
    const handle2 = person2.handleStr;
    expect(handle2).toStrictEqual('viviancheng0');
    const person3 = userProfileV1(user3.authUserId, user3.authUserId);
    const handle3 = person3.handleStr;
    expect(handle3).toStrictEqual('viviancheng1');
  });

  test('check handle: cut off at length 20', () => {
    const user = authRegisterV1('vc@unsw.edu.au', 'password', 'Vivian1234', 'Cheng123456');
    const person = userProfileV1(user.authUserId, user.authUserId);
    const handle = person.handleStr;
    expect(handle).toStrictEqual('vivian1234cheng12345');
  });
});