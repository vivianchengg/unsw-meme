
import request from 'sync-request';
import config from './config.json';

const ERROR = { error: expect.any(String) };
const SERVER_URL = `${url}:${port}`;

describe('channelDetailsV1 Test', () => {
  beforeEach(() => {
    clearV1();
  });

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
    const outsideUser = authRegisterV1('yj@unsw.edu.au', 'PASSWORD', 'Yuchao', 'Jiang');
    expect(channelDetailsV1(outsideUser.authUserId, channel.channelId)).toStrictEqual(ERROR);
  });
  test('Basic functionality', () => {
    const user = authRegisterV1('jr@unsw.edu.au', 'password', 'Jake', 'Renzella');
    const channel = channelsCreateV1(user.authUserId, 'COMP1531', true);
    const userProfile = userProfileV1(user.authUserId, user.authUserId);
    expect(channelDetailsV1(user.authUserId, channel.channelId)).toStrictEqual({
      name: 'COMP1531',
      isPublic: true,
      ownerMembers: [userProfile.user],
      allMembers: [userProfile.user],
    });
  });
});

let user : any;
let channel : any;

describe('channelJoinV1 function testing', () => {
  beforeEach(() => {
    clearV1();
    user = authRegisterV1('bridgetcosta@gmail.com', 'daffodil', 'bridget', 'costa');
  });
  test('channelId does not refer to a valid channel', () => {
    channel = channelsCreateV1(user.authUserId, 'holidays', true);
    expect(channelJoinV1(user.authUserId, channel.channelId + 1)).toStrictEqual(ERROR);
  });

  test('the authorised user is already a member of the channel', () => {
    channel = channelsCreateV1(user.authUserId, 'games', true);
    channelJoinV1(user.authUserId, channel.channelId);
    expect(channelJoinV1(user.authUserId, channel.channelId)).toStrictEqual(ERROR);
  });

  test('channelId refers to a channel that is private, when the authorised user is not already a channel member and is not a global owner', () => {
    channel = channelsCreateV1(user.authUserId, 'sports', false);
    const user2 = authRegisterV1('dianahazea@gmail.com', 'january', 'diana', 'haze');
    expect(channelJoinV1(user2.authUserId, channel.channelId)).toStrictEqual(ERROR);
  });

  test('Test global owner can join private channel', () => {
    const user2 = authRegisterV1('dianahazea@gmail.com', 'january', 'diana', 'haze');
    channel = channelsCreateV1(user2.authUserId, 'sports', false);
    channelJoinV1(user.authUserId, channel.channelId);
    const cDetail = channelDetailsV1(user.authUserId, channel.channelId);
    const owners = cDetail.ownerMembers.map(mem => mem.uId);
    const allmems = cDetail.allMembers.map(mem => mem.uId);
    expect(owners).toEqual(expect.not.arrayContaining([user.authUserId]));
    expect(allmems).toContain(user.authUserId);
  });

  test('authUserId is invalid', () => {
    channel = channelsCreateV1(user.authUserId, 'music', true);
    expect(channelJoinV1(user.authUserId + 1, channel.channelId)).toStrictEqual(ERROR);
  });

  test('valid input', () => {
    channel = channelsCreateV1(user.authUserId, 'games', true);
    const user2 = authRegisterV1('abc@gmail.com', 'password', 'Mary', 'Chan');
    expect(channelJoinV1(user2.authUserId, channel.channelId)).toStrictEqual({});
  });
});

describe('channelInviteV1 function testing', () => {
  beforeEach(() => {
    clearV1();
    user = authRegisterV1('bridgetcosta@gmail.com', 'daffodil', 'bridget', 'costa');
  });
  test('channelId does not refer to a valid channel', () => {
    const newUser = authRegisterV1('arialee@gmail.com', 'dynamite', 'aria', 'lee');
    const channel = channelsCreateV1(user.authUserId, 'music', false);
    expect(channelInviteV1(user.authUserId, channel.channelId + 1, newUser.authUserId)).toStrictEqual(ERROR);
  });

  test('uId does not refer to a valid user', () => {
    const newUser = authRegisterV1('arialee@gmail.com', 'dynamite', 'aria', 'lee');
    const channel = channelsCreateV1(user.authUserId, 'music', false);
    expect(channelInviteV1(user.authUserId, channel.channelId, newUser.authUserId + 1)).toStrictEqual(ERROR);
  });

  test('uId refers to a user who is already a member of the channel', () => {
    const user2 = authRegisterV1('arialee@gmail.com', 'dynamite', 'aria', 'lee');
    const channel = channelsCreateV1(user.authUserId, 'music', false);
    channelInviteV1(user.authUserId, channel.channelId, user2.authUserId);
    expect(channelInviteV1(user.authUserId, channel.channelId, user2.authUserId)).toStrictEqual(ERROR);
  });
  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const channel = channelsCreateV1(user.authUserId, 'music', false);
    const user2 = authRegisterV1('dianahazea@gmail.com', 'january', 'diana', 'haze');
    const newUser = authRegisterV1('arialee@gmail.com', 'dynamite', 'aria', 'lee');
    expect(channelInviteV1(user2.authUserId, channel.channelId, newUser.authUserId)).toStrictEqual(ERROR);
  });
  test('authUserId is invalid', () => {
    const channel = channelsCreateV1(user.authUserId, 'bored', false);
    const newUser = authRegisterV1('arialee@gmail.com', 'dynamite', 'aria', 'lee');
    expect(channelInviteV1(user.authUserId + 1, channel.channelId, newUser.authUserId)).toStrictEqual(ERROR);
  });
  test('valid input ', () => {
    const user2 = authRegisterV1('arialee@gmail.com', 'dynamite', 'aria', 'lee');
    const channel = channelsCreateV1(user.authUserId, 'sports', true);
    expect(channelInviteV1(user.authUserId, channel.channelId, user2.authUserId)).toStrictEqual({});
  });
});

describe('channelMessagesV1 function testing', () => {
  beforeEach(() => {
    clearV1();
    user = authRegisterV1('bridgetcosta@gmail.com', 'daffodil', 'bridget', 'costa');
  });
  test('channelId does not refer to a valid channel', () => {
    const channel = channelsCreateV1(user.authUserId, 'music', false);
    expect(channelMessagesV1(user.authUserId, channel.channelId + 1, 0)).toStrictEqual(ERROR);
  });

  test('start is greater than the total number of messages in the channel', () => {
    const channel = channelsCreateV1(user.authUserId, 'sports', false);
    expect(channelMessagesV1(user.authUserId, channel.channelId, 1)).toStrictEqual(ERROR);
  });

  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const channel = channelsCreateV1(user.authUserId, 'gaming', false);
    const user1 = authRegisterV1('dianahazea@gmail.com', 'january', 'diana', 'haze');
    expect(channelMessagesV1(user1.authUserId, channel.channelId, 0)).toStrictEqual(ERROR);
  });

  test('authUserId is invalid', () => {
    const channel = channelsCreateV1(user.authUserId, 'games', true);
    expect(channelMessagesV1(user.authUserId + 1, channel.channelId, 0)).toStrictEqual(ERROR);
  });

  test('valid input', () => {
    const channel = channelsCreateV1(user.authUserId, 'music', true);
    expect(channelMessagesV1(user.authUserId, channel.channelId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });
});


//Iteration 2

beforeEach(() => {
  request('DELETE', SERVER_URL + '/clear', { json: {} });
  deleterequest('DELETE', SERVER_URL + '/clear', { json: {} });
  const person = {
    email: 'bridgetcosta@gmail.com',
    password: 'daffodil',
    nameFirst: 'bridget',
    nameLast: 'costa'
  };
  const user = postRequest('/auth/register/v2', person);
});

describe('HTTP tests using Jest for channelInviteV2', () => {
  beforeEach(() => {
    const param2 = {
      email: 'arialee@gmail.com',
      password: 'dynamite',
      nameFirst: 'aria',
      nameLast: 'lee'
    };
    const invited_user = postRequest('/auth/user/v2', param1); 
  });  
  test('channelId does not refer to a valid channel', () => {
    const param1 = {
      token: user.token,
      name: "holidays",
      isPublic: true
    };
    const channel = postRequest('/channels/create/v2', param1);
    const param2 = {
      token: user.token, 
      channelId: channel.channelId + 1, 
      uId: invited_user.authUserId
    }
    expect(postRequest('/channel/invite/v2', param2).toStrictEqual(ERROR));
  });
  test('uId does not refer to a valid user', () => {
    const param1 = {
      token: user.token,
      name: "holidays",
      isPublic: false
    };
    const channel = postRequest('/channels/create/v2', param1);
    const param2 = {
      token: user.token,
      channelId: channel.channelId,
      uId: invited_user.authUserId + 1
    }
    expect(postRequest('/channel/invite/v2', param2).toStrictEqual(ERROR));
  });
  test('uId refers to a user who is already a member of the channel', () => {
    const param1 = {
      token: user.token,
      name: "holidays",
      isPublic: false
    };
    const channel = postRequest('/channels/create/v2', param1);
    const param2 = {
      token: invited_user.token, 
      channelId: channel.channelId, 
    }
    postRequest('/channel/join/v2', param2); 
    const param3 = {
      token: user.token, 
      channelId: channel.channelId, 
      uId: invited_user.authUserId
    }
    expect(postRequest('/channel/invite/v2', param3)).toStrictEqual(ERROR);
  }); 
  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const param1 = {
      token: user.token,
      name: "holidays",
      isPublic: false
    };
    const channel = postRequest('/channels/create/v2', param1);
    const param2 = {
      email: 'dianahazea@gmail.com', 
      password: 'january', 
      nameFirst: 'diana',
      nameLast: 'haze'
    }
    const user2 = postRequest('/auth/register/v2', param2);
    const param3 = {
      token: user2.token,
      channelId: channel.channelId, 
      uId: invited_user.authUserId
    }
    expect(postRequest('/channel/invite/v2', param3)).toStrictEqual(ERROR);
  });
  test('token is invalid', () => {
    const param1 = {
      token: user.token,
      name: "holidays",
      isPublic: false
    };
    const channel = postRequest('/channels/create/v2', param1);
    const param2 = {
      token: user.token + 1, 
      channelId: channel.channelId,
      uId: invited_user.authUserId
    }
    expect(postRequest('/channel/invite/v2', param2)).toStrictEqual(ERROR);
  });
  test ('valid channelIviteV2', () => {
    const param1 = {
      token: user.token,
      name: "holidays",
      isPublic: false
    };
    const channel = postRequest('/channels/create/v2', param1);
    const param2 = {
      token: user.token, 
      channelId: channel.channelId,
      uId: invited_user.authUserId
    }
    expect(postRequest('/channel/invite/v2', param2)).toStrictEqual({});
  });
});