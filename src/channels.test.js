import { channelsListAllV1 } from './channel.js';
import { channelsCreateV1 } from './channels.js';
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


describe('channelListAllV1 Tests'), () => {
  
  beforeEach(() => {
    clearV1();
    let user_id = authRegisterV1('jr@unsw.edu.au', 'password', 'Jake', 'Renzella');
    let channel_id = channelsCreateV1(user_id, 'COMP1531', true);
  });


  test('Invalid authUserId'), () => {
    expect(channelsListAllV1(user_id + 1, channel_id)).toStrictEqual({ error: expect.any(String)});
  }
  test('Basic functionality'), () => {
    expect(channelListAllV1(user_id, channel_id)).toStrictEqual([{
        channelId: channel_id,
        name: 'COMP1531'
    }]);
  }
}
