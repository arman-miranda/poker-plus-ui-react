function getDataFromServer(url) {
  return requestGETFrom(url);
}

function requestGETFrom(url){
  return fetch(url, {
    credentials: 'include'
  }).then(response => response.json());
}

function requestPUTTo(url, body){
  return fetch(url, {
    credentials: 'include',
    method: 'PUT',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })
}

export { getDataFromServer, requestPUTTo };
