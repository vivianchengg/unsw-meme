import { User, getData, setData } from './dataStore';
import validator from 'validator';

/**
  * check whether email entered belong to a user
  *
  * @param {string} email
  * @returns {bool}
*/
const isEmailFromUser = (email: string): boolean => {
  const data = getData();
  let user;
  if (data.users !== undefined) {
    user = data.users.find(person => person.email === email);
  }

  if (user === undefined) {
    return false;
  }
  return true;
};

/**
  * check if handle is taken
  *
  * @param {string} handle
  * @returns {bool}
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
  let max = 0;
  const user = data.users;
  user.forEach((i: User) => {
    if (i.uId > max) {
      max = i.uId;
    }
  });

  const id = max + 10;
  return id;
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
  return {
    authUserId: id,
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

  // error: email entered is invalid
  if (!validator.isEmail(email)) {
    return { error: 'invalid email' };
  }

  // error: email already being used by another user
  if (isEmailFromUser(email)) {
    return { error: 'email already taken' };
  }

  // error: length of password is less than 6 characters
  if (password.length < 6) {
    return { error: 'password < 6 characters' };
  }

  // error: firstname length not 1-50
  if (nameFirst.length < 1 || nameFirst.length > 50) {
    return { error: 'incorrect firstname length' };
  }

  // error: lastname length not 1-50
  if (nameLast.length < 1 || nameLast.length > 50) {
    return { error: 'incorrect lastname length' };
  }

  const handle = newHandle(nameFirst, nameLast);
  const id = getNewId();

  const newUser = {
    uId: id,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    handleStr: handle,
    password: password,
  };

  data.users.push(newUser);
  setData(data);

  return {
    authUserId: id,
  };
};
