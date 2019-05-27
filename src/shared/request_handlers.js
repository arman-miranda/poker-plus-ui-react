function getDataFromServer(url) {
  return requestGETFrom(url);
}

function deleteDataFromServer(url) {
  return fetch(url,{
    method: 'DELETE',
    credentials: 'include'
  }).then(window.location.reload())
}

function requestGETFrom(url){
  return fetch(url, {
    credentials: 'include'
  }).then(response => response.json());
}

export {
  getDataFromServer,
  deleteDataFromServer
};
