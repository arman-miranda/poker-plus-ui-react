const host_url = 'http://18.179.196.103:3000';

function parseUrl(url) {
  return `${host_url}/${url}`;
}

function getDataFromServer(url) {
  return requestGETFrom(parseUrl(url));
}

function deleteDataFromServer(url) {
  return fetch(parseUrl(url),{
    method: 'DELETE',
    credentials: 'include'
  }).then(window.location.reload());
}

function requestGETFrom(url) {
  return fetch(url, {
    credentials: 'include'
  }).then(response => response.json());
}

function requestPOSTTo(url, body) {
  return fetch(parseUrl(url), {
    credentials: 'include',
    method: 'POST',
    headers: {
      "Content-Type": 'application/json'
    },
    body: JSON.stringify(body)
  });
}

function requestPUTTo(url, body){
  return fetch(parseUrl(url), {
    credentials: 'include',
    method: 'PUT',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  }).then(response => response.json());
}

export {
  getDataFromServer,
  deleteDataFromServer,
  requestPOSTTo,
  requestPUTTo
};
