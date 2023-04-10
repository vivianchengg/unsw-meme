import { getRequest, postRequest, deleteRequest, requestHelper } from './request';
import { getHash } from './dataStore';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  deleteRequest('/clear/v1', null);
});

afterAll(() => {
  deleteRequest('/clear/v1', null);
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

    // new channel
    const channelData = {
      token: user.token,
      name: 'ABC',
      isPublic: true
    };
    const channel = postRequest('/channels/create/v2', channelData);

    // clear
    requestHelper('DELETE', '/clear/v1', {}, {});

    // get user profile
    const profileData = {
      token: user.token,
      uId: user.authUserId,
    };

    // get channel detail
    const detailData = {
      token: user.token,
      channelId: channel.channelId,
    };

    expect(getRequest('/user/profile/v2', profileData)).toStrictEqual(ERROR);
    expect(getRequest('/channel/details/v2', detailData)).toStrictEqual(ERROR);
  });

  test('test clearV1 - basic output', () => {
    expect(requestHelper('DELETE', '/clear/v1', {}, {})).toStrictEqual({});
  });
});
