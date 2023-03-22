
import request from 'sync-request';
import config from './config.json';

const ERROR = { error: expect.any(String) };
const port = config.port;
const url = config.url;
const SERVERurl = `${url}:${port}`;

const postRequest = (url: string, data: any) => {
  const res = request('POST', SERVERurl+ url, { json: data });
  const body = JSON.parse(String(res.getBody()));
  return body;
};

const deleteRequest = (url: string, data: any) => {
  const res = request('DELETE', SERVERurl + url, { qs: data });
  const body = JSON.parse(String(res.getBody()));
  return body;
};

const getRequest = (url: string, data: any) => {
  const res = request('GET', SERVERurl + url, { qs: data });
  const body = JSON.parse(String(res.getBody()));
  return body;
};

let user : any;
let channel : any;

beforeEach(() => {
  deleterequest('DELETE', SERVERurl + '/clear', { json: {} });
  const person = {
    email: 'bridgetcosta@gmail.com',
    password: 'daffodil',
    nameFirst: 'bridget',
    nameLast: 'costa'
  };
  const user = postRequest('/auth/register/v2', person);
});

describe('HTTP tests using Jest for channelJoinV2', () => {
  test('channelId does not refer to a valid channel', () => {
    const param1 = {
      token: user.token,
      name: 'holidays',
      isPublic: true
    }
    const channel = postRequest('/channel/create/v2', param1);
    const param2 = {
      token: channel.token,
      channelId = channel.channelId + 1; 
    }
    expect(postRequest('/channel/Join/v2', param2).toStrictEqual(ERROR));  
  });
  test('the authorised user is already a member of the channel', () => {
    const param1 = {
      token: user.token,
      name: 'games',
      isPublic: true
    }
    const channel = postRequest('/channel/create/v2', param1); 
    const param2 = {
      token: channel.token,
      channelId: channel.channelId
    }
    postRequest('/channel/join/v2', param2); 
    expect(postRequest('/channel/Join/v2', param2).toStrictEqual(ERROR)); 
  });

  test('channelId refers to a channel that is private, when the authorised user is not already a channel member and is not a global owner', () => {
    const param1 = {
      token: user.token, 
      name:'sports',
      isPublic: false
    }
    const channel = postRequest('/channel/create/v2', param1); 
    const param2 = {
      email: 'dianahazea@gmail.com',
      password: 'january',
      nameFirst: 'diana',
      nameLast: 'haze'
    }
    const user2 = postRequest('/auth/register/v2', param2); 
    const param3 = {
      token: user2.token, 
      channelId: channel.channelId
    }
    expect(postRequest('/channel/join/v2', param2).toStrictEqual(ERROR)); 
  });
  
  test('token is invalid', () => {
    const param1 = {
      token: user.token + 1, 
      channelId: channelId
    }
    expect(postRequest('/channel/join/v2', param1).toStrictEqual(ERROR)); 
  });

  test('test sucessful channelJoinV2', () => {
    const param1 = {
      token: user.token, 
      name: 'games',
      isPublic: true
    }
    const channel = (postRequest('/channels/create/v2', param1).toStrictEqual(ERROR)); 
    expect(postRequest('/channel/join/v2', param1).toStrictEqual(ERROR));
  });
});

describe('channelMessengesV2 function testing', () => {
  beforeEach(() => {
    clearV1();
    user = authRegisterV1('bridgetcosta@gmail.com', 'daffodil', 'bridget', 'costa');
  });

  test('channelId does not refer to a valid channel', () => {
    const channel = channelsCreateV1(user.authUserId, 'music', false);
    const res = request(
      'GET',
            `${url}:${port}/channelMessagesV2`,
            {
              qs: {
                token: user.token,
                channelId: channel.channelId + 1,
                start: 0
              }
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual(ERROR);
  });

  test('channelId does not refer to a valid channel', () => {
    const channel = channelsCreateV1(user.authUserId, 'music', false);
    const res = request(
      'GET',
            `${url}:${port}/channelMessagesV2`,
            {
              qs: {
                token: user.token,
                channelId: channel.channelId + 1,
                start: 0
              }
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual(ERROR);
  });

  test('start is greater than the total number of messages in the channe', () => {
    const channel = channelsCreateV1(user.authUserId, 'sports', false);
    const res = request(
      'GET',
            `${url}:${port}/channelMessagesV2`,
            {
              qs: {
                token: user.token,
                channelId: channel.channelId,
                start: 1
              }
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual(ERROR);
  });


  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const res = request(
      'GET',
            `${url}:${port}/channelMessagesV2`,
            {
              qs: {
                token: user1.token,
                channelId: channel.channelId,
                start: 0
              }
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual(ERROR);
  });

  test('token is invalid', () => {
    const channel = channelsCreateV1(user.authUserId, 'games', true);
    const res = request(
      'GET',
            `${url}:${port}/channelMessagesV2`,
            {
              qs: {
                token: user.token + 1,
                channelId: channel.channelId,
                start: 0
              }
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual(ERROR);
  });

  test('valid input', () => {
    const channel = channelsCreateV1(user.authUserId, 'music', true);
    const res = request(
      'GET',
            `${url}:${port}/channelMessagesV2`,
            {
              qs: {
                token: user.token,
                channelId: channel.channelId,
                start: 0
              }
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual(ERROR);
  });
});
