import request from 'sync-request';
import { port, url } from './config.json';
const ERROR = { error: expect.any(String) };
const SERVERurl = `${url}:${port}`;

const postRequest = (url: string, data: any) => {
  const res = request(
    'POST',
    SERVERurl + url,
    {
      json: data,
    }
  );
  const body = JSON.parse(res.getBody() as string);
  return body;
};

const deleteRequest = (url: string, data: any) => {
  const res = request(
    'DELETE',
    SERVERurl + url,
    {
      qs: data,
    }
  );
  const body = JSON.parse(res.getBody() as string);
  return body;
};

let user : any;
let channel : any;

beforeEach(() => {
  deleteRequest('/clear/v1', null);
  const param = {
    email: 'arialee@gmail.com',
    password: 'dynamite',
    nameFirst: 'aria',
    nameLast: 'lee'
  };
  user = postRequest('/auth/register/v2', param);
});

describe('HTTP tests using Jest for messageSendV1', () => {
  test('channelId does not refer to a valid channel', () => {
    const param1 = {
      token: user.token,
      name: 'holidays',
      isPublic: true
    };
    channel = postRequest('/channels/create/v2', param1);
    const param2 = {
      token: user.token,
      channelId: channel.channelId + 1,
      message: 'Heyyy, how is ur day going'
    };
    expect(postRequest('/message/send/v1', param2)).toStrictEqual(ERROR);
  });
  test('length of message is less than 1 characters', () => {
    const param1 = {
      token: user.token,
      name: 'holidays',
      isPublic: false
    };
    channel = postRequest('/channels/create/v2', param1);
    const param2 = {
      token: user.token,
      channelId: channel.channelId,
      message: ''
    };
    expect(postRequest('/message/send/v1', param2)).toStrictEqual(ERROR);
  });
  test('length of message is over 1000 characters', () => {
    const param1 = {
      token: user.token,
      name: 'holidays',
      isPublic: false
    };
    channel = postRequest('/channels/create/v2', param1);
    const param2 = {
      token: user.token,
      channelId: channel.channelId,
      message: 'Australia, officially the Commonwealth of Australia, is a sovereign country comprising the mainland of the Australian continent, the island of Tasmania, and numerous smaller islands. With an area of 7,617,930 square kilometres (2,941,300 sq mi), Australia is the largest country by area in Oceania and the worlds sixth-largest country. Australia is the oldest, flattest, and driest inhabited continent, with the least fertile soils. It is a megadiverse country, and its size gives it a wide variety of landscapes and climates, with deserts in the centre, tropical rainforests in the north-east, and mountain ranges in the south-east. The ancestors of Aboriginal Australians began arriving from south-east Asia approximately 65,000 years ago, during the last ice age. Arriving by sea, they settled the continent and had formed approximately 250 distinct language groups by the time of European settlement, maintaining some of the longest known continuing artistic and religious traditions in the world.'
    };
    expect(postRequest('/message/send/v1', param2)).toStrictEqual(ERROR);
  });
  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const param1 = {
      email: 'arialee@gmail.com',
      password: 'dynamite',
      nameFirst: 'aria',
      nameLast: 'lee'
    };
    const user2 = postRequest('/auth/register/v2', param1);
    const param2 = {
      token: user2.token,
      name: 'holidays',
      isPublic: true
    };
    channel = postRequest('/channels/create/v2', param2);
    const param3 = {
      token: user.token,
      channelId: channel.channelId,
      message: 'Heyyy, how is ur day going'
    };
    expect(postRequest('/message/send/v1', param3)).toStrictEqual(ERROR);
  });
  test('token is invalid', () => {
    const param1 = {
      token: user.token,
      name: 'holidays',
      isPublic: false
    };
    channel = postRequest('/channels/create/v2', param1);
    const param2 = {
      token: user.token + '1',
      channelId: channel.channelId,
      message: 'no thanks'
    };
    expect(postRequest('/message/send/v1', param2)).toStrictEqual(ERROR);
  });
  test('valid input and output', () => {
    const param1 = {
      token: user.token,
      name: 'holidays',
      isPublic: false
    };
    channel = postRequest('/channels/create/v2', param1);
    const param2 = {
      token: user.token,
      channelId: channel.channelId,
      message: 'no thanks'
    };
    expect(postRequest('/message/send/v1', param2)).toStrictEqual(expect.any(Number));
  });
});
