const FUTABA_LIGHTBOX_CLASS = "futaba_lightbox";
const FUTABA_LIGHTBOX_HIDDEN_CLASS = "futaba_lightbox_hidden";

let hide_completely = false;
let ng_word_list = [];
let put_hide_button = true;
let hide_size = 16;
let have_sod = false;
let have_del = false;
let words_changed = false;
let show_deleted_res = false;

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

    if(blockquote.style.display == "none"){
        // show
        blockquote.style.display = "block";
        if(a_img){
            a_img.style.display = "block";
            if (a_img.className == FUTABA_LIGHTBOX_HIDDEN_CLASS) {
                a_img.className = FUTABA_LIGHTBOX_CLASS;
            }
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
        e.target.textContent = `[NGワード]`;
    }

    fixFormPosition();
}

function switchHide(e){
    let response = e.target.parentNode;
    let blockquote = response.getElementsByTagName("blockquote")[0];
    let img = response.getElementsByTagName("img")[0];
    let a_img = img ? img.parentNode : null;

    if(blockquote.style.display == "none"){
        // show
        blockquote.style.display = "block";
        if(a_img){
            a_img.style.display = "block";
            if (a_img.className == FUTABA_LIGHTBOX_HIDDEN_CLASS) {
                a_img.className = FUTABA_LIGHTBOX_CLASS;
            }
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
        e.target.textContent = `[見る]`;
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

    if(blockquote.style.display == "none"){
        // show
        blockquote.style.display = "block";
        if(a_img){
            a_img.style.display = "block";
            if (a_img.className == FUTABA_LIGHTBOX_HIDDEN_CLASS) {
                a_img.className = FUTABA_LIGHTBOX_CLASS;
            }
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

function putHideButton(block, hide){
    let btn = document.createElement("a");
    btn.className = "KOSHIAN_HideButton";
    btn.href="javascript:void(0)";
    btn.textContent="[隠す]";
    btn.style.fontSize = `${hide_size}px`;
    btn.onclick = switchHide;

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

function process(beg = 0){
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
        return ng_word[1] ? new RegExp(ng_word[0], ng_word[3] ? "i" : "") : null;
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
        return ng_word[2] ? new RegExp(ng_word[0], ng_word[3] ? "i" : "") : null;
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
        for (let header_regex of header_regex_list) {
            // 題名・Name
            for (let bold of bolds) {
                if (header_regex.test(bold.textContent)) {
                    hideBlock(block, header_regex.source);
                    continue loop;
                }
            }

            // メール欄
            if (mail_text && header_regex.test(mail_text)) {
                hideBlock(block, header_regex.source);
                continue loop;
            }

            // ID･IP
            if (idip && header_regex.test(idip)) {
                hideBlock(block, header_regex.source);
                continue loop;
            }
        }

        if (put_hide_button) {
            putHideButton(block, hide);
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
            idip = node.textContent.match(/ID:\S{8}|IP:[^\s]+/);
        } else if (node.nodeValue) {
            idip = node.nodeValue.match(/ID:\S{8}|IP:[^\s]+/);
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

function main(){
    have_sod = document.getElementsByClassName("sod").length > 0;
    have_del = document.getElementsByClassName("del").length > 0;

    process();

    document.addEventListener("KOSHIAN_reload", () => {
        process(last_process_num);
    });

    let status = "";
    let target = document.getElementById("akahuku_reload_status");
    if (target) {
        checkAkahukuReload();
    } else {
        document.addEventListener("AkahukuContentApplied", () => {
            target = document.getElementById("akahuku_reload_status");
            if (target) checkAkahukuReload();
        });
    }

    document.addEventListener("visibilitychange", handleVisibilityChange, false);

    browser.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
        let sel = window.getSelection().toString();
        sendResponse( {selection:sel} );
    });

    function checkAkahukuReload() {
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
}

function onLoadSetting(result) {
    hide_completely = safeGetValue(result.hide_completely, false);
    ng_word_list = safeGetValue(result.ng_word_list, []);
    put_hide_button = safeGetValue(result.put_hide_button, true);
    hide_size = safeGetValue(result.hide_size, 16);
    
    main();
}

function onSettingChanged(changes, areaName) {
    if (areaName != "local") {
        return;
    }

    let changedItems = Object.keys(changes);
    for (let item of changedItems) { 
        if (item == "hide_completely") {
            hide_completely = safeGetValue(changes.hide_completely.newValue, false);
        }
        if (item == "ng_word_list") {
            ng_word_list = safeGetValue(changes.ng_word_list.newValue, []);
        }
        if (item == "put_hide_button") {
            put_hide_button = safeGetValue(changes.put_hide_button.newValue, true);
        }
        if (item == "hide_size") {
            hide_size = safeGetValue(changes.hide_size.newValue, 16);
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
