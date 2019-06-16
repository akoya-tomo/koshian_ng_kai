/* globals board_list */

const CHECK_BOX_NUM = 4;  // NGワードのワード当たりのチェックボックスの数
const CHECK_BOX_MAX_NUM = 5;  // NGワードのワード当たりの最大チェックボックス数（5で固定）

let g_hide_completely = null;
let g_ng_input = null;
let g_ng_submit = null;
let g_ng_list = null;
let g_ng_word_list = [];
let g_check_body = null;
let g_check_header = null;
let g_ignore_case = null;
let g_temporary_regist = null;
let g_board_list = null;
let g_put_hide_button = null;
let g_hide_size = null;
let g_use_contextmenu = null;
let g_regist_id_temp = null;
let g_regist_ip_temp = null;
let g_file = null;
let g_import = null;
let g_alert = null;
let g_export = null;
let g_export_a  = null;
let g_max_threads = null;

/* eslint indent: ["warn", 2] */

function onError(error) { // eslint-disable-line no-unused-vars
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
    hide_size: g_hide_size.value,
    use_contextmenu: g_use_contextmenu.checked,
    regist_id_temp: g_regist_id_temp.checked,
    regist_ip_temp: g_regist_ip_temp.checked,
    max_threads: g_max_threads.value
  });
}

/**
 * NGワードリストにNGワードを追加
 * @param {string} text 追加するNGワード
 * @param {Array.<boolean>} check 追加するNGワードのチェックボックスの状態
 * @param {string} board_id 追加する対象板ID
 */
function addItem(text, check, board_id = "") {
  let item = document.createElement("div");
  let btn = document.createElement("input");
  let div = [], check_box = [];

  btn.type = "button";
  btn.value = "削除";
  btn.className = "col_btn";
  btn.addEventListener("click", (e) => {  // eslint-disable-line no-unused-vars
    let result = window.confirm(`${text}を削除してもよろしいですか？`);
    if (result) {
      item.remove();
      g_ng_word_list = g_ng_word_list.filter((value) => {
        return value[0] != text || value[6] != board_id;
      });
      saveSetting();
    }
  });
  item.appendChild(btn);

  for (let i = 0; i < CHECK_BOX_NUM; i++){
    check_box[i] = document.createElement("input");
    check_box[i].type = "checkbox";
    check_box[i].checked = check[i];
    check_box[i].style.margin = "auto";
    check_box[i].addEventListener("change", () => {
      let index = g_ng_word_list.findIndex(value => value[0] == text && value[6] == board_id);
      if (index > -1) {
        g_ng_word_list[index][i + 1] = check_box[i].checked;
        saveSetting();
      } else {
        refreshNgList();
      }
    });

    div[i] = document.createElement("div");
    div[i].className = "col_check";
    div[i].appendChild(check_box[i]);
    item.appendChild(div[i]);
  }

  let div_select = document.createElement("div");
  div_select.className = "col_select";
  let select = document.createElement("select");
  select.name = board_id;
  for (let key in board_list) {
    let opt = document.createElement("option");
    opt.value = key;
    opt.text = board_list[key].name;
    opt.disabled = board_list[key].disabled ? true : false;
    opt.selected = key == board_id;
    select.appendChild(opt);
  }
  select.addEventListener("change", () => {
    if (g_ng_word_list.some(value => value[0] == text && value[6] == select.value)) {
      alert("同じNGワードが既にあります");
      refreshNgList();
      return;
    }
    let index = g_ng_word_list.findIndex(value => value[0] == text && value[6] == select.name);
    if (index > -1) {
      g_ng_word_list[index][6] = select.value;
      select.name = select.value;
      saveSetting();
    } else {
      refreshNgList();
    }
  });
  div_select.appendChild(select);
  item.appendChild(div_select);

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
    for (let j = 0; j < CHECK_BOX_NUM; j++) {
      check.push(g_ng_word_list[i][j + 1]);
    }
    addItem(g_ng_word_list[i][0], check, g_ng_word_list[i][6]);
  }
}

function setCurrentChoice(result) {
  g_hide_completely.checked = safeGetValue(result.hide_completely, false);
  g_put_hide_button.checked = safeGetValue(result.put_hide_button, true);
  g_hide_size.value = safeGetValue(result.hide_size, 16);
  g_use_contextmenu.checked = safeGetValue(result.use_contextmenu, false);
  g_regist_id_temp.checked = safeGetValue(result.regist_id_temp, true);
  g_regist_ip_temp.checked = safeGetValue(result.regist_ip_temp, true);
  g_ng_word_list = safeGetValue(result.ng_word_list, []);
  g_max_threads.value = safeGetValue(result.max_threads, 512);

  g_regist_id_temp.disabled = !g_use_contextmenu.checked;
  g_regist_ip_temp.disabled = !g_use_contextmenu.checked;

  refreshNgList();
}

