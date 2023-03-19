import { channelsListAllV1, channelsCreateV1, channelsListV1 } from './channels';
import { authRegisterV1 } from './auth';
import { clearV1 } from './other';

import request from 'sync-request';
import config from './config.json';

//const OK = 200;
const port = config.port;
const url = config.url;

const ERROR = { error: expect.any(String) };

let user : { authUserId: number } | any = { authUserId: -1 };
let channel : { channelId: number } | any = { channelId: -1 };

// iteration 2
const getRequestPOST = (url: string, data: any) => {
  const res = request(
    'POST',
    url,
    {
      json: data,
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  return bodyObj
}

describe('channelsCreateV2 Tests', () => {
  test('Testing valid token + name', () => {
    const bodyObj = getRequestPOST(`${url}:${port}/channels/create/v2`, {
      token: user.token[0],
      name: 'pewpewpew!',
      isPublic: true,
    });
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual({ channelId: expect.any(Number) });
  })

  test('Testing invalid token', () => {
    const bodyObj = getRequestPOST(`${url}:${port}/channels/create/v2`, {
      token: user.token[0] + 'hey!',
      name: 'pewpewpew!',
      isPublic: true,
    });
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual(ERROR);
  })

  test('Testing invalid name', () => {
    const bodyObj = getRequestPOST(`${url}:${port}/channels/create/v2`, {
      token: user.token[0],
      name: 'verycoolchannelname1234567891011121314151617181920',
      isPublic: true,
    });
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual(ERROR);
  })

})


beforeEach(() => {
  clearV1();
  user = authRegisterV1('jr@unsw.edu.au', 'password', 'Jake', 'Renzella');
  channel = channelsCreateV1(user.authUserId, 'COMP1531', true);
});

describe('channelsCreateV1 Tests', () => {
  test('Test: valid name & authid!', () => {
    expect(channelsCreateV1(user.authUserId, 'pewpewpew!', true)).toStrictEqual({ channelId: expect.any(Number) });
  });

  test('Test: invalid 0 name length', () => {
    expect(channelsCreateV1(user.authUserId, '', false)).toStrictEqual(ERROR);
  });

  test('Test: invalid +20 name length', () => {
    expect(channelsCreateV1(user.authUserId, 'verycoolchannelname1234567891011121314151617181920', true)).toStrictEqual(ERROR);
  });

  test('Test: invalid authUserId', () => {
    expect(channelsCreateV1(user.authUserId + 1, 'pewpewpew!', true)).toStrictEqual(ERROR);
  });
});

describe('channelsListV1 Tests', () => {
  test('Test: invalid authUserId', () => {
    expect(channelsListV1(user.authUserId + 1)).toStrictEqual(ERROR);
  });

  test('Valid authUserId', () => {
    expect(channelsListV1(user.authUserId)).toStrictEqual({
      channels: [{
        channelId: channel.channelId,
        name: 'COMP1531',
      }]
    });
  });
});

describe('channelListAllV1 Tests', () => {
  test('Invalid authUserId', () => {
    channelsCreateV1(user.authUserId, 'COMP1531', true);
    expect(channelsListAllV1(user.authUserId + 1)).toStrictEqual(ERROR);
  });
  test('Basic functionality', () => {
    const channel2 = channelsCreateV1(user.authUserId, 'COMP2511', true);
    expect(channelsListAllV1(user.authUserId)).toStrictEqual({
      channels:
      [{
        channelId: channel.channelId,
        name: 'COMP1531'
      }, {
        channelId: channel2.channelId,
        name: 'COMP2511'
      }]
    });
  });
  test('Includes private with public channels', () => {
    const channel2 = channelsCreateV1(user.authUserId, 'COMP2511', true);
    const channelPriv = channelsCreateV1(user.authUserId, 'COMP3311', false);
    expect(channelsListAllV1(user.authUserId)).toStrictEqual({
      channels:
      [{
        channelId: channel.channelId,
        name: 'COMP1531'
      }, {
        channelId: channel2.channelId,
        name: 'COMP2511'
      }, {
        channelId: channelPriv.channelId,
        name: 'COMP3311'
      }]
    });
  });
  test('Includes channels user is not part of', () => {
    const user2 = authRegisterV1('yj@unsw.edu.au', 'PASSWORD', 'Yuchao', 'Jiang');
    const channel2 = channelsCreateV1(user.authUserId, 'COMP2511', true);
    const channelPriv = channelsCreateV1(user2.authUserId, 'COMP3311', false);
    expect(channelsListAllV1(user.authUserId)).toStrictEqual({
      channels:
    [{
      channelId: channel.channelId,
      name: 'COMP1531'
    }, {
      channelId: channel2.channelId,
      name: 'COMP2511'
    }, {
      channelId: channelPriv.channelId,
      name: 'COMP3311'
    }]
    });
  });
});
