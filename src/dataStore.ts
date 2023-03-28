import fs from 'fs';

// YOU SHOULD MODIFY THIS OBJECT BELOW
export type User = {
  uId: number,
  nameFirst: string,
  nameLast: string,
  email: string,
  handleStr: string,
  password: string,
  pId: number,
  token: string[],
};

export type Message = {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number,
}

export type Channel = {
  channelId: number,
  name: string,
  isPublic: boolean,
  allMembers: number[],
  ownerMembers: number[],
  messages: Message[],
  start: number,
  end: number,
};

export type Data = {
  users: User[],
  channels: Channel[]
};

// let data: Data = {
//   users: [],
//   channels: []
// };

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

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
