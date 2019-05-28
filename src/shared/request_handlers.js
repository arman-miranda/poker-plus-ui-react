function getDataFromServer(url) {
  return requestGETFrom(url);
}

function deleteDataFromServer(url) {
  return fetch(url,{
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
  return fetch(url, {
    credentials: 'include',
    method: 'POST',
    headers: {
      "Content-Type": 'application/json'
    },
    body: JSON.stringify(body)
  });
}

export {
  getDataFromServer,
  deleteDataFromServer,
  requestPOSTTo
};
