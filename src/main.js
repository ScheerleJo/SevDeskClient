const path = window.__TAURI__.path;
const { readFile, writeFile } = window.__TAURI__.fs;

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
function setAttributes(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
}
//#endregion

async function loadData() {
  if (await pingServer()) loadStateFromServer();
}

async function fetchNewData() {
  let year = document.getElementById('input-year').value;
  const data= await fetchFromServer('/api/fetchNew?year=' + year)
  if(data.error) {
    InfoMessageBox(`Beim Abrufen der Daten ist etwas schiefgelaufen.  ${data.error}`);
  }else if (data.data){
    createTableBody(data.data);
    InfoMessageBox(`` + Object.keys(data.data).length + ` neue Elemente aus dem Jahr ${year} wurden hinzugefügt`);
  }
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
  setAttributes(tr, { class: 'donator-autocreate-tr', id: `donator-${userID}` });

  tr.appendChild(createCaretTD(element.id));
  tr.appendChild(createDonatorStatusTD(element));
  tr.appendChild(createTextTD(element.familyname));
  tr.appendChild(createTextTD((element.academicTitle == '' ? '' : element.academicTitle + ' ') + element.surename));
  tr.appendChild(createDonatorAddressTD(element.address));
  tr.appendChild(createTextTD(element.donations.length));
  tr.appendChild(createTextTD(element.formattedSum));
  tr.appendChild(createTextTD(element.sumInWords));
  tr.appendChild(createCheckboxTD({ type: 'checkbox', id: `checked-${userID}`, onclick: `changeStatus(${userID})`}, (element.status == 'checked' || element.status == 'checkedNotInPool' || element.status == 'done')));
  tr.appendChild(createCheckboxTD({ type: 'checkbox', id: `create-${userID}`, onclick: `changeStatus(${userID})`}, (element.status != 'checkedNotInPool')));
  tr.appendChild(createButtonTD('fa-solid fa-rotate-right', `askRefetchDonator(${userID})`));
  tr.appendChild(createButtonTD('fa-solid fa-trash', `askDeleteDonator(${userID})`));
  return tr;
}

function createTextTD(text) {
  let td = document.createElement('td');
  td.appendChild(document.createTextNode(text));
  return td
}
function createCaretTD(userID) {
  let a = document.createElement('a');
  setAttributes(a, { id: `caret-${userID}`, onclick: `toggleCaret('caret-${userID}')`, class: 'fa-solid fa-caret-right' })
  let td = document.createElement('td');
  td.appendChild(a);
  return td;
}
function createDonatorStatusTD(element) {
  let i = document.createElement('i');
  i.setAttribute('id', 'status-' + element.id);
  setStatusIcon(element.id, element.status, i);
  td = document.createElement('td');
  td.appendChild(i);
  return td;
}
function createDonatorAddressTD(address) {
  let td = document.createElement('td');
  let text = document.createTextNode((address.street ||'') +'\n' + (address.zip || '') + ' ' + (address.city || '') + '\n' + (address.country || ''))
  td.setAttribute('style', 'white-space: pre-wrap; word-wrap: break-word;');
  td.appendChild(text);
  return td;
}
function createButtonTD(icon, buttonAction) {
  let button = document.createElement('button');
  button.setAttribute('onclick', buttonAction);
  button.setAttribute('class', icon);
  let td = document.createElement('td');
  td.appendChild(button);
  return td;
}
function createCheckboxTD(options, checked = false) {
  let input = document.createElement('input');
  if(checked) options.checked = 'true';
  setAttributes(input, options);
  let td = document.createElement('td');
  td.appendChild(input);
  return td;
}

function setStatusIcon(userID, status, icon = undefined) {
  let i = icon || document.getElementById('status-' + userID);
  let options = {}
  switch (status) {
    case 'unchecked': options = { class: 'fa-lg fa-solid fa-triangle-exclamation', style: 'color: #FEC63D' }; break;
    case 'checked': options = { class: 'fa-lg fa-regular fa-circle-check', style: 'color: #629C44' }; break;
    case 'checkedNotInPool': options = { class: 'fa-lg fa-solid fa-circle-check', style: 'color: #D6D6D6' }; break;
    case 'done': options = { class: 'fa-lg fa-solid fa-circle-check', style: 'color: #629C44' }; break;
    default: options = { class: 'fa-lg fa-solid fa-circle-exclamation', style: 'color: #FF5D55' }; break;
  }
  setAttributes(i, options);
}

/**
 * Create Table with all Donations Listed in SevDesk to the User above
 * @param  {Array<Array<string>} donations
 * 2 Dimensional Array, with needed info for a Donation per row of Array
 * @param  {number} userID
 * Number of associated User in Table
 */
function createDonationTable(donations, userID) {
  let outerTr = document.createElement('tr');
  setAttributes(outerTr, { class: 'donation-autocreate-tr', id: `donation-tr-${userID}` });
  outerTr.appendChild(document.createElement('td'));

  let outerTd = document.createElement('td');
  outerTd.setAttribute('colspan', 11);

  let innerTbl = document.createElement('table');
  setAttributes(innerTbl, { id: `donation-${userID}`, class: 'donation-table', style: 'display: none' });

  let innerTrHead = document.createElement('tr');
  ['Datum', 'Summe'].forEach(text => {
    let th = document.createElement('th');
    th.appendChild(document.createTextNode(text));
    innerTrHead.appendChild(th);
  });
  innerTbl.appendChild(innerTrHead);

  donations.forEach(donation => {
    let innerTr = document.createElement('tr');
    innerTr.appendChild(createTextTD(donation.date));
    innerTr.appendChild(createTextTD(donation.sum));
    innerTbl.appendChild(innerTr);
  });
  outerTd.appendChild(innerTbl);
  outerTr.appendChild(outerTd);
  return outerTr;
}

async function saveCurrentState() {
  const data= await fetchFromServer('/api/saveData');
  if(data.status == 201) InfoMessageBox(`Aktueller Status wurde erfolgreich gespeichert!`);
  else InfoMessageBox(`Beim Speichern ist etwas schiefgelaufen. ${data}`);
}

async function setAuthToken(token) {
  const data= await fetchFromServer('/api/saveToken?token=' + token)
  if(data.status == 200) InfoMessageBox('Das Token wurde gespeichert!');
  else InfoMessageBox(`Beim Speichern ist etwas schiefgelaufen. ${data}`);
}

async function setConnection(url) {
  if(await pingServer(url)){
    console.log('server reachable at ' + url);
    let filepath = await path.join(await path.resourceDir(), 'config.json');
    let config = { serverUrl: url };
    await writeFile(filepath, new TextEncoder().encode(JSON.stringify(config)));

    InfoMessageBox('Die Verbindung wurde erfolgreich gespeichert!');
  }
}
async function changeStatus(userID) {
  let checked = document.getElementById('checked-' + userID).checked;
  let create = document.getElementById('create-' + userID).checked;

  let status = 'unchecked';
  if(checked && !create) status = 'checkedNotInPool';
  else if(checked)  status = 'checked';

  const data= await fetchFromServer('/api/moveDonator?donatorID=' + userID + '&status=' + status)
  if(!data.data) InfoMessageBox(`Beim Ändern des Status ist etwas schiefgelaufen.  ${data}`);
  else setStatusIcon(userID, data.data[userID].status);
}

async function refetchDonator(userID) {
  const data= await fetchFromServer('/api/getDonator?donatorID=' + userID)
  if(data.data) {
    document.getElementById(`donator-${userID}`).replaceWith(createDonatorTr(userID, data.data[userID]));
    document.getElementById(`donation-tr-${userID}`).replaceWith(createDonationTable(data.data[userID].donations, userID));
    InfoMessageBox(`Der Spender ${data.data.familyname} ${data.data.surename} wurde aktualisiert`);
  }
}

async function deleteDonator(userID) {
  const data = await fetchFromServer('/api/getDonator?donatorID=' + userID)
  if(data.data) {
    document.getElementById(`donator-${userID}`).remove();
    document.getElementById(`donation-tr-${userID}`).remove();
    InfoMessageBox(`Der Spender ${data.data.familyname} ${data.data.surename} wurde gelöscht`);
  }
}

