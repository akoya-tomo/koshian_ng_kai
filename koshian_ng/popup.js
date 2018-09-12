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

    g_check_body.checked = "checked";

    g_ng_input.addEventListener("keypress", (e) => {
        if (e.key == "Enter") addNgWord();
    });

    g_ng_submit.addEventListener("click", addNgWord);

    browser.tabs.query({active: true}, function(tab) {
        browser.tabs.sendMessage(tab[0].id, {}, function(response) {
            g_ng_input.value = response.selection.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
        });
    });

    browser.storage.local.get().then(setCurrentChoice, onError);

    /**
     * NGワード追加
     */
    function addNgWord() {
        if (g_ng_input.value === "") return;
        // 登録と重複したワードを削除
        g_ng_word_list = g_ng_word_list.filter((value) => {
            return value[0] != g_ng_input.value;
        });

        g_ng_word_list.push([g_ng_input.value, g_check_body.checked, g_check_header.checked, g_ignore_case.checked]);
        g_ng_input.value = "";
        saveSetting();
        alert("NGワードを登録しました");
    }
}

document.addEventListener("DOMContentLoaded", onLoad);