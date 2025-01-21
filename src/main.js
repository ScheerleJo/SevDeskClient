const { show, hide } = require("@tauri-apps/api/app");

DocumentType = module;

const { invoke } = window.__TAURI__.tauri;
// const { BaseDirectory } = window.__TAURI__.fs;
// const { downloadDir } = window.__TAURI__.path
// const { exists, BaseDirectory, createDir, createFile, writeFile, readFile } = window.__TAURI__.fs;
// // import {BaseDirectory} from '@tauri-apps/api/fs';

module.exports = {
  toggleCaret,
  fetchNewData,
  showTable,
  loadData,
  showMessage,
  createLatexFile,
  loadCurrentState,
  saveCurrentState,
  showSetAuthToken,
  showSetConnection,
  setAuthToken,
  setConnection,
}

//#region UTILITY
function showElement(elementID) {
  let element = document.getElementById(elementID);
  element.style.display = "block";
}
function hideElement(elementID) {
  let element = document.getElementById(elementID);
  element.style.display = "none";
}



function toggleCaret(elementID) {
  let anchorCaret = document.getElementById(elementID);
  if(anchorCaret.classList.contains('fa-caret-right')) {
    showElement('donation-' + elementID.split('-')[1]);
    anchorCaret.setAttribute('class','fa-solid fa-caret-down');
  } else {
    hideElement('donation-' + elementID.split('-')[1]);
    anchorCaret.setAttribute('class','fa-solid fa-caret-right');
  }
}
//#endregion

function loadData() {
  let url = document.getElementById('server-connection').innerHTML;
  document.getElementById('input-year').value = new Date().getFullYear() - 1;

  document.body.style.cursor = "progress";
  fetch(url + '/ping').then(response => response.json()).then(data => {
    setTimeout(() => {
      document.body.style.cursor = "default";
      if(data.status == 'pong') {
        document.getElementById('server-text').innerHTML = 'Server ist erreichbar';
        document.getElementById('server-indicator').setAttribute('style', 'color:rgb(72, 198, 9)');
        
        document.body.style.cursor = "progress";
        fetch(url + '/api/loadData').then(response => response.json()).then(data => {
          setTimeout(() => {
            document.body.style.cursor = "default";
            if(data.data) {
              createTableBody(data.data);
              showMessage(`<p id="status-info">Der Stand der Daten vom Jahr ${data.year} wurde wiederhergestellt.</p>`);
            }
          }, 100);
        });
      }

    }, 100);
  }).catch(error => {
    document.body.style.cursor = "default";
    document.getElementById('server-text').innerHTML = 'Server nicht erreichbar';
    document.getElementById('server-indicator').setAttribute('style', 'color: #FF5D55');
  });
  
}

function fetchNewData() {
  let year = document.getElementById('input-year').value;
  let url = document.getElementById('server-connection').innerHTML +'/api/fetchNew?year=' + year;
  document.body.style.cursor = "progress";
  fetch(url).then(response => response.json()).then(data => {
    setTimeout(() => {
      if (data.data) createTableBody(data.data);
      showMessage(`<p id="status-info">${Object.keys(data.data).length} neue Elemente aus dem Jahr ${year} wurden hinzugefügt</p>`);
      document.body.style.cursor = "default";

    }, 100);
  });
}

function createTableBody(data) {
  let tableBody = document.createElement('tbody');
  if(data) {
    for(const key in data) {
      tableBody.appendChild(createDonatorTr(key, data[key]));
      tableBody.appendChild(createDonationTable(data[key].donations, key));
    }
  }
  document.getElementById('autocreate-table-body').innerHTML = tableBody.innerHTML;
}

