const { invoke } = window.__TAURI__.tauri;

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




document.getElementById('input-your').value = new Date().toUTCString()


function showTable(state) {
  /*
    State 0: click on Tab 'open'
    State 1: click on Tab 'check'
    State 0: click on Tab 'done'
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