function onLoad() {
  g_hide_completely = document.getElementById("hide_completely");
  g_ng_input = document.getElementById("ng_input");
  g_ng_submit = document.getElementById("ng_submit");
  g_ng_list = document.getElementById("ng_list");
  g_put_hide_button = document.getElementById("put_hide_button");
  g_hide_size = document.getElementById("hide_size");
  g_use_contextmenu = document.getElementById("use_contextmenu");
  g_regist_id_temp = document.getElementById("regist_id_temp");
  g_regist_ip_temp = document.getElementById("regist_ip_temp");
  g_check_body = document.getElementById("check_body");
  g_check_header = document.getElementById("check_header");
  g_ignore_case = document.getElementById("ignore_case");
  g_temporary_regist = document.getElementById("temporary_regist");
  g_board_list = document.getElementById("board_list");
  g_file = document.getElementById("file");
  g_import = document.getElementById("import");
  g_alert = document.getElementById("alert");
  g_export = document.getElementById("export");
  g_export_a = document.getElementById("export_a");
  g_max_threads = document.getElementById("max_threads");

  g_check_body.checked = "checked";

  g_hide_completely.addEventListener("change", saveSetting);
  g_put_hide_button.addEventListener("change", saveSetting);
  g_hide_size.addEventListener("change", saveSetting);
  g_use_contextmenu.addEventListener("change", () => {
    g_regist_id_temp.disabled = !g_use_contextmenu.checked;
    g_regist_ip_temp.disabled = !g_use_contextmenu.checked;
    saveSetting();
  });
  g_regist_id_temp.addEventListener("change", saveSetting);
  g_regist_ip_temp.addEventListener("change", saveSetting);

  g_ng_input.addEventListener("keypress", (e) => {
    if (e.key == "Enter"){
      addNgWord();
    }
  });

  g_ng_submit.addEventListener("click", addNgWord);

  let reader = new FileReader();
  g_file.onchange = (e) => {
    reader.readAsText(e.target.files[0]);
  };
  g_import.addEventListener("click", () =>{
    importCsv(reader.result);
  });
  g_export.addEventListener("click", exportCsv);

  g_max_threads.addEventListener("change", saveSetting);

  for (let key in board_list) {
    let opt = document.createElement("option");
    opt.value = key;
    opt.text = board_list[key].name;
    opt.disabled = board_list[key].disabled ? true : false;
    g_board_list.appendChild(opt);
  }

  browser.storage.local.get().then(setCurrentChoice, onError);

  /**
   * NGワード追加
   */
  function addNgWord() {
    if (g_ng_input.value == "") {
      return;
    }
    // 登録と重複したワードを削除
    g_ng_word_list = g_ng_word_list.filter((value) => {
      return value[0] != g_ng_input.value || value[6] != g_board_list.value;
    });
    // NGリストの表示を更新
    refreshNgList();

    addItem(g_ng_input.value, [g_check_body.checked, g_check_header.checked, g_ignore_case.checked, g_temporary_regist.checked], g_board_list.value);
    g_ng_word_list.push([g_ng_input.value, g_check_body.checked, g_check_header.checked, g_ignore_case.checked, g_temporary_regist.checked, null, g_board_list.value]);
    g_ng_input.value = "";
    saveSetting();
  }
}

/**
 * NGワードCSVファイルインポート
 * @param {string} csv NGワードCSVデータ
 */
function importCsv(csv) {
  if (!csv) {
    g_alert.textContent = "ファイルがありません";
    return;
  }
  let line = csv.split("\n");
  let arr =[];
  if (line[0] !== "KOSHIAN_NG_words") {
    g_alert.textContent = "NGワードファイルではありません";
    return;
  }
  for (let i = 0, line_num = line.length - 1; i < line_num; ++i) {
    if (!line[i + 1]) {
      continue;
    }
    arr[i] = line[i + 1].split(",");
    if (!arr[i][0] || !arr[i][1] || (arr[i][1].toLowerCase() !== "true" && arr[i][1].toLowerCase() !== "false")) {
      g_alert.textContent = "ファイルのデータが異常です";
      return;
    }
  }
  g_ng_word_list = [];
  for (let i = 0, arr_num = arr.length; i < arr_num; ++i) {
    g_ng_word_list[i] = [];
    g_ng_word_list[i].push(decodeURIComponent(arr[i][0]));
    for (let j = 1; j <= CHECK_BOX_NUM; ++j) {
      g_ng_word_list[i].push(arr[i][j] ? arr[i][j].toLowerCase() === "true" : false);
    }
    for (let j = CHECK_BOX_NUM + 1; j <= CHECK_BOX_MAX_NUM; ++j) {
      g_ng_word_list[i].push(null);
    }
    g_ng_word_list[i].push(arr[i][6] ? arr[i][6] : "");
  }
  saveSetting();
  g_alert.textContent = "インポートしました";
}

/**
 * NGワードCSVファイルエクスポート
 */
function exportCsv() {
  let csv = "KOSHIAN_NG_words\n";
  for (let i = 0; i < g_ng_word_list.length; i++) {
    let ng_word_data = g_ng_word_list[i];
    for (let j = 0; j < ng_word_data.length; j++) {
      let str = ng_word_data[j] === null ? "" : ng_word_data[j].toString();
      if (j > 0) csv += ",";
      csv += encodeURIComponent(str);
    }
    csv += "\n";
  }
  g_export_a.href = "data:text/csv," + encodeURIComponent(csv);
  g_export_a.download = "KOSHIAN_NG_words_" + getDate() + ".csv";
  g_export_a.click();
}

/**
 * 日付取得
 * @return {string} 現在の日付の文字列 yymmdd_hhmmss
 */
function getDate() {
  let now = new Date();
  let date = ("" + now.getFullYear()).slice(-2) +
    ("0" + (now.getMonth() + 1)).slice(-2) +
    ("0" + now.getDate()).slice(-2) + "_" +
    ("0" + now.getHours()).slice(-2) +
    ("0" + now.getMinutes()).slice(-2) +
    ("0" + now.getSeconds()).slice(-2);
  return date;
}

function onSettingChanged(changes, areaName) {
  if (areaName != "local") {
    return;
  }

  if (changes.ng_word_list) {
    g_ng_word_list = safeGetValue(changes.ng_word_list.newValue, []);
    refreshNgList();
  }
}

document.addEventListener("DOMContentLoaded", onLoad);
browser.storage.onChanged.addListener(onSettingChanged);
