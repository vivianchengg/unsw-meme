import { channelJoinV1, channelInviteV1, channelMessagesV1, channelDetailsV1 } from './channel.js';
import { channelsCreateV1 } from './channels.js';
import { authRegisterV1 } from './auth.js';
import { clearV1 } from './other.js';
import { userProfileV1 } from './users.js';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  clearV1();
});

describe('channelDetailsV1 Test', () => {
  test('Invalid authUserId', () => {
    const user = authRegisterV1('jr@unsw.edu.au', 'password', 'Jake', 'Renzella');
    const channel = channelsCreateV1(user.authUserId, 'COMP1531', true);
    expect(channelDetailsV1(user.authUserId + 1, channel.channelId)).toStrictEqual(ERROR);
  });
  test('Invalid channelId', () => {
    const user = authRegisterV1('jr@unsw.edu.au', 'password', 'Jake', 'Renzella');
    const channel = channelsCreateV1(user.authUserId, 'COMP1531', true);
    expect(channelDetailsV1(user.authUserId, channel.channelId + 1)).toStrictEqual(ERROR);
  });
  test('Valid channelId and authUserId but user is not in course', () => {
    const user = authRegisterV1('jr@unsw.edu.au', 'password', 'Jake', 'Renzella');
    const channel = channelsCreateV1(user.authUserId, 'COMP1531', true);
    const outside_user = authRegisterV1('yj@unsw.edu.au', 'PASSWORD', 'Yuchao', 'Jiang');
    expect(channelDetailsV1(outside_user.authUserId, channel.channelId)).toStrictEqual(ERROR);
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

describe('channelJoinV1 function testing', () => {
  test('channelId does not refer to a valid channel', () => {
    const new_user_authid = authRegisterV1("bridgetcosta@gmail.com", "daffodil", "bridget", "costa");
    const new_channel_id = channelsCreateV1(new_user_authid.authUserId, "holidays", true);
    expect(channelJoinV1(new_user_authid.authUserId, new_channel_id.channelId + 1)).toStrictEqual(ERROR);
  });
  
  test('the authorised user is already a member of the channel', () => {
    const new_user_authid = authRegisterV1("bridgetcosta@gmail.com", "daffodil", "bridget", "costa");
    const new_channel_id = channelsCreateV1(new_user_authid.authUserId, "games", true);
    channelJoinV1(new_user_authid, new_channel_id.channelId);
    expect(channelJoinV1(new_user_authid.authUserId, new_channel_id.channelId)).toStrictEqual(ERROR);
  });
  
  test('channelId refers to a channel that is private, when the authorised user is not already a channel member and is not a global owner', () => {
    const new_user_authid = authRegisterV1("bridgetcosta@gmail.com", "daffodil", "bridget", "costa");
    const new_channel_id = channelsCreateV1(new_user_authid.authUserId, "sports", false);
    const new_user_authid1 = authRegisterV1("dianahazea@gmail.com", "january", "diana", "haze");
    expect(channelJoinV1(new_user_authid.authUserId, new_channel_id.channelId)).toStrictEqual(ERROR);
  });
  
  test('authUserId is invalid', () => {
    const new_user_authid = authRegisterV1("bridgetcosta@gmail.com", "daffodil", "bridget", "costa");
    const new_channel_id = channelsCreateV1(new_user_authid.authUserId, "music", true);
    expect(channelJoinV1(new_user_authid.authUserId + 1, new_channel_id.channelId)).toStrictEqual(ERROR);
  });

  test('valid input', () => {
    const user1 = authRegisterV1("bridgetcosta@gmail.com", "daffodil", "bridget", "costa");
    const channel = channelsCreateV1(user1.authUserId, "games", true);
    const user2 = authRegisterV1("abc@gmail.com", "password", "Mary", "Chan");
    expect(channelJoinV1(user2.authUserId, channel.channelId)).toStrictEqual({});
  });
});


describe('channelInviteV1 function testing', () => {
  test('channelId does not refer to a valid channel', () => {
    const new_user_authid = authRegisterV1("bridgetcosta@gmail.com", "daffodil", "bridget", "costa");
    const new_user_uId = authRegisterV1("arialee@gmail.com", "dynamite", "aria", "lee");
    const new_channel_id = channelsCreateV1(new_user_authid.authUserId, "music", false);
    expect(channelInviteV1(new_user_authid.authUserId, new_channel_id.channelId + 1, new_user_uId.uId)).toStrictEqual(ERROR);
  });
  
  test('uId does not refer to a valid user', () => {
    const new_user_authid = authRegisterV1("bridgetcosta@gmail.com", "daffodil", "bridget", "costa");
    const new_user_uId = authRegisterV1("arialee@gmail.com", "dynamite", "aria", "lee");
    const new_channel_id = channelsCreateV1(new_user_authid.authUserId, "music", false);
    expect(channelInviteV1(new_user_authid.authUserId, new_channel_id.channelId, new_user_uId.uId + 1)).toStrictEqual(ERROR);
  });
  
  test('uId refers to a user who is already a member of the channel', () => {
    const new_user_authid = authRegisterV1("bridgetcosta@gmail.com", "daffodil", "bridget", "costa");
    const new_user_uId = authRegisterV1("arialee@gmail.com", "dynamite", "aria", "lee");
    const new_channel_id = channelsCreateV1(new_user_authid.authUserId, "music", false);
    channelJoinV1(new_user_uId.uId, new_channel_id.channelId); 
    expect(channelInviteV1(new_user_authid.authUserId, new_channel_id.channelId, new_user_uId.uId)).toStrictEqual(ERROR);
  });
  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const new_user_authid = authRegisterV1("bridgetcosta@gmail.com", "daffodil", "bridget", "costa");
    const new_channel_id = channelsCreateV1(new_user_authid.authUserId, "music", false);
    const new_user_authid2 = authRegisterV1("dianahazea@gmail.com", "january", "diana", "haze");
    const new_user_uId = authRegisterV1("arialee@gmail.com", "dynamite", "aria", "lee");
    expect(channelInviteV1(new_user_authid2.authUserId, new_channel_id.channelId, new_user_uId.uId)).toStrictEqual(ERROR);
  });
  test('authUserId is invalid', () => {
    const new_user_authid = authRegisterV1("bridgetcosta@gmail.com", "daffodil", "bridget", "costa");
    const new_channel_id = channelsCreateV1(new_user_authid.authUserId, "bored", false);
    const new_user_uId = authRegisterV1("arialee@gmail.com", "dynamite", "aria", "lee");
    expect(channelInviteV1(new_user_authid.authUserId  + 1,new_channel_id.channelId, new_user_uId.uId)).toStrictEqual(ERROR);
  });
  test('valid input ', () => {
    const user1 = authRegisterV1("bridgetcosta@gmail.com", "daffodil", "bridget", "costa");
    const user2 = authRegisterV1("arialee@gmail.com", "dynamite", "aria", "lee");
    const channel = channelsCreateV1(user1.authUserId, "sports", true);
    expect(channelInviteV1(user1.authUserId, channel.channelId, user2.authUserId)).toStrictEqual({});
   });
});

describe('channelMessagesV1 function testing', () => {
  test('channelId does not refer to a valid channel', () => {
    const new_user_authid = authRegisterV1("bridgetcosta@gmail.com", "daffodil", "bridget", "costa");
    const new_channel_id = channelsCreateV1(new_user_authid.authUserId, "music", false);
    expect(channelMessagesV1(new_user_authid.authUserId, new_channel_id.channelId + 1, 0)).toStrictEqual(ERROR);
  });
  
  test('start is greater than the total number of messages in the channel', () => {
    const new_user_authid = authRegisterV1("bridgetcosta@gmail.com", "daffodil", "bridget", "costa");
    const new_channel_id = channelsCreateV1(new_user_authid.authUserId, "sports", false);
    expect(channelMessagesV1(new_user_authid.authUserId, new_channel_id.channelId, 1)).toStrictEqual(ERROR);
  });
  
  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const new_user_authid = authRegisterV1("bridgetcosta@gmail.com", "daffodil", "bridget", "costa");
    const new_channel_id = channelsCreateV1(new_user_authid.authUserId, "gaming", false);
    const new_user_authid1 = authRegisterV1("dianahazea@gmail.com", "january", "diana", "haze");
    expect(channelMessagesV1(new_user_authid1.authUserId, new_channel_id.channelId, 0)).toStrictEqual(ERROR);
  });
  
  test('authUserId is invalid', () => {
    const new_user_authid = authRegisterV1("bridgetcosta@gmail.com", "daffodil", "bridget", "costa");
    const new_channel_id = channelsCreateV1(new_user_authid.authUserId, "games", true);
    expect(channelMessagesV1(new_user_authid.authUserId+ 1, new_channel_id.channelId, 0)).toStrictEqual(ERROR);
  });

  test('valid input', () => {
    const new_user_authid = authRegisterV1("bridgetcosta@gmail.com", "daffodil", "bridget", "costa");
    const new_channel_id = channelsCreateV1(new_user_authid.authUserId, "music", true);
    expect(channelMessagesV1(new_user_authid.authUserId, new_channel_id.channelId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });  
});