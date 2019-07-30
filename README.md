## <sub><img src="koshian_ng/icons/icon-48.png"></sub> KOSHIAN NG 改
このFirefoxアドオンはふたば☆ちゃんねるでNGワードを表示しないようにする[Pachira](https://addons.mozilla.org/ja/firefox/user/anonymous-a0bba9187b568f98732d22d51c5955a6/)氏の[KOSHIAN NG](https://addons.mozilla.org/ja/firefox/addon/koshian-ng/)を改変したものです。  
メール欄などをNG判定範囲に含める機能などをオリジナル版に追加しています。  

※このアドオンはWebExtensionアドオン対応のFirefox専用となります。  
※他のKOSHIAN改変版などのふたば支援ツールは[こちら](https://github.com/akoya-tomo/futaba_auto_reloader_K/wiki/)。  

## 機能
* オリジナルの機能（KOSHIAN NG）
  - レス送信モードでNGワードを含むレスを隠す
* 追加された機能（KOSHIAN NG 改）
  - NGワードの判定範囲に「メール欄など」を追加  
    NGワードを判定する範囲をレス本文に加えてメール欄・題名・Name・ID・IPを追加しました。  
    NGワードの登録画面で判定範囲（「本文」「メール欄など」）をNGワード単位で選択できます。  
  - NGワードの判定に大文字・小文字を区別しない設定を追加  
    NGワードの登録画面で「大文字・小文字を区別しない」をNGワード単位で選択できます。  
  - ツールバーボタンからNGワードを登録する機能を追加  
    ツールバーボタンのポップアップからNGワードを直接登録することができます。  
    またポップアップの右上の\[設定\]ボタンから設定画面を開くことができます。  
    NGにしたい文字列を選択してからツールバーボタンを押すとNGワード入力欄に反映されます。  
  - 設定の変更やNGワードの登録が直ぐにスレに反映されるように変更  
    スレを更新しなくても設定の変更やNGワードの登録が直ぐに反映されます。  
  - NGワードのインポート・エクスポート機能を追加  
    登録したNGワードをエクスポートして保存したり、インポートして戻すことができます。  
  - NGワードの設定に「一時的に登録」を追加  
    ブラウザを閉じたり再起動すると「一時的に登録」にチェックされたNGワードが削除されます。  
    IDや塩のファイル名など短期間でNGの効果が無くなるNGワードにご利用ください。  
  - コンテキストメニューからID・IPをNGワードに直接登録する機能を追加（デフォルト：無効）  
    NGにしたいID(IP)のレスの上で右クリックしてコンテキストメニューから「NG登録:ID(IP):～」を選択するとNGワードとして登録されます。  
    IDとIPでそれぞれ一時的に登録するかオプションで設定できます。  
  - NG対象の板を選択する機能を追加  
    NGワードを適用する板を選択することができます。デフォルトでは全ての板が対象になります。  
  - \[隠す\]ボタンで隠したレスをブラウザを閉じても記憶する  
    \[隠す\]ボタンで隠したレスを記憶して、再読み込みやタブを閉じたりブラウザを閉じた後にスレを開いてもレスが隠れたままになります。  
    「記憶するスレの数」（全板共通）をオプションから設定できます。（デフォルト：512スレ）  

## インストール
**GitHub**  
[![インストールボタン](images/install_button.png "クリックでアドオンをインストール")](https://github.com/akoya-tomo/koshian_ng_kai/releases/download/v1.8.4/koshian_ng_kai-1.8.4-fx.xpi)

※v1.8.1からアドオンのアクセス許可に「」ッチー(`tsumanne.net`)・FTBucket(`ftbucket.info`)が追加になります。（アドオンを動作させるため）  
※v1.5.1からアドオンのアクセス許可にふたポの過去ログ\(`kako.futakuro.com`\)が追加になります。（アドオンを動作させるため） 

※「接続エラーのため、アドオンをダウンロードできませんでした。」と表示されてインストール出来ないときはインストールボタンを右クリックしてxpiファイルをダウンロードし、メニューのツール→アドオン（またはCtrl+Shift+A）で表示されたアドオンマネージャーのページにxpiファイルをドラッグ＆ドロップして下さい。  

## 追加機能の補足
* NGワードを登録した後でも「本文」「メール欄など」「大文字・小文字を区別しない」「一時的に登録」のチェックや「NG対象」の板は自由に変更できます。「本文」「メ欄」のチェックを外せば、NGワードを登録したまま無効になります。  
* NGワードに登録済みと同じワードかつ同じNG対象を登録すると重複せずに新しい設定に上書きされます。  
* コンテキストメニューからのID・IPのNG登録はスレとレス以外（引用ポップアップ・IDポップアップなど）では表示されません。  
* [futaba ID+IP popup](https://greasyfork.org/ja/scripts/8189-futaba-id-ip-popup/)使用時、IPは赤字の部分のみ登録されます。  
* 本アドオンが自動または手動で更新されると一時的に登録されたNGワードは削除されます。  

## 注意事項
* 本アドオンを有効にしたときはオリジナル版を無効にするか削除して下さい。  
* オリジナル版とは別アドオンなので設定は初期値に戻ります。  
  再度設定をお願い致します。  

## 既知の不具合
* \[隠す\]ボタン操作直後に再読み込みやタブを閉じると記憶されないことがある  
* ![\(New\)](images/new.png "New") アドオン更新後にツールバーボタンのポップアップが表示されないことがある  
  - ブラウザを再起動することで表示されるようになります。  

## 更新履歴
* v1.8.4 2019-07-31
  - 新板（昭和・平成）を追加
* v1.8.3 2019-07-29
  - 新板（FGO・アイマス）を追加
* v1.8.2 2019-06-17
  - FTBucketのアドレスを修正
* v1.8.1 2019-06-16
  - \[隠す\]ボタンで隠したレスをブラウザを閉じても記憶するように変更
  - コンテキストメニューからスレのID・IPのNG登録ができるように修正
  - オプション画面のNGリストでNG対象板を変更できるように修正
  - ログサイトで動作するように修正
  - オプション画面で異なる対象板の同じNGワードがあると設定が正常に変更できない不具合を修正
* v1.7.0 2019-05-13
  - NG対象の板を選択する機能を追加  
  - 設定ページを通常のタブで開くように変更
  - NGワード削除時に確認するように修正
* v1.6.0 2019-05-09
  - ふたばのリロードの仕様変更に対応  
* v1.5.2 2019-04-29
  - 赤福Extendedの外部のファイルのプレビューが隠れない不具合を修正  
* v1.5.1 2018-12-20
  - アドオンを実行するサイトに[ふたポ](http://futapo.futakuro.com/)の過去ログ\(kako.futakuro.com\)を追加  
* v1.5.0 2018-11-07
  - 「一時的に登録」機能を追加
  - コンテキストメニューからID・IPをNGワード登録する機能を追加
* v1.4.0 2018-09-30
  - NGワードのインポート・エクスポート機能を追加
* v1.3.1 2018-09-26
  - NGにしたレスの画像が[futaba lightbox](https://github.com/himuro-majika/futaba_lightbox/)で表示されないように修正
* v1.3.0 2018-09-12
  - \[NGワード\]ボタンにマウスオーバーすると該当したNGワードをポップアップ表示する機能を追加
  - ツールバーボタンを押したときに選択した文字列に正規表現でエスケープが必要な文字が含まれていたらエスケープを追加するように修正
  - 赤福Extendedのリロード検出を修正
  - スレ内のNGワードの検索速度を改善
  - レス内のIPの全ての文字列を取得できていない不具合を修正
* v1.2.2 2018-09-09
  - [赤福Extended](https://toshiakisp.github.io/akahuku-firefox-sp/)のリロードに対応
* v1.2.1 2018-05-14
  - NGワード登録で[隠す]ボタンで隠したレスが表示される不具合を修正
* v1.2.0 2018-05-14
  - ツールバーボタンからポップアップを開くときに選択文字列をNGワード入力欄へ反映する機能を追加
  - NGワード登録で隠れた削除レスが表示される不具合を修正
* v1.1.0 2018-05-01
  - ツールバーボタンからNGワードを登録する機能を追加
  - 設定の変更やNGワードの登録が直ぐにスレに反映されるように変更
  - 登録済みのNGワードを登録すると上書きするように変更
* v1.0.0 2018-04-18
  - KOSHIAN NG v1.1.1ベース
  - NGワードの判定範囲に「メール欄など」を追加
  - NGワードの大文字/小文字を区別しない設定を追加
  - [NGワード]ボタンにボタンのサイズ設定を反映
  - アドオン更新後の[隠す]ボタンの重複を抑止
