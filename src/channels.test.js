import { channelsListAllV1, channelsCreateV1, channelsListV1 } from './channels.js';
import { authRegisterV1 } from './auth.js';
import { clearV1 } from './other.js';

const ERROR = { error: expect.any(String) };

describe('channelsCreateV1 Tests', () => {

  beforeEach(() => {
    clearV1();
  });

  test('Test: valid name & authid!', () => {
    const user = authRegisterV1('christine@gmail.com', 'password', 'christine', 'chu');
    expect(channelsCreateV1(user.authUserId, 'pewpewpew!', true)).toStrictEqual({channelId: expect.any(Number)});
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
})

describe('channelsListV1 Tests', () => {

  beforeEach(() => {
    clearV1();
  });

  test('Test: invalid authUserId', () => {
    const user = authRegisterV1('christine@gmail.com', 'password', 'christine', 'chu');
    const channel = channelsCreateV1(user.authUserId, 'pineapplesunshine', true);
    expect(channelsListV1(user.authUserId + 1, channel.channelId)).toStrictEqual(ERROR);
  });

  test('Valid authUserId', () => {
    const user = authRegisterV1('christine@gmail.com', 'password', 'christine', 'chu');
    const channel = channelsCreateV1(user.authUserId, 'pineapplesunshine', true);
    expect(channelsListV1(user.authUserId, channel.channelId)).toStrictEqual({
      channels: [{
        channelId: channel.channelId,
        name: 'pineapplesunshine',
    }]});
  });
})

describe('channelListAllV1 Tests', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Invalid authUserId', () => {
    const user = authRegisterV1('jr@unsw.edu.au', 'password', 'Jake', 'Renzella');
    const channel = channelsCreateV1(user.authUserId, 'COMP1531', true);
    expect(channelsListAllV1(user.authUserId + 1, channel.channelId)).toStrictEqual(ERROR);
  });
  test('Basic functionality', () => {
    const user = authRegisterV1('jr@unsw.edu.au', 'password', 'Jake', 'Renzella');
    const channel = channelsCreateV1(user.authUserId, 'COMP1531', true);
    const second_channel = channelsCreateV1(user.authUserId, 'COMP2511', true);
    expect(channelsListAllV1(user.authUserId, channel.channelId)).toStrictEqual([{
        channelId: channel.channelId,
        name: 'COMP1531'
    }, {
        channelId: second_channel.channelId,
        name: 'COMP2511'
    }]);
  });
  test('Includes private with public channels', () => {
    const user = authRegisterV1('jr@unsw.edu.au', 'password', 'Jake', 'Renzella');
    const channel = channelsCreateV1(user.authUserId, 'COMP1531', true);
    const second_channel = channelsCreateV1(user.authUserId, 'COMP2511', true);
    const private_channel = channelsCreateV1(user.authUserId, 'COMP3311', false);
    expect(channelsListAllV1(user.authUserId)).toStrictEqual([{
      channelId: channel.channelId,
      name: 'COMP1531'
    }, {
      channelId: second_channel.channelId,
      name: 'COMP2511'
    }, {
      channelId: private_channel.channelId,
      name: 'COMP3311'
    }]);
  });
  test('Includes channels user is not part of', () => {
    const user = authRegisterV1('jr@unsw.edu.au', 'password', 'Jake', 'Renzella');
    const second_user = authRegisterV1('yj@unsw.edu.au', 'PASSWORD', 'Yuchao', 'Jiang');
    const channel = channelsCreateV1(user.authUserId, 'COMP1531', true);
    const second_channel = channelsCreateV1(user.authUserId, 'COMP2511', true);
    const private_channel = channelsCreateV1(second_user.authUserId, 'COMP3311', false);
    expect(channelsListAllV1(user.authUserId)).toStrictEqual([{
      channelId: channel.channelId,
      name: 'COMP1531'
    }, {
      channelId: second_channel.channelId,
      name: 'COMP2511'
    }, {
      channelId: private_channel.channelId,
      name: 'COMP3311'
    }]);
  });
});
