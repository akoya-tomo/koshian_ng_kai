const FUTABA_LIGHTBOX_CLASS = "futaba_lightbox";
const FUTABA_LIGHTBOX_HIDDEN_CLASS = "futaba_lightbox_hidden";

let hide_completely = false;
let ng_word_list = [];
let put_hide_button = true;
let hide_size = 16;
let use_contextmenu = false;
let regist_id_temp = true;
let regist_ip_temp = true;
let use_contextmenu_img = true;
let hide_id_res = false;
let max_threads = 512;
let hide_res_list = {};
let have_input = false;
let have_sod = false;
let have_del = false;
let words_changed = false;
let show_deleted_res = false;
let context_idip = null;
let context_img = null;
let board_id = "";
let thread_id = "";
let is_futaba = document.domain.endsWith(".2chan.net");
let is_ftbucket = document.domain.endsWith(".ftbucket.info");
let is_idip_thread = checkThreadMail();

console.debug("KOSHIAN_ng/res.js - is_futaba: " + is_futaba);
console.debug("KOSHIAN_ng/res.js - is_ftbucket: " + is_ftbucket);
console.debug("KOSHIAN_ng/res.js - is_idip_thread: " + is_idip_thread);

function checkThreadMail() {
    if (is_ftbucket) {
        // FTBucket
        // may形式
        let font = document.querySelector(".thre > font > b > font");
        if (font && font.textContent.match(/^i[dp]表示/i)) {
            return true;
        }
        // img形式
        let fonts = document.querySelectorAll(".thre > font");
        for (let font of fonts) {
            if (font.textContent.match(/^i[dp]表示/i)) {
                return true;
            }
        }
    } else {
        // メール欄にID・IPスレが設定されているか確認
        // may形式
        let mail = document.querySelector(".thre > font > b > a");
        if (mail && mail.href.match(/^mailto:i[dp]%E8%A1%A8%E7%A4%BA/i)) {
            return true;
        }
        // img形式
        let anchors = document.querySelectorAll(".thre > a");
        for (let anchor of anchors) {
            if (anchor.href && anchor.href.match(/^mailto:i[dp]%E8%A1%A8%E7%A4%BA/i)) {
                return true;
            }
        }
        // 「KOSHIAN メール欄を表示」対応
        mail = document.getElementsByClassName("KOSHIAN_meran")[0];
        if (mail && mail.textContent.match(/^\[i[dp]表示/i)) {
            return true;
        }
    }
    return false;
}

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
        case "dev.ftbucket.info":
            // ftbucket
            match = location.href.match(/^https?:\/\/[^.]+.ftbucket.info\/.+\/cont\/([^./]+)\.2chan.net_([^_/]+)_res_(\d+)\/index.htm/);
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
 * レスNo.取得
 * @param {Element} target レスNo.を取得するレスの要素(.rtd or .thre)
 * @return {string} レスNo.の数字部分。レスNo.が無ければ空文字
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
            } else if (node.className == "KOSHIAN_NumberButton") {
                // KOSHIAN 引用メニュー 改
                let match = node.textContent.match(/No.(\d+)/);
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
        e.target.textContent = e.target.name || `[NGワード]`;
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

function hide(block, ng_word, btn_text = "[NGワード]"){
    let btn = document.createElement("a");
    btn.className = "KOSHIAN_NGSwitch";
    btn.href="javascript:void(0)";
    btn.style.fontSize = `${hide_size}px`;
    btn.onclick = switchNG;
    btn.title = ng_word;
    btn.name = btn_text;

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
            if(a_img && a_img.className == FUTABA_LIGHTBOX_CLASS) {
                a_img.className = FUTABA_LIGHTBOX_HIDDEN_CLASS;
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

function process(beg = 0, loaded = false, reloaded = false){
    let responses = document.getElementsByClassName("rtd");
    let respones_num = responses.length;

    if(beg >= respones_num){
        if (hide_id_res && !is_idip_thread && is_futaba && reloaded) {
            hideIdResponses();
        }
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
        // ng_word[6] string ng_board NG対象板ID
        return ng_word[1] && (!ng_word[6] || ng_word[6] == board_id) ? new RegExp(ng_word[0], ng_word[3] ? "i" : "") : null;
    }).filter(Boolean); // 配列からnullを削除

    /**
     * メール欄などのNGワードの正規表現の配列
     * @type {Array.<RegExp>}
     */
    let header_regex_list = ng_word_list.map((ng_word) => {
        // ng_word[2] boolean check_header メール欄などが対象か
        // ng_word[0] string ng_input NGワード
        // ng_word[3] boolean ignore_case 大文字/小文字を区別しないか
        // ng_word[6] string ng_board NG対象板ID
        return ng_word[2] && (!ng_word[6] || ng_word[6] == board_id) ? new RegExp(ng_word[0], ng_word[3] ? "i" : "") : null;
    }).filter(Boolean); // 配列からnullを削除

    /**
     * サムネ画像NGの配列
     * @type {Array.<Object>}
     */
    let ng_image_list = ng_word_list.map((ng_word) => {
        // ng_word[0] string ng_input NGワード
        // ng_word[5] boolean ng_image サムネ画像NG
        // ng_word[6] string ng_board NG対象板ID
        if (ng_word[5] && (!ng_word[6] || ng_word[6] == board_id)) {
            let ng_image = ng_word[0].split(",");
            if (ng_image.length >= 3) {
                let obj = {};
                obj.width = parseInt(ng_image[0], 10);
                obj.height = parseInt(ng_image[1], 10);
                let ng_size = ng_image[2].split("-");
                obj.min_size = parseInt(ng_size[0], 10);
                if (ng_size.length < 2) {
                    obj.max_size = obj.min_size;
                } else {
                    obj.max_size = parseInt(ng_size[1], 10);
                    if (obj.min_size > obj.max_size) {
                        [obj.min_size, obj.max_size] = [obj.max_size, obj.min_size];
                    }
                }
                obj.text = ng_image[3] || "";
                return obj;
            }
        }
        return null;
    }).filter(Boolean); // 配列からnullを削除

    show_deleted_res = isDeletedResShown(); // 削除レスの表示状態を確認

    loop: for (let i = beg; i < end; ++i) {
        let response = responses[i];
        let block = response.getElementsByTagName("blockquote")[0];
        let hide = false;

        if (words_changed) {
            show(response);
        }
        // 既存の[隠す]ボタンがあれば削除
        let hide_button = response.getElementsByClassName("KOSHIAN_HideButton")[0];
        if (hide_button){
            if (hide_button.textContent == "[見る]") {
                hide = true;
            }
            hide_button.remove();
        } else {
            let ng_switch = response.getElementsByClassName("KOSHIAN_NGSwitch")[0];
            if (ng_switch) {
                ng_switch.remove();
            }
        }

        // 本文検索
        let block_text = block.textContent;
        for (let j = 0, list_num = body_regex_list.length; j < list_num; ++j) {
            if (body_regex_list[j].test(block_text)) {
                hideBlock(block, body_regex_list[j].source);
                continue loop;
            }
        }

        // 題名・Name取得
        let bolds = response.getElementsByTagName("b");

        // メール欄取得
        let mail = response.getElementsByClassName("KOSHIAN_meran")[0];
        let mail_text = null;
        if (mail) {
            mail_text = mail.textContent.slice(1,-1);
        } else {
            mail = response.getElementsByTagName("a")[0];
            if (mail && mail.href.indexOf("mailto:") === 0) {
                mail_text = decodeURIComponent(mail.href.slice(7));
            }
        }

        // ID・IP取得
        let idip = searchIdIp(response);

        // ヘッダ部検索
        for (let j = 0, list_num = header_regex_list.length; j < list_num; ++j) {
            // 題名・Name
            for (let bold of bolds) {
                if (header_regex_list[j].test(bold.textContent)) {
                    hideBlock(block, header_regex_list[j].source);
                    continue loop;
                }
            }

            // メール欄
            if (mail_text && header_regex_list[j].test(mail_text)) {
                hideBlock(block, header_regex_list[j].source);
                continue loop;
            }

            // ID･IP
            if (idip && header_regex_list[j].test(idip)) {
                hideBlock(block, header_regex_list[j].source);
                continue loop;
            }
        }

        // サムネ画像検索
        let img = response.getElementsByTagName("img")[0];
        if (img && img.alt && img.width && img.height) {
            let size = parseInt(img.alt, 10);
            for (let j = 0, list_num = ng_image_list.length; j < list_num; ++j) {
                let ng_image = ng_image_list[j];
                if (img.width == ng_image.width && img.height == ng_image.height && size >= ng_image.min_size && size <= ng_image.max_size) {
                    let text = ng_image.text ? `[${ng_image.text}] ${block_text}` : block_text;
                    hideBlock(block, text, "[NG画像]");
                    continue loop;
                }
            }
        }

        // ID表示レス
        if (idip && hide_id_res && !is_idip_thread) {
            hideBlock(block, idip, "[ID表示]");
            continue loop;
        }

        if (put_hide_button) {
            let res_number = "";
            if (loaded && !hide && thread_id) {
                if (have_input) {
                    let input = response.getElementsByTagName("INPUT")[0];
                    if (input && input.value == "delete") {
                        res_number = input.name;
                    }
                }
                if (!res_number && have_sod) {
                    let sod = response.getElementsByClassName("sod")[0];
                    if (sod && sod.id) {
                        res_number = sod.id.slice(2);
                    }
                }
                if (!res_number) {
                    res_number = getResponseNumber(response);
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

    if (hide_id_res && !is_idip_thread && is_futaba && reloaded) {
        hideIdResponses();
    }

    function hideBlock(block, ng_word, btn_text){
        if(hide_completely){
            hideComopletely(block);
        }else{
            hide(block, ng_word, btn_text);
        }
    }

    function hideIdResponses() {
        for (let i = 0; i < beg; ++i) {
            let response = responses[i];
            if (searchIdIp(response)) {
                if (hide_completely) {
                    if (response.parentNode.style.display != "none") {
                        let block = response.getElementsByTagName("blockquote")[0];
                        hideComopletely(block);
                    }
                } else {
                    let ng_switch = response.getElementsByClassName("KOSHIAN_NGSwitch")[0];
                    if (!ng_switch) {
                        let block = response.getElementsByTagName("blockquote")[0];
                        hideBlock(block, "", "[ID表示]");
                    }
                }
            }
        }
    }
}

/**
 * ID・IP検索
 * @param {HTMLElement} target ID・IPを検索するレスのHTML要素(.rtd or .thre)
 * @return {string} ID・IP文字列
 */
function searchIdIp(target){
    let idip = null;
    for (let node = target.firstElementChild.nextSibling; node; node = node.nextSibling) {
        if (node.tagName == "A") {
            idip = node.textContent.match(/ID:\S{8}|IP:[^\s[]+/);
        } else if (node.nodeValue) {
            idip = node.nodeValue.match(/ID:\S{8}|IP:[^\s[]+/);
        }
        if (idip) {
            return idip[0];
        } else if (node.className == "del") {
            return;
        }
    }
}

/**
 * ページの表示／非表示切り替え検出
 */
function handleVisibilityChange() {
    if (!document.hidden && words_changed) {
        // NGワードが変更された状態でページが表示状態になったらNG処理実行
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
    return ddbut && ddbut.textContent == "隠す";
}

/**
 * コンテキストメニューからNG登録
 * @param {string} text ID・IP文字列
 */
function onClickNg(text, is_ng_image = false) {
    if (!text) {
        return;
    }
    if (!is_ng_image) {
        text = text.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&"); // エスケープが必要な文字にエスケープを追加
    }
    addNgWord(text, is_ng_image);
}

/**
 * NGワード登録
 * @param {RegExp} text 登録するNGワード
 */
function addNgWord(text, is_ng_image = false) {
    if (!text) {
        return;
    }
    // 登録と重複したワードを削除
    ng_word_list = ng_word_list.filter((value) => {
        return value[0] != text || value[6];
    });

    if (is_ng_image) {
        let comment = prompt("NG画像のコメントを入力してください（キャンセルでNG登録中止します）");
        if (comment == null) {
            return;
        }
        if (comment) {
            text += `,${comment}`;
        }
    }
    let temp_regist = false;
    if (text.match(/^ID:\S{8}$/)) {
        temp_regist = regist_id_temp;
    } else 
    if (text.match(/^IP:[^\s[]+$/)) {
        temp_regist = regist_ip_temp;
    }
    ng_word_list.push([text, false, !is_ng_image, false, temp_regist, is_ng_image, ""]);
    browser.storage.local.set({
        ng_word_list: ng_word_list
    });
    if (!is_ng_image) {
        alert("NGワードを登録しました");
    }
}

/**
 * コンテキストメニューにNG登録のメニューアイテムを追加
 */
function onContextmenu(e) {
    context_img = null;
    context_idip = null;
    if (use_contextmenu_img) {
        // サムネ画像情報を取得してコンテキストメニューに反映
        let img = e.target.closest("img");
        if (img && img.alt && img.width && img.height) {
            let img_a = img.parentNode;
            if (img_a && img_a.nodeName == "A") {
                let filename = img_a.href ? img_a.href.match(/\d+\.[a-zA-Z0-9]+$/) : null;
                if (filename) {
                    context_img = `${img.width},${img.height},${parseInt(img.alt, 10)}`;
                    browser.runtime.sendMessage({
                        id: "koshian_ng_img",
                        text: filename[0]
                    });
                    return;
                }
            }
        }
    } 
    if (use_contextmenu) {
        getIdIp(e);
    }
}

/**
 * ID・IPを取得してコンテキストメニューに反映
 */
function getIdIp(e) {
    let rtd_thre = e.target.closest(".rtd, .thre");
    if (rtd_thre) {
        context_idip = searchIdIp(rtd_thre);
        if (context_idip) {
            browser.runtime.sendMessage({
                id: "koshian_ng_idip",
                text: context_idip
            });
        }
    }
}

function main(){
    have_input = document.querySelector(".thre > input") ? document.querySelector(".thre > input").value == "delete" : false;
    have_sod = document.getElementsByClassName("sod").length > 0;
    have_del = document.getElementsByClassName("del").length > 0;

    process(0, true);

    // KOSHIAN リロード監視
    document.addEventListener("KOSHIAN_reload", () => {
        process(last_process_num, false, true);
    });

    // 赤福 リロード監視
    let target = document.getElementById("akahuku_reload_status");
    if (target) {
        checkAkahukuReload(target);
    } else {
        document.addEventListener("AkahukuContentApplied", () => {
            target = document.getElementById("akahuku_reload_status");
            if (target) {
                checkAkahukuReload(target);
            }
        });
    }
    function checkAkahukuReload(target) {
        let status = "";
        let config = { childList: true };
        let observer = new MutationObserver(() => {
            if (target.textContent == status) {
                return;
            }
            status = target.textContent;
            if (status.indexOf("新着:") === 0) {
                process(last_process_num, false, true);
            }
        });
        observer.observe(target, config);
    }

    // ふたば リロード監視
    let contdisp = document.getElementById("contdisp");
    if (contdisp) {
        check2chanReload(contdisp);
    }
    function check2chanReload(target) {
        let status = "";
        let reloading = false;
        let config = { childList: true };
        let observer = new MutationObserver(() => {
            if (target.textContent == status) {
                return;
            }
            status = target.textContent;
            if (status == "・・・") {
                reloading = true;
            } else if (reloading && status.endsWith("頃消えます")) {
                process(last_process_num);
                reloading = false;
            } else {
                reloading = false;
            }
        });
        observer.observe(target, config);
    }

    document.addEventListener("visibilitychange", handleVisibilityChange, false);

    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        switch (message.id) {
            case "koshian_ng_popup":
                sendResponse({
                    selection: window.getSelection().toString(),
                    board_id: board_id
                });
                break;
            case "koshian_ng_context_idip":
                onClickNg(context_idip);
                sendResponse();
                break;
            case "koshian_ng_context_img":
                onClickNg(context_img, true);
                sendResponse();
                break;
        }
    });

    document.addEventListener("contextmenu", onContextmenu, false);
}

function onLoadSetting(result) {
    hide_completely = safeGetValue(result.hide_completely, false);
    ng_word_list = safeGetValue(result.ng_word_list, []);
    put_hide_button = safeGetValue(result.put_hide_button, true);
    hide_size = safeGetValue(result.hide_size, 16);
    use_contextmenu = safeGetValue(result.use_contextmenu, false);
    regist_id_temp = safeGetValue(result.regist_id_temp, true);
    regist_ip_temp = safeGetValue(result.regist_ip_temp, true);
    use_contextmenu_img = safeGetValue(result.use_contextmenu_img, true);
    hide_id_res = safeGetValue(result.hide_id_res, false);
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
        use_contextmenu_img = safeGetValue(changes.use_contextmenu_img.newValue, true);
        hide_id_res = safeGetValue(changes.hide_id_res.newValue, false);
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

    if (words_changed && !document.hidden) {
        process();
        words_changed = false;
    }
}

function safeGetValue(value, default_value) {
    return value === undefined ? default_value : value;
}

browser.storage.local.get().then(onLoadSetting, (err) => {});   // eslint-disable-line no-unused-vars
browser.storage.onChanged.addListener(onSettingChanged);