function createDonatorTr(userID, element) {
  let tr = document.createElement('tr');
  tr.setAttribute('class', 'donator-autocreate-tr');
  tr.setAttribute('id', `donator-${userID}`);
  for (let j = 0; j < 12; j++) {
    let td = document.createElement('td');
    td.setAttribute('class', `donator-element-${userID}`);
    switch (j) {
        case 0:
          td.setAttribute('class', 'align-center caret donator-element-' + userID);
          let a = document.createElement('a');
          a.setAttribute('id', `caret-${userID}`);
          a.setAttribute('href', '#');
          a.setAttribute('onclick', `toggleCaret('caret-${userID}')`);
          a.setAttribute('class', 'fa-solid fa-caret-right');
          td.appendChild(a);
          break;
      case 1: td.appendChild(createDonatorStatus(element)); break;
      case 2: td.appendChild(createDonatorSpan(element.familyname)); break;
      case 3: td.appendChild(createDonatorSpan((element.academicTitle == '' ? '' : element.academicTitle + ' ') + element.surename)); break;
      case 4: td.appendChild(createDonatorAddressSpan(element.address)); break;
      case 5: td.appendChild(createDonatorSpan(element.donations.length)); break;
      case 6: td.appendChild(createDonatorSpan(element.totalSum)); break;
      case 7: td.appendChild(createDonatorSpan(element.sumInWords)); break;
      case 8:
        td.setAttribute('class', 'donator-element-' + userID);
        let input = document.createElement('input')
        input.setAttribute('type', 'checkbox');
        input.setAttribute('id', `checked-${userID}`);
        input.setAttribute('onclick', `changeStatus(${userID})`);
        td.appendChild(input);
        break;
      case 9: 
        td.setAttribute('class', 'donator-element-' + userID);
        let input2 = document.createElement('input')
        input2.setAttribute('type', 'checkbox');
        input2.setAttribute('id', `create-${userID}`);
        input2.setAttribute('onclick', `changeStatus(${userID})`);
        input2.setAttribute('checked', 'true');
        td.appendChild(input2);
        break;
      case 10:
        td.setAttribute('class', 'donator-element-' + userID);
        let button = document.createElement('button');
        button.setAttribute('onclick', `refetchDonator(${userID})`);
        button.appendChild(document.createElement('i')).setAttribute('class', 'fa-solid fa-rotate-right');
        td.appendChild(button);
        break;
      case 11:
        td.setAttribute('class', 'donator-element-' + userID);
        let button2 = document.createElement('button');
        button2.setAttribute('onclick', `deleteDonator(${userID})`);
        button2.appendChild(document.createElement('i')).setAttribute('class', 'fa-solid fa-trash');
        td.appendChild(button2);
        break;
    }
    tr.appendChild(td);
  }
  return tr;
}
function createDonatorSpan(donatorElement) {
  let span = document.createElement('span');
  span.appendChild(document.createTextNode(donatorElement));
  return span;
}
function createDonatorStatus(element) {
  let i = document.createElement('i');
  i.setAttribute('id', 'status-' + element.id);
  switch (element.status) {
    case 'unchecked':
      i.setAttribute('class', 'fa-lg fa-solid fa-triangle-exclamation');
      i.setAttribute('style', 'color: #FEC63D');
      break;
    case 'checked':
      i.setAttribute('class', 'fa-lg fa-regular fa-circle-check');
      i.setAttribute('style', 'color: #629C44');
      break;
    case 'checkedNotInPool':
      i.setAttribute('class', 'fa-lg fa-solid fa-circle-check');
      i.setAttribute('style', 'color: #D6D6D6');
      break;
    case 'done':
      i.setAttribute('class', 'fa-lg fa-solid fa-circle-check');
      i.setAttribute('style', 'color: #629C44');
      break;
    default:
      i.setAttribute('class', 'fa-lg fa-solid fa-circle-exclamation');
      i.setAttribute('style', 'color: #FF5D55');
      break;
  }
  return i;
}
function createDonatorAddressSpan(address) {
  let span = document.createElement('span');
  let street = address.street ||'';
  let zip = address.zip || '';
  let city = address.city || '';
  let country = address.country || '';
  span.appendChild(document.createTextNode(street +'\n' + zip + ' ' + city + '\n' + country));
  span.setAttribute('style', 'white-space: pre-wrap; word-wrap: break-word;');
  return span;
}

