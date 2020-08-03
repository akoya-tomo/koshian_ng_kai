let hide_id_res = false;
let ng_word_list = [];

function removeMenu(){
    browser.contextMenus.remove("koshian_ng_idip");
    browser.contextMenus.remove("koshian_ng_img");
}

browser.contextMenus.onClicked.addListener((info, tab) => {
    let id, checked = false;
    switch (info.menuItemId) {
        case "koshian_ng_idip":
            id = "koshian_ng_context_idip";
            break;
        case "koshian_ng_img":
            id = "koshian_ng_context_img";
            break;
        case "koshian_ng_popup_menu":
            id = "koshian_ng_context_popup";
            checked = info.checked;
            break;
        default:
            return;
    }
    browser.tabs.sendMessage(
        tab.id, {
            id: id,
            checked: checked
        }
    );
});

browser.contextMenus.onHidden.addListener(removeMenu);

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    let title, contexts;
    switch (message.id) {
        case "koshian_ng_idip":
            title = `NG登録:${message.text}`;
            contexts = ["page"];
            break;
        case "koshian_ng_img":
            title = `NG画像登録:${message.text}`;
            contexts = ["image"];
            break;
        case "koshian_ng_popup_menu":
            browser.contextMenus.update(
                message.id, {
                    checked: message.checked
                }
            );
            return;
        default:
            return;
    }
    browser.contextMenus.create({
        id: message.id,
        title: title,
        contexts: contexts,
        documentUrlPatterns: ["*://*.2chan.net/*/res/*", "*://kako.futakuro.com/futa/*_b/*", "*://tsumanne.net/*/data/*", "*://*.ftbucket.info/*/cont/*"]
    });
    browser.contextMenus.refresh();
    sendResponse();
});

function onLoadSetting(result) {
    hide_id_res = safeGetValue(result.hide_id_res, false);
    ng_word_list = safeGetValue(result.ng_word_list, []);
    // 一時的な登録を削除
    ng_word_list = ng_word_list.filter((value) => {
        return !value[4];
    });
    for (let i = 0; i < ng_word_list.length; ++i) {
        // 未定義のNG対象に空文字（全ての板）を定義
        if (ng_word_list[i][6] == null) {   // undefinedとnullを""に変換
            ng_word_list[i][6] = "";

        // 古い板IDを変換
        } else if (ng_word_list[i][6] == "jun_b") {
            ng_word_list[i][6] = "jun_jun";
        } else if (ng_word_list[i][6] == "dec_b") {
            ng_word_list[i][6] = "dec_dec";
        }
    }

    browser.storage.local.set({
        ng_word_list: ng_word_list
    });

    browser.contextMenus.create({
        id: "koshian_ng_popup_menu",
        title: "IDが表示されたレスを隠す",
        contexts: ["browser_action"],
        type: "checkbox",
        checked: hide_id_res,
        documentUrlPatterns: ["*://*.2chan.net/*/res/*", "*://kako.futakuro.com/futa/*_b/*", "*://tsumanne.net/*/data/*", "*://*.ftbucket.info/*/cont/*"]
    });
}

function safeGetValue(value, default_value) {
    return value === undefined ? default_value : value;
}

browser.storage.local.get().then(onLoadSetting, (err) => {});   // eslint-disable-line no-unused-vars
