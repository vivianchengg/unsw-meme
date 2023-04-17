import { requestHelper } from './request';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
let user: any;

beforeEach(() => {
  requestHelper('DELETE', '/clear/v1', {}, {});
  const userData = {
    email: 'jr@unsw.edu.au',
    password: 'password',
    nameFirst: 'Jake',
    nameLast: 'Renzella'
  };
  user = requestHelper('POST', '/auth/register/v3', {}, userData);
});

afterAll(() => {
  requestHelper('DELETE', '/clear/v1', {}, {});
});

describe('userProfileSetHandleV1 tests', () => {
  test('Invalid token', () => {
    const param = {
      handleStr: 'theJAKErenzella'
    };

    const headerData = {
      token: user.token + 'buffer'
    };

    expect(requestHelper('PUT', '/user/profile/sethandle/v2', headerData, param)).toEqual(403);
  });

  test('New handle not between 3-20 characters', () => {
    const param = {
      handleStr: 'ohmygodILOVECOMP1531!!'
    };

    const headerData = {
      token: user.token
    };

    expect(requestHelper('PUT', '/user/profile/sethandle/v2', headerData, param)).toEqual(400);
  });

  test('New handle contains non-alphanumeric characters', () => {
    const param = {
      handleStr: 'やったCOMP1531が大好き!'
    };

    const headerData = {
      token: user.token
    };

    expect(requestHelper('PUT', '/user/profile/sethandle/v2', headerData, param)).toEqual(400);
  });

  test('New handle already taken', () => {
    const person2 = {
      email: 'yj@unsw.edu.au',
      password: 'PASSWORD',
      nameFirst: 'Yuchao',
      nameLast: 'Jiang'
    };

    const user2 = requestHelper('POST', '/auth/register/v3', {}, person2);

    const profileParam = {
      uId: user2.authUserId
    };

    const header1Data = {
      token: user2.token
    };

    const user2Profile = requestHelper('GET', '/user/profile/v3', header1Data, profileParam);

    const param = {
      handleStr: user2Profile.user.handleStr
    };

    const header2Data = {
      token: user.token
    };

    expect(requestHelper('PUT', '/user/profile/sethandle/v2', header2Data, param)).toEqual(400);
  });

  test('Basic functionality', () => {
    const param = {
      handleStr: 'theJAKErenzella'
    };

    const headerData = {
      token: user.token
    };

    requestHelper('PUT', '/user/profile/sethandle/v2', headerData, param);

    const userDetailData = {
      uId: user.authUserId
    };

    const header1Data = {
      token: user.token
    };

    const userDetail = requestHelper('GET', '/user/profile/v3', header1Data, userDetailData);
    expect(userDetail.user.handleStr).toStrictEqual('theJAKErenzella');
  });
});

describe('userProfileSetEmailV1 tests', () => {
  test('Invalid token', () => {
    const param = {
      email: 'jake23@unsw.edu.au'
    };

    const headerData = {
      token: user.token + 'buffer'
    };

    expect(requestHelper('PUT', '/user/profile/setemail/v2', headerData, param)).toEqual(403);
  });

  test('Invalid email', () => {
    const param = {
      email: 'buffer'
    };

    const headerData = {
      token: user.token
    };

    expect(requestHelper('PUT', '/user/profile/setemail/v2', headerData, param)).toEqual(400);
  });

  test('Email already taken', () => {
    const person2 = {
      email: 'yj@unsw.edu.au',
      password: 'PASSWORD',
      nameFirst: 'Yuchao',
      nameLast: 'Jiang'
    };

    const user2 = requestHelper('POST', '/auth/register/v3', {}, person2);

    const profileParam = {
      uId: user2.authUserId
    };

    const header1Data = {
      token: user2.token
    };

    const user2Profile = requestHelper('GET', '/user/profile/v3', header1Data, profileParam);

    const param = {
      email: user2Profile.user.email
    };

    const headerData = {
      token: user.token
    };

    expect(requestHelper('PUT', '/user/profile/setemail/v2', headerData, param)).toEqual(400);
  });

  test('Basic functionality', () => {
    const param = {
      email: 'JR@unsw.edu.au'
    };

    const headerData = {
      token: user.token,
    };

    requestHelper('PUT', '/user/profile/setemail/v2', headerData, param);

    const userDetailData = {
      uId: user.authUserId
    };

    const header1Data = {
      token: user.token
    };

    const userDetail = requestHelper('GET', '/user/profile/v3', header1Data, userDetailData);

    expect(userDetail.user.email).toStrictEqual('JR@unsw.edu.au');
  });
});

describe('HTTP - /user/profile/setname/v1', () => {
  test('Invalid token', () => {
    const param = {
      nameFirst: 'yum',
      nameLast: 'my'
    };

    const headerData = {
      token: user.token + '1'
    };

    expect(requestHelper('PUT', '/user/profile/setname/v2', headerData, param)).toEqual(403);
  });

  test('0 length first name', () => {
    const param = {
      nameFirst: '',
      nameLast: 'my'
    };

    const headerData = {
      token: user.token
    };

    expect(requestHelper('PUT', '/user/profile/setname/v2', headerData, param)).toEqual(400);
  });

  test('50+ length first name', () => {
    const param = {
      nameFirst: 'a'.repeat(51),
      nameLast: 'my'
    };

    const headerData = {
      token: user.token
    };

    expect(requestHelper('PUT', '/user/profile/setname/v2', headerData, param)).toEqual(400);
  });

  test('0 length last name', () => {
    const param = {
      nameFirst: 'yum',
      nameLast: ''
    };

    const headerData = {
      token: user.token
    };

    expect(requestHelper('PUT', '/user/profile/setname/v2', headerData, param)).toEqual(400);
  });

  test('50+ length lastname name', () => {
    const param = {
      nameFirst: 'yum',
      nameLast: 'a'.repeat(51),
    };

    const headerData = {
      token: user.token
    };

    expect(requestHelper('PUT', '/user/profile/setname/v2', headerData, param)).toEqual(400);
  });

  test('Valid input', () => {
    const param = {
      nameFirst: 'yum',
      nameLast: 'my',
    };

    const headerData = {
      token: user.token
    };

    requestHelper('PUT', '/user/profile/setname/v2', headerData, param);

    const userDetailData = {
      uId: user.authUserId
    };

    const header1Data = {
      token: user.token
    };

    const userDetail = requestHelper('GET', '/user/profile/v3', header1Data, userDetailData);
    expect(userDetail.user.nameFirst).toStrictEqual('yum');
    expect(userDetail.user.nameLast).toStrictEqual('my');
  });
});

describe('HTTP - /users/all/v1', () => {
  test('Invalid Token', () => {
    const param = {
      token: user.token + 'lol',
    };
    expect(requestHelper('GET', '/users/all/v2', param, {})).toEqual(403);
  });

  test('Valid Token', () => {
    const person = {
      email: 'abc@unsw.edu.au',
      password: 'password',
      nameFirst: 'abby',
      nameLast: 'boo',
    };
    const user3 = requestHelper('POST', '/auth/register/v3', {}, person);

    const param = {
      token: user3.token,
    };

    expect(requestHelper('GET', '/users/all/v2', param, {})).toStrictEqual({
      users: [
        {
          uId: user.authUserId,
          email: 'jr@unsw.edu.au',
          nameFirst: 'Jake',
          nameLast: 'Renzella',
          handleStr: 'jakerenzella',
          profileImgUrl: null
        }, {
          uId: user3.authUserId,
          email: 'abc@unsw.edu.au',
          nameFirst: 'abby',
          nameLast: 'boo',
          handleStr: 'abbyboo',
          profileImgUrl: null
        }]
    });
  });
});

describe('userProfileV2 tests', () => {
  test('Testing valid token + uId', () => {
    const userDetailData = {
      uId: user.authUserId
    };

    const header1Data = {
      token: user.token
    };

    const userDetail = requestHelper('GET', '/user/profile/v3', header1Data, userDetailData);
    expect(userDetail).toStrictEqual({
      user: {
        uId: user.authUserId,
        email: 'jr@unsw.edu.au',
        nameFirst: 'Jake',
        nameLast: 'Renzella',
        handleStr: 'jakerenzella',
        profileImgUrl: null
      }
    });
  });

  test('Testing invalid token', () => {
    const userDetailData = {
      uId: user.authUserId
    };

    const header1Data = {
      token: user.token + 'yay'
    };

    const userDetail = requestHelper('GET', '/user/profile/v3', header1Data, userDetailData);
    expect(userDetail).toEqual(403);
  });

  test('Testing invalid uId', () => {
    const userDetailData = {
      uId: user.authUserId + 189
    };

    const header1Data = {
      token: user.token
    };

    const userDetail = requestHelper('GET', '/user/profile/v3', header1Data, userDetailData);
    expect(userDetail).toEqual(400);
  });
});

describe('HTML - user/profile/uploadphoto/v1 tests', () => {
  test('imgUrl returns an HTTP status other than 200, or any other errors occur when attempting to retrieve the image', () => {
    const param = {
      imgUrl: 'http:/what-is-this',
      xStart: 2,
      yStart: 2,
      xEnd: 4,
      yEnd: 4
    };
    const headerData = {
      token: user.token
    };
    expect(requestHelper('POST', '/user/profile/uploadphoto/v1', headerData, param)).toStrictEqual(400);

    const param1 = {
      imgUrl: 'http://cdn.britannica.com/62/99062-050-C3752373/Turtles',
      xStart: 2,
      yStart: 2,
      xEnd: 4,
      yEnd: 4
    };
    const header1Data = {
      token: user.token
    };
    expect(requestHelper('POST', '/user/profile/uploadphoto/v1', header1Data, param1)).toStrictEqual(400);
  });

  test('any of xStart, yStart, xEnd, yEnd are not within the dimensions of the image at the URL : xStart or yStart less than 0', () => {
    const param = {
      imgUrl: 'http://cdn.britannica.com/62/99062-050-C3752373/Turtles.jpg',
      xStart: -40,
      yStart: 2,
      xEnd: 4,
      yEnd: 9
    };
    const headerData = {
      token: user.token
    };
    expect(requestHelper('POST', '/user/profile/uploadphoto/v1', headerData, param)).toStrictEqual(400);

    const param2 = {
      imgUrl: 'http://cdn.britannica.com/62/99062-050-C3752373/Turtles.jpg',
      xStart: 1,
      yStart: -243,
      xEnd: 4,
      yEnd: 9
    };

    expect(requestHelper('POST', '/user/profile/uploadphoto/v1', headerData, param2)).toStrictEqual(400);
  });

  test('any of xStart, yStart, xEnd, yEnd are not within the dimensions of the image at the URL: xStart is greater than width, or yStart is greater than height', () => {
    const param = {
      imgUrl: 'http://cdn.britannica.com/62/99062-050-C3752373/Turtles.jpg',
      xStart: 1620,
      yStart: 2,
      xEnd: 1630,
      yEnd: 9
    };
    const headerData = {
      token: user.token
    };
    expect(requestHelper('POST', '/user/profile/uploadphoto/v1', headerData, param)).toStrictEqual(400);

    const param2 = {
      imgUrl: 'http://cdn.britannica.com/62/99062-050-C3752373/Turtles.jpg',
      xStart: 1,
      yStart: 870,
      xEnd: 4,
      yEnd: 880
    };

    expect(requestHelper('POST', '/user/profile/uploadphoto/v1', headerData, param2)).toStrictEqual(400);
  });

  test('xEnd is less than or equal to xStart', () => {
    const param = {
      imgUrl: 'http://cdn.britannica.com/62/99062-050-C3752373/Turtles.jpg',
      xStart: 8,
      yStart: 2,
      xEnd: 4,
      yEnd: 9
    };
    const headerData = {
      token: user.token
    };
    expect(requestHelper('POST', '/user/profile/uploadphoto/v1', headerData, param)).toStrictEqual(400);
  });

  test('yEnd is less than or equal to yStart', () => {
    const param = {
      imgUrl: 'http://cdn.britannica.com/62/99062-050-C3752373/Turtles.jpg',
      xStart: 2,
      yStart: 9,
      xEnd: 4,
      yEnd: 2
    };
    const headerData = {
      token: user.token
    };
    expect(requestHelper('POST', '/user/profile/uploadphoto/v1', headerData, param)).toStrictEqual(400);
  });

  test('image uploaded is not a JPG', () => {
    const param = {
      imgUrl: 'http://www.jakerenzella.com/static/f3f0f6b37152e744baf502d4c2181164/4c27b/jake-photo.webp',
      xStart: 1,
      yStart: 2,
      xEnd: 4,
      yEnd: 9
    };
    const headerData = {
      token: user.token
    };
    expect(requestHelper('POST', '/user/profile/uploadphoto/v1', headerData, param)).toStrictEqual(400);
  });

  test('invalid token', () => {
    const param = {
      imgUrl: 'http://cdn.britannica.com/62/99062-050-C3752373/Turtles.jpg',
      xStart: 1,
      yStart: 20,
      xEnd: 1000,
      yEnd: 200
    };
    const headerData = {
      token: user.token + 'yay'
    };
    expect(requestHelper('POST', '/user/profile/uploadphoto/v1', headerData, param)).toStrictEqual(403);
  });

  test('valid input', () => {
    const param = {
      imgUrl: 'http://cdn.britannica.com/62/99062-050-C3752373/Turtles.jpg',
      xStart: 1,
      yStart: 20,
      xEnd: 1000,
      yEnd: 200
    };
    const headerData = {
      token: user.token
    };
    requestHelper('POST', '/user/profile/uploadphoto/v1', headerData, param);

    const profileParam = {
      uId: user.authUserId
    };

    const header1Data = {
      token: user.token
    };

    const userProfile = requestHelper('GET', '/user/profile/v3', header1Data, profileParam);

    expect(userProfile.user.profileImgUrl).toEqual(`${SERVER_URL}/imgurl/${user.authUserId}.jpg`);
  });
});
