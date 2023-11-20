DocumentType = module;

// import { appWindow } from "@tauri-apps/api/window";
const tauriWindow = require('@tauri-apps/api/window');
// const appWindow = tauriAppWindow.appWindow;
const { invoke } = window.__TAURI__.tauri;

module.exports = {
  closeWindow,
  toggleMaximize,
  minimizeWindow,
  setStartStatus,
  setListingStatus,
  toggleCaret,
  getData,
  showTable
}

let greetInputEl;
let greetMsgEl;





let userInfo = [
  // [
  //   customernumber,
  //   title,
  //   firstName,
  //   lastName,
  //   streetNumber,
  //   postalCodeCity,
  //   donationSum,
  //   [
  //     ['01.01.2023', 'Spende', 'Verzicht auf Spendenbescheinigung', '250€'],
  //     ['01.02.2023', 'Spende', 'Verzicht auf Rückerstattung', '250€'],
  //     ['01.03.2023', 'Spende', 'Verzicht', '250€']],
  //   state
  // ],
  [
    '1',
    'title',
    'firstName',
    'lastName',
    'streetNumber',
    '74343 Hohenhaslach',
    'donationSum',
    [
      ['01.01.2023', 'Spende', 'Verzicht auf Spendenbescheinigung', '250€'],
      ['01.02.2023', 'Spende', 'Verzicht auf Rückerstattung', '250€'],
      ['01.03.2023', 'Spende', 'Verzicht', '250€']], 0
  ],
  [
    '2',
    'title',
    'firstName',
    'lastName',
    'streetNumber',
    'postalCodeCity',
    'donationSum',
    [
      ['01.01.2023', 'Spende', 'Verzicht auf Spendenbescheinigung', '250€'],
      ['01.02.2023', 'Spende', 'Verzicht auf Rückerstattung', '250€'],
      ['01.03.2023', 'Spende', 'Verzicht', '250€']], 0
],];


async function greet() {
  // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
  greetMsgEl.textContent = await invoke("greet", { name: greetInputEl.value });
}

window.addEventListener("DOMContentLoaded", () => {
  greetInputEl = document.querySelector("#greet-input");
  greetMsgEl = document.querySelector("#greet-msg");
  document.querySelector("#greet-form").addEventListener("submit", (e) => {
    e.preventDefault();
    greet();
  });
});

function closeWindow() {
  tauriWindow.appWindow.close();
}
function toggleMaximize(){
  tauriWindow.appWindow.toggleMaximize();
}
function minimizeWindow(){
  tauriWindow.appWindow.minimize();
}

// document
  // .getElementById('titlebar-minimize')
  // .addEventListener('click', () => appWindow.minimize())
// document
  // .getElementById('titlebar-maximize')
  // .addEventListener('click', () => appWindow.toggleMaximize())
// document
  // .getElementById('titlebar-close')
  // .addEventListener('click', () => appWindow.close())



document.getElementById('input-year').value = new Date().getFullYear()

function showElement(elementID) {
  let element = document.getElementById(elementID);
  element.style.display = "block";
}
function hideElement(elementID) {
  let element = document.getElementById(elementID);
  element.style.display = "none";
}

function toggleCaret(elementID) {
  let donationTbl = document.getElementById('donation-' + elementID.split('-')[1]);
  let anchorCaret = document.getElementById(elementID).firstChild;
  let anchorContentRight = '<i class="fa-solid fa-caret-right"></i>'
  if(anchorCaret.innerHTML == anchorContentRight) {
    donationTbl.style.display = "block";
    anchorCaret.innerHTML = '<i class="fa-solid fa-caret-down"></i>';
  } else {
    donationTbl.style.display = "none";
    anchorCaret.innerHTML = '<i class="fa-solid fa-caret-right"></i>';
  }
}
function getData() {
  let data = [
    // [
    //   customernumber,
    //   title,
    //   firstName,
    //   lastName,
    //   streetNumber,
    //   postalCodeCity,
    //   donationSum,
    //   [
    //     ['01.01.2023', 'Spende', 'Verzicht auf Spendenbescheinigung', '250€'],
    //     ['01.02.2023', 'Spende', 'Verzicht auf Rückerstattung', '250€'],
    //     ['01.03.2023', 'Spende', 'Verzicht', '250€']],
    //   state
    // ],
    [
      '1',
      'title',
      'firstName',
      'lastName',
      'streetNumber',
      '74343 Hohenhaslach',
      'donationSum',
      [
        ['01.01.2023', 'Spende', 'Verzicht auf Spendenbescheinigung', '250€'],
        ['01.02.2023', 'Spende', 'Verzicht auf Rückerstattung', '250€'],
        ['01.03.2023', 'Spende', 'Verzicht', '250€']], 0
    ],
    [
      '2',
      'title',
      'firstName',
      'lastName',
      'streetNumber',
      'postalCodeCity',
      'donationSum',
      [
        ['01.01.2023', 'Spende', 'Verzicht auf Spendenbescheinigung', '250€'],
        ['01.02.2023', 'Spende', 'Verzicht auf Rückerstattung', '250€'],
        ['01.03.2023', 'Spende', 'Verzicht', '250€']], 0
  ],];;

  return data;

}
function setStartStatus() {
  showElement('start-container');
  hideElement('listing-container');
}
function setListingStatus(state) {
  showElement('listing-container');
  hideElement('start-container');
  showTable(state);
}

function showTable(state) {
  /*
    State 0: click on Tab 'open'
    State 1: click on Tab 'check'
    State 2: click on Tab 'done'
  */
  let data = getData()   //TODO: Code the process of getting all Data to display in the table

  
  createUserTable(data, state);
}

function createUserTable(userInfo, state) {

  let tblBody = document.getElementById('autocreate-table-body');
  for (let userIndex = 0; userIndex < userInfo.length; userIndex++) {
    let tr = document.createElement('tr');
    tr.setAttribute('class', 'donator-autocreate-tr');
    tr.setAttribute('id', `donator-${userIndex}`);
    for (let j = 0; j < 9; j++) {
      let td = document.createElement('td');
      td.setAttribute('class', `donator-element-${j}`);
      if (j == 0) {
        td.setAttribute('class', 'align-center caret');
        td.setAttribute('id', `caret-${userIndex}`);
        let a = document.createElement('a');
        a.setAttribute('href', '#');
        a.setAttribute('onclick', `toggleCaret('caret-${userIndex}')`);
        let i = document.createElement('i');
        i.setAttribute('class', 'fa-solid fa-caret-down');
        a.appendChild(i);
        
        td.appendChild(a);
      } else if (j == 1) {
        td.setAttribute('class', 'align-center');
        let input = document.createElement('input')
        input.setAttribute('class', 'checkbox-done')
        input.setAttribute('type', 'checkbox');

        td.appendChild(input);
      } else {
        let span = document.createElement('span');
        span.appendChild(document.createTextNode(userInfo[userIndex][j - 2]));
        td.appendChild(span);
      }
      tr.appendChild(td);
    }
    tblBody.appendChild(tr);
    let donationInfo = userInfo[userIndex][7];
    createDonationTable(donationInfo, userIndex);
  }
}

/**
 * Create Table with all Donations Listed in SevDesk to the User above
 * @param  {Array<Array<string>} donationInfo
 * 2 Dimensional Array, with needed info for a Donation per row of Array
 * @param  {number} userIndex
 * Number of associated User in Table
 */
function createDonationTable(donationInfo, userIndex) {
  // donationInfo Sample = [[date, type, waive, sum], [date, type, waive, sum], [...], ...]
  if(document.getElementById(`donation-${userIndex}`) != undefined) {
    return false;
  }
  let tblBody = document.getElementById('autocreate-table-body');
  let outerTr = document.createElement('tr');
  let outerTd = document.createElement('td');
  outerTr.setAttribute('class', 'donation-autocreate-tr');
  outerTr.appendChild(document.createElement('td'));
  
  let innerTbl = document.createElement('table');
  innerTbl.setAttribute('id', `donation-${userIndex}`);
  innerTbl.setAttribute('class', 'donation-table');
  let innerTrHead = document.createElement('tr');
  
  let innerHeadInfo = ['Datum', 'Art', 'Verzicht', 'Betrag'];
  for (let i = 0; i < innerHeadInfo.length; i++) {
    let innerTh = document.createElement('th');
    innerTh.appendChild(document.createTextNode(innerHeadInfo[i]));
    innerTrHead.appendChild(innerTh);
  }
  innerTbl.appendChild(innerTrHead);
  for (let i = 0; i < donationInfo.length; i++) {
    const element = donationInfo[i];
    let innerTr = document.createElement('tr');
    for (let j = 0; j < 4; j++) {
      let innerTd = document.createElement('td');
      innerTd.appendChild(document.createTextNode(element[j]));
      innerTr.appendChild(innerTd);
    }
    innerTbl.appendChild(innerTr);
  }
  outerTd.setAttribute('colspan', 8);
  outerTd.appendChild(innerTbl);
  outerTr.appendChild(outerTd);
  tblBody.appendChild(outerTr);

  toggleCaret(`caret-${userIndex}`);
  return true;
}

function clearAllOnStartUp(){
  let tblBody = document.getElementById('autocreate-table-body');
  while (tblBody.firstChild) {
    tblBody.removeChild(tblBody.firstChild);
  }
}

clearAllOnStartUp();
