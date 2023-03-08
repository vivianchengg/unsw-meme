import { channelsListAllV1 } from './channel.js';
import { channelsCreateV1 } from './channels.js';
import { authRegisterV1 } from './auth.js';
import { clearV1 } from './other.js';

beforeEach(() => {
  clearV1();
  let user_id = authRegisterV1('jr@unsw.edu.au', 'password', 'Jake', 'Renzella');
  let channel_id = channelsCreateV1(user_id, 'COMP1531', true);
});

describe('channelListAllV1 Tests'), () => {
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
