import { channelsListAllV1, channelsCreateV1, channelsListV1 } from './channels';
import { authRegisterV1 } from './auth';
import { clearV1 } from './other';

const ERROR = { error: expect.any(String) };

describe('channelsCreateV1 Tests', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Test: valid name & authid!', () => {
    const user = authRegisterV1('christine@gmail.com', 'password', 'christine', 'chu');
    expect(channelsCreateV1(user.authUserId, 'pewpewpew!', true)).toStrictEqual({ channelId: expect.any(Number) });
  });

  test('Test: invalid 0 name length', () => {
    const user = authRegisterV1('christine@gmail.com', 'password', 'christine', 'chu');
    expect(channelsCreateV1(user.authUserId, '', false)).toStrictEqual(ERROR);
  });

  test('Test: invalid +20 name length', () => {
    const user = authRegisterV1('christine@gmail.com', 'password', 'christine', 'chu');
    expect(channelsCreateV1(user.authUserId, 'verycoolchannelname1234567891011121314151617181920', true)).toStrictEqual(ERROR);
  });

  test('Test: invalid authUserId', () => {
    const user = authRegisterV1('christine@gmail.com', 'password', 'christine', 'chu');
    expect(channelsCreateV1(user.authUserId + 1, 'pewpewpew!', true)).toStrictEqual(ERROR);
  });
});

describe('channelsListV1 Tests', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Test: invalid authUserId', () => {
    const user = authRegisterV1('christine@gmail.com', 'password', 'christine', 'chu');
    channelsCreateV1(user.authUserId, 'pineapplesunshine', true);
    expect(channelsListV1(user.authUserId + 1)).toStrictEqual(ERROR);
  });

  test('Valid authUserId', () => {
    const user = authRegisterV1('christine@gmail.com', 'password', 'christine', 'chu');
    const channel = channelsCreateV1(user.authUserId, 'pineapplesunshine', true);
    expect(channelsListV1(user.authUserId)).toStrictEqual({
      channels: [{
        channelId: channel.channelId,
        name: 'pineapplesunshine',
      }]
    });
  });
});

describe('channelListAllV1 Tests', () => {
  let user: any;
  let channel: any;

  beforeEach(() => {
    clearV1();
    user = authRegisterV1('jr@unsw.edu.au', 'password', 'Jake', 'Renzella');
    channel = channelsCreateV1(user.authUserId, 'COMP1531', true);
  });

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
