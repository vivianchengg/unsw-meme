import { channelJoinV1, channelInviteV1, channelMessagesV1, channelDetailsV1 } from './channel';
import { channelsCreateV1 } from './channels';
import { authRegisterV1 } from './auth';
import { clearV1 } from './other';
import { userProfileV1 } from './users';

const ERROR = { error: expect.any(String) };

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
});

describe('HTTP tests using Jest for channelJoinV2', () => {
  beforeEach(() => {
    clearV1();
    user = authRegisterV1('bridgetcosta@gmail.com', 'daffodil', 'bridget', 'costa');
  });

  test('test sucessful channelJoinV2', () => {
    channel = channelsCreateV2(user.authUserId, 'games', true);
    const user = authRegisterV2('abc@gmail.com', 'password', 'Mary', 'Chan');
    expect(channelJoinV1(user.token, channel.channelId)).toStrictEqual({});

    const res = request(
      'POST', `${url}:${port}/channelJoinV2`, { json: {token: user2.token, channeld: 3}} );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual();
  })

  test('channelId does not refer to a valid channel', () => {
    channel = channelsCreateV1(user.authUserId, 'holidays', true);
    expect(channelJoinV1(user.authUserId, channel.channelId + 1)).toStrictEqual(ERROR);
    const res = request(
      'POST', `${url}:${port}/channelJoinV2`, { json: {token: user.token, channeld: channel.channelId + 1}} );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });
  
  test('the authorised user is already a member of the channel', () => {
    channel = channelsCreateV1(user.authUserId, 'games', true);
    channelJoinV1(user.token, channel.channelId);
    const res = request(
      'POST', `${url}:${port}/channelJoinV2`, { json: {token: user.token, channeld: channel.channelId}} );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('channelId refers to a channel that is private, when the authorised user is not already a channel member and is not a global owner', () => {
    channel = channelsCreateV1(user.authUserId, 'sports', false);
    const user2 = authRegisterV1('dianahazea@gmail.com', 'january', 'diana', 'haze');
    const res = request(
      'POST', `${url}:${port}/channelJoinV2`, { json: {token: user2.token, channeld: channel.channelId}} );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });
  
  /*test('Test global owner can join private channel', () => {
    const user2 = authRegisterV1('dianahazea@gmail.com', 'january', 'diana', 'haze');
    channel = channelsCreateV1(user2.authUserId, 'sports', false);
    channelJoinV2(user.authUserId, channel.channelId);
    const cDetail = channelDetailsV1(user.authUserId, channel.channelId);
    const owners = cDetail.ownerMembers.map(mem => mem.uId);
    const allmems = cDetail.allMembers.map(mem => mem.uId);
    expect(owners).toEqual(expect.not.arrayContaining([user.authUserId]));
    expect(allmems).toContain(user.authUserId);
      const res = request(
        'POST', `${url}:${port}/channelJoinV2`, { json: {token: user2.token, channeld: channel.channelId}} );
      const bodyObj1 = JSON.parse(res.body as string);

      const res = request(
        'POST', `${url}:${port}/channelJoinV2`, { json: {token: user2.token, channeld: channel.channelId}} );
      const bodyObj2 = JSON.parse(res.body as string);
      expect(res.statusCode).toBe(OK);
      expect(bodyObj1).toStrictEqual({ error: 'error' });
      
  });*/
});


describe('channelInvite2 function testing', () => {
  beforeEach(() => {
    clearV1();
    user = authRegisterV1('bridgetcosta@gmail.com', 'daffodil', 'bridget', 'costa');
  });

  test('channelId does not refer to a valid channel', () => {
    channel = channelsCreateV1(user.authUserId, 'holidays', true);
    const newUser = authRegisterV2('arialee@gmail.com', 'dynamite', 'aria', 'lee');
    const res = request(
      'POST', `${url}:${port}/channelInvite2`, { json: {token: user.token, channeld: channel.channelId + 1, uId: newuser.authUserId}} );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('uId does not refer to a valid user', () => {
    const newUser = authRegisterV2('arialee@gmail.com', 'dynamite', 'aria', 'lee');
    const channel = channelsCreateV2(user.authUserId, 'music', false);
    const res = request(
      'POST', `${url}:${port}/channelInvite2`, { json: {token: user.token, channeld: channel.channelId + 1, uId: newUser.authUserId + 1}} );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('uId refers to a user who is already a member of the channel', () => {
    const newUser = authRegisterV2('arialee@gmail.com', 'dynamite', 'aria', 'lee');
    const channel = channelsCreateV2(user.authUserId, 'music', false);
    channelInviteV1(user.authUserId, channel.channelId, user2.authUserId);
    const res = request(
      'POST', `${url}:${port}/channelInviteV2`, { json: {token: user.token, channeld: channel.channelId, uId: user2.authUserId}} );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const channel = channelsCreateV1(user.authUserId, 'music', false);
    const user2 = authRegisterV1('dianahazea@gmail.com', 'january', 'diana', 'haze');
    const newUser = authRegisterV1('arialee@gmail.com', 'dynamite', 'aria', 'lee');
    const res = request(
      'POST', `${url}:${port}/channelInviteV2`, { json: {token: user2.token, channeld: channel.channelId, uId: newUser.authUserId}} );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });

  test('valid input', () => {
    const user2 = authRegisterV1('arialee@gmail.com', 'dynamite', 'aria', 'lee');
    const channel = channelsCreateV1(user.authUserId, 'sports', true);
    const res = request(
      'POST', `${url}:${port}/channelInviteV2`, { json: {token: user.token, channeld: channel.channelId, uId: user2.authUserId}} );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({ error: 'error' });
  });
}); 