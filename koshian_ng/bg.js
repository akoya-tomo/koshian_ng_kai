let ng_word_list = [];

function removeMenu(){
    browser.contextMenus.remove("koshian_ng");
}

browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "koshian_ng") {
        let tab_id = tab.id;
        browser.tabs.sendMessage(
            tab_id,
            {id:"koshian_ng_context"}
        );
    }
});

browser.contextMenus.onHidden.addListener(removeMenu);

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.id == "koshian_ng_idip") {
        browser.contextMenus.create({
            id: "koshian_ng",
            title: `NG登録:${message.text}`,
            contexts: ["page"],
            documentUrlPatterns: ["*://*.2chan.net/*/res/*"]
        });
        browser.contextMenus.refresh();
    }
});

function onLoadSetting(result) {
    ng_word_list = safeGetValue(result.ng_word_list, []);
    // 一時的な登録を削除
    ng_word_list = ng_word_list.filter((value) => {
        return !value[4];
    });

    browser.storage.local.set({
        ng_word_list: ng_word_list
    });
}

function safeGetValue(value, default_value) {
    return value === undefined ? default_value : value;
}

browser.storage.local.get().then(onLoadSetting, (err) => {});