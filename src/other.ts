import { getData, setData } from './dataStore';

/**
  * Resets the internal data of the application to its initial state
  *
  * @param {}
  * @returns {}
*/
export const clearV1 = () => {
  const data = getData();
  data.users = [];
  data.channels = [];
  data.dms = [];
  setData(data);
  return {};
};
