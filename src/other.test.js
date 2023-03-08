import { clearV1 } from './other.js';
import { authRegisterV1 } from './auth.js';

const ERROR = { error: expect.any(String)};

describe('Test clearV1 function'), () => {
  test('test clear'), () => {
    const user = authRegisterV1('vc@unsw.edu.au', 'password', 'Vivian', 'Cheng');
    const newChannel = channelsCreateV1(user.authUserId, 'ABC', true);
    clearV1();
    const person = userProfileV1(user.authUserId, user.authUserId);
    const channel = channelDetailsV1(user.authUserId, newChannel.channelId);
    expect(person).toStrictEqual(ERROR);
    expect(channel).toStrictEqual(ERROR);
  } 
}