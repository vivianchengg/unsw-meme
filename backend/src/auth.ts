import { getData, setData, getHash, Notif, updateWorkSpace } from './dataStore';
import { isValidToken } from './users';
import validator from 'validator';
import HTTPError from 'http-errors';
import nodemailer from 'nodemailer';

/**
  * check whether email entered belong to a user
  *
  * @param {string} email
  * @returns {boolean}
*/
export const isEmailFromUser = (email: string): boolean => {
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
export const isHandleTaken = (handle: string): boolean => {
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
  let tokenNum = Math.floor(Math.random() * 300);
  let tokenString = tokenNum.toString();
  while (isValidToken(tokenString)) {
    tokenNum = Math.floor(Math.random() * 300);
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
    throw HTTPError(400, 'invalid email');
  }

  const user = data.users.find(person => person.email === email);
  if (user.password !== getHash(password)) {
    throw HTTPError(400, 'incorrect password');
  }

  const id = user.uId;

  const token = getNewToken();
  const hashedToken = getHash(token);
  user.token.push(hashedToken);
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
    throw HTTPError(400, 'invalid email');
  }

  if (isEmailFromUser(email)) {
    throw HTTPError(400, 'email already taken');
  }

  if (password.length < 6) {
    throw HTTPError(400, 'password < 6 characters');
  }

  if (nameFirst.length < 1 || nameFirst.length > 50) {
    throw HTTPError(400, 'incorrect firstname length');
  }

  if (nameLast.length < 1 || nameLast.length > 50) {
    throw HTTPError(400, 'incorrect lastname length');
  }

  const handle = newHandle(nameFirst, nameLast);
  const id = getNewId();

  let pId = 1;
  if (data.users.length !== 0) {
    pId = 2;
  }

  const token = getNewToken();
  const hashedToken = getHash(token);
  const hashedPwd = getHash(password);
  const url: string = null;
  const notif: Notif[] = [];
  const resetCode: string = null;
  const now = Math.floor(new Date().getTime() / 1000);

  // init workspace stat
  updateWorkSpace(data);

  const cJoin = {
    numChannelsJoined: 0,
    timeStamp: now
  };

  const dJoin = {
    numDmsJoined: 0,
    timeStamp: now
  };

  const msgSent = {
    numMessagesSent: 0,
    timeStamp: now
  };

  const userStat = {
    channelsJoined: [cJoin],
    dmsJoined: [dJoin],
    messagesSent: [msgSent],
    involvementRate: 0
  };

  const newUser = {
    uId: id,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    handleStr: handle,
    password: hashedPwd,
    pId: pId,
    token: [hashedToken],
    profileImgUrl: url,
    notifications: notif,
    resetCode: resetCode,
    isRemoved: false,
    userStats: userStat
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
    throw HTTPError(403, 'invalid token');
  }

  const hashedToken = getHash(token);
  for (const user of data.users) {
    user.token = user.token.filter(t => t !== hashedToken);
  }
  setData(data);
  return {};
};

/**
  * send secret password reset code to email
  * log out all sessions
  *
  * @param {string} email
  * @returns {}
*/
export const authPasswordRequestV1 = (email: string) => {
  const data = getData();
  const user = data.users.find(u => u.email === email);
  if (user === undefined) {
    return {};
  }
  user.token = [];

  const code = (Math.floor(Math.random() * 1000));
  user.resetCode = getHash(code.toString());
  const senderEmail = 'fleta.kuphal@ethereal.email';
  const senderPwd = 'pMRJmnxG2KMYg1hCDG';

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: senderEmail,
      pass: senderPwd
    }
  });

  const options = {
    from: `1531Project <${senderEmail}>`,
    to: `${user.nameFirst} ${user.nameLast} <${user.email}>`,
    subject: 'Password reset request',
    text: `Reset code: ${user.resetCode}`
  };

  transporter.sendMail(options).then((i) => {
    const messageUrl = nodemailer.getTestMessageUrl(i);
    console.log(`Message sent: ${messageUrl}`);
  });

  setData(data);
  return {};
};

/**
  * reset password
  * invalidate reset code if used
  *
  * @param {number} resetCode
  * @param {string} password
  * @returns {}
*/
export const authPasswordResetV1 = (resetCode: string, newPassword: string) => {
  const data = getData();
  const user = data.users.find(u => u.resetCode === resetCode);
  if (user === undefined) {
    throw HTTPError(400, 'invalid resetCode');
  }

  if (newPassword.length < 6) {
    throw HTTPError(400, 'password length < 6');
  }

  user.password = getHash(newPassword);
  user.resetCode = null;
  setData(data);
  return {};
};
