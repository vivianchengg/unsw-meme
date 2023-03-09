import { authRegisterV1 } from './auth.js';

beforeEach(() => {
  clearV1();
});

const ERROR = { error: expect.any(String) };

describe ('VALID INPUT!', () => {
  test('Test: valid authuserId and uId', () => {
    const user = authRegisterV1('christine@gmail.com', 'password', 'christine', 'chu');
    expect(userProfileV1(user.authUserId, authUserId.uId)).toStrictEqual({
        uId: user.authUserId,
        email: 'christine@gmail.com',
        nameFirst: 'christine',
        nameLast: 'chu',
        handleStr: 'christinechu',
    });
  });
});

describe ('INVALID!', () => {
  test('Test: invalid authUserId', () => {
    const authUserId = authRegisterV1('christine@gmail.com', 'password', 'christine', 'chu');
    expect(userProfileV1(3, authUserId.uId)).toStrictEqual(ERROR);
  });

  test('Test: invalid authUserId', () => {
    const authUserId = authRegisterV1('christine@gmail.com', 'password', 'christine', 'chu');
    expect(userProfileV1(authUserId.uId, 6)).toStrictEqual(ERROR);
  });

});