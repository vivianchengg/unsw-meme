import { getData, setData, getHash } from './dataStore';
import validator from 'validator';
import HTTPError from 'http-errors';
import { isEmailFromUser, isHandleTaken } from './auth';
import request from 'sync-request';
import fs from 'fs';
import sharp from 'sharp';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;

/**
  * Finds the authUserId given a token, if invalid token, return null.
  *
  * @param {string} token
  * @returns {string} authUserId
*/
export const isValidToken = (token: string) => {
  const data = getData();
  const hashedToken = getHash(token);

  for (const user of data.users) {
    if (user.token.includes(hashedToken)) {
      return user.uId;
    }
  }
  return null;
};

/**
  * Checks if user is valid
  * @param {number} authUserId
  * @returns {boolean}
*/
export const isValidUser = (userId: number): boolean => {
  const data = getData();

  for (const user of data.users) {
    if (user.uId === userId) {
      return true;
    }
  }
  return false;
};

/**
  * Checks if name last and name first is valid length
  * @param {string} nameLast
  * ...
  * @returns {boolean}
*/
const invalidName = (name: string) => {
  const length = name.length;
  const min = 1;
  const max = 50;
  if (length < min || length > max) {
    return false;
  }
  return true;
};

/**
  * Checks if entered string is alphanumeric
  * @param {string} str
  * @returns {boolean}
 */
const isAlphanumeric = (str: string): boolean => {
  return /^[a-zA-Z0-9]+$/.test(str);
};

/**
  * Returns user information given a token and uId.
  *
  * @param {string} token
  * @param {number} uId
  * @returns {{
  *   uId: number,
  *   email: string,
  *   nameFirst: string,
  *   nameLast: string,
  *   handleStr: string,
  * }} user
*/
export const userProfileV1 = (token: string, uId: number) => {
  const data = getData();

  const authUserId = isValidToken(token);
  if (authUserId === null) {
    throw HTTPError(403, 'invalid token');
  }

  if (!isValidUser(uId)) {
    throw HTTPError(400, 'invalid uId');
  }

  let person;
  for (const user of data.users) {
    if (user.uId === uId) {
      person = {
        uId: user.uId,
        email: user.email,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
        handleStr: user.handleStr,
        profileImgUrl: user.profileImgUrl
      };
    }
  }

  return {
    user: person
  };
};

/**
  * Changes the first and last name of user
  *
  * @param {string} token
  * @param {string} nameFirst
  * @param {string} nameLast
  * @returns {}
*/
export const userProfileSetName = (token: string, nameFirst: string, nameLast: string) => {
  const data = getData();

  const authUserId = isValidToken(token);
  if (authUserId === null) {
    throw HTTPError(403, 'invalid token');
  }

  if (!invalidName(nameLast)) {
    throw HTTPError(400, 'name length +51 or less than 1');
  }
  if (!invalidName(nameFirst)) {
    throw HTTPError(400, 'name length +51 or less than 1');
  }

  const user = data.users.find(d => d.uId === authUserId);
  user.nameFirst = nameFirst;
  user.nameLast = nameLast;

  setData(data);
  return {};
};

/**
  * Updates authorised user's handle
  *
  * @param {string} token
  * @param {string} handleStr
  * @returns {}
  *
 */
export const userProfileSetHandleV1 = (token: string, handleStr: string) => {
  const data = getData();

  const userId = isValidToken(token);
  if (userId === null) {
    throw HTTPError(403, 'invalid token');
  }

  const minimumLength = 3;
  const maximumLength = 20;
  if (handleStr.length > maximumLength || handleStr.length < minimumLength) {
    throw HTTPError(400, 'Length of handleStr is not between 3-20 characters');
  }

  if (isHandleTaken(handleStr)) {
    throw HTTPError(400, 'Handle already taken by another user');
  }

  if (!isAlphanumeric(handleStr)) {
    throw HTTPError(400, 'Handle contains non-alphanumeric characters');
  }

  const user = data.users.find(u => u.uId === userId);

  user.handleStr = handleStr;
  setData(data);

  return {};
};

