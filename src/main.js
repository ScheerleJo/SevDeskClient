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

function showMessage (Message) {
  document.getElementById('status-content').innerHTML = Message;
  showElement('status-container');
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
  document.getElementById('input-year').value = new Date().getFullYear() - 1;
  let url = document.getElementById('server-connection').innerHTML +'/api/loadData';
  fetch(url).then(response => response.json()).then(data => {
    setTimeout(() => {
      if(data.data) {
        createTableBody(data.data);
        document.getElementById('donatorData-storage').innerHTML = JSON.stringify(data);
        document.getElementById('input-year').value = data.year
        showMessage(`<p id="status-info">Der Stand der Daten vom Jahr ${data.year} wurde wiederhergestellt.</p>`);
      }
    }, 100);
  });
}

function fetchNewData() {
  let year = document.getElementById('input-year').value;
  let url = document.getElementById('server-connection').innerHTML +'/api/fetchNew?year=' + year;
  fetch(url).then(response => response.json()).then(data => {
    setTimeout(() => {
      if (data.data) createTableBody(data.data);
      document.getElementById('donatorData-storage').innerHTML = JSON.stringify(data);
      showMessage(`<p id="status-info">${Object.keys(data.data).length} neue Elemente aus dem Jahr ${year} wurden hinzugefügt</p>`);
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
  for (let j = 0; j < 11; j++) {
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
        button.appendChild(document.createTextNode('Zurücksetzen'));
        td.appendChild(button);
        break;
        //TODO: Add Button to create refetch
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
  span.appendChild(document.createTextNode(address.street +'\n' + address.zip + ' ' + address.city  + '\n' +  address.country));
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
  let url = document.getElementById('server-connection').innerHTML +'/api/moveDonator?donatorIDs=' + userID + '&status=' + status;
  fetch(url).then(response => response.json()).then(data => {
    document.getElementById('donatorData-storage').innerHTML = JSON.stringify(data);
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
  fetch(document.getElementById('server-connection').innerHTML +'/api/saveData').then(response => response.json()).then(data => {
    setTimeout(() => {
      try {
        if(data.Status == 201) showMessage(`<p id="status-info">Aktueller Status wurde gespeichert und wird beim nächsten Neustart automatisch neu geladen</p>`);
        else showMessage(`<p id="status-info">Beim Speichern ist etwas schiefgelaufen: \n BackEnd: ${data}</p>`);
      } catch(error) {
        showMessage(`<p id="status-info">Beim Speichern ist etwas schiefgelaufen: \n BackEnd: ${error}</p>`);
      }
    }, 100);
  });
}

function showSetAuthToken(){
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
  p.appendChild(document.createTextNode('Hier die Server-URL ( IP-Adresse des Raspberry-Pi ) einfügen:'))
  message.appendChild(p);
  message.appendChild(input);
  message.appendChild(button);
  showMessage(message.innerHTML);
}

function setAuthToken() {
  fetch(`${document.getElementById('server-connection').innerHTML}/api/saveToken?token=${document.getElementById('input-authKey').value}`).then(response => response.json()).then(data => {
    setTimeout(() => {
      try {
        if(data.Status == 200) showMessage(`<p id="status-info">Das Token wurde gespeichert</p>`);
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
    fetch(`http://${ipAddress}:8040/ping`).then(response => response.json()).then(data => {
      if(data.Status == 'pong') {
        document.getElementById('server-connection').innerHTML = `http://${ipAddress}:8040`;
        showMessage(`<p id="status-info">Die Verbindung wurde erfolgreich gespeichert</p>`);
      }
    });
  } catch(error) {
    showMessage(`<p id="status-info">Beim Verbindungsaufbau zum Server ist etwas schiefgelaufen: \n BackEnd: ${error}</p>`);
  }
}