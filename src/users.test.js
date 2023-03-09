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
    const user = authRegisterV1('christine@gmail.com', 'password', 'christine', 'chu');
    expect(userProfileV1(user.authUserId + 1, user.authUserId)).toStrictEqual(ERROR);
  });

  test('Test: invalid authUserId', () => {
    const user = authRegisterV1('christine@gmail.com', 'password', 'christine', 'chu');
    expect(userProfileV1(user.authUserId, user.authUserId + 1)).toStrictEqual(ERROR);
  });

});