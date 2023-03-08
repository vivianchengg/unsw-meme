import { channelsListAllV1 } from './channel.js';
import { channelsCreateV1 } from './channels.js';
import { authRegisterV1 } from './auth.js';
import { clearV1 } from './other.js';

beforeEach(() => {
  clearV1();
  let user_id = authRegisterV1('jr@unsw.edu.au', 'password', 'Jake', 'Renzella');
  const channel_id = channelsCreateV1(user_id, 'COMP1531', true);
  const second_channel_id = channelsCreateV1(user_id, 'COMP2511', true);
});

describe('channelListAllV1 Tests'), () => {
  test('Invalid authUserId'), () => {
    expect(channelsListAllV1(user_id + 1)).toStrictEqual({ error: expect.any(String)});
  }
  test('Shows all public channels'), () => {
    expect(channelListAllV1(user_id)).toStrictEqual([{
        channelId: channel_id,
        name: 'COMP1531'
    }, {
      channelId: second_channel_id,
      name: 'COMP2511'
    }]);
  }
  test('Includes private with public channels'), () => {
    const private_id = channelsCreateV1(user_id, 'COMP3311', false);
    expect(channelListAllV1(user_id)).toStrictEqual([{
      channelId: channel_id,
      name: 'COMP1531'
    }, {
      channelId: second_channel_id,
      name: 'COMP2511'
    }, {
      channeId: private_id,
      name: 'COMP3311'
    }]);
  }
  test('Includes channels user is not part of'), () => {
    const second_user_id = authRegisterV1('yj@unsw.edu.au', 'PASSWORD', 'Yuchao', 'Jiang');
    const private_id = channelsCreateV1(second_user_id, 'COMP3311', false);
    expect(channelListAllV1(user_id)).toStrictEqual([{
      channelId: channel_id,
      name: 'COMP1531'
    }, {
      channelId: second_channel_id,
      name: 'COMP2511'
    }, {
      channeId: private_id,
      name: 'COMP3311'
    }]);
  }
}
