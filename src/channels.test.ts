import { requestHelper } from './request';

const ERROR = { error: expect.any(String) };

let user: any;
let channel: any;
let tokenData: any;

beforeEach(() => {
  requestHelper('DELETE', '/clear/v1', {}, null);

  const person = {
    email: 'jr@unsw.edu.au',
    password: 'password',
    nameFirst: 'Jake',
    nameLast: 'Renzella'
  };
  user = requestHelper('POST', '/auth/register/v2', {}, person);

  const channelData = {
    name: 'COMP1531',
    isPublic: true,
  };

  tokenData = {
    token: user.token
  };
  channel = requestHelper('POST', '/channels/create/v2', tokenData, channelData);
});

afterAll(() => {
  requestHelper('DELETE', '/clear/v1', {}, null);
});

describe('HTTP - channelsListV2 Tests', () => {
  test('Testing valid input', () => {
    const person = {
      email: 'cc@unsw.edu.au',
      password: 'password',
      nameFirst: 'christine',
      nameLast: 'chu'
    };
    const user2 = requestHelper('POST', '/auth/register/v2', {}, person);

    const channelData = {
      name: 'COMP1521',
      isPublic: true,
    };

    const token2Data = {
      token: user2.token,
    };
    requestHelper('POST', '/channels/create/v2', token2Data, channelData);

    const channelsList = requestHelper('GET', '/channels/list/v2', tokenData, {});
    expect(channelsList).toStrictEqual({
      channels: [{
        channelId: channel.channelId,
        name: 'COMP1531',
      }]
    });
  });

  test('Testing invalid token', () => {
    tokenData.token = user.token + 'yay!';
    expect(requestHelper('GET', '/channels/list/v2', tokenData, {})).toStrictEqual(ERROR);
  });
});

describe('channelListAllV1 Tests', () => {
  test('Invalid token', () => {
    tokenData.token = user.token + 'yay!';
    expect(requestHelper('GET', '/channels/listall/v2', tokenData, {})).toStrictEqual(ERROR);
  });

  test('Basic functionality', () => {
    const channel2Data = {
      name: 'COMP2511',
      isPublic: true
    };

    const channel2 = requestHelper('POST', '/channels/create/v2', tokenData, channel2Data);

    expect(requestHelper('GET', '/channels/listall/v2', tokenData, {})).toStrictEqual({
      channels: [{
        channelId: channel.channelId,
        name: 'COMP1531'
      }, {
        channelId: channel2.channelId,
        name: 'COMP2511'
      }]
    });
  });

  test('Includes private with public channels', () => {
    const channel2Data = {
      name: 'COMP2511',
      isPublic: true
    };

    const channel2 = requestHelper('POST', '/channels/create/v2', tokenData, channel2Data);

    const channelPrivData = {
      name: 'COMP3311',
      isPublic: false
    };

    const channelPriv = requestHelper('POST', '/channels/create/v2', tokenData, channelPrivData);

    expect(requestHelper('GET', '/channels/listall/v2', tokenData, {})).toStrictEqual({
      channels: [{
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
    const outsideUserData = {
      email: 'yj@unsw.edu.au',
      password: 'PASSWORD',
      nameFirst: 'Yuchao',
      nameLast: 'Jiang'
    };

    const outsideUser = requestHelper('POST', '/auth/register/v2', {}, outsideUserData);

    const channel2Data = {
      name: 'COMP2511',
      isPublic: true
    };

    const channel2 = requestHelper('POST', '/channels/create/v2', tokenData, channel2Data);

    const channelPrivData = {
      name: 'COMP3311',
      isPublic: false
    };

    const channelPriv = requestHelper('POST', '/channels/create/v2', tokenData, channelPrivData);

    tokenData.token = outsideUser.token;

    expect(requestHelper('GET', '/channels/listall/v2', tokenData, {})).toStrictEqual({
      channels: [{
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

describe('HTTP - channelsCreateV2 Tests', () => {
  test('Testing valid token + name', () => {
    const param = {
      name: 'pewpewpew!',
      isPublic: true,
    };

    const channelId = requestHelper('POST', '/channels/create/v2', tokenData, param);
    expect(channelId).toStrictEqual({ channelId: expect.any(Number) });
  });

  test('Testing invalid token', () => {
    const param = {
      name: 'pewpewpew!',
      isPublic: true,
    };
    tokenData.token = user.token + 'yay';

    const channelId = requestHelper('POST', '/channels/create/v2', tokenData, param);
    expect(channelId).toStrictEqual(ERROR);
  });

  test('Testing 20+ name length', () => {
    const param = {
      name: 'verycoolchannelname1234567891011121314151617181920',
      isPublic: true,
    };

    const channelId = requestHelper('POST', '/channels/create/v2', tokenData, param);
    expect(channelId).toStrictEqual(ERROR);
  });

  test('Testing 0 name length', () => {
    const param = {
      token: user.token,
      name: '',
      isPublic: true,
    };

    const channelId = requestHelper('POST', '/channels/create/v2', tokenData, param);
    expect(channelId).toStrictEqual(ERROR);
  });
});