/**
  * Updates authorised user's email address
  *
  * @param {string} token
  * @param {string} email
  * @returns {}
  *
*/
export const userProfileSetEmailV1 = (token: string, email: string) => {
  const data = getData();

  const userId = isValidToken(token);
  if (userId === null) {
    throw HTTPError(403, 'invalid token');
  }

  if (!validator.isEmail(email)) {
    throw HTTPError(400, 'Invalid email entered');
  }

  if (isEmailFromUser(email)) {
    throw HTTPError(400, 'Email already taken by another user');
  }

  const user = data.users.find(u => u.uId === userId);

  user.email = email;
  setData(data);

  return {};
};

/**
  * List all the users in the data.
  *
  * @param {string} token
  * @returns {{
  *   uId: number,
  *   email: string,
  *   nameFirst: string,
  *   nameLast: string,
  *   handleStr: string,
  * }} user
*/
export const usersAllV1 = (token: string) => {
  const data = getData();

  if (isValidToken(token) === null) {
    throw HTTPError(403, 'invalid token');
  }

  const list = [];
  for (const user of data.users) {
    if (!user.isRemoved) {
      const detail = {
        uId: user.uId,
        email: user.email,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
        handleStr: user.handleStr,
        profileImgUrl: user.profileImgUrl
      };
      list.push(detail);
    }
  }

  return {
    users: list,
  };
};

/**
  * upload cropped profile pic
  * @param {string} token
  * @param {string} imgUrl
  * @param {number} xStart
  * @param {number} yStart
  * @param {number} xEnd
  * @param {number} yEnd
  * @returns {}
*/
export const userProfileUploadPhotoV1 = async (token: string, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number) => {
  const data = getData();
  const authUserId = isValidToken(token);
  if (authUserId === null) {
    throw HTTPError(403, 'invalid token');
  }
  const user = data.users.find(u => u.uId === authUserId);

  if (xEnd <= xStart || yEnd <= yStart) {
    throw HTTPError(400, 'end < start');
  }

  if (!validator.isURL(imgUrl)) {
    throw HTTPError(400, 'invalid url');
  }

  const res = request('GET', imgUrl);

  if (res.statusCode !== 200) {
    throw HTTPError(400, 'imgUrl returns HTTP status other than 200');
  }

  const body = res.getBody();

  try {
    const metadata = await sharp(body).metadata();
    if (metadata.format !== 'jpg' && metadata.format !== 'jpeg') {
      throw HTTPError(400, 'image uploaded is not a JPG');
    }
    const height = metadata.height;
    const width = metadata.width;

    if (xStart < 0 || yStart < 0 || xStart > width || yStart > height || xEnd > width || yEnd > height || xEnd < 0 || yEnd < 0) {
      throw HTTPError(400, 'not within dimensions');
    }

    fs.writeFileSync('./static/imgurl/image.jpg', body, { flag: 'w' });

    sharp('./static/imgurl/image.jpg').extract({ left: xStart, top: yStart, width: xEnd - xStart, height: yEnd - yStart }).toFile(`./static/imgurl/${authUserId}.jpg`);

    user.profileImgUrl = `${SERVER_URL}/imgurl/${authUserId}.jpg`;
    console.log(user.profileImgUrl);
    setData(data);
    return {};
  } catch (err) {
    console.error(err.message);
    throw err;
  }
};

export const userStatV1 = (token: string) => {
  const data = getData();
  const uId = isValidToken(token);
  if (uId === null) {
    throw HTTPError(403, 'invalid token');
  }
  const user = data.users.find(u => u.uId === uId);
  return {
    userStats: user.userStats
  };
};

export const usersStatV1 = (token: string) => {
  const data = getData();
  const uId = isValidToken(token);
  if (uId === null) {
    throw HTTPError(403, 'invalid token');
  }

  return {
    workspaceStats: data.workspaceStats
  };
};
