import { port, url } from './config.json';
import request from 'sync-request';

const ERROR = { error: expect.any(String) };
const SERVER_URL = `${url}:${port}`;

const getRequest = (url: string, data: any) => {
  const res = request(
    'GET',
    SERVER_URL + url,
    {
      qs: data,
    }
  );
  const body = JSON.parse(res.getBody() as string);
  return body;
};

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

const deleteRequest = (url: string) => {
  const res = request(
    'DELETE',
    SERVER_URL + url
  );
  const body = JSON.parse(res.getBody() as string);
  return body;
};

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
    deleteRequest('/clear/v1');

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
    expect(deleteRequest('/clear/v1')).toStrictEqual({});
  });
});
