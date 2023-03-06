import { getData, setData } from './dataStore.js';

export function clearV1() {
    const data = getData();
    data.users = [];
    data.channels = [];
    setData(data);
    return {};
}