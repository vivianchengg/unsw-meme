import { Message, setData, getData } from './dataStore';
import { isValidUser, validTokenUser } from './channel';

/**
  * check whether email entered belong to a user
  *
  * @param {string} token
  * @param {number[]} uIds
  * @returns {number} dmId
*/
export const dmCreateV1 = (token: string, uIds: number[]) => {
  const data = getData();
  let count = 0;
  for (const userId of uIds) {
    if (!isValidUser(userId)) {
      return { error: 'invalid uId exists' };
    }

    if (uIds.indexOf(userId) !== count) {
      return { error: 'duplicate uId' };
    }
    count++;
  }

  const owner = validTokenUser(token);
  if (owner === null) {
    return { error: 'invalid token' };
  }

  const dmId = data.dms.length + 1;
  const allHandle = [owner.handleStr];

  const dmOwner = owner.uId;
  const dmMember = [owner.uId];
  for (const userId of uIds) {
    dmMember.push(userId);

    const user = data.users.find(u => u.uId === userId);
    allHandle.push(user.handleStr);
  }

  allHandle.sort();
  let dmName = '';
  for (const handle of allHandle) {
    if (dmName.length !== 0) {
      dmName += ', ';
    }
    dmName += handle;
  }

  const message: Message[] = [];

  const newDm = {
    dmId: dmId,
    name: dmName,
    allMembers: dmMember,
    owner: dmOwner,
    messages: message,
    start: -1,
    end: -1,
  };
  data.dms.push(newDm);
  setData(data);

  return {
    dms: {
      dmId: dmId,
      name: dmName,
    }
  };
};
