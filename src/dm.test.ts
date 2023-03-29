import request from 'sync-request';
import config from './config.json';

const ERROR = { error: expect.any(String) };
const port = config.port;
const url = config.url;
const SERVERurl = `${url}:${port}`;

const postRequest = (url: string, data: any) => {
  const res = request('POST', SERVERurl + url, { json: data });
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

let dm : any;
let user1 : any;
let user2 : any;
let user3 : any;

beforeEach(() => {
  deleteRequest('/clear/v1', null);
  const person1 = {
    email: 'bridgetcosta@gmail.com',
    password: 'daffodil',
    nameFirst: 'bridget',
    nameLast: 'costa'
  };
  user1 = postRequest('/auth/register/v2', person1);
  const person2 = {
    email: 'arialee@gmail.com',
    password: 'dynamite',
    nameFirst: 'aria',
    nameLast: 'lee'
  };
  user2 = postRequest('/auth/register/v2', person2);
  const person3 = {
    email: 'arialee@gmail.com',
    password: 'dynamite',
    nameFirst: 'aria',
    nameLast: 'lee'
  };
  user3 = postRequest('/auth/register/v2', person3);
  const uIds = [user2.uId, user3.uId];
  const param = {
    token: user1.token,
    uIds: uIds
  };
  dm = postRequest('/dm/create/v1', param);
});

describe('HTTP tests using Jest for dmMessagesV1', () => {
  test('dmId does not refer to a valid DM', () => {
    const param = {
      token: user1.token,
      dmId: dm.dmId + 1,
      start: 0
    };
    expect(getRequest('/dm/messages/v1', param).toStrictEqual(ERROR));
  });
  test('start is greater than the total number of messages in the channel', () => {
    const param = {
      token: user2.token,
      dmId: dm.dmId,
      start: 20
    };
    expect(getRequest('/dm/messages/v1', param)).toStrictEqual(ERROR);
  });
  test('dmId is valid and the authorised user is not a member of the DM', () => {
    const person = {
      email: 'kennyfarzie@gmail.com',
      password: 'lonis',
      nameFirst: 'kenny',
      nameLast: 'farzie'
    };
    const nonMember = postRequest('/auth/register/v2', person);
    const param2 = {
      token: nonMember.token,
      dmId: dm.dmId,
      start: 0
    };
    expect(getRequest('/dm/messages/v1', param2)).toStrictEqual(ERROR);
  });
  test('token is invalid', () => {
    const param = {
      token: user3.token + 1,
      dmId: dm.dmId,
      start: 0
    };
    expect(getRequest('/dm/messages/v1', param)).toStrictEqual(ERROR);
  });
  test('valid input', () => {
    const param = {
      token: user2.token,
      dmId: dm.dmId,
      start: 0
    };
    const expectedRet = {
      messages: {},
      start: 0,
      end: 50
    };
    expect(getRequest('/dm/messages/v1', param)).toStrictEqual(expectedRet);
  });
});
