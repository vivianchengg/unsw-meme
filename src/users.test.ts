import request from 'sync-request';
import config from './config.json';

const port = config.port;
const url = config.url;

const ERROR = { error: expect.any(String) };
const SERVER_URL = `${url}:${port}`;

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

let user: any;
let user3: any;

beforeEach(() => {
  deleteRequest('/clear/v1', null);
  let person = {
    email: 'jr@unsw.edu.au',
    password: 'password',
    nameFirst: 'Jake',
    nameLast: 'Renzella'
  };
  user = postRequest('/auth/register/v2', person);

  person = {
    email: 'abc@unsw.edu.au',
    password: 'password',
    nameFirst: 'abby',
    nameLast: 'boo',
  };
  user3 = postRequest('/auth/register/v2', person);
});

describe('userProfileSetHandleV1 tests', () => {
  test('Invalid token', () => {
    const param = {
      token: user.token + 'buffer',
      handleStr: 'theJAKErenzella'
    };

    expect(putRequest('/user/profile/sethandle/v1', param)).toStrictEqual(ERROR);
  });

  test('New handle not between 3-20 characters', () => {
    const param = {
      token: user.token,
      handleStr: 'ohmygodILOVECOMP1531!!'
    };

    expect(putRequest('/user/profile/sethandle/v1', param)).toStrictEqual(ERROR);
  });

  test('New handle contains non-alphanumeric characters', () => {
    const param = {
      token: user.token,
      handleStr: 'やったCOMP1531が大好き!'
    };

    expect(putRequest('/user/profile/sethandle/v1', param)).toStrictEqual(ERROR);
  });

  test('New handle already taken', () => {
    const person2 = {
      email: 'yj@unsw.edu.au',
      password: 'PASSWORD',
      nameFirst: 'Yuchao',
      nameLast: 'Jiang'
    };

    const user2 = postRequest('/auth/register/v2', person2);

    const profileParam = {
      token: user2.token,
      uId: user2.authUserId
    };

    const user2Profile = getRequest('/user/profile/v2', profileParam);

    const param = {
      token: user.token,
      handleStr: user2Profile.user.handleStr
    };

    expect(putRequest('/user/profile/sethandle/v1', param)).toStrictEqual(ERROR);
  });

  test('Basic functionality', () => {
    const param = {
      token: user.token,
      handleStr: 'theJAKErenzella'
    };

    expect(putRequest('/user/profile/sethandle/v1', param)).toStrictEqual({});
  });
});

describe('userProfileSetEmailV1 tests', () => {
  test('Invalid token', () => {
    const param = {
      token: user.token + 'buffer',
      email: 'jake23@unsw.edu.au'
    };

    expect(putRequest('/user/profile/setemail/v1', param)).toStrictEqual(ERROR);
  });

  test('Invalid email', () => {
    const param = {
      token: user.token,
      email: 'buffer'
    };

    expect(putRequest('/user/profile/setemail/v1', param)).toStrictEqual(ERROR);
  });

  test('Email already taken', () => {
    const person2 = {
      email: 'yj@unsw.edu.au',
      password: 'PASSWORD',
      nameFirst: 'Yuchao',
      nameLast: 'Jiang'
    };

    const user2 = postRequest('/auth/register/v2', person2);

    const profileParam = {
      token: user2.token,
      uId: user2.authUserId
    };

    const user2Profile = getRequest('/user/profile/v2', profileParam);

    const param = {
      token: user.token,
      email: user2Profile.user.email
    };

    expect(putRequest('/user/profile/setemail/v1', param)).toStrictEqual(ERROR);
  });

  test('Basic functionality', () => {
    const param = {
      token: user.token,
      email: 'JR@unsw.edu.au'
    };

    expect(putRequest('/user/profile/setemail/v1', param)).toStrictEqual({});
  });
});

describe('HTTP - /user/profile/setname/v1', () => {
  test('Invalid token', () => {
    const param = {
      token: user.token + '1',
      nameFirst: 'yum',
      nameLast: 'my',
    };
    expect(putRequest('/user/profile/setname/v1', param)).toStrictEqual(ERROR);
  });

  test('0 length first name', () => {
    const param = {
      token: user.token,
      nameFirst: '',
      nameLast: 'my',
    };
    expect(putRequest('/user/profile/setname/v1', param)).toStrictEqual(ERROR);
  });

  test('50 length first name', () => {
    const param = {
      token: user.token,
      nameFirst: 'vVxXHvdFIFaYGy6YiWUXN8ub6QM47q9xR6mZ7JtA8jdutYtuZIlol',
      nameLast: 'my',
    };
    expect(putRequest('/user/profile/setname/v1', param)).toStrictEqual(ERROR);
  });

  test('0 length last name', () => {
    const param = {
      token: user.token,
      nameFirst: 'yum',
      nameLast: '',
    };
    expect(putRequest('/user/profile/setname/v1', param)).toStrictEqual(ERROR);
  });

  test('50 length lastname name', () => {
    const param = {
      token: user.token,
      nameFirst: 'yum',
      nameLast: 'vVxXHvdFIFaYGy6YiWUXN8ub6QM47q9xR6mZ7JtA8jdutYtuZIlol',
    };
    expect(putRequest('/user/profile/setname/v1', param)).toStrictEqual(ERROR);
  });

  test('Valid input', () => {
    const param = {
      token: user.token,
      nameFirst: 'yum',
      nameLast: 'my',
    };
    putRequest('/user/profile/setname/v1', param);

    const newparam = {
      token: user.token,
      uId: user.authUserId,
    };
    const details = getRequest('/user/profile/v2', newparam);
    expect(details).toStrictEqual({
      user: {
        uId: user.authUserId,
        email: 'jr@unsw.edu.au',
        nameFirst: 'yum',
        nameLast: 'my',
        handleStr: 'jakerenzella',
      }
    });
  });
});

describe('HTTP - /users/all/v1', () => {
  test('Invalid Token', () => {
    const param = {
      token: user.token + 'lol',
    };
    expect(getRequest('/users/all/v1', param)).toStrictEqual(ERROR);
  });

  test('Valid Token', () => {
    const param = {
      token: user3.token,
    };
    expect(getRequest('/users/all/v1', param)).toStrictEqual({
      users: [
        {
          uId: user.authUserId,
          email: 'jr@unsw.edu.au',
          nameFirst: 'Jake',
          nameLast: 'Renzella',
          handleStr: 'jakerenzella'
        }, {
          uId: user3.authUserId,
          email: 'abc@unsw.edu.au',
          nameFirst: 'abby',
          nameLast: 'boo',
          handleStr: 'abbyboo'
        }]
    });
  });
});

describe('userProfileV2 tests', () => {
  test('Testing valid token + uId', () => {
    const param = {
      token: user.token,
      uId: user.authUserId,
    };
    const profile = getRequest('/user/profile/v2', param);

    expect(profile).toStrictEqual({
      user: {
        uId: user.authUserId,
        email: 'jr@unsw.edu.au',
        nameFirst: 'Jake',
        nameLast: 'Renzella',
        handleStr: 'jakerenzella',
      }
    });
  });

  test('Testing invalid token', () => {
    const param = {
      token: user.token + '1',
      uId: user.authUserId,
    };
    const profile = getRequest('/user/profile/v2', param);
    expect(profile).toStrictEqual(ERROR);
  });

  test('Testing invalid uId', () => {
    const param = {
      token: user.token,
      uId: user.authUserId + 1,
    };
    const profile = getRequest('/user/profile/v2', param);
    expect(profile).toStrictEqual(ERROR);
  });
});
