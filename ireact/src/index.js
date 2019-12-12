import React from 'react';
import ReactDOM from 'react-dom';
import TList from './questions';

let eroot = document.getElementById('eroot');
if (eroot) {
  let uri = eroot.getAttribute('data-json')
  let token = eroot.getAttribute('token')
  fetch(uri)
  .then(response => response.json())
  .then(json => {
    ReactDOM.render(<TList items={json} token={token} uri={uri} />, eroot)
  })
}
