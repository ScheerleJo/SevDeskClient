DocumentType = module;

module.exports = {
  toggleCaret,
  fetchNewData,
  loadData,
  downloadLatexFile,
  loadCurrentState,
  saveCurrentState,
  showSetAuthToken,
  showSetConnection
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
  document.getElementById('input-year').value = new Date().getFullYear() - 1;

  document.body.style.cursor = "progress";
  fetchFromServer(getServerUrl() + '/ping', true).then(data => {
    if(data.status == 'pong') {
      setServerStatus(true);
      fetchFromServer('/api/loadData').then(data => {
        if(data.data) {
          createTableBody(data.data);
          InfoMessageBox(`Der Stand der Daten vom Jahr ${data.year} wurde wiederhergestellt.`);
        }
      });
    } else setServerStatus(false);
  }).catch(error => {
    setServerStatus(false);
  });
}

function fetchNewData() {
  if(!getServerStatus()) {
    InfoMessageBox('Der Server ist nicht erreichbar. Bitte überprüfe die Verbindung.');
    return;
  }
  let year = document.getElementById('input-year').value;
  fetchFromServer('/api/fetchNew?year=' + year).then(data => {
    if(data.error) {
      InfoMessageBox(`Beim Abrufen der Daten ist etwas schiefgelaufen: \n BackEnd: ${data.error}`);
    }else if (data.data){
      createTableBody(data.data);
      InfoMessageBox(`` + Object.keys(data.data).length + ` neue Elemente aus dem Jahr ${year} wurden hinzugefügt`);
    }
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
      case 6: td.appendChild(createDonatorSpan(element.formattedSum)); break;
      case 7: td.appendChild(createDonatorSpan(element.sumInWords)); break;
      case 8:
        td.setAttribute('class', 'donator-element-' + userID);
        let input = document.createElement('input')
        input.setAttribute('type', 'checkbox');
        input.setAttribute('id', `checked-${userID}`);
        input.setAttribute('onclick', `changeStatus(${userID})`);
        if(element.status == 'checked' || element.status == 'checkedNotInPool' || element.status == 'done') input.setAttribute('checked', 'true');
        td.appendChild(input);
        break;
      case 9: 
        td.setAttribute('class', 'donator-element-' + userID);
        let input2 = document.createElement('input')
        input2.setAttribute('type', 'checkbox');
        input2.setAttribute('id', `create-${userID}`);
        input2.setAttribute('onclick', `changeStatus(${userID})`);
        if(element.status != 'checkedNotInPool') input2.setAttribute('checked', 'true');
        td.appendChild(input2);
        break;
      case 10:
        td.setAttribute('class', 'donator-element-' + userID);
        let button = document.createElement('button');
        button.setAttribute('onclick', `askRefetchDonator(${userID})`);
        button.appendChild(document.createElement('i')).setAttribute('class', 'fa-solid fa-rotate-right');
        td.appendChild(button);
        break;
      case 11:
        td.setAttribute('class', 'donator-element-' + userID);
        let button2 = document.createElement('button');
        button2.setAttribute('onclick', `askDeleteDonator(${userID})`);
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
  fetchFromServer('/api/moveDonator?donatorID=' + userID + '&status=' + status).then(data => {
    if(!data.data == 200) InfoMessageBox(`Beim Ändern des Status ist etwas schiefgelaufen: \n BackEnd: ${data}`);
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
  fetchFromServer('/api/saveData').then(data => {
    if(data.status == 201) InfoMessageBox(`Aktueller Status wurde erfolgreich gespeichert!`);
    else InfoMessageBox(`Beim Speichern ist etwas schiefgelaufen: \n BackEnd: ${data}`);
  });
}

function setAuthToken(token) {
  document.body.style.cursor = "progress";
  fetchFromServer('/api/saveToken?token=' + token).then(data => {
    if(data.status == 200) InfoMessageBox('Das Token wurde gespeichert!');
    else InfoMessageBox(`Beim Speichern ist etwas schiefgelaufen: \n BackEnd: ${data}`);
  });
}

function setConnection(url) {
  fetchFromServer(url + '/ping', true).then(data => {
    if(data.status == 'pong') {
      console.log('Connection set to: ' + url);
      document.getElementById('server-connection').innerHTML = url;
      InfoMessageBox('Die Verbindung wurde erfolgreich gespeichert!');
      setServerStatus(true);
    }
  }).catch(error => {
    InfoMessageBox(`Beim Verbindungsaufbau zum Server ist etwas schiefgelaufen: \n BackEnd: ${error}`);
    setServerStatus(false);
  });
}

function refetchDonator(userID) {
  console.log('refetching: ' + userID);
  fetchFromServer('/api/getDonator?donatorID=' + userID).then(data => {
    if(data.data) {
      document.getElementById(`donator-${userID}`).replaceWith(createDonatorTr(userID, data.data[userID]));
      document.getElementById(`donation-tr-${userID}`).replaceWith(createDonationTable(data.data[userID].donations, userID));
      InfoMessageBox(`Der Spender ${data.data.familyname} ${data.data.surename} wurde aktualisiert`);
    }
  });
}

function deleteDonator(userID) {
  console.log('deleting: ' + userID);
  fetchFromServer('/api/getDonator?donatorID=' + userID).then(data => {
    if(data.data) {
      document.getElementById(`donator-${userID}`).remove();
      document.getElementById(`donation-tr-${userID}`).remove();
      InfoMessageBox(`Der Spender ${data.data.familyname} ${data.data.surename} wurde gelöscht`);
    }
  });
}

function downloadLatexFile() {
  fetchFromServer('/api/createLatex').then(data => {
    if(data.status == 201) {
      console.log('downloading tex file');
      document.body.style.cursor = "progress";
      fetch(getServerUrl() + '/api/getLatex').then(response => {
        return response.blob();
      }).then(blob => {
          const url = window.URL.createObjectURL(new Blob([blob]));
          const a = document.createElement('a');
          a.href = url;
          a.download = 'bescheinigungen.tex';
          a.click();
      });
    }
  })
}
function fetchSavedState() {
  console.log('fetching last saved state');
  fetchFromServer('/api/loadDataFromFile').then(data => {
    if(data.data) {
      createTableBody(data.data);
      setInfoContainer(data);
      InfoMessageBox(`Der Stand der Daten vom Jahr ${data.year} wurde wiederhergestellt.`);
    }
  }).catch(error => {
    InfoMessageBox(`Beim Laden ist etwas schiefgelaufen: \n BackEnd: ${error}`);
    document.body.style.cursor = "default";
  });
}

function setServerStatus(running) {
  if(running) {
    document.getElementById('server-status-boolean').innerHTML = 1;
    document.getElementById('server-text').innerHTML = 'Server ist erreichbar';
    document.getElementById('server-indicator').setAttribute('style', 'color:rgb(72, 198, 9)');
  } else {
    document.getElementById('server-status-boolean').innerHTML = 0;
    document.getElementById('server-text').innerHTML = 'Server nicht erreichbar';
    document.getElementById('server-indicator').setAttribute('style', 'color: #FF5D55');
  }
}
function getServerStatus() {
  return document.getElementById('server-status-boolean').innerHTML == 1;
}
function getServerUrl() {
  return document.getElementById('server-connection').innerHTML;
}
function setInfoContainer(data) {
  document.getElementById('input-all-donations').value = data.additionalInfo.totalDonationSum;
  document.getElementById('input-all-donators').value = data.additionalInfo.totalDonators;
  document.getElementById('input-checked').value = data.additionalInfo.checkedDonators;
  document.getElementById('input-checkedNotInPool').value = data.additionalInfo.checkedDonatorsNIP;
}

async function fetchFromServer(queryUrl, checkServer = false) {
  if(!getServerStatus() && !checkServer) {
    InfoMessageBox('Der Server ist nicht erreichbar. Bitte überprüfe die Verbindung.');
    throw new Error('Server not reachable');
  }
  document.body.style.cursor = "progress";
  let url = checkServer ? queryUrl : getServerUrl() +  queryUrl;
  console.log('fetching: ' + url);
  let response = await fetch(url);
  let data = await response.json();
  if(data.additionalInfo) setInfoContainer(data);
  document.body.style.cursor = "default";
  return data;
}

//#region MESSAGES
function showMessage (message) {
  document.getElementById('status-content').innerHTML = message;
  showElement('status-container');
}
function InfoMessageBox (message) {
  let messageBox = document.createElement('div');
  let p = document.createElement('p');
  p.appendChild(document.createTextNode(message));
  messageBox.appendChild(p);
  showMessage(messageBox.innerHTML);
}
function YesNoMessageBox (question, yesAction, noAction = undefined){
  let message = document.createElement('div')
  let p = document.createElement('p')
  p.appendChild(document.createTextNode(question))
  let buttonYes = document.createElement('button');
  buttonYes.setAttribute('onclick', yesAction);
  buttonYes.appendChild(document.createTextNode('Ja'));
  let buttonNo = document.createElement('button');
  buttonNo.setAttribute('onclick', noAction || 'hideElement("status-container")');
  buttonNo.appendChild(document.createTextNode('Nein'));
  message.appendChild(p);
  message.appendChild(buttonYes);
  message.appendChild(buttonNo);
  showMessage(message.innerHTML);
}

function InputMessageBox(question, placeholderText, buttonText, buttonAction) {
  let message = document.createElement('div')
  let button = document.createElement('button');
  button.setAttribute('onclick', buttonAction.replace(')','') + 'document.getElementById("status-input").value' + ')');
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
function askRefetchDonator(userID) {
  
  YesNoMessageBox('Soll der Spender wirklich neu von SevDesk abgefragt und der aktuelle Stand überschrieben werden?', 'refetchDonator(' + userID + ')');
}
function askDeleteDonator(userID) {
  YesNoMessageBox('Soll der Spender wirklich gelöscht werden werden?', 'deleteDonator(' + userID + ')');
}
function loadCurrentState() {
  YesNoMessageBox('Soll der aktuelle Stand wirklich mit dem zuletzt gespeicherten Stand überschrieben werden?', 'fetchSavedState()');
}
function showSetAuthToken(){
  InputMessageBox('Hier den API-Schlüssel aus SevDesk einfügen:', 'API-Schlüssel eingeben', 'Schlüssel speichern', 'setAuthToken()');
}
function showSetConnection() {
  InputMessageBox('Hier die Server-URL (z.b. http://raspberry:8040 oder http://192.168.1.20:8040) eingeben. (Standardmäßig http://raspberry:8040, sodass es direkt funktionieren sollte.)', 'Server-URL eingeben', 'Verbindung speichern', 'setConnection()');
}
//#endregion