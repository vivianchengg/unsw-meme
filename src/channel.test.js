import { channelDetailsV1 } from './channel.js';
import { channelsCreateV1 } from './channels.js';
import { authRegisterV1 } from './auth.js';
import { clearV1 } from './other.js';
import { userProfileV1 } from './users.js';

beforeEach(() => {
  clearV1();
});

describe('channelDetailsV1 Test', () => {
  test('Invalid authUserId', () => {
    const user = authRegisterV1('jr@unsw.edu.au', 'password', 'Jake', 'Renzella');
    const channel = channelsCreateV1(user.authUserId, 'COMP1531', true);
    expect(channelDetailsV1(user.authUserId + 1, channel.channelId)).toStrictEqual({ error: expect.any(String)});
  });
  test('Invalid channelId', () => {
    const user = authRegisterV1('jr@unsw.edu.au', 'password', 'Jake', 'Renzella');
    const channel = channelsCreateV1(user.authUserId, 'COMP1531', true);
    expect(channelDetailsV1(user.authUserId, channel.channelId + 1)).toStrictEqual({ error: expect.any(String)});
  });
  test('Valid channelId and authUserId but user is not in course', () => {
    const user = authRegisterV1('jr@unsw.edu.au', 'password', 'Jake', 'Renzella');
    const channel = channelsCreateV1(user.authUserId, 'COMP1531', true);
    const outside_user = authRegisterV1('yj@unsw.edu.au', 'PASSWORD', 'Yuchao', 'Jiang');
    expect(channelDetailsV1(outside_user.authUserId, channel.channelId)).toStrictEqual({error: expect.any(String)});
  });
  test('Basic functionality', () => {
    const user = authRegisterV1('jr@unsw.edu.au', 'password', 'Jake', 'Renzella');
    const channel = channelsCreateV1(user.authUserId, 'COMP1531', true);
    const user_profile = userProfileV1(user.authUserId, user.authUserId);
    expect(channelDetailsV1(user.authUserId, channel.channelId)).toStrictEqual({
        name: 'COMP1531',
        isPublic: true,
        ownerMembers: [user_profile],
        allMembers: [user_profile],
    });
  });
});