function getDataFromServer(url) {
  return requestGETFrom(url);
}

function requestGETFrom(url){
  return fetch(url, {
    credentials: 'include'
  }).then(response => response.json());
}

export { getDataFromServer };