async function downloadLatexFile() {
  if(fetchFromServer('/api/createLatex').status == 201) {
    try {
      const response = await fetch(await getServerUrl() + '/api/getLatex');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bescheinigungen.tex';
      a.click();
    } catch (error) { InfoMessageBox(`Beim Download ist etwas schiefgelaufen! ${error}`); }
  }
}

async function loadStateFromServer(loadFromFile = false) {
  try {
    const data = await fetchFromServer(loadFromFile ? '/api/loadDataFromFile' : '/api/loadData')
    if(data.data) {
      createTableBody(data.data);
      InfoMessageBox(`Der Stand der Daten vom Jahr ${data.year} wurde wiederhergestellt.`);
    }
  } catch(error) { InfoMessageBox(`Beim Laden ist etwas schiefgelaufen! ${error}`);}
}

function setInfoContainer(data) {
  if(document.getElementById('input-year').value == '') document.getElementById('input-year').value = data.year;
  document.getElementById('input-all-donations').value = data.additionalInfo.totalDonationSum;
  document.getElementById('input-all-donators').value = data.additionalInfo.totalDonators;
  document.getElementById('input-checked').value = data.additionalInfo.checkedDonators;
  document.getElementById('input-checkedNotInPool').value = data.additionalInfo.checkedDonatorsNIP;
}

//#region SERVER ROOT-FUNCTIONS
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

async function getServerUrl() {
  let filepath = await path.join(await path.resourceDir(), 'config.json');
  const config = JSON.parse(new TextDecoder().decode(await readFile(filepath)));
  return config.serverUrl;
}

async function fetchFromServer(queryUrl, checkServer = false) {
  let url = checkServer ? queryUrl : await getServerUrl() +  queryUrl;
  if(!getServerStatus() && !checkServer) {
    InfoMessageBox(`Der Server ist an ${url} nicht erreichbar. Bitte überprüfe die Verbindung.`);
    throw new Error('Server not reachable');
  }
  document.body.style.cursor = "progress";
  let response = await fetch(url);
  const data= await response.json();
  if(data.additionalInfo) setInfoContainer(data);
  document.body.style.cursor = "default";
  return data;
}

async function pingServer(baseUrL = undefined) {
  try {
    let url = (baseUrL || await getServerUrl()) + '/ping';
    const data= await fetchFromServer(url, true);
    let success = data.status == 'pong'
    setServerStatus(success);
    return success;
    }
  catch(error) {
    setServerStatus(false);
    InfoMessageBox(`Beim Verbindungsaufbau zum Server mit Adresse ${baseUrL || await getServerUrl()} ist etwas schiefgelaufen! ${error}`);
    return false;
  };
}
//#endregion

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
  setAttributes(input, { type: 'text', class: 'input', id: 'status-input', placeholder: placeholderText });
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
function askLoadSavedState() {
  YesNoMessageBox('Soll der aktuelle Stand wirklich mit dem zuletzt gespeicherten Stand überschrieben werden?', 'loadStateFromServer(true)');
}
function showSetAuthToken(){
  InputMessageBox('Hier den API-Schlüssel aus SevDesk einfügen:', 'API-Schlüssel eingeben', 'Schlüssel speichern', 'setAuthToken()');
}
function showSetConnection() {
  InputMessageBox('Hier die Server-URL (z.b. http://raspberry:8040 oder http://192.168.1.20:8040) eingeben. (Standardmäßig http://raspberry:8040, sodass es direkt funktionieren sollte.)', 'Server-URL eingeben', 'Verbindung speichern', 'setConnection()');
}
function askfetchNewData() {
  if(document.getElementById('autocreate-table-body').textContent != '') {
    YesNoMessageBox('Soll wirklich eine neue Abfrage gestartet werden? Alle bisherigen Änderungen gehen verloren.', 'fetchNewData()');
  } else fetchNewData();
}
//#endregion