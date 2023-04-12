import { getRequest, postRequest, requestHelper } from './request';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  requestHelper('DELETE', '/clear/v1', {}, {});
});

afterAll(() => {
  requestHelper('DELETE', '/clear/v1', {}, {});
});

describe('Test clearV1 function', () => {
  test('test clearV1 - user and channel', () => {
    // new user
    const userData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const user = postRequest('/auth/register/v2', userData);
    // const user = requestHelper('POST', '/auth/register/v3', {}, userData);

    // new channel
    const tokenData = {
      token: user.token
    };
    const channelData = {
      token: user.token,
      name: 'ABC',
      isPublic: true
    };
    const channel = requestHelper('POST', '/channels/create/v3', tokenData, channelData);

    // clear
    requestHelper('DELETE', '/clear/v1', {}, {});

    // get user profile
    const tokenData = {
      token: user.token
    };
    const profileData = {
      uId: user.authUserId,
    };

    // get channel detail
    const detailData = {
      channelId: channel.channelId,
    };

    expect(() => requestHelper('GET', '/user/profile/v3', tokenData, profileData)).toThrow(Error);
    expect(() => requestHelper('GET', '/channel/details/v3', tokenData, detailData)).toThrow(Error);
  });

  test('test clearV1 - basic output', () => {
    expect(requestHelper('DELETE', '/clear/v1', {}, {})).toStrictEqual({});
  });
});
