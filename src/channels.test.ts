import { channelsListAllV1, channelsCreateV1, channelsListV1 } from './channels';
import { authRegisterV1 } from './auth';
import { clearV1 } from './other';

const ERROR = { error: expect.any(String) };

describe('channelsCreateV1 Tests', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Test: valid name & authid!', () => {
    const user = authRegisterV1('christine@gmail.com', 'password', 'christine', 'chu');
    expect(channelsCreateV1(user.authUserId, 'pewpewpew!', true)).toStrictEqual({ channelId: expect.any(Number) });
  });

  test('Test: invalid 0 name length', () => {
    const user = authRegisterV1('christine@gmail.com', 'password', 'christine', 'chu');
    expect(channelsCreateV1(user.authUserId, '', false)).toStrictEqual(ERROR);
  });

  test('Test: invalid +20 name length', () => {
    const user = authRegisterV1('christine@gmail.com', 'password', 'christine', 'chu');
    expect(channelsCreateV1(user.authUserId, 'verycoolchannelname1234567891011121314151617181920', true)).toStrictEqual(ERROR);
  });

  test('Test: invalid authUserId', () => {
    const user = authRegisterV1('christine@gmail.com', 'password', 'christine', 'chu');
    expect(channelsCreateV1(user.authUserId + 1, 'pewpewpew!', true)).toStrictEqual(ERROR);
  });
});

describe('channelsListV1 Tests', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Test: invalid authUserId', () => {
    const user = authRegisterV1('christine@gmail.com', 'password', 'christine', 'chu');
    channelsCreateV1(user.authUserId, 'pineapplesunshine', true);
    expect(channelsListV1(user.authUserId + 1)).toStrictEqual(ERROR);
  });

  test('Valid authUserId', () => {
    const user = authRegisterV1('christine@gmail.com', 'password', 'christine', 'chu');
    const channel = channelsCreateV1(user.authUserId, 'pineapplesunshine', true);
    expect(channelsListV1(user.authUserId)).toStrictEqual({
      channels: [{
        channelId: channel.channelId,
        name: 'pineapplesunshine',
      }]
    });
  });
});

describe('channelListAllV1 Tests', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Invalid authUserId', () => {
    const user = authRegisterV1('jr@unsw.edu.au', 'password', 'Jake', 'Renzella');
    channelsCreateV1(user.authUserId, 'COMP1531', true);
    expect(channelsListAllV1(user.authUserId + 1)).toStrictEqual(ERROR);
  });
  test('Basic functionality', () => {
    const user = authRegisterV1('jr@unsw.edu.au', 'password', 'Jake', 'Renzella');
    const channel = channelsCreateV1(user.authUserId, 'COMP1531', true);
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
    const user = authRegisterV1('jr@unsw.edu.au', 'password', 'Jake', 'Renzella');
    const channel = channelsCreateV1(user.authUserId, 'COMP1531', true);
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
    const user = authRegisterV1('jr@unsw.edu.au', 'password', 'Jake', 'Renzella');
    const user2 = authRegisterV1('yj@unsw.edu.au', 'PASSWORD', 'Yuchao', 'Jiang');
    const channel = channelsCreateV1(user.authUserId, 'COMP1531', true);
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
  
  test('Test global owner can join private channel', () => {
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
      const bodyObj = JSON.parse(res.body as string);
      expect(res.statusCode).toBe(OK);
      expect(bodyObj).toStrictEqual({ error: 'error' });
  });
});