function changeStatus(userID) {
  let icon = document.getElementById('status-' + userID);
  let checked = document.getElementById('checked-' + userID).checked;
  let create = document.getElementById('create-' + userID).checked;
  let status = 'unchecked';
  if(checked && !create) { // checkedNotInPool
    icon.setAttribute('class', 'fa-lg fa-solid fa-circle-check');
    icon.setAttribute('style', 'color: #D6D6D6');
    status = 'checkedNotInPool';
  } else if(checked) {  // checked
    icon.setAttribute('class', 'fa-lg fa-regular fa-circle-check');
    icon.setAttribute('style', 'color: #629C44');
    status = 'checked';
  } else if(!checked) { // unchecked
    icon.setAttribute('class', 'fa-lg fa-solid fa-triangle-exclamation');
    icon.setAttribute('style', 'color: #FEC63D');
    status = 'unchecked';
  }
  let url = document.getElementById('server-connection').innerHTML +'/api/moveDonator?donatorID=' + userID + '&status=' + status;
  document.body.style.cursor = "progress";
  fetch(url).then(response => response.json()).then(data => {
    document.body.style.cursor = "default";
  });
}
/**
 * Create Table with all Donations Listed in SevDesk to the User above
 * @param  {Array<Array<string>} donations
 * 2 Dimensional Array, with needed info for a Donation per row of Array
 * @param  {number} userID
 * Number of associated User in Table
 */
function createDonationTable(donations, userID) {
  //CREATE SPACE FOR DONATION TABLE in DONATOR-TABLE
  let outerTr = document.createElement('tr');
  let outerTd = document.createElement('td');
  outerTr.setAttribute('class', 'donation-autocreate-tr');
  outerTr.setAttribute('id', `donation-tr-${userID}`);
  outerTr.appendChild(document.createElement('td'));
  outerTd.setAttribute('colspan', 9);
  
  //CREATE DONATION-TABLE-HEAD
  let innerTbl = document.createElement('table');
  innerTbl.setAttribute('id', `donation-${userID}`);
  innerTbl.setAttribute('class', 'donation-table');
  let innerTrHead = document.createElement('tr');
  
  let innerHeadInfo = ['Datum', 'Summe'];
  for (let i = 0; i < innerHeadInfo.length; i++) {
    let innerTh = document.createElement('th');
    innerTh.appendChild(document.createTextNode(innerHeadInfo[i]));
    innerTrHead.appendChild(innerTh);
  }
  
  //CREATE DONATION-TABLE-BODY (FOR EACH DONATION in 'donations')
  innerTbl.appendChild(innerTrHead);
  for (const key in donations) {
    const element = donations[key];
    let innerTr = document.createElement('tr');
    
    innerTr.appendChild(createDonationTd(element.date));
    innerTr.appendChild(createDonationTd(element.sum));
    innerTbl.appendChild(innerTr);
  }
  //#endregion

  innerTbl.style.display = 'none'
  outerTd.appendChild(innerTbl);
  outerTr.appendChild(outerTd);
  return outerTr;
}
function createDonationTd(donationElement) {
  let innerTd = document.createElement('td');
  innerTd.appendChild(document.createTextNode(donationElement));
  return innerTd
}


function saveCurrentState() {
  document.body.style.cursor = "progress";
  fetch(document.getElementById('server-connection').innerHTML +'/api/saveData').then(response => response.json()).then(data => {
    document.body.style.cursor = "default";
    setTimeout(() => {
      if(data.status == 201) showMessage(`<p id="status-info">Aktueller Status wurde erfolgreich gespeichert!</p>`);
      else showMessage(`<p id="status-info">Beim Speichern ist etwas schiefgelaufen: \n BackEnd: ${data}</p>`);
    }, 100);
  }).catch(error => {
    document.body.style.cursor = "default";
    showMessage(`<p id="status-info">Beim Speichern ist etwas schiefgelaufen: \n BackEnd: ${error}</p>`);
  });
}

