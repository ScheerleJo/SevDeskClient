DocumentType = module;

// import { appWindow } from "@tauri-apps/api/window";
const tauriWindow = require('@tauri-apps/api/window');
// const appWindow = tauriAppWindow.appWindow;
const { invoke } = window.__TAURI__.tauri;

module.exports = {
  setStartStatus,
  setListingStatus,
  toggleCaret,
  gatherData,
  showTable,
  loadData,
  deleteSelectedDonators,
  moveSelectedDonators,
  selectAllCheckboxes,
  saveCurrentState,
  showSetAuthToken,
  setAuthToken
}

/*
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
*/


//#region UTILITY

function showElement(elementID) {
  let element = document.getElementById(elementID);
  element.style.display = "block";
}
function hideElement(elementID) {
  let element = document.getElementById(elementID);
  element.style.display = "none";
}

function setStartStatus() {
  showElement('start-container');
  hideElement('listing-container');
}
function setListingStatus(status) {
  showElement('listing-container');
  hideElement('start-container');
  showTable(status);
}

function showMessage (Message) {
  document.getElementById('status-content').innerHTML = Message;
  showElement('status-container');
}

function toggleCaret(elementID) {
  let donationTblID = 'donation-' + elementID.split('-')[1];
  // let donationTbl = document.getElementById(donationTblID);
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


//#endregion

function loadData() {
  setStartStatus();
  let url = 'http://localhost:8040/loadData';
  fetch(url).then(response => response.json()).then(data => {
    setTimeout(() => {
      let donatorData = data.Data;
      countStatus(donatorData);
      createTableBodies(donatorData);
      document.getElementById('donatorData-storage').innerHTML = JSON.stringify(data);
      document.getElementById('input-year').value = data.Year
      showMessage(`<p id="status-info">Der Stand der Daten vom Jahr ${data.Year} wurde wiederhergestellt.</p>`);
    }, 100);
  });
}


function gatherData() {
  let year = document.getElementById('input-year').value;
  let url = 'http://localhost:8040/fetchNew?year=' + year;
  fetch(url).then(response => response.json()).then(data => {
    setTimeout(() => {
      let donatorData = data.Data;
      countStatus(donatorData);
      createTableBodies(donatorData);
      document.getElementById('donatorData-storage').innerHTML = JSON.stringify(data);
      showMessage(`<p id="status-info">${donatorData.length} neue Elemente aus dem Jahr ${year} wurden hinzugefügt</p>`);
      setListingStatus(0);
    }, 100);
  });

}
/*
  Info: State 0: click on Tab 'open'
  Info: State 1: click on Tab 'check'
  Info: State 2: click on Tab 'done'
*/
function countStatus(data){
  let countOpen = 0;
  let countCheck = 0;
  let countDone = 0;
  for (let i = 0; i < data.length; i++) {
    const element = data[i];
    switch(element.Status) {
      case 0: countOpen++; break;
      case 1: countCheck++; break;
      case 2: countDone++; break;
    }
    document.getElementById('open-jobs-nr').innerHTML = `<center>Offen</center>${countOpen}`;
    document.getElementById('check-jobs-nr').innerHTML = `<center>Prüfen</center>${countCheck}`;
    document.getElementById('successful-jobs-nr').innerHTML = `<center>Abgeschlossen</center>${countDone}`;
  }
}

function createTableBodies(data) {
  let statusBody0 = document.createElement('tbody');
  let statusBody1 = document.createElement('tbody');
  let statusBody2 = document.createElement('tbody');
  statusBody0.setAttribute('id', 'statusBody0');
  statusBody1.setAttribute('id', 'statusBody1');
  statusBody2.setAttribute('id', 'statusBody2');

  for (let i = 0; i < data.length; i++) {
    const element = data[i];
    switch(element.Status) {
      case 0: 
      statusBody0.appendChild(createDonatorTr(i, element)); 
      statusBody0.appendChild(createDonationTable(element.Donations, i))
      break;
      case 1: 
      statusBody1.appendChild(createDonatorTr(i, element)); 
      statusBody1.appendChild(createDonationTable(element.Donations, i))
      break;
      case 2: 
      statusBody2.appendChild(createDonatorTr(i, element)); 
      statusBody2.appendChild(createDonationTable(element.Donations, i))
      break;
    }
  }
  document.getElementById('statusBody0').innerHTML = statusBody0.innerHTML;
  document.getElementById('statusBody1').innerHTML = statusBody1.innerHTML;
  document.getElementById('statusBody2').innerHTML = statusBody2.innerHTML;
}

function showTable(status) {
  let tblBody;
  switch(status) {
    case 0: 
      tblBody = document.getElementById('statusBody0');
      showElement('move-button');
      document.getElementById('listing-header').innerHTML = 'Offen'
      document.getElementById('listing-paragraph').innerHTML = 'sind dabei alle angelegten Spender aus SevDesk, bei denen das automatische Generieren der Bescheinigung noch nicht angestoßen wurde. Hier muss gecheckt werden, ob alle Daten der einzelnen Spender korrekt sind. Ist das der Fall kann für den jeweiligen Spender der Haken geprüft gesetzt werden.'
      document.getElementById('move-button').innerHTML = 'LaTeX Datei aus Ausgewählten Elementen erstellen'
      break;
    case 1: 
      tblBody = document.getElementById('statusBody1'); 
      document.getElementById('listing-header').innerHTML = 'Prüfen'
      document.getElementById('listing-paragraph').innerHTML = 'sind alle Bescheinigungen, die automatisch erstellt wurden und geprüft werden müssen. Hier landen alle Einträge der Spender. Die Ausdrucke werden anhand der Daten erneut auf Richtigkeit geprüft. Nach Setzen des Hakens sind die Spendenbescheinigungen als Abgeschlossen markiert.'
      showElement('move-button');
      document.getElementById('move-button').innerHTML = 'Ausgewählte Geprüft'
      break;
      case 2: 
      tblBody = document.getElementById('statusBody2'); 
      document.getElementById('listing-header').innerHTML = 'Abgeschlossen'
      document.getElementById('listing-paragraph').innerHTML = 'sind alle Spender, deren Bescheinigungen bereits geprüft und abgeschickt sind.'
      hideElement('move-button');
      break;
    default: return;
  }
  let autocreate = document.getElementById('autocreate-table-body');
  autocreate.innerHTML = tblBody.innerHTML;
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
        td.setAttribute('class', 'align-center donator-element-' + index);
        let input = document.createElement('input')
        input.setAttribute('class', 'checkbox-done')
        input.setAttribute('type', 'checkbox');
        td.appendChild(input);
        break;
        case 1:
          td.setAttribute('class', 'align-center caret donator-element-' + index);
          let a = document.createElement('a');
          a.setAttribute('id', `caret-${index}`);
          a.setAttribute('href', '#');
          a.setAttribute('onclick', `toggleCaret('caret-${index}')`);
          let i = document.createElement('i');
          i.setAttribute('class', 'fa-solid fa-caret-right');
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

  //#region CREATE SPACE FOR DONATION TABLE in DONATOR-TABLE
  let outerTr = document.createElement('tr');
  let outerTd = document.createElement('td');
  outerTr.setAttribute('class', 'donation-autocreate-tr');
  outerTr.setAttribute('id', `donation-tr-${userIndex}`);
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

function selectAllCheckboxes() {
  let checked = document.getElementById('check-all').checked
  let tblBody = document.getElementById('autocreate-table-body')
  for(let i = 0, row; row = tblBody.rows[i]; i += 2) {
    let donatorIndex = row.id.split('-')[1];
    let input = row.cells[0].firstChild
    if(checked) {
      input.checked = true;
    } else {
      input.checked = false;
      
    }
  }
  
}

function deleteSelectedDonators() {
  let storedData = JSON.parse(document.getElementById('donatorData-storage').innerHTML);
  let donatorData = storedData.Data;
  let tblBody = document.getElementById('autocreate-table-body');
  let selected = getSelected(tblBody);

  for(let i = 0; i < donatorData.length; i++) {
    for(let j = 0; j < selected.length; j++) {
      if(selected[j] == i) {
        tblBody.removeChild(document.getElementById(`donator-${i}`))
        tblBody.removeChild(document.getElementById(`donation-tr-${i}`))
        let url = 'http://localhost:8040/deleteItem?donatorIndex=' + i; 
        fetch(url).then(response => response.json()).then(data => {
          setTimeout(() => {
            if(data == 400)  showMessage(`<p id="status-info">Beim Löschen des Elements ${i} ist ein Fehler aufgetreten</p>`); 
            else {
              donatorData = data; 
              countStatus(donatorData);
              createTableBodies(donatorData); 
              storedData.Data = donatorData;
              document.getElementById('donatorData-storage').innerHTML = JSON.stringify(storedData);            }
          }, 100);
        });
      }
    }
  }
}

function moveSelectedDonators() {
  let storedData = JSON.parse(document.getElementById('donatorData-storage').innerHTML);
  let donatorData = storedData.Data;
  let tblBody = document.getElementById('autocreate-table-body');
  let selected = getSelected(tblBody);

  for(let i = 0; i < donatorData.length; i++) {
    for(let j = 0; j < selected.length; j++) {
      if(selected[j] == i) {
        tblBody.removeChild(document.getElementById(`donator-${i}`));
        tblBody.removeChild(document.getElementById(`donation-tr-${i}`));
        
        let url = 'http://localhost:8040/moveItem?donatorIndex=' + i; 
        fetch(url).then(response => response.json()).then(data => {
          setTimeout(() => {
            if(data == 400) showMessage(`<p id="status-info">Beim Verschieben des Elements ${i} ist ein Fehler aufgetreten</p>`); 
            else{
              donatorData = data; 
              countStatus(donatorData);
              createTableBodies(donatorData); 
              storedData.Data = donatorData;
              document.getElementById('donatorData-storage').innerHTML = JSON.stringify(storedData);
              if(selected.length - 1 == j) {      // Last Element
                fetch('http://localhost:8040/createLatex').then(response => response.json()).then(data => {
                  setTimeout(() => {
                    try {
                      if(data.Status == 200) showMessage(`<p id="status-info">LaTeX-Datei wurde erstellt und im 'Downloads'-Verzeichnis abgespeichert</p>`);
                      else showMessage(`<p id="status-info">Beim Erstellen der LaTeX-Datei ist etwas schiefgelaufen:\n ${data}</p>`);
                    } catch(error) {
                      showMessage(`<p id="status-info">Beim Erstellen der LaTeX-Datei ist etwas schiefgelaufen:\n ${error}</p>`);
                    }
                  }, 100);
                });
              }
            } 
          }, 100);
        });
      }
    }
  }
}

function getSelected(tblBody) {
  let selected = [];
  for(let i = 0, row; row = tblBody.rows[i]; i += 2) {
    let td = row.cells[0]
    let donatorIndex = row.id.split('-')[1];
    let input = td.firstChild
    if (input.checked) selected.push(donatorIndex);
  }
  return selected;
}

function saveCurrentState() {
  fetch('http://localhost:8040/saveData').then(response => response.json()).then(data => {
    setTimeout(() => {
      console.log(data)
      try {
        if(data.Status == 200) showMessage(`<p id="status-info">Aktueller Status wurde gespeichert und wird beim nächsten Neustart automatisch neu geladen</p>`);
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
  input.setAttribute('type', 'text');
  let p = document.createElement('p');
  p.setAttribute('id', 'auth-info');
  p.appendChild(document.createTextNode('Hier den API-Schlüssel aus SevDesk einfügen:'))
  message.appendChild(p);
  message.appendChild(input);
  message.appendChild(button);
  showMessage(message.innerHTML);
}

function setAuthToken() {

  fetch(`http://localhost:8040/saveToken?token=${document.getElementById('input-authKey').value}`).then(response => response.json()).then(data => {
    setTimeout(() => {
      console.log(data);
      try {
        if(data.Status == 200) showMessage(`<p id="status-info">Das Token wurde gespeichert</p>`);
        else showMessage(`<p id="status-info">Beim Speichern ist etwas schiefgelaufen: \n BackEnd: ${data}</p>`);
      } catch(error) {
        showMessage(`<p id="status-info">Beim Speichern ist etwas schiefgelaufen: \n BackEnd: ${error}</p>`);
      }
      // document.getElementById('input-authKey').value = '';
    }, 100);
  });
}