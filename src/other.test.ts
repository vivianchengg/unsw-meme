import { clearV1 } from './other';
import { authRegisterV1 } from './auth';
import { channelsCreateV1 } from './channels';
import { userProfileV1 } from './users';
import { channelDetailsV1 } from './channel';

const ERROR = { error: expect.any(String) };

describe('Test clearV1 function', () => {
  test('test clearV1 - user and channel', () => {
    const user = authRegisterV1('vc@unsw.edu.au', 'password', 'Vivian', 'Cheng');
    const newChannel = channelsCreateV1(user.authUserId, 'ABC', true);
    clearV1();
    const person = userProfileV1(user.authUserId, user.authUserId);
    const channel = channelDetailsV1(user.authUserId, newChannel.channelId);
    expect(person).toStrictEqual(ERROR);
    expect(channel).toStrictEqual(ERROR);
  });

  test('test clearV1 - basic output', () => {
    const result = clearV1();
    expect(result).toStrictEqual({});
  });
});
