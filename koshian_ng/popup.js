let g_ng_input = null;
let g_ng_submit = null;
let g_ng_word_list = [];
let g_check_body = null;
let g_check_header = null;
let g_ignore_case = null;

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
    ng_word_list: g_ng_word_list,
  });
}

function setCurrentChoice(result) {
  g_ng_word_list = safeGetValue(result.ng_word_list, []);
}

function onLoad() {
  g_ng_input = document.getElementById("ng_input");
  g_ng_submit = document.getElementById("ng_submit");
  g_check_body = document.getElementById("check_body");
  g_check_header = document.getElementById("check_header");
  g_ignore_case = document.getElementById("ignore_case");

  console.log("res.js selection_text: " + window.getSelection().toString());
  g_ng_input.value = window.getSelection().toString();
  g_check_body.checked = "checked";

  g_ng_input.addEventListener("keypress", (e) => {
    if (e.key == "Enter" && g_ng_input.value != "") {
      //登録と重複したワードを削除
      g_ng_word_list = g_ng_word_list.filter((value, index, array) => {
        return value[0] != g_ng_input.value;
      });

      g_ng_word_list.push([g_ng_input.value, g_check_body.checked, g_check_header.checked, g_ignore_case.checked]);
      g_ng_input.value = "";
      saveSetting();
      alert("NGワードを登録しました");
    }
  });

  g_ng_submit.addEventListener("click", (e) => {
    if (g_ng_input.value != "") {
      //登録と重複したワードを削除
      g_ng_word_list = g_ng_word_list.filter((value, index, array) => {
        return value[0] != g_ng_input.value;
      });

      g_ng_word_list.push([g_ng_input.value, g_check_body.checked, g_check_header.checked, g_ignore_case.checked]);
      g_ng_input.value = "";
      saveSetting();
      alert("NGワードを登録しました");
    }
  });

  browser.storage.local.get().then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", onLoad);