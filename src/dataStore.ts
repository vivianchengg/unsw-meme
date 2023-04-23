import fs from 'fs';
import crypto from 'crypto';

export type React = {
  reactId: number,
  uIds: number[],
  isThisUserReacted: boolean
};

export type Notif = {
  channelId: number,
  dmId: number,
  notificationMessage: string
};

export type Message = {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number,
  reacts: React[],
  isPinned: boolean
};

export type MsgStore = {
  handle: string,
  message: string
};

export type Standup = {
  isActive: boolean,
  timeFinish: number,
  starterId: number
  msgStore: MsgStore[]
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

export type cJoin = {
  numChannelsJoined: number,
  timeStamp: number
};

export type dJoin = {
  numDmsJoined: number,
  timeStamp: number
};

export type msgSent = {
  numMessagesSent: number,
  timeStamp: number
};

export type UserStat = {
  channelsJoined: cJoin[],
  dmsJoined: dJoin[],
  messagesSent: msgSent[],
  involvementRate: number
};

export type cExist = {
  numChannelsExist: number,
  timeStamp: number
};

export type dExist = {
  numDmsExist: number,
  timeStamp: number
};

export type msgExist = {
  numMessagesExist: number,
  timeStamp: number
};

export type WorkspaceStat = {
  channelsExist: cExist[],
  dmsExist: dExist[],
  messagesExist: msgExist[],
  utilizationRate: number
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
  notifications: Notif[],
  resetCode: string,
  isRemoved: boolean,
  userStats: UserStat
};

export type Data = {
  users: User[],
  channels: Channel[],
  dms: Dm[],
  workspaceStats: WorkspaceStat
};

// export const data: Data = {
//   users: [],
//   channels: [],
//   dms: [],
//   workspaceStats: {
//     channelsExist, dmsExist, messagesExist, utilizationRate
//   }
// };

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
  const json = fs.readFileSync('./src/data.json', 'utf8');
  const data = JSON.parse(json);
  return data;
};

// Use set(newData) to pass in the entire data object, with modifications made
// - Only needs to be used if you replace the data store entirely
// - Javascript uses pass-by-reference for objects... read more here: https://stackoverflow.com/questions/13104494/does-javascript-pass-by-reference
// Hint: this function might be useful to edit in iteration 2
export const setData = (newData: Data) => {
  const dataString = JSON.stringify(newData, null, 2);
  fs.writeFileSync('./src/data.json', dataString);
};

export const getHash = (input: string) => {
  return crypto.createHash('sha256').update(input).digest('hex');
};

export const updateWorkSpace = (data: Data) => {
  const now = Math.floor(new Date().getTime() / 1000);
  let numUsers = data.users.length;
  const numChannels = data.channels.length;
  const numDms = data.dms.length;
  let numMsgs = 0;
  for (const channel of data.channels) {
    numMsgs += channel.messages.length;
  }

  for (const dm of data.dms) {
    numMsgs += dm.messages.length;
  }

  let countUser = 0;
  for (const user of data.users) {
    const channel = data.channels.find(c => c.allMembers.includes(user.uId));
    const dm = data.dms.find(d => d.allMembers.includes(user.uId));

    if (channel !== undefined || dm !== undefined) {
      countUser += 1;
    }
  }

  if (data.users.length === 0) {
    data.workspaceStats.channelsExist = [{ numChannelsExist: numChannels, timeStamp: now }];
    data.workspaceStats.dmsExist = [{ numDmsExist: numDms, timeStamp: now }];
    data.workspaceStats.messagesExist = [{ numMessagesExist: numMsgs, timeStamp: now }];
    numUsers = 1;
  } else {
    const lastCExist = data.workspaceStats.channelsExist.slice(-1)[0].numChannelsExist;
    if (numChannels !== lastCExist) {
      data.workspaceStats.channelsExist.push({ numChannelsExist: numChannels, timeStamp: now });
    }

    const lastDExist = data.workspaceStats.dmsExist.slice(-1)[0].numDmsExist;
    if (numDms !== lastDExist) {
      data.workspaceStats.dmsExist.push({ numDmsExist: numDms, timeStamp: now });
    }

    const lastMExist = data.workspaceStats.messagesExist.slice(-1)[0].numMessagesExist;
    if (numMsgs !== lastMExist) {
      data.workspaceStats.messagesExist.push({ numMessagesExist: numMsgs, timeStamp: now });
    }
  }

  const utilizationRate = countUser / numUsers;
  data.workspaceStats.utilizationRate = utilizationRate;
  setData(data);
};

export const updateUserStat = (data: Data, user: User) => {
  const now = Math.floor(new Date().getTime() / 1000);
  let numMsgs = 0;
  let msgCount = 0;
  let channelCount = 0;
  for (const channel of data.channels) {
    if (channel.allMembers.includes(user.uId)) {
      channelCount += 1;
      for (const msg of channel.messages) {
        if (msg.uId === user.uId) {
          msgCount += 1;
        }
      }
      numMsgs += channel.messages.length;
    }
  }

  let dmCount = 0;
  for (const dm of data.dms) {
    if (dm.allMembers.includes(user.uId)) {
      dmCount += 1;

      for (const msg of dm.messages) {
        if (msg.uId === user.uId) {
          msgCount += 1;
        }
      }

      numMsgs += dm.messages.length;
    }
  }

  const numChannels = data.channels.length;
  const numDms = data.dms.length;

  let involve = (channelCount + dmCount + msgCount) / (numChannels + numDms + numMsgs);
  if ((numChannels + numDms + numMsgs) === 0) {
    involve = 0;
  } else if (involve > 1) {
    involve = 1;
  }

  const lastCJoin = user.userStats.channelsJoined.slice(-1)[0].numChannelsJoined;
  if (channelCount !== lastCJoin) {
    user.userStats.channelsJoined.push({ numChannelsJoined: channelCount, timeStamp: now });
  }

  const lastDJoin = user.userStats.dmsJoined.slice(-1)[0].numDmsJoined;
  if (dmCount !== lastDJoin) {
    user.userStats.dmsJoined.push({ numDmsJoined: dmCount, timeStamp: now });
  }

  const lastMSent = user.userStats.messagesSent.slice(-1)[0].numMessagesSent;
  if (msgCount !== lastMSent) {
    user.userStats.messagesSent.push({ numMessagesSent: msgCount, timeStamp: now });
  }

  setData(data);
};
