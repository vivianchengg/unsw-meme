import { authRegisterV1, authLoginV1 } from './auth.js';
import { clearV1 } from './other.js';

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