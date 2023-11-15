const { invoke } = window.__TAURI__.tauri;

let greetInputEl;
let greetMsgEl;

setListingStatus();


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
    Default: send alert with warning and display all Donations no matter what state

  */
  switch (state){
    case 0:


    break;
    case 1:



    break;
    case 2:


    break;
    default:


    break;
  }
}

