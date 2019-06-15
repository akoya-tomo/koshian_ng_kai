/* globals board_list */

let g_ng_input = null;
let g_ng_submit = null;
let g_ng_word_list = [];
let g_check_body = null;
let g_check_header = null;
let g_ignore_case = null;
let g_temporary_regist = null;
let g_board_list = null;

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
        ng_word_list: g_ng_word_list
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
    g_temporary_regist = document.getElementById("temporary_regist");
    g_board_list = document.getElementById("board_list");

    g_check_body.checked = "checked";

    g_ng_input.addEventListener("keypress", (e) => {
        if (e.key == "Enter") addNgWord();
    });

    g_ng_submit.addEventListener("click", addNgWord);

    browser.tabs.query({active: true}, function(tab) {
        browser.tabs.sendMessage(tab[0].id, {id:"koshian_ng_popup"}, function(response) {
            if (response) {
                g_ng_input.value = response.selection.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
                let board_id = response.board_id;
                if (board_id) {
                    let opt = document.createElement("option");
                    opt.value = board_id;
                    opt.text = board_list[board_id].name;
                    g_board_list.insertBefore(opt, g_board_list.firstElementChild.nextSibling);
                }
            }
        });
    });

    browser.storage.local.get().then(setCurrentChoice, onError);

    for (let key in board_list) {
        let opt = document.createElement("option");
        opt.value = key;
        opt.text = board_list[key].name;
        opt.disabled = board_list[key].disabled ? true : false;
        g_board_list.appendChild(opt);
    }

    /**
     * NGワード追加
     */
    function addNgWord() {
        if (g_ng_input.value === "") return;
        // 登録と重複したワードを削除
        g_ng_word_list = g_ng_word_list.filter((value) => {
            return value[0] != g_ng_input.value || value[6] != g_board_list.value;
        });

        g_ng_word_list.push([g_ng_input.value, g_check_body.checked, g_check_header.checked, g_ignore_case.checked, g_temporary_regist.checked, null, g_board_list.value]);
        g_ng_input.value = "";
        saveSetting();
        alert("NGワードを登録しました");
    }
}

document.addEventListener("DOMContentLoaded", onLoad);