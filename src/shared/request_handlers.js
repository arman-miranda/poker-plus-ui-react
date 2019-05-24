function getDataFromServer(url) {
  return requestGETFrom(url);
}

function requestGETFrom(url){
  return fetch(url)
    .then(response => response.json());
}

export { getDataFromServer };
