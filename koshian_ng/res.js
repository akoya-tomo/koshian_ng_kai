const FUTABA_LIGHTBOX_CLASS = "futaba_lightbox";
const FUTABA_LIGHTBOX_HIDDEN_CLASS = "futaba_lightbox_hidden";

let hide_completely = false;
let ng_word_list = [];
let put_hide_button = true;
let hide_size = 16;
let use_contextmenu = false;
let regist_id_temp = true;
let regist_ip_temp = true;
let max_threads = 512;
let hide_res_list = {};
let have_input = false;
let have_sod = false;
let have_del = false;
let words_changed = false;
let show_deleted_res = false;
let context_idip = null;
let board_id = "";
let thread_id = "";

/**
 * 板ID・スレッドID設定
 *     {string} board_id 板ID文字列（サーバー名_パス名）
 *     {string} thread_id スレッドID文字列（サーバー名_パス名_スレッドNo.）
 */
function setThreadId() {
    let match, server, path;
    switch (document.domain) {
        case "kako.futakuro.com":
            // ふたポ過去ログ
            match = location.href.match(/^https?:\/\/kako.futakuro.com\/futa\/([^/]+)\/(\d+)\//);
            if (match) {
                board_id = match[1];
                thread_id = board_id + "_" + match[2];
            }
            break;
        case "tsumanne.net":
            // 「」ッチー
            match = location.href.match(/^https?:\/\/tsumanne.net\/([^/]+)\/data\//);
            if (match) {
                switch (match[1]) {
                    case "my":
                        board_id = "may_b";
                        break;
                    case "si":
                        board_id = "img_b";
                        break;
                    case "sa":
                        board_id = "dat_b";
                        break;
                }
                if (board_id) {
                    let thre = document.getElementsByClassName("thre")[0];
                    let number = getResponseNumber(thre);
                    if (number) {
                        thread_id = board_id + "_" + number;
                    }
                }
            }
            break;
        case "www.ftbucket.info":
            // ftbucket
            match = location.href.match(/^https?:\/\/www.ftbucket.info\/.+\/cont\/([^./]+)\.2chan.net_([^_/]+)_res_(\d+)\/index.htm/);
            if (match) {
                board_id = match[1] + "_" + match[2];
                thread_id = board_id + "_" + match[3];
            }
            break;
        default:
            // ふたば
            server = document.domain.match(/^[^.]+/);
            path = location.pathname.match(/[^/]+/);
            board_id = server + "_" + path;
            match = location.pathname.match(/\/(\d+)\.htm/);
            if (match) {
                thread_id = board_id + "_" + match[1];
            }
    }
    console.debug("KOSHIAN_ng/res.js - thread_id: " + thread_id);
}

/**
 * レス番号取得
 * @param {HTMLElement} target レス番号を取得するレスのHTML要素(.rtd or .thre)
 * @return {string} レス番号の数字部分。レス番号が無ければ空文字
 */
function getResponseNumber(target) {
    if (target) {
        for (let node = target.firstChild; node; node = node.nextSibling) {
            let node_value = node.nodeValue;
            if (node_value) {
                let match = node_value.match(/No.(\d+)/);
                if (match) {
                    return match[1];
                }
            }
        }
    }
    return "";
}

function fixFormPosition(){
    let form = document.getElementById("ftbl");
    let uform = document.getElementById("ufm");

    if(!form || !uform){
        return;
    }

    if(form.style.position != "absolute"){
        return;
    }

    let rect = uform.getBoundingClientRect();
    let top = rect.y + document.documentElement.scrollTop;
    form.style.top = `${top}px`;
}

function switchNG(e){
    let response = e.target.parentNode;
    let blockquote = response.getElementsByTagName("blockquote")[0];
    let img = response.getElementsByTagName("img")[0];
    let a_img = img? img.parentNode : null;
    let akahuku_preview = response.getElementsByClassName("akahuku_preview_container")[0];

    if(blockquote.style.display == "none"){
        // show
        blockquote.style.display = "block";
        if(a_img){
            a_img.style.display = "block";
            if (a_img.className == FUTABA_LIGHTBOX_HIDDEN_CLASS) {
                a_img.className = FUTABA_LIGHTBOX_CLASS;
            }
        }
        if (akahuku_preview) {
            akahuku_preview.style.display = "";
        }
        e.target.textContent = `[隠す]`;
    }else{
        // hide
        blockquote.style.display = "none";
        if(a_img){
            a_img.style.display = "none";
            if (a_img.className == FUTABA_LIGHTBOX_CLASS) {
                a_img.className = FUTABA_LIGHTBOX_HIDDEN_CLASS;
            }
        }
        if (akahuku_preview) {
            akahuku_preview.style.display = "none";
        }
        e.target.textContent = `[NGワード]`;
    }

    fixFormPosition();
}

function switchHide(e){
    let response = e.target.parentNode;
    let blockquote = response.getElementsByTagName("blockquote")[0];
    let img = response.getElementsByTagName("img")[0];
    let a_img = img ? img.parentNode : null;
    let akahuku_preview = response.getElementsByClassName("akahuku_preview_container")[0];
    let res_number = e.target.name;

    if(blockquote.style.display == "none"){
        // show
        blockquote.style.display = "block";
        if(a_img){
            a_img.style.display = "block";
            if (a_img.className == FUTABA_LIGHTBOX_HIDDEN_CLASS) {
                a_img.className = FUTABA_LIGHTBOX_CLASS;
            }
        }
        if (akahuku_preview) {
            akahuku_preview.style.display = "";
        }
        e.target.textContent = `[隠す]`;
        if (thread_id && res_number) {
            hide_res_list[thread_id] = hide_res_list[thread_id].filter(value => value != res_number);
            browser.storage.local.set({
                hide_res_list: JSON.stringify(hide_res_list)
            });
        }
    }else{
        // hide
        blockquote.style.display = "none";
        if(a_img){
            a_img.style.display = "none";
            if (a_img.className == FUTABA_LIGHTBOX_CLASS) {
                a_img.className = FUTABA_LIGHTBOX_HIDDEN_CLASS;
            }
        }
        if (akahuku_preview) {
            akahuku_preview.style.display = "none";
        }
        e.target.textContent = `[見る]`;
        if (thread_id && res_number) {
            hide_res_list[thread_id].push(res_number);
            browser.storage.local.set({
                hide_res_list: JSON.stringify(hide_res_list)
            });
        }
    }

    fixFormPosition();
}

function hide(block, ng_word){
    let btn = document.createElement("a");
    btn.className = "KOSHIAN_NGSwitch";
    btn.href="javascript:void(0)";
    btn.style.fontSize = `${hide_size}px`;
    btn.onclick = switchNG;
    btn.title = ng_word;

    let response = block.parentNode;
    if(have_sod){
        response.insertBefore(btn, response.getElementsByClassName("sod")[0].nextSibling);
    }else if(have_del){
        response.insertBefore(btn, response.getElementsByClassName("del")[0].nextSibling);
    }else{
        response.insertBefore(btn, block);
    }

    switchNG({target: btn});
}

function hideComopletely(block){
    let response = block.parentNode;
    let img = response.getElementsByTagName("img")[0];
    let a_img = img ? img.parentNode : null;
    for(let node = block.parentNode; node != null; node = node.parentNode){
        if(node.nodeName == "TABLE"){
            node.style.display = "none";
            if(a_img){
                a_img.style.display = "none";
                if (a_img.className == FUTABA_LIGHTBOX_CLASS) {
                    a_img.className = FUTABA_LIGHTBOX_HIDDEN_CLASS;
                }
            }
            break;
        }
    }
}

function show(response){
    let blockquote = response.getElementsByTagName("blockquote")[0];
    let img = response.getElementsByTagName("img")[0];
    let a_img = img ? img.parentNode : null;
    let akahuku_preview = response.getElementsByClassName("akahuku_preview_container")[0];

    if(blockquote.style.display == "none"){
        // show
        blockquote.style.display = "block";
        if(a_img){
            a_img.style.display = "block";
            if (a_img.className == FUTABA_LIGHTBOX_HIDDEN_CLASS) {
                a_img.className = FUTABA_LIGHTBOX_CLASS;
            }
        }
        if (akahuku_preview) {
            akahuku_preview.style.display = "";
        }
    }

    for(let node = response.parentNode; node; node = node.parentNode){
        if(node.nodeName == "TABLE"){
            if(show_deleted_res || node.className != "deleted"){
                node.style.display = "";
                if (a_img && a_img.className == FUTABA_LIGHTBOX_HIDDEN_CLASS) {
                    a_img.className = FUTABA_LIGHTBOX_CLASS;
                }
            }
            break;
        }
    }
}

function putHideButton(block, hide, res_number){
    let btn = document.createElement("a");
    btn.className = "KOSHIAN_HideButton";
    btn.href="javascript:void(0)";
    btn.textContent="[隠す]";
    btn.style.fontSize = `${hide_size}px`;
    btn.onclick = switchHide;
    btn.name = res_number;

    let response = block.parentNode;
    if(have_sod){
        response.insertBefore(btn, response.getElementsByClassName("sod")[0].nextSibling);
    }else if(have_del){
        response.insertBefore(btn, response.getElementsByClassName("del")[0].nextSibling);
    }else{
        response.insertBefore(btn, block);
    }

    if(hide){
        switchHide({target: btn});
    }
}

let last_process_num = 0;

function process(beg = 0, start = false){
    let responses = document.getElementsByClassName("rtd");
    let respones_num = responses.length;

    if(beg >= respones_num){
        return;
    }

    let end = responses.length;

    /**
     * 本文のNGワードの正規表現の配列
     * @type {Array.<RegExp>}
     */
    let body_regex_list = ng_word_list.map((ng_word) => {
        // ng_word[1] boolean check_body 本文が対象か
        // ng_word[0] string ng_input NGワード
        // ng_word[3] boolean ignore_case 大文字/小文字を区別しないか
        // ng_word[6] string ng_board NG対象板
        return ng_word[1] && (!ng_word[6] || ng_word[6] == board_id) ? new RegExp(ng_word[0], ng_word[3] ? "i" : "") : null;
    });
    body_regex_list = body_regex_list.filter(Boolean);  // 配列からnullを削除

    /**
     * メール欄などのNGワードの正規表現の配列
     * @type {Array.<RegExp>}
     */
    let header_regex_list = ng_word_list.map((ng_word) => {
        // ng_word[2] boolean check_header メール欄などが対象か
        // ng_word[0] string ng_input NGワード
        // ng_word[3] boolean ignore_case 大文字/小文字を区別しないか
        // ng_word[6] string ng_board NG対象板
        return ng_word[2] && (!ng_word[6] || ng_word[6] == board_id) ? new RegExp(ng_word[0], ng_word[3] ? "i" : "") : null;
    });
    header_regex_list = header_regex_list.filter(Boolean);  // 配列からnullを削除

    show_deleted_res = isDeletedResShown(); // 削除レスの表示状態を確認

    loop: for (let i = beg; i < end; ++i) {
        let block = responses[i].getElementsByTagName("blockquote")[0];
        let hide = false;

        if (words_changed) {
            show(responses[i]);
        }
        // 既存の[隠す]ボタンがあれば削除
        let hide_button = responses[i].getElementsByClassName("KOSHIAN_HideButton")[0];
        if (hide_button){
            if (hide_button.textContent == "[見る]") {
                hide = true;
            }
            hide_button.remove();
        } else {
            let ng_switch = responses[i].getElementsByClassName("KOSHIAN_NGSwitch")[0];
            if (ng_switch) {
                ng_switch.remove();
            }
        }

        // 本文検索
        let block_text = block.textContent;
        for (let body_regex of body_regex_list) {
            if (body_regex.test(block_text)) {
                hideBlock(block, body_regex.source);
                continue loop;
            }
        }

        // 題名・Name取得
        let bolds = responses[i].getElementsByTagName("b");

        // メール欄取得
        let mail = responses[i].getElementsByClassName("KOSHIAN_meran")[0];
        let mail_text = null;
        if (mail) {
            mail_text = mail.textContent.slice(1,-1);
        } else {
            mail = responses[i].getElementsByTagName("a")[0];
            if (mail && mail.href.indexOf("mailto:") === 0) {
                mail_text = decodeURIComponent(mail.href.slice(7));
            }
        }

        // ID・IP取得
        let idip = searchIdIp(responses[i]);

        // ヘッダ部検索
        for (let i = 0, list_num = header_regex_list.length; i < list_num; ++i) {
            // 題名・Name
            for (let bold of bolds) {
                if (header_regex_list[i].test(bold.textContent)) {
                    hideBlock(block, header_regex_list[i].source);
                    continue loop;
                }
            }

            // メール欄
            if (mail_text && header_regex_list[i].test(mail_text)) {
                hideBlock(block, header_regex_list[i].source);
                continue loop;
            }

            // ID･IP
            if (idip && header_regex_list[i].test(idip)) {
                hideBlock(block, header_regex_list[i].source);
                continue loop;
            }
        }

        if (put_hide_button) {
            let res_number = "";
            if (start && !hide && thread_id) {
                if (have_input) {
                    let input = responses[i].getElementsByTagName("INPUT")[0];
                    if (input && input.value == "delete") {
                        res_number = input.name;
                    }
                }
                if (!res_number && have_sod) {
                    let sod = responses[i].getElementsByClassName("sod")[0];
                    if (sod && sod.id) {
                        res_number = sod.id.slice(2);
                    }
                }
                if (!res_number) {
                    res_number = getResponseNumber(responses[i]);
                }
                if (res_number) {
                    hide = hide_res_list[thread_id].some(value => value == res_number);
                }
            }
            putHideButton(block, hide, res_number);
        }
    }

    fixFormPosition();

    last_process_num = end;

    function hideBlock(block, ng_word){
        if(hide_completely){
            hideComopletely(block);
        }else{
            hide(block, ng_word);
        }
    }
}

function searchIdIp(rtd){
    let idip = null;
    for (let node = rtd.firstElementChild.nextSibling; node; node = node.nextSibling) {
        if (node.tagName == "BLOCKQUOTE") return;
        if (node.tagName == "A") {
            idip = node.textContent.match(/ID:\S{8}|IP:[^\s[]+/);
        } else if (node.nodeValue) {
            idip = node.nodeValue.match(/ID:\S{8}|IP:[^\s[]+/);
        }
        if (idip) {
            return idip[0];
        }
    }
}

function handleVisibilityChange() {
    if (!document.hidden && words_changed) {
        process();
        words_changed = false;
    }
}

/**
 * 削除されたレスが表示されているか
 * @return {boolean} 削除されたレスが表示されているか
 */
function isDeletedResShown() {
    let ddbut = document.getElementById("ddbut");
    if (ddbut && ddbut.textContent == "隠す") {
        return true;
    } else {
        return false;
    }
}

/**
 * コンテキストメニューからNG登録
 * @param {string} text ID・IP文字列
 */
function onClickNg(text) {
    if (!text) return;
    text = text.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&"); // エスケープが必要な文字にエスケープを追加
    addNgWord(text);
}

/**
 * NGワード登録
 * @param {RegExp} text 登録するNGワード
 */
function addNgWord(text) {
    if (!text) return;
    // 登録と重複したワードを削除
    ng_word_list = ng_word_list.filter((value) => {
        return value[0] != text || value[6];
    });

    let temp_regist = false;
    if (text.indexOf("ID:") === 0) {
        temp_regist = regist_id_temp;
    } else 
    if (text.indexOf("IP:") === 0) {
        temp_regist = regist_ip_temp;
    }
    ng_word_list.push([text, false, true, false, temp_regist, null, ""]);
    browser.storage.local.set({
        ng_word_list: ng_word_list
    });
    alert("NGワードを登録しました");
}

/**
 * ID・IPを取得してコンテキストメニューに反映
 */
function getIdIp(e) {
    context_idip = null;
    if (!use_contextmenu) return;
    let rtd = e.target.closest(".rtd");
    if (rtd) {
        context_idip = searchIdIp(rtd);
    } else {
        let thre = e.target.closest(".thre");
        if (thre) {
            context_idip = searchIdIp(thre);
        }
    }
    if (context_idip) {
        browser.runtime.sendMessage({
            id: "koshian_ng_idip",
            text: context_idip
        });
    }
}

function main(){
    have_input = document.querySelector(".thre > input") ? document.querySelector(".thre > input").value == "delete" : false;
    have_sod = document.getElementsByClassName("sod").length > 0;
    have_del = document.getElementsByClassName("del").length > 0;

    process(0, true);

    document.addEventListener("KOSHIAN_reload", () => {
        process(last_process_num);
    });

    let target = document.getElementById("akahuku_reload_status");
    if (target) {
        checkAkahukuReload(target);
    } else {
        document.addEventListener("AkahukuContentApplied", () => {
            target = document.getElementById("akahuku_reload_status");
            if (target) checkAkahukuReload(target);
        });
    }

    let contdisp = document.getElementById("contdisp");
    if (contdisp) {
        check2chanReload(contdisp);
    }

    document.addEventListener("visibilitychange", handleVisibilityChange, false);

    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.id == "koshian_ng_popup") {
            let sel = window.getSelection().toString();
            sendResponse({
                selection: sel,
                board_dir: board_dir
            });
        }
        if (message.id == "koshian_ng_context") {
            onClickNg(context_idip);
        }
    });

    document.addEventListener("contextmenu", getIdIp, false);

    function checkAkahukuReload(target) {
        let status = "";
        let config = { childList: true };
        let observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (target.textContent == status) return;
                status = target.textContent;
                if (status.indexOf("新着:") === 0) {
                    process(last_process_num);
                }
            });
        });
        observer.observe(target, config);
    }

    function check2chanReload(target) {
        let status = "";
        let reloading = false;
        let config = { childList: true };
        let observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (target.textContent == status) return;
                status = target.textContent;
                if (status == "・・・") {
                    reloading = true;
                } else
                if (reloading && status.endsWith("頃消えます")) {
                    process(last_process_num);
                    reloading = false;
                } else {
                    reloading = false;
                }
            });
        });
        observer.observe(target, config);
    }
}

function onLoadSetting(result) {
    hide_completely = safeGetValue(result.hide_completely, false);
    ng_word_list = safeGetValue(result.ng_word_list, []);
    put_hide_button = safeGetValue(result.put_hide_button, true);
    hide_size = safeGetValue(result.hide_size, 16);
    use_contextmenu = safeGetValue(result.use_contextmenu, false);
    regist_id_temp = safeGetValue(result.regist_id_temp, true);
    regist_ip_temp = safeGetValue(result.regist_ip_temp, true);
    max_threads = safeGetValue(result.max_threads, 512);
    hide_res_list = JSON.parse(safeGetValue(result.hide_res_list, "{}"));

    let hide_res_list_num = Object.keys(hide_res_list).length;
    for (let i = 0; i < hide_res_list_num - max_threads; ++i) {
        delete hide_res_list[Object.keys(hide_res_list)[0]];
    }

    setThreadId();
    if (thread_id && !hide_res_list[thread_id]) {
        hide_res_list[thread_id] = [];
    }

    main();
}

function onSettingChanged(changes, areaName) {
    if (areaName != "local") {
        return;
    }

    if (changes.hide_completely) {
        hide_completely = safeGetValue(changes.hide_completely.newValue, false);
        put_hide_button = safeGetValue(changes.put_hide_button.newValue, true);
        hide_size = safeGetValue(changes.hide_size.newValue, 16);
        use_contextmenu = safeGetValue(changes.use_contextmenu.newValue, false);
        regist_id_temp = safeGetValue(changes.regist_id_temp.newValue, true);
        regist_ip_temp = safeGetValue(changes.regist_ip_temp.newValue, true);
        max_threads = safeGetValue(changes.max_threads.newValue, 512);
    }
    if (changes.ng_word_list) {
        ng_word_list = safeGetValue(changes.ng_word_list.newValue, []);
        words_changed = true;
    }
    if (changes.hide_res_list) {
        hide_res_list = JSON.parse(safeGetValue(changes.hide_res_list.newValue, "{}"));
        if (thread_id && !hide_res_list[thread_id]) {
            hide_res_list[thread_id] = [];
        }
    }

    words_changed = true;
    if (!document.hidden) {
        process();
        words_changed = false;
    }
}

function safeGetValue(value, default_value) {
    return value === undefined ? default_value : value;
}

browser.storage.local.get().then(onLoadSetting, (err) => {});
browser.storage.onChanged.addListener(onSettingChanged);
