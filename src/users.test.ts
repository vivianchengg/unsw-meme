import { clearV1 } from './other';
import { userProfileV1 } from './users';
import { authRegisterV1 } from './auth';

import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;

//iteration 2
const getRequestGET = (url: string, data: any) => {
  const res = request('GET', url, { qs: data, });
  const bodyObj = JSON.parse(String(res.getBody()));
  return bodyObj;
}

//takes in token + uId
describe ('HTTP - userProfileV2 tests', () => {
  test('Testing valid token + uId', () => {
    const user = authRegisterV1('christine@gmail.com', 'password', 'christine', 'chu');
    const bodyObj = getRequestGET(`${url}:${port}/user/profile/v2`, {
      token: user.token[0],
      id: user.uId,
    });
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual({
      user: {
        uId: user.authUserId,
        email: 'christine@gmail.com',
        nameFirst: 'christine',
        nameLast: 'chu',
        handleStr: 'christinechu',
      }
    });
  })

  test('Testing invalid token', () => {
    const user = authRegisterV1('christine@gmail.com', 'password', 'christine', 'chu');
    const bodyObj = getRequestGET(`${url}:${port}/user/profile/v2`, {
      token: user.token[0] + 'yay!',
      id: user.uId,
    });
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual(ERROR);
  })

  test('Testing invalid uId', () => {
    const user = authRegisterV1('christine@gmail.com', 'password', 'christine', 'chu');
    const bodyObj = getRequestGET(`${url}:${port}/user/profile/v2`, {
      token: user.token[0],
      id: user.uId + 1,
    });
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual(ERROR);
  })
});



// iteration 1
let user: any;

beforeEach(() => {
  clearV1();
  const user = authRegisterV1('christine@gmail.com', 'password', 'christine', 'chu');
});

const ERROR = { error: expect.any(String) };

describe('VALID INPUT!', () => {
  test('Test: valid authuserId and uId', () => {
    expect(userProfileV1(user.authUserId, user.authUserId)).toStrictEqual({
      user: {
        uId: user.authUserId,
        email: 'christine@gmail.com',
        nameFirst: 'christine',
        nameLast: 'chu',
        handleStr: 'christinechu',
      }
    });
  });
});

describe('INVALID!', () => {
  test('Test: invalid authUserId', () => {
    expect(userProfileV1(user.authUserId + 1, user.authUserId)).toStrictEqual(ERROR);
  });

  test('Test: invalid authUserId', () => {
    expect(userProfileV1(user.authUserId, user.authUserId + 1)).toStrictEqual(ERROR);
  });
});
