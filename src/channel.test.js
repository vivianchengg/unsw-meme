import { channelDetailsV1 } from './channel.js';
import { channelsCreateV1 } from './channels.js';
import { authRegisterV1 } from './auth.js';
import { clearV1 } from './other.js';

beforeEach(() => {
  clearV1();
  let user_id = authRegisterV1('jr@unsw.edu.au', 'password', 'Jake', 'Renzella');
  let channel_id = channelsCreateV1(user_id, 'COMP1531', true);
});

describe('channelDetailsV1 Test', () => {
  test('Invalid authUserId', () => {
    expect(channelDetailsV1(user_id + 1, channel_id)).toStrictEqual({ error: expect.any(String)});
  });
  test('Invalid channelId', () => {
    expect(channelDetailsV1(user_id, channel_id + 1)).toStrictEqual({ error: expect.any(String)});
  });
  test('Valid channelId and authUserId but user is not in course', () => {
    const outside_user_id = authRegisterV1('yj@unsw.edu.au', 'PASSWORD', 'Yuchao', 'Jiang');
    expect(channelDetailsV1(outside_user_id, channel_id)).toStrictEqual({error: expect.any(String)});
  });
  test('Basic functionality', () => {
    expect(channelDetailsV1(user_id, channel_id)).toStrictEqual({
        name: 'COMP1531',
        isPublic: true,
        ownerMembers: [],
        allMembers: [user_id]
    });
  });
});
