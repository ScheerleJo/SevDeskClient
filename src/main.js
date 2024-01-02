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



// document.getElementById('input-year').value;

function showElement(elementID) {
  let element = document.getElementById(elementID);
  element.style.display = "block";
}
function hideElement(elementID) {
  let element = document.getElementById(elementID);
  element.style.display = "none";
}

function toggleCaret(elementID) {
  let donationTblID = 'donation-' + elementID.split('-')[1];
  let donationTbl = document.getElementById(donationTblID);
  let anchorCaret = document.getElementById(elementID);
  let anchorContentRight = '<i class="fa-solid fa-caret-right" aria-hidden="true"></i>'
  if(anchorCaret.innerHTML == anchorContentRight) {
    showElement(donationTblID);
    anchorCaret.innerHTML = '<i class="fa-solid fa-caret-down" aria-hidden="true"></i>';
  } else {
    hideElement(donationTblID);
    anchorCaret.innerHTML = '<i class="fa-solid fa-caret-right" aria-hidden="true"></i>';
  }
}

function setStartStatus() {
  showElement('start-container');
  hideElement('listing-container');
}
function setListingStatus(state) {
  showElement('listing-container');
  hideElement('start-container');
  showTable(status);
}

function showTable(status) {
  /*
    Info: State 0: click on Tab 'open'
    Info: State 1: click on Tab 'check'
    Info: State 2: click on Tab 'done'
  */
  
  createUserTable(status);
}

function createUserTable(status) {
  if(document.getElementsByClassName('donator-autocreate-tr').firstChild != undefined) {
    return false;                                                                  
  } else {
    let url = 'http://localhost:8040/getDonations?year=2023';
    fetch(url).then(response => response.json()).then(data => {
      setTimeout(() => {
        let tblBody = document.getElementById('autocreate-table-body');
        for (let userIndex = 0; userIndex < data.length; userIndex++) {
          const element = data[userIndex];
          tblBody.appendChild(createDonatorTr(userIndex, element));
          createDonationTable(element.Donations, userIndex);
        }
        return true;
      }, 100);
    });
  }
}


function createDonatorTr(index, element) {
  let tr = document.createElement('tr');
  tr.setAttribute('class', 'donator-autocreate-tr');
  tr.setAttribute('id', `donator-${index}`);
  for (let j = 0; j < 11; j++) {
    let td = document.createElement('td');
    td.setAttribute('class', `donator-element-${index}`);
    switch (j) {
      case 0: 
        td.setAttribute('class', 'align-center');
        let input = document.createElement('input')
        input.setAttribute('class', 'checkbox-done')
        input.setAttribute('type', 'checkbox');
        td.appendChild(input);
        break;
        case 1:
          td.setAttribute('class', 'align-center caret');
          let a = document.createElement('a');
          a.setAttribute('id', `caret-${index}`);
          a.setAttribute('href', '#');
          a.setAttribute('onclick', `toggleCaret('caret-${index}')`);
          let i = document.createElement('i');
          i.setAttribute('class', 'fa-solid fa-caret-down');
          a.appendChild(i);
          td.appendChild(a);
          break;
      case 2: td.appendChild(createDonatorSpan(element.CustomerNumber)); break;
      case 3: td.appendChild(createDonatorSpan(element.AcademicTitle)); break;
      case 4: 
        if(element.Familyname == "") td.setAttribute('colspan', 2);
        td.appendChild(createDonatorSpan(element.Surename)); 
        break;
      case 5: 
        if(element.Familyname == "") continue;
        td.appendChild(createDonatorSpan(element.Familyname));
        break;
      case 6: td.appendChild(createDonatorSpan(element.Street)); break;
      case 7: td.appendChild(createDonatorSpan(element.ZipCity)); break;
      case 8: td.appendChild(createDonatorSpan(element.Country)); break;
      case 9: td.appendChild(createDonatorSpan(element.TotalSum)); break;
      case 10: td.appendChild(createDonatorSpan(element.SumInWords)); break;      
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

/**
 * Create Table with all Donations Listed in SevDesk to the User above
 * @param  {Array<Array<string>} donations
 * 2 Dimensional Array, with needed info for a Donation per row of Array
 * @param  {number} userIndex
 * Number of associated User in Table
 */
function createDonationTable(donations, userIndex) {
  //Info: donations Sample = [[Date, Type, Waive, Sum], [Date, Type, Waive, Sum], [...], ...]
  if(document.getElementById(`donation-${userIndex}`) != undefined) {
    return false;                                                                  
  }
  //#region CREATE SPACE FOR DONATION TABLE in DONATOR-TABLE
  
  let tblBody = document.getElementById('autocreate-table-body');
  let outerTr = document.createElement('tr');
  let outerTd = document.createElement('td');
  outerTr.setAttribute('class', 'donation-autocreate-tr');
  outerTr.appendChild(document.createElement('td'));
  outerTd.setAttribute('colspan', 9);

  //#endregion
  
  //#region CREATE DONATION-TABLE-HEAD
  let innerTbl = document.createElement('table');
  innerTbl.setAttribute('id', `donation-${userIndex}`);
  innerTbl.setAttribute('class', 'donation-table');
  let innerTrHead = document.createElement('tr');
  
  let innerHeadInfo = ['Datum', 'Art der Zuwendung', 'Verzicht auf Rückerstattung', 'Summe'];
  for (let i = 0; i < innerHeadInfo.length; i++) {
    let innerTh = document.createElement('th');
    innerTh.appendChild(document.createTextNode(innerHeadInfo[i]));
    innerTrHead.appendChild(innerTh);
  }

  //#endregion
  
  //#region CREATE DONATION-TABLE-BODY (FOR EACH DONATION in 'donations')
  innerTbl.appendChild(innerTrHead);
  for (let i = 0; i < donations.length; i++) {
    const element = donations[i];
    let innerTr = document.createElement('tr');
    
    innerTr.appendChild(createDonationTd(element.Date));
    innerTr.appendChild(createDonationTd(element.Type));
    innerTr.appendChild(createDonationTd(element.Waive));
    innerTr.appendChild(createDonationTd(element.Sum));

    innerTbl.appendChild(innerTr);
  }
  //#endregion
  outerTd.appendChild(innerTbl);
  outerTr.appendChild(outerTd);
  tblBody.appendChild(outerTr);

  toggleCaret(`caret-${userIndex}`);
  return true;
}

function createDonationTd(donationElement) {
  let innerTd = document.createElement('td');
  innerTd.appendChild(document.createTextNode(donationElement));
  return innerTd
}

function clearAllOnStartUp(){
  let tblBody = document.getElementById('autocreate-table-body');
  while (tblBody.firstChild) {
    tblBody.removeChild(tblBody.firstChild);
  }
}

clearAllOnStartUp();