function setAuthToken(token) {
  document.body.style.cursor = "progress";
  fetch(`${document.getElementById('server-connection').innerHTML}/api/saveToken?token=${token}`).then(response => response.json()).then(data => {
    setTimeout(() => {
      document.body.style.cursor = "default";
      try {
        if(data.Status == 200) showMessage(`<p id="status-info">Das Token wurde gespeichert!</p>`);
        else showMessage(`<p id="status-info">Beim Speichern ist etwas schiefgelaufen: \n BackEnd: ${data}</p>`);
      } catch(error) {
        showMessage(`<p id="status-info">Beim Speichern ist etwas schiefgelaufen: \n BackEnd: ${error}</p>`);
      }
    }, 100);
  });
}

function setConnection() {
  let ipAddress = document.getElementById('input-connection').value;
  try {
    fetch(`${ipAddress}/ping`).then(response => response.json()).then(data => {
      if(data.Status == 'pong') {
        document.getElementById('server-connection').innerHTML = ipAddress;
        showMessage(`<p id="status-info">Die Verbindung wurde erfolgreich gespeichert!</p>`);
      }
    });
  } catch(error) {
    showMessage(`<p id="status-info">Beim Verbindungsaufbau zum Server ist etwas schiefgelaufen: \n BackEnd: ${error}</p>`);
  }
}

function refetchDonator(userID) {
  console.log('refetching: ' + userID);
  let url = document.getElementById('server-connection').innerHTML + '/api/refetchDonator?donatorID=' + userID;
  
  document.body.style.cursor = "progress";
  fetch(url).then(response => response.json()).then(data => {
    setTimeout(() => {
      document.body.style.cursor = "default";
      if(data.data) {
        document.getElementById(`donator-${userID}`).replaceWith(createDonatorTr(userID, data.data[userID]));
        document.getElementById(`donation-tr-${userID}`).replaceWith(createDonationTable(data.data[userID].donations, userID));
        showMessage(`<p id="status-info">Der Spender ${data.data.familyname} ${data.data.surename} wurde aktualisiert</p>`);
      }
    }, 100);
  });
}

function deleteDonator(userID) {
  console.log('deleting: ' + userID);
  let url = document.getElementById('server-connection').innerHTML + '/api/deleteDonator?donatorID=' + userID;
  document.body.style.cursor = "progress";
  fetch(url).then(response => response.json()).then(data => {
    setTimeout(() => {
      document.body.style.cursor = "default";
      if(data.data) {
        document.getElementById(`donator-${userID}`).remove();
        document.getElementById(`donation-tr-${userID}`).remove();
        showMessage(`<p id="status-info">Der Spender ${data.data.familyname} ${data.data.surename} wurde gelöscht</p>`);
      }
    }, 100);
  });
}


function downloadTex() {
  console.log('downloading tex file');
  document.body.style.cursor = "progress";
  fetch(document.getElementById('server-connection').innerHTML + '/api/getLatex').then(response => {
    document.body.style.cursor = "default";
    return response.blob();
  }).then(blob => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'test.tex';
      a.click();
  });
}
function fetchSavedState() {
  console.log('fetching last saved state');
  document.body.style.cursor = "progress";
  fetch(document.getElementById('server-connection').innerHTML +'/api/loadDataFromFile').then(response => response.json()).then(data => {
    setTimeout(() => {
      document.body.style.cursor = "default";
      if(data.data) {
        createTableBody(data.data);
        showMessage(`<p id="status-info">Der Stand der Daten vom Jahr ${data.year} wurde wiederhergestellt.</p>`);
      }

    }, 100);
  }).catch(error => {
    showMessage(`<p id="status-info">Beim Laden ist etwas schiefgelaufen: \n BackEnd: ${error}</p>`);
    document.body.style.cursor = "default";
  });
}

function loadCurrentState() {
  YesNoMessageBox('Soll der aktuelle Stand wirklich mit dem zuletzt gespeicherten Stand überschrieben werden?', 'fetchSavedState()', 'hideElement("status-container")');
}

//#region MESSAGES
function showMessage (message) {
  document.getElementById('status-content').innerHTML = message;
  showElement('status-container');
}
function hideMessage() {
  hideElement('status-container');
}

function YesNoMessageBox (question, yesAction, noAction){
  let message = document.createElement('div')
  let p = document.createElement('p')
  p.appendChild(document.createTextNode(question))
  let buttonYes = document.createElement('button');
  buttonYes.setAttribute('onclick', yesAction);
  buttonYes.appendChild(document.createTextNode('Ja'));
  let buttonNo = document.createElement('button');
  buttonNo.setAttribute('onclick', noAction);
  buttonNo.appendChild(document.createTextNode('Nein'));
  message.appendChild(p);
  message.appendChild(buttonYes);
  message.appendChild(buttonNo);
  showMessage(message.innerHTML);
}

function InputMessageBox(question, placeholderText, buttonText, buttonAction) {
  let message = document.createElement('div')
  let button = document.createElement('button');
  button.setAttribute('onclick', 'triggerStatusButton(buttonAction)');
  button.appendChild(document.createTextNode(buttonText));
  let input = document.createElement('input');
  input.setAttribute('id', 'status-input');
  input.setAttribute('placeholder', placeholderText);
  let p = document.createElement('p');
  p.appendChild(document.createTextNode(question))
  message.appendChild(p);
  message.appendChild(input);
  message.appendChild(button);
  showMessage(message.innerHTML);
}
function triggerStatusButton(buttonAction) {
  let input = document.getElementById('status-input').value;
  let functionText = ;
  eval(buttonAction.replace('()', '') `('${input}')`);
}

function showSetAuthToken(){
  InputMessageBox('Hier den API-Schlüssel aus SevDesk einfügen:', 'API-Schlüssel eingeben', 'Schlüssel speichern', 'setAuthToken()');
  let message = document.createElement('div')
  let button = document.createElement('button');
  button.setAttribute('onclick', 'setAuthToken()');
  button.appendChild(document.createTextNode('Schlüssel speichern'));
  let input = document.createElement('input');
  input.setAttribute('id', 'input-authKey');
  input.setAttribute('placeholder', 'API-Schlüssel eingeben');
  let p = document.createElement('p');
  p.setAttribute('id', 'auth-info');
  p.appendChild(document.createTextNode('Hier den API-Schlüssel aus SevDesk einfügen:'))
  message.appendChild(p);
  message.appendChild(input);
  message.appendChild(button);
  showMessage(message.innerHTML);
}

function showSetConnection() {
  let message = document.createElement('div')
  let button = document.createElement('button');
  button.setAttribute('onclick', 'setConnection()');
  button.appendChild(document.createTextNode('Verbindung speichern'));
  let input = document.createElement('input');
  input.setAttribute('id', 'input-connection');
  input.setAttribute('placeholder', 'Server-URL eingeben');
  let p = document.createElement('p');
  p.setAttribute('id', 'connection-info');
  p.appendChild(document.createTextNode('Hier die Server-URL (z.b. http://raspberry:8040 oder http://192.168.1.20:8040) eingeben:'))
  p.appendChild(document.createTextNode('Standardmäßig ist die URL auf http://raspberry:8040 gesetzt, sodass sie direkt funktionieren sollte.'));
  message.appendChild(p);
  message.appendChild(input);
  message.appendChild(button);
  showMessage(message.innerHTML);
}
//#endregion