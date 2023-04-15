import fs from 'fs';
import crypto from 'crypto';

export type React = {
  reactId: number,
  uIds: number [],
  isThisUserReacted: boolean
};

export type Notif = {
  channelId: number,
  dmId: number,
  notificationMessage: string
};

export type User = {
  uId: number,
  nameFirst: string,
  nameLast: string,
  email: string,
  handleStr: string,
  password: string,
  pId: number,
  token: string[],
  profileImgUrl: string,
  notifications: Notif[]
};

export type Message = {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number,
  reacts: React[],
  isPinned: boolean
};

export type Standup = {
  isActive: boolean,
  timeFinish: number,
  starterId: number
};

export type Channel = {
  channelId: number,
  name: string,
  isPublic: boolean,
  allMembers: number[],
  ownerMembers: number[],
  messages: Message[],
  standup: Standup
};

export type Dm = {
  dmId: number,
  name: string,
  allMembers: number[],
  owner: number,
  messages: Message[]
};

export type Data = {
  users: User[],
  channels: Channel[],
  dms: Dm[]
};

export const data: Data = {
  users: [],
  channels: [],
  dms: []
};

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
export const getData = (): Data => {
  const json = fs.readFileSync('./src/data.json', { flag: 'r' });
  const data = JSON.parse(json.toString());
  return data;
};

// Use set(newData) to pass in the entire data object, with modifications made
// - Only needs to be used if you replace the data store entirely
// - Javascript uses pass-by-reference for objects... read more here: https://stackoverflow.com/questions/13104494/does-javascript-pass-by-reference
// Hint: this function might be useful to edit in iteration 2
export const setData = (newData: Data) => {
  const dataString = JSON.stringify(newData);
  fs.writeFileSync('./src/data.json', dataString, { flag: 'w' });
};

export const getHash = (input: string) => {
  return crypto.createHash('sha256').update(input).digest('hex');
};
