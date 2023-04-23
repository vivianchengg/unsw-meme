import { requestHelper } from './request';
import { getData } from './dataStore';

const sleep = (s: number) => {
  return new Promise(resolve => setTimeout(resolve, s * 1000));
}

beforeEach(() => {
  requestHelper('DELETE', '/clear/v1', {}, {});
});

afterAll(() => {
  requestHelper('DELETE', '/clear/v1', {}, {});
});

describe('test stat', () => {
  test('invalid token', () => {
    const regData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };

    const user = requestHelper('POST', '/auth/register/v3', {}, regData);

    const reg1Data = {
      email: 'vc1@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };

    const user1 = requestHelper('POST', '/auth/register/v3', {}, reg1Data);

    const tokenData = {
      token: user.token
    };

    const token1Data = {
      token: user1.token
    };

    const param = {
      uId: user1.authUserId
    };

    requestHelper('DELETE', '/admin/user/remove/v1', tokenData, param);

    expect(requestHelper('GET', '/user/stats/v1', token1Data, {})).toEqual(403);
    expect(requestHelper('GET', '/users/stats/v1', token1Data, {})).toEqual(403);
  });

  test('test authReg', () => {
    const regData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };

    const user = requestHelper('POST', '/auth/register/v3', {}, regData);

    const tokenData = {
      token: user.token
    };

    const userStat = requestHelper('GET', '/user/stats/v1', tokenData, {});
    expect(userStat.userStats.channelsJoined.length).toStrictEqual(1);
    expect(userStat.userStats.dmsJoined.length).toStrictEqual(1);
    expect(userStat.userStats.messagesSent.length).toStrictEqual(1);
    expect(userStat.userStats.involvementRate).toStrictEqual(0);
  });

  test('test channel', () => {
    const regData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const user = requestHelper('POST', '/auth/register/v3', {}, regData);

    const tokenData = {
      token: user.token
    };

    const reg1Data = {
      email: 'vc1@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };

    const user1 = requestHelper('POST', '/auth/register/v3', {}, reg1Data);

    const token1Data = {
      token: user1.token
    };

    // channel create
    const channelData = {
      name: 'COMP1531',
      isPublic: true
    };
    const channel = requestHelper('POST', '/channels/create/v3', tokenData, channelData);
    let userStat = requestHelper('GET', '/user/stats/v1', tokenData, {});
    expect(userStat.userStats.channelsJoined.length).toStrictEqual(2);
    let usersStat = requestHelper('GET', '/users/stats/v1', tokenData, {});
    expect(usersStat.workspaceStats.channelsExist.length).toStrictEqual(2);

    // channel invite
    const inviteData = {
      channelId: channel.channelId,
      uId: user1.authUserId
    };
    requestHelper('POST', '/channel/invite/v3', tokenData, inviteData);
    expect(userStat.userStats.channelsJoined.length).toStrictEqual(2);
    userStat = requestHelper('GET', '/user/stats/v1', token1Data, {});
    expect(userStat.userStats.channelsJoined.length).toStrictEqual(2);
    expect(userStat.userStats.channelsJoined[1].numChannelsJoined).toStrictEqual(1);

    // channel leave
    const leaveData = {
      channelId: channel.channelId
    };
    requestHelper('POST', '/channel/leave/v2', token1Data, leaveData);
    userStat = requestHelper('GET', '/user/stats/v1', token1Data, {});
    expect(userStat.userStats.channelsJoined.length).toStrictEqual(3);
    expect(userStat.userStats.channelsJoined[2].numChannelsJoined).toStrictEqual(0);

    // channel Join
    const joinData = {
      channelId: channel.channelId
    };
    requestHelper('POST', '/channel/join/v3', token1Data, joinData);
    userStat = requestHelper('GET', '/user/stats/v1', token1Data, {});
    expect(userStat.userStats.channelsJoined.length).toStrictEqual(4);
    expect(userStat.userStats.channelsJoined[3].numChannelsJoined).toStrictEqual(1);
    usersStat = requestHelper('GET', '/users/stats/v1', token1Data, {});
    expect(usersStat.workspaceStats.utilizationRate).toStrictEqual(1);

    // channel2 create
    const channel2Data = {
      name: 'COMP2511',
      isPublic: true
    };
    requestHelper('POST', '/channels/create/v3', token1Data, channel2Data);
    userStat = requestHelper('GET', '/user/stats/v1', token1Data, {});
    expect(userStat.userStats.channelsJoined.length).toStrictEqual(5);
    expect(userStat.userStats.channelsJoined[4].numChannelsJoined).toStrictEqual(2);
  });

  test('test dm', () => {
    const regData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const user = requestHelper('POST', '/auth/register/v3', {}, regData);

    const tokenData = {
      token: user.token
    };

    const reg1Data = {
      email: 'vc1@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };

    const user1 = requestHelper('POST', '/auth/register/v3', {}, reg1Data);

    const token1Data = {
      token: user1.token
    };

    // dm create
    const dm1Data = {
      uIds: [user1.authUserId]
    };

    // check dm owner + member
    let userStat = requestHelper('GET', '/user/stats/v1', tokenData, {});
    expect(userStat.userStats.dmsJoined.length).toStrictEqual(1);
    expect(userStat.userStats.dmsJoined[0].numDmsJoined).toStrictEqual(0);

    userStat = requestHelper('GET', '/user/stats/v1', token1Data, {});
    expect(userStat.userStats.dmsJoined.length).toStrictEqual(1);
    expect(userStat.userStats.dmsJoined[0].numDmsJoined).toStrictEqual(0);

    let dm1 = requestHelper('POST', '/dm/create/v2', tokenData, dm1Data);
    userStat = requestHelper('GET', '/user/stats/v1', tokenData, {});
    expect(userStat.userStats.dmsJoined.length).toStrictEqual(2);
    expect(userStat.userStats.dmsJoined[1].numDmsJoined).toStrictEqual(1);
    let usersStat = requestHelper('GET', '/users/stats/v1', tokenData, {});
    expect(usersStat.workspaceStats.dmsExist.length).toStrictEqual(2);

    userStat = requestHelper('GET', '/user/stats/v1', token1Data, {});
    expect(userStat.userStats.dmsJoined.length).toStrictEqual(2);
    expect(userStat.userStats.dmsJoined[1].numDmsJoined).toStrictEqual(1);
    
    // dm leave
    const leaveDetail = {
      dmId: dm1.dmId,
    };
    requestHelper('POST', '/dm/leave/v2', token1Data, leaveDetail);
    userStat = requestHelper('GET', '/user/stats/v1', token1Data, {});
    expect(userStat.userStats.dmsJoined.length).toStrictEqual(3);
    expect(userStat.userStats.dmsJoined[2].numDmsJoined).toStrictEqual(0);
    usersStat = requestHelper('GET', '/users/stats/v1', tokenData, {});
    expect(usersStat.workspaceStats.utilizationRate).toStrictEqual(1/2);
    
    // dm remove 
    const dmRemoveData = {
      dmId: dm1.dmId
    };
    requestHelper('DELETE', '/dm/remove/v2', tokenData, dmRemoveData);
    userStat = requestHelper('GET', '/user/stats/v1', tokenData, {});
    expect(userStat.userStats.dmsJoined.length).toStrictEqual(3);
    expect(userStat.userStats.dmsJoined[2].numDmsJoined).toStrictEqual(0);
    userStat = requestHelper('GET', '/user/stats/v1', token1Data, {});
    expect(userStat.userStats.dmsJoined.length).toStrictEqual(3);
    expect(userStat.userStats.dmsJoined[2].numDmsJoined).toStrictEqual(0);
    usersStat = requestHelper('GET', '/users/stats/v1', tokenData, {});
    expect(usersStat.workspaceStats.dmsExist.length).toStrictEqual(3);

    dm1 = requestHelper('POST', '/dm/create/v2', tokenData, dm1Data);
    usersStat = requestHelper('GET', '/users/stats/v1', tokenData, {});
    expect(usersStat.workspaceStats.dmsExist.length).toStrictEqual(4);
    userStat = requestHelper('GET', '/user/stats/v1', tokenData, {});
    expect(userStat.userStats.dmsJoined.length).toStrictEqual(4);
    expect(userStat.userStats.dmsJoined[3].numDmsJoined).toStrictEqual(1);

    const dmMsgData = {
      dmId: dm1.dmId,
      message: 'hi'
    }

    requestHelper('POST', '/message/senddm/v2', tokenData, dmMsgData);

  });

  test('test msg', () => {
    const regData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };

    const user = requestHelper('POST', '/auth/register/v3', {}, regData);

    const reg1Data = {
      email: 'vc1@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };

    const user1 = requestHelper('POST', '/auth/register/v3', {}, reg1Data);

    const tokenData = {
      token: user.token
    };

    const token1Data = {
      token: user1.token
    };

    const channelData = {
      name: 'COMP1531',
      isPublic: true
    };
    const channel = requestHelper('POST', '/channels/create/v3', tokenData, channelData);

    const joinData = {
      channelId: channel.channelId
    };
    requestHelper('POST', '/channel/join/v3', token1Data, joinData);

    const messageData = {
      channelId: channel.channelId,
      message: 'hello ellen'
    };
    let message = requestHelper('POST', '/message/send/v2', tokenData, messageData);

    let userStat = requestHelper('GET', '/user/stats/v1', tokenData, {});
    expect(userStat.userStats.messagesSent.length).toStrictEqual(2);
    expect(userStat.userStats.messagesSent[1].numMessagesSent).toStrictEqual(1);
    let usersStat = requestHelper('GET', '/users/stats/v1', tokenData, {});
    expect(usersStat.workspaceStats.messagesExist.length).toStrictEqual(2);
    expect(usersStat.workspaceStats.messagesExist[1].numMessagesExist).toStrictEqual(1);


    // msg remove
    const msgRemoveData = {
      messageId: message.messageId
    };
    requestHelper('DELETE', '/message/remove/v2', tokenData, msgRemoveData);
    userStat = requestHelper('GET', '/user/stats/v1', tokenData, {});
    expect(userStat.userStats.messagesSent.length).toStrictEqual(3);
    expect(userStat.userStats.messagesSent[2].numMessagesSent).toStrictEqual(0);
    usersStat = requestHelper('GET', '/users/stats/v1', tokenData, {});
    expect(usersStat.workspaceStats.messagesExist.length).toStrictEqual(3);
    expect(usersStat.workspaceStats.messagesExist[2].numMessagesExist).toStrictEqual(0);

    message = requestHelper('POST', '/message/send/v2', tokenData, messageData);

    const edit1Data = {
      messageId: message.messageId,
      message: ''
    }
    requestHelper('PUT', '/message/edit/v2', tokenData, edit1Data);

    userStat = requestHelper('GET', '/user/stats/v1', tokenData, {});
    expect(userStat.userStats.messagesSent.length).toStrictEqual(5);
    expect(userStat.userStats.messagesSent[4].numMessagesSent).toStrictEqual(0);
    usersStat = requestHelper('GET', '/users/stats/v1', tokenData, {});
    expect(usersStat.workspaceStats.messagesExist.length).toStrictEqual(5);
    expect(usersStat.workspaceStats.messagesExist[4].numMessagesExist).toStrictEqual(0);

    message = requestHelper('POST', '/message/send/v2', tokenData, messageData);
    const edit2Data = {
      messageId: message.messageId,
      message: 'hi'
    }
    requestHelper('PUT', '/message/edit/v2', tokenData, edit2Data);

    userStat = requestHelper('GET', '/user/stats/v1', tokenData, {});
    expect(userStat.userStats.messagesSent.length).toStrictEqual(6);
    expect(userStat.userStats.messagesSent[5].numMessagesSent).toStrictEqual(1);
    usersStat = requestHelper('GET', '/users/stats/v1', tokenData, {});
    expect(usersStat.workspaceStats.messagesExist.length).toStrictEqual(6);
    expect(usersStat.workspaceStats.messagesExist[5].numMessagesExist).toStrictEqual(1);
  });
});
