let g_hide_completely = null;
let g_ng_input = null;
let g_ng_submit = null;
let g_ng_list = null;
let g_ng_word_list = [];
let g_put_hide_button = true;
let g_hide_size = 16;

function onError(error) {
}

function safeGetValue(value, default_value) {
  if (value === undefined) {
    return default_value;
  } else {
    return value;
  }
}

function saveSetting() {
  browser.storage.local.set({
    hide_completely: g_hide_completely.checked,
    ng_word_list: g_ng_word_list,
    put_hide_button: g_put_hide_button.checked,
    hide_size: g_hide_size.value
  });
}

function addItem(text) {
  let item = document.createElement("div");
  let btn = document.createElement("input");

  btn.type = "button";
  btn.value = "削除";
  btn.addEventListener("click", (e) => {
    item.remove();
    g_ng_word_list = g_ng_word_list.filter((value, indedx, array) => {
      return value != text;
    });
    saveSetting();
  })

  item.appendChild(btn);
  item.appendChild(document.createTextNode(text));
  g_ng_list.appendChild(item);
}

function setCurrentChoice(result) {
  g_hide_completely.checked = safeGetValue(result.hide_completely, false);
  g_put_hide_button.checked = safeGetValue(result.put_hide_button, true);
  g_hide_size.value = safeGetValue(result.hide_size, 16);
  g_ng_word_list = safeGetValue(result.ng_word_list, []);

  for (let i = 0; i < g_ng_word_list.length; ++i) {
    addItem(g_ng_word_list[i]);
  }
}

function onLoad() {
  g_hide_completely = document.getElementById("hide_completely");
  g_ng_input = document.getElementById("ng_input");
  g_ng_submit = document.getElementById("ng_submit");
  g_ng_list = document.getElementById("ng_list");
  g_put_hide_button = document.getElementById("put_hide_button");
  g_hide_size = document.getElementById("hide_size");
  g_hide_completely.addEventListener("change", (e) => {
    saveSetting();
  });

  g_put_hide_button.addEventListener("change", (e) => {
    saveSetting();
  });
  
  g_hide_size.addEventListener("change", (e) => {
    saveSetting();
  });

  g_ng_input.addEventListener("keypress", (e) => {
    if (e.key == "Enter" && g_ng_input.value != "") {
      addItem(g_ng_input.value);
      g_ng_word_list.push(g_ng_input.value);
      g_ng_input.value = "";
      saveSetting();
    }
  });

  g_ng_submit.addEventListener("click", (e) => {
    if (g_ng_input.value != "") {
      addItem(g_ng_input.value);
      g_ng_word_list.push(g_ng_input.value);
      g_ng_input.value = "";
      saveSetting();
    }
  });

  browser.storage.local.get().then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", onLoad);