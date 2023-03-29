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

let user : any;
let channel : any;
let Message : any;

beforeEach(() => {
  deleteRequest('/clear/v1', null);
  const param1 = {
    email: 'arialee@gmail.com',
    password: 'dynamite',
    nameFirst: 'aria',
    nameLast: 'lee'
  };
  user = postRequest('/auth/register/v2', param1);
  const param2 = {
    token: user.token,
    name: 'holidays',
    isPublic: false
  };
  channel = postRequest('/channels/create/v2', param2);
  const param3 = {
    token: user.token,
    channeleId: channel.channelId,
    message: 'hello ellen'
  };
  Message = postRequest('/message/send/v1', param3);
});

describe('HTTP tests using Jest for messageRemove', () => {
  test('messageId does not refer to a valid message within a channel/DM that the authorised user has joined', () => {
    const param1 = {
      token: user.token,
      messageId: Message.messageId
    };
    expect(deleteRequest('/message/removev1', param1)).toStrictEqual(ERROR);
  });
  test('the message was not sent by the authorised user making this request and the user does not have owner permissions in the channel/DM', () => {
    const param1 = {
      email: 'arialee@gmail.com',
      password: 'dynamite',
      nameFirst: 'aria',
      nameLast: 'lee'
    };
    const user2 = postRequest('/auth/register/v2', param1);
    const param2 = {
      token: user2.token,
      messageId: Message.messageId
    };
    expect(deleteRequest('/message/removev1', param2)).toStrictEqual(ERROR);
  });
  test('token is invalid', () => {
    const param1 = {
      token: user.token + 'hi',
      messageId: Message.messageId
    };
    expect(deleteRequest('/message/removev1', param1)).toStrictEqual(ERROR);
  });
  test('valid input', () => {
    const param = {
      token: user.token,
      messageId: Message.messageId
    };
    expect(deleteRequest('/message/removev1', param)).toStrictEqual();
  });
});
