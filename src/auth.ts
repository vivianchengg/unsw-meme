import { getData, setData } from './dataStore';
import { isValidToken } from './users';
import validator from 'validator';

/**
  * check whether email entered belong to a user
  *
  * @param {string} email
  * @returns {boolean}
*/
const isEmailFromUser = (email: string): boolean => {
  const data = getData();

  const user = data.users.find(person => person.email === email);
  if (user === undefined) {
    return false;
  }
  return true;
};

/**
  * check if handle is taken
  *
  * @param {string} handle
  * @returns {boolean}
*/
const isHandleTaken = (handle: string): boolean => {
  const data = getData();
  const user = data.users.find(person => person.handleStr === handle);
  if (user === undefined) {
    return false;
  }
  return true;
};

/**
  * get new unique handle
  *
  * @param {string} nameFirst
  * @param {string} nameLast
  * @returns {string}
*/
const newHandle = (nameFirst: string, nameLast: string): string => {
  let handle = '';

  let first = nameFirst.toLowerCase();
  first = first.replace(/[^a-z0-9]/g, '');

  let last = nameLast.toLowerCase();
  last = last.replace(/[^a-z0-9]/g, '');

  handle += first;
  handle += last;

  const len = 20;
  handle = handle.length > len ? handle.substring(0, len) : handle;

  let num = 0;
  let handleStr = handle;
  while (isHandleTaken(handleStr)) {
    const addNum = num.toString();
    handleStr = handle + addNum;
    num++;
  }

  return handleStr;
};

/**
  * get new id
  *
  * @param {}
  * @returns {number}
*/
const getNewId = (): number => {
  const data = getData();
  const id = (data.users.length + 1) * 10;
  return id;
};

/**
  * get new token
  *
  * @param {}
  * @returns {string}
*/
const getNewToken = () => {
  let tokenNum = Math.floor(Math.random() * 1000);
  let tokenString = tokenNum.toString();
  while (isValidToken(tokenString)) {
    tokenNum = Math.floor(Math.random() * 1000);
    tokenString = tokenNum.toString();
  }
  return tokenString;
};

/**
  * Given a registered user's email and password, returns their authUserId value.
  *
  * @param {string} email
  * @param {string} password
  * @returns {{authUserId: number}}
*/
export const authLoginV1 = (email: string, password: string) => {
  const data = getData();

  // error: email entered does not belong to a user or incorrect password
  if (!isEmailFromUser(email)) {
    return { error: 'invalid email' };
  }

  const user = data.users.find(person => person.email === email);
  if (user.password !== password) {
    return { error: 'incorrect password' };
  }

  const id = user.uId;

  const token = getNewToken();
  user.token.push(token);
  setData(data);

  return {
    authUserId: id,
    token: token
  };
};

/**
  * Given a user's first and last name, email address, and password,
  * creates a new account for them and returns a new authUserId.
  *
  * @param {string} email
  * @param {string} password
  * @param {string} nameFirst
  * @param {string} nameLast
  * @returns {{authUserId: number}}
*/
export const authRegisterV1 = (email: string, password: string, nameFirst: string, nameLast: string) => {
  const data = getData();

  if (!validator.isEmail(email)) {
    return { error: 'invalid email' };
  }

  if (isEmailFromUser(email)) {
    return { error: 'email already taken' };
  }

  if (password.length < 6) {
    return { error: 'password < 6 characters' };
  }

  if (nameFirst.length < 1 || nameFirst.length > 50) {
    return { error: 'incorrect firstname length' };
  }

  if (nameLast.length < 1 || nameLast.length > 50) {
    return { error: 'incorrect lastname length' };
  }

  const handle = newHandle(nameFirst, nameLast);
  const id = getNewId();

  let pId = 1;
  if (data.users.length !== 0) {
    pId = 2;
  }

  const token = getNewToken();

  const newUser = {
    uId: id,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    handleStr: handle,
    password: password,
    pId: pId,
    token: [token],
  };

  data.users.push(newUser);
  setData(data);

  return {
    authUserId: id,
    token: token,
  };
};

/**
  * Given an active token, invalidates the token to log the user out.
  *
  * @param {string} token
  * @returns {}
*/
export const authLogoutV1 = (token: string) => {
  const data = getData();
  if (!isValidToken(token)) {
    return { error: 'invalid token' };
  }
  for (const user of data.users) {
    user.token = user.token.filter(t => t !== token);
  }
  setData(data);
  return {};
};
