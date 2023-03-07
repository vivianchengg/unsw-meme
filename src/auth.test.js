import { authRegisterV1, authLoginV1 } from './auth.js';
import { clearV1 } from './other.js';

beforeEach(() => {
  clearV1();
});

describe('authLoginV1 Test', () => {
  test('email entered does not belong to a user', () => {
    expect(authLoginV1('vc@unsw.edu.au', 'password')).toStrictEqual({ error: 'invalid email' });

    authRegisterV1('vc@unsw.edu.au', 'password', 'Vivian', 'Cheng');
    expect(authLoginV1('vc1@unsw.edu.au', 'password')).toStrictEqual({ error: 'invalid email' });
  });

  test('password is not correct', () => {
    authRegisterV1('vc@unsw.edu.au', 'password', 'Vivian', 'Cheng');
    expect(authLoginV1('vc@unsw.edu.au', 'pwd')).toStrictEqual({ error: 'incorrect password' });
  });

  test('test login', () => {
    const reg = authRegisterV1('vc@unsw.edu.au', 'password', 'Vivian', 'Cheng');
    const user = authLoginV1('vc@unsw.edu.au', 'password');
    expect(user.authUserId).toStrictEqual(reg.authUserId);
  });
});