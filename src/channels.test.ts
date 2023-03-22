import { channelsListAllV1, channelsCreateV1, channelsListV1 } from './channels';
import { authRegisterV1 } from './auth';
import { clearV1 } from './other';

const ERROR = { error: expect.any(String) };

let user : { authUserId: number } | any = { authUserId: -1 };
let channel : { channelId: number } | any = { channelId: -1 };

beforeEach(() => {
  clearV1();
  user = authRegisterV1('jr@unsw.edu.au', 'password', 'Jake', 'Renzella');
  channel = channelsCreateV1(user.authUserId, 'COMP1531', true);
});

describe('channelsCreateV1 Tests', () => {
  test('Test: valid name & authid!', () => {
    expect(channelsCreateV1(user.authUserId, 'pewpewpew!', true)).toStrictEqual({ channelId: expect.any(Number) });
  });

  test('Test: invalid 0 name length', () => {
    expect(channelsCreateV1(user.authUserId, '', false)).toStrictEqual(ERROR);
  });

  test('Test: invalid +20 name length', () => {
    expect(channelsCreateV1(user.authUserId, 'verycoolchannelname1234567891011121314151617181920', true)).toStrictEqual(ERROR);
  });

  test('Test: invalid authUserId', () => {
    expect(channelsCreateV1(user.authUserId + 1, 'pewpewpew!', true)).toStrictEqual(ERROR);
  });
});

describe('channelsListV1 Tests', () => {
  test('Test: invalid authUserId', () => {
    expect(channelsListV1(user.authUserId + 1)).toStrictEqual(ERROR);
  });

  test('Valid authUserId', () => {
    expect(channelsListV1(user.authUserId)).toStrictEqual({
      channels: [{
        channelId: channel.channelId,
        name: 'COMP1531',
      }]
    });
  });
});

describe('channelListAllV1 Tests', () => {
  test('Invalid authUserId', () => {
    channelsCreateV1(user.authUserId, 'COMP1531', true);
    expect(channelsListAllV1(user.authUserId + 1)).toStrictEqual(ERROR);
  });
  test('Basic functionality', () => {
    const channel2 = channelsCreateV1(user.authUserId, 'COMP2511', true);
    expect(channelsListAllV1(user.authUserId)).toStrictEqual({
      channels:
      [{
        channelId: channel.channelId,
        name: 'COMP1531'
      }, {
        channelId: channel2.channelId,
        name: 'COMP2511'
      }]
    });
  });
  test('Includes private with public channels', () => {
    const channel2 = channelsCreateV1(user.authUserId, 'COMP2511', true);
    const channelPriv = channelsCreateV1(user.authUserId, 'COMP3311', false);
    expect(channelsListAllV1(user.authUserId)).toStrictEqual({
      channels:
      [{
        channelId: channel.channelId,
        name: 'COMP1531'
      }, {
        channelId: channel2.channelId,
        name: 'COMP2511'
      }, {
        channelId: channelPriv.channelId,
        name: 'COMP3311'
      }]
    });
  });
  test('Includes channels user is not part of', () => {
    const user2 = authRegisterV1('yj@unsw.edu.au', 'PASSWORD', 'Yuchao', 'Jiang');
    const channel2 = channelsCreateV1(user.authUserId, 'COMP2511', true);
    const channelPriv = channelsCreateV1(user2.authUserId, 'COMP3311', false);
    expect(channelsListAllV1(user.authUserId)).toStrictEqual({
      channels:
    [{
      channelId: channel.channelId,
      name: 'COMP1531'
    }, {
      channelId: channel2.channelId,
      name: 'COMP2511'
    }, {
      channelId: channelPriv.channelId,
      name: 'COMP3311'
    }]
    });
  });
});

//Iteration 2

beforeEach(() => {
  request('DELETE', SERVER_URL + '/clear', { json: {} });
  
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
