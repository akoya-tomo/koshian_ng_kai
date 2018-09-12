const check_box_num = 3;  // NGワードのワード当たりのチェックボックスの数

let g_hide_completely = null;
let g_ng_input = null;
let g_ng_submit = null;
let g_ng_list = null;
let g_ng_word_list = [];
let g_check_body = null;
let g_check_header = null;
let g_ignore_case = null;
let g_put_hide_button = true;
let g_hide_size = 16;

/* eslint indent: ["warn", 2] */

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

/**
 * NGワードリストにNGワードを追加
 * @param {string} text 追加するNGワード
 * @param {Array.<boolean>} check 追加するNGワードのチェックボックスの状態
 */
function addItem(text, check) {
  let item = document.createElement("div");
  let btn = document.createElement("input");
  let div = [], check_box = [];

  btn.type = "button";
  btn.value = "削除";
  btn.className = "col_btn";
  btn.addEventListener("click", (e) => {
    item.remove();
    g_ng_word_list = g_ng_word_list.filter((value) => {
      return value[0] != text;
    });
    saveSetting();
  });
  item.appendChild(btn);

  for (let i = 0; i < check_box_num; i++){
    check_box[i] = document.createElement("input");
    check_box[i].type = "checkbox";
    check_box[i].checked = check[i];
    check_box[i].style.margin = "auto";
    check_box[i].addEventListener("click", (e) => {
      for (let j = 0; j < g_ng_word_list.length; ++j) {
        if (g_ng_word_list[j][0] == text) {
          g_ng_word_list[j][i + 1] = check_box[i].checked;
          break;
        }
      }
      saveSetting();
    });

    div[i] = document.createElement("div");
    div[i].className = "col_check";
    div[i].appendChild(check_box[i]);
    item.appendChild(div[i]);
  }

  item.appendChild(document.createTextNode("　" + text));
  g_ng_list.appendChild(item);
}

/**
 * NGリスト更新
 */
function refreshNgList() {
  g_ng_list.textContent = null; // g_ng_listの子要素を全削除
  for (let i = 0; i < g_ng_word_list.length; ++i) {
    let check =[];
    for (let j = 0; j < check_box_num; j++) {
      check.push(g_ng_word_list[i][j + 1]);
    }
    addItem(g_ng_word_list[i][0], check);
  }
}

function setCurrentChoice(result) {
  g_hide_completely.checked = safeGetValue(result.hide_completely, false);
  g_put_hide_button.checked = safeGetValue(result.put_hide_button, true);
  g_hide_size.value = safeGetValue(result.hide_size, 16);
  g_ng_word_list = safeGetValue(result.ng_word_list, []);

  for (let i = 0; i < g_ng_word_list.length; ++i) {
    let check =[];
    for (let j = 0; j < check_box_num; j++) {
      check.push(g_ng_word_list[i][j + 1]);
    }
    addItem(g_ng_word_list[i][0], check);
  }
}

function onLoad() {
  g_hide_completely = document.getElementById("hide_completely");
  g_ng_input = document.getElementById("ng_input");
  g_ng_submit = document.getElementById("ng_submit");
  g_ng_list = document.getElementById("ng_list");
  g_put_hide_button = document.getElementById("put_hide_button");
  g_hide_size = document.getElementById("hide_size");
  g_check_body = document.getElementById("check_body");
  g_check_header = document.getElementById("check_header");
  g_ignore_case = document.getElementById("ignore_case");

  g_check_body.checked = "checked";

  g_hide_completely.addEventListener("change", saveSetting);

  g_put_hide_button.addEventListener("change", saveSetting);
  
  g_hide_size.addEventListener("change", saveSetting);

  g_ng_input.addEventListener("keypress", (e) => {
    if (e.key == "Enter") addNgWord();
  });

  g_ng_submit.addEventListener("click", addNgWord);

  browser.storage.local.get().then(setCurrentChoice, onError);

  /**
   * NGワード追加
   */
  function addNgWord() {
    if (g_ng_input.value == "") return;

    // 登録と重複したワードを削除
    g_ng_word_list = g_ng_word_list.filter((value) => {
      return value[0] != g_ng_input.value;
    });
    // NGリストの表示を更新
    refreshNgList();

    addItem(g_ng_input.value, [g_check_body.checked, g_check_header.checked, g_ignore_case.checked]);
    g_ng_word_list.push([g_ng_input.value, g_check_body.checked, g_check_header.checked, g_ignore_case.checked]);
    g_ng_input.value = "";
    saveSetting();
  }
}

function onSettingChanged(changes, areaName) {
  if (areaName != "local") {
    return;
  }

  let changed_items = Object.keys(changes);
  for (let item of changed_items) {
    if (item == "hide_completely") {
      g_hide_completely.checked = safeGetValue(changes.hide_completely.newValue, false);
    }
    if (item == "ng_word_list") {
      g_ng_word_list = safeGetValue(changes.ng_word_list.newValue, []);
    }
    if (item == "put_hide_button") {
      g_put_hide_button.checked = safeGetValue(changes.put_hide_button.newValue, true); 
    }
    if (item == "hide_size") {
      g_hide_size.value = safeGetValue(changes.hide_size.newValue, 16);
    }
  }
  refreshNgList();
}

document.addEventListener("DOMContentLoaded", onLoad);
browser.storage.onChanged.addListener(onSettingChanged);
