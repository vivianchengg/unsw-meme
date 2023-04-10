import request from 'sync-request';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;

export const getRequest = (url: string, data: any) => {
  const res = request(
    'GET',
    SERVER_URL + url,
    {
      qs: data,
    }
  );
  const body = JSON.parse(res.getBody() as string);
  return body;
};

export const postRequest = (url: string, data: any) => {
  const res = request(
    'POST',
    SERVER_URL + url,
    {
      json: data,
    }
  );
  const body = JSON.parse(res.getBody() as string);
  return body;
};

export const putRequest = (url: string, data: any) => {
  const res = request(
    'PUT',
    SERVER_URL + url,
    {
      json: data,
    }
  );
  const body = JSON.parse(res.getBody() as string);
  return body;
};

export const deleteRequest = (url: string, data: any) => {
  const res = request(
    'DELETE',
    SERVER_URL + url,
    {
      qs: data,
    }
  );
  const body = JSON.parse(res.getBody() as string);
  return body;
};

// request helper to be used for it3
/*
export const requestHelper = (method: HttpVerb, path: string, token: object, data: object) => {
   let qs = {};
   let json = {};
   let headers = token;
   if (['GET', 'DELETE'].includes(method)) {
     qs = data;
   } else {
     // PUT/POST
     json = data;
   }
   const res = request(method, SERVER_URL + path, { headers, qs, json, timeout: 20000 });
   return JSON.parse(res.getBody('utf-8'));
}
*/
