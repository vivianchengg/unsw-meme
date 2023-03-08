import { authRegisterV1 } from './auth.js';
import { clearV1 } from './other.js';

beforeEach(() => {
  clearV1();
});

describe('authRegisterV1 Test', () => {
  test('invalid email', () => {
    expect(authRegisterV1('email', 'password', 'Vivian', 'Cheng')).toStrictEqual({ error: 'invalid email' });
  });

  test('email already taken', () => {
    authRegisterV1('vc@unsw.edu.au', 'password', 'Vivian', 'Cheng');
    expect(authRegisterV1('vc@unsw.edu.au', 'password', 'Vivian', 'Cheng')).toStrictEqual({ error: 'email already taken' });
  });

  test('invalid password length', () => {
    expect(authRegisterV1('vc@unsw.edu.au', 'pwd', 'Vivian', 'Cheng')).toStrictEqual({ error: 'password < 6 characters' });
  });
  
  test('invalid firstname length', () => {
    expect(authRegisterV1('vc@unsw.edu.au', 'password', '', 'Cheng')).toStrictEqual({ error: 'incorrect firstname length' });
  });

  test('invalid lastname length', () => {
    expect(authRegisterV1('vc@unsw.edu.au', 'password', 'Vivian', '')).toStrictEqual({ error: 'incorrect lastname length' });
  });

  test('test basic register', () => {
    const user = authRegisterV1('vc@unsw.edu.au', 'password', 'Vivian', 'Cheng');
    const id = user.authUserId;
    expect(id).toStrictEqual(10);
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