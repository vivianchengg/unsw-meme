import request from 'sync-request';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const ERROR = { error: expect.any(String) };

const getRequest = (url: string, data: any) => {
  const res = request(
    'GET',
    SERVER_URL + url,
    {
      qs: data,
    }
  );
  const body = JSON.parse(res.getBody() as string);
  return body;
};

const postRequest = (url: string, data: any) => {
  const res = request(
    'POST',
    SERVER_URL + url,
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
    SERVER_URL + url,
    {
      qs: data,
    }
  );
  const body = JSON.parse(res.getBody() as string);
  return body;
};

const putRequest = (url: string, data: any) => {
  const res = request(
    'PUT',
    SERVER_URL + url,
    {
      json: data,
    }
  );
  const body = JSON.parse(res.getBody() as string);
  return body;
};

let user: any;
beforeEach(() => {
  deleteRequest('/clear/v1', {});
  const person = {
    email: 'jr@unsw.edu.au',
    password: 'password',
    nameFirst: 'Jake',
    nameLast: 'Renzella'
  };
  user = postRequest('/auth/register/v2', person);
});

describe('HTTP - /user/profile/setname/v1', () => {
  test('Invalid token', () => {
    const param = {
      token: user.token[0] - 1,
      nameFirst: 'yum',
      nameLast: 'my',
    };
    expect(putRequest('/user/profile/setname/v1', param)).toStrictEqual(ERROR);
  });

  test('0 length first name', () => {
    const param = {
      token: user.token[0],
      nameFirst: '',
      nameLast: 'my',
    };
    expect(putRequest('/user/profile/setname/v1', param)).toStrictEqual(ERROR);
  });

  test('50 length first name', () => {
    const param = {
      token: user.token[0],
      nameFirst: 'vVxXHvdFIFaYGy6YiWUXN8ub6QM47q9xR6mZ7JtA8jdutYtuZIlol',
      nameLast: 'my',
    };
    expect(putRequest('/user/profile/setname/v1', param)).toStrictEqual(ERROR);
  });

  test('0 length last name', () => {
    const param = {
      token: user.token[0],
      nameFirst: 'yum',
      nameLast: '',
    };
    expect(putRequest('/user/profile/setname/v1', param)).toStrictEqual(ERROR);
  });

  test('50 length lastname name', () => {
    const param = {
      token: user.token[0],
      nameFirst: 'yum',
      nameLast: 'vVxXHvdFIFaYGy6YiWUXN8ub6QM47q9xR6mZ7JtA8jdutYtuZIlol',
    };
    expect(putRequest('/user/profile/setname/v1', param)).toStrictEqual(ERROR);
  });

  test('Valid input', () => {
    const param = {
      token: user.token[0],
      nameFirst: 'yum',
      nameLast: 'my',
    };
    putRequest('/user/profile/setname/v1', param);

    const newparam = {
      token: user.token[0],
      uId: user.authUserId,
    };
    const details = getRequest('/user/profile/v2', newparam);
    expect(details).toStrictEqual({
      user: {
        uId: details.uId,
        email: details.email,
        nameFirst: details.nameFirst,
        nameLast: details.nameLast,
        handleStr: details.handleStr,
      }
    });
  });
});
