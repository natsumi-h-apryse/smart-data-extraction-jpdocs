# ドキュメント構造抽出結果（Document Structure）

- 出力元: `docstructureextraction.js`
- 全体のまとめは `../report_jp.md` を参照
- 評価記号（◯ △ ▲ ☓ / - 対象外）の定義は `../report_jp.md` を参照。◯ も実用レベルを意味しない

| ドキュメント | 検出要素 | 評価 | 所見 |
|---|---|---|---|
| contract.pdf | paragraph 16, list 4, heading 2 | ▲ | 条見出し・段落・リストを認識。ただしページ画像を内蔵 OCR で読み直すため誤字が多い（例: InspireHigh → Tnsp{re High） |
| driverslicense-ocr-ed.pdf | group 1 | ☓ | テキスト 0 件。カード画像と顔写真の group のみ（OCR テキスト層を使わない） |
| form/attorney.pdf | paragraph 10, heading 1 | ◯ | タイトルを heading、ほかを段落として正しく認識 |
| form/medicalform_ocr_ed.pdf | group 1 | ☓ | テキスト 0 件。ページ全体が画像の group のみ（OCR テキスト層を使わない） |
| form/register_of_marriage.pdf | paragraph 77, textbox 6, graphic 4, heading 1, group 1, table 1 | ▲ | 表・テキストボックスは検出するが、印刷されない赤字の注意書きと本文が重なり、読み順が崩れる |
| form/syomei.pdf | paragraph 7, table 1, group 1 | △ | 上半分の段落と形式の表は正確。下半分の記入欄は 1 つの group にまとまり、読み順が崩れる |
| invoice-57-….pdf | paragraph 9, heading 2, group 1, textbox 1 | ◯ | 見出し・段落を正確に認識。KVE で落ちた発行日・税の内訳も段落として取得 |
| invoice_B003028840.pdf | paragraph 14, textbox 4, heading 2, image 1, table 1 | ◯ | 明細を table（31 行）、請求金額・需要者情報を textbox で取得 |
| receipt_875103444-発車オーライネット….pdf | paragraph 7, image 2, table 2 | ◯ | 2 つの表を table として認識し、読み順も自然 |
| receipt_ocr-ed_iris.pdf | group 1 | ☓ | テキスト 0 件。画像の group のみ（OCR テキスト層を使わない） |

## 詳細

### contract.pdf

| ページ | 要素 | テキスト |
|---|---|---|
| 1 | heading L2 | 業務委託基本契約書 (準委任) |
| 1 | paragraph | 株式会社 Tnsp{re High (以下「甲」という。) と  堀 菜摘 似下「乙」という。) とは` 甲が凸に委託する業務に開 し` 以下のとおり莱務委託基本契約 (以下「基本契約ー とい う。) を締結する。 |
| 1 | heading L1 | 第ー条 (目的) |
| 1 | paragraph | 本契約慎 甲が乙に対して委託ずる` ゥェブサイ 卜、ソフトゥェア、デザイン、映傷` 写真、楽 曲` 原稿などの制作業務 (以下「委託業務」という” } に関ずる基本的事項を定めるものでぁり、 |
| 1 | paragraph | 本契約を実施するために甲乙問にて取り交ゎされる全ての個別契約 (以下 咽別契約j とし`う。) に適用される。 |
| 1 | paragraph | 第2条 (個別契約〕 |
| 1 | list | （テキストなし） |
| 1 | paragraph | の  と ず  る。 |
| 1 | paragraph | 第3条〔委託料〕 |
| 1 | paragraph | 甲は、乙が甲に対して諮行する請求害の発行日から 60 日以内に` 委託業務の対価として個別契約 に定める金額 (以下「委託料」という〝 ) を乙の指定する口座に送金して玄払う。委託業務に要す る費用は、全て委託料に含まれるものとする〟 |
| 1 | paragraph | 第4条 (委託業務の履行) |
| 1 | paragraph | 乙は、本契約、個別契釣およぴ甲が乙に交付する仕様書その他の賛料なちぴに甲の指ポにしたがっ て善良なる管理者の注意義榜をもって委託業務を行仙 その成果物を甲に納入するものとする。 |
| 1 | paragraph | 第5条 (再委託〕 |
| 1 | list | （テキストなし） |
| 1 | paragraph | による同意を得るものとずる。 |
| 1 | list | （テキストなし） |
| 1 | paragraph | 『者をして本契納およぴ個別契約の定めを遵守させるものとする。 |
| 1 | list | （テキストなし） |
| 1 | paragraph | 第6 条 (納入) |
| 1 | paragraph | ー. こは` 個別契約に定められた納期に、委託業務の成果物 (以下「成畏物」という。) を甲 の指定する方法で納入するものとする〟 |
| 1 | paragraph | 2・ 成果物には` 委託業務の遂行により生み出された一切の制作物 (写真デ〕タ、イラストレ ーターデ」タなどの元データ等の中聞制作物を含む〟 ) が含まれるものとすろ。 |
| 1 | paragraph | 3. 凸ば`  納期に成果物を納入ずることができなぃおそれが生じたときは`  ただちにその旨甲 |

### driverslicense-ocr-ed.pdf

個人情報を含むため省略。

### form/attorney.pdf

| ページ | 要素 | テキスト |
|---|---|---|
| 1 | heading L1 | 委任状 |
| 1 | paragraph | 令和 年 月 日 |
| 1 | paragraph | 代理人（受任者） 住所 |
| 1 | paragraph | 氏名 |
| 1 | paragraph | 私は、上記のものを代理人と定め、下記の権限を委任します。 |
| 1 | paragraph | 記 |
| 1 | paragraph | （1) |
| 1 | paragraph | （2） |
| 1 | paragraph | 以上 |
| 1 | paragraph | 本人（委任者） 住所 |
| 1 | paragraph | 氏名 |

### form/medicalform_ocr_ed.pdf

| ページ | 要素 | テキスト |
|---|---|---|
| 1 | group | （テキストなし） |

### form/register_of_marriage.pdf

| ページ | 要素 | テキスト |
|---|---|---|
| 1 | textbox | 夫 妻 |
| 1 | paragraph | 必ず「Ａ３」サイズの白 午前 紙 ・ 午 に 後 印刷 旅 し 券 て ・ くだ 旅券 さ ・ い。 |
| 1 | textbox | 受 理 令和 年 月 日 第 号 |
| 1 | paragraph | ※この注意書きは印刷さ 時 れま 分受付 せん 他（ 。印 ）     刷 他 時 （ |
| 1 | graphic | （テキストなし） |
| 1 | graphic | （テキストなし） |
| 1 | graphic | （テキストなし） |
| 1 | paragraph | 婚 姻 届 |
| 1 | heading L1 | に ） 注意書きが消えない場合は、別のブラウザやPDFソフトからの印刷をお試しください。 |
| 1 | textbox | 証 人 署 名 （※押印は任意） 印 印 生 年 月 日 年 月 日 年 月 日 住 所 本 籍 番地 番 番地 番 |
| 1 | paragraph | 公館印 |
| 1 | paragraph | 令和 年 月 日 届出 |
| 1 | paragraph | 大 使 |
| 1 | paragraph | 書類調査 戸籍記載 記載調査 調 査 票 |
| 1 | paragraph | 附 票 住 民 票 通 知 |
| 1 | paragraph | 在シンガポール日本国 |
| 1 | paragraph | 殿 |
| 1 | paragraph | 総領事 |
| 1 | paragraph | （ フ リ ガ ナ ） |
| 1 | paragraph | 夫 に な る 人 |
| 1 | paragraph | 妻 に な る 人 |
| 1 | paragraph | 氏 名 氏 名 |
| 1 | textbox | 記入の注意 |
| 1 | paragraph | (1) 氏 名 |
| 1 | paragraph | (2) |
| 1 | paragraph | 生 年 月 日 |
| 1 | paragraph | 住 所 |
| 1 | paragraph | 昭和 ・ 平成 年 |
| 1 | paragraph | シンガポール共和国 |
| 1 | paragraph | 月 日 昭和 ・ 平成 年 月 日 |
| 1 | paragraph | シンガポール共和国 |
| 1 | paragraph | (3) |
| 1 | paragraph | 本 籍 |
| 1 | paragraph | 外国人のときは 番地 番地 |
| 1 | paragraph | （ 国籍だけを書い ） 筆頭者 |
| 1 | paragraph | 番 番 |
| 1 | paragraph | 筆頭者 |
| 1 | paragraph | て く だ さ い |
| 1 | paragraph | 父  母  及  び 養 父 母 の 氏 名 父 母 と の 続 き 柄 |
| 1 | paragraph | の氏名 |
| 1 | paragraph | 父 母 |
| 1 | textbox | （ ） |
| 1 | paragraph | 養父 |
| 1 | paragraph | 続き柄 |
| 1 | paragraph | 男 続き柄 |
| 1 | paragraph | の氏名 |
| 1 | paragraph | 父 母 |
| 1 | paragraph | 養父 |
| 1 | paragraph | 続き柄 |
| 1 | paragraph | 女 続き柄 |
| 1 | paragraph | 右 記 の 養 父 母 以 外 に も |
| 1 | paragraph | 養 父 母 が い る 場 合 に は |
| 1 | paragraph | その他の欄に書いてください 養母 |
| 1 | paragraph | 養 子 養母 養 女 |
| 1 | paragraph | (4) |
| 1 | paragraph | 婚姻後の夫婦の 氏・新しい本籍 |
| 1 | paragraph | □夫の氏 |
| 1 | paragraph | □妻の氏 |
| 1 | paragraph | 新本籍（左の☑の氏の人がすでに戸籍の筆頭者となっているときは書かないでください） |
| 1 | paragraph | 番地 番 |
| 1 | paragraph | (5) |
| 1 | paragraph | 同居を始めたとき |
| 1 | paragraph | 平成 ・ 令和 |
| 1 | paragraph | （ 結婚式をあげたとき、または、同居を始め ） |
| 1 | textbox | 年 月 |
| 1 | paragraph | たときのうち早いほうを書いてください |
| 1 | paragraph | (6) |
| 1 | paragraph | 初婚・再婚の別 |
| 1 | paragraph | □初婚 |
| 1 | paragraph | 再 （ 婚 |
| 1 | paragraph | □死別 平成 |
| 1 | paragraph | □離別 令和 |
| 1 | paragraph | 年 月 日 ） □初婚 |
| 1 | paragraph | 再 （ 婚 |
| 1 | paragraph | □死別 平成 年 |
| 1 | paragraph | □離別 令和 |
| 1 | paragraph | 月 日 ） |
| 1 | paragraph | (7) |
| 1 | paragraph | 同 居 を 始 め る 前の夫婦のそれ ぞ れ の 世 帯 の お も な 仕 事 と |
| 1 | paragraph | （国勢調査の年… 年…の４月１日から翌年３月３１日までに届出をするときだけ書いてください） |
| 1 | paragraph | (8) |
| 1 | paragraph | 夫 婦 の 職 業 |
| 1 | paragraph | 夫の職業 |
| 1 | paragraph | 妻の職業 |
| 1 | group | （テキストなし） |
| 1 | paragraph | 令和 年 月 日 の方式により婚姻成立、 作成の |
| 1 | paragraph | 婚姻証書添付。 |
| 1 | graphic | （テキストなし） |
| 1 | paragraph | そ の 他 |
| 1 | table（3行） | 届 出 人 署 名 夫 （※押印は任意） 印 妻 印 事 件 簿 番 号 (届出人の連絡先及び電話番号 Mobile: E-mail: ） |

### form/syomei.pdf

| ページ | 要素 | テキスト |
|---|---|---|
| 1 | paragraph | 署 名 (お よ び 拇 印) 証 明 申 請 書 |
| 1 | paragraph | 年 月 日 |
| 1 | paragraph | 在シンガポール日本国大使 殿 |
| 1 | paragraph | 以下の目的のため私の署名（及び拇印）証明を申請します。 |
| 1 | paragraph | ●必要な証明形式（「形式１」または「形式２」）にチェックを入れてください。 |
| 1 | paragraph | ※証明書の原紙は窓口でお渡しいたしますので番号が呼ばれるまでお待ちください。 |
| 1 | paragraph | ※形式１の場合、持参されている書類への署名はせず、窓口で確認後、署名をしてください。 |
| 1 | table（4行） | □ 「形式 １」（貼付型） □ 「形式 ２」（単独型） 署名をする必要のある書類に、申請人が署名したこ とを証明する形式です。お手持ちの書類に、大使館 の証明が貼付されます。 市区町村役場で発行される印鑑証明のように申請人の署 名および拇印であることを、一枚の証明書として発行しま す。 必要通数 通 必要通数 通 合 計 通 |
| 1 | group | 外国語 ： 有 無 抜いていない場合 市 ・ 区 町 ・ 村 （郡） 都 ・ 道 府 ・ 県 住民登録市区町村役場名 ： 抜いていません。 抜いています。 私は、日本の住民登録を、 日 月 年 大 ・ 昭 平 ・ 令 生年 月日 備 考 (自宅・勤務先・携帯) 連絡先 日本の住民登録を抜いていない方の場合、提出先関係機関が、日本国 大使館（総領事館）からの署名証明を要求していますか？ （○○法務局、○○運輸支局、○○銀行、司法書士、行政書士等） 提出先 (遺産分割協議書への署名、不動産登記、車の名義変更、銀行手続き等） 使用目的 現住所 日本 旅券番号 ｱﾙﾌｧﾍﾞｯﾄ （※読みやすい字体で原則として戸籍上の氏名を記入してください。） 申請人氏名 |

### invoice-57-….pdf

| ページ | 要素 | テキスト |
|---|---|---|
| 1 | heading L1 | 領収書 |
| 1 | heading L2 | 堀菜摘 様 |
| 1 | group | （テキストなし） |
| 1 | paragraph | No. SEI-3993146 |
| 1 | paragraph | 発行日：2026年04月04日 ご利用日：2026年04月04日 |
| 1 | paragraph | 但し |
| 1 | paragraph | シェアラウンジ利用料として（クレジットカード払い） 下記の通り領収しました。 |
| 1 | textbox | 合計金額 1,930  円（税込） |
| 1 | paragraph | (内(10%) 税抜 1,755円 消費税10% 175円) |
| 1 | paragraph | 530-0001 大阪府大阪市北区 梅田3丁目2-123 イノゲート大阪 6階 |
| 1 | paragraph | 06-6616-8111 |
| 1 | paragraph | TSUTAYA BOOKSTORE |
| 1 | paragraph | イノゲート大阪 登録番号 T2120001077107 |

### invoice_B003028840.pdf

個人情報を含むため省略。

### receipt_875103444-発車オーライネット….pdf

| ページ | 要素 | テキスト |
|---|---|---|
| 1 | image | （テキストなし） |
| 1 | paragraph | 領収書 |
| 1 | paragraph | スヌワルニルマルクマル 様 |
| 1 | paragraph | 下記の通り、正に領収致しました。 |
| 1 | table（2行） | 合計⾦額 ¥2,400－（10%対象消費税・税込み） ※但し、乗車券代として（PayPay決済） 領収⽇ 2025年03月19日 |
| 1 | table（9行） | ご予約番号 03198002242 運賃⾦額 ¥2,400－ その他手数料・料⾦ ¥0－ ご利⽤往路路線名 土浦つくば・成田空港線 出発⽇／便 2025年04月09日／ 0001便 乗⾞区間 つくばセンター⇒成田空港第2PTB 発⾏⽇ 2025年03月19日 発⾏番号 2025031908002242-1 登録番号 T3030001082610 |
| 1 | paragraph | 発⾞オーライネット運営元 |
| 1 | paragraph | バス乗⾞券・鉄道乗⾞券代⾦代理受領者 株式会社⼯房 |
| 1 | image | （テキストなし） |
| 1 | paragraph | 〒332-0012 埼⽟県⼝市本町3丁⽬2-22 |
| 1 | paragraph | 発⾞オーライネット https://secure.j-bus.co.jp |

### receipt_ocr-ed_iris.pdf

| ページ | 要素 | テキスト |
|---|---|---|
| 1 | group | （テキストなし） |

※ トライアルライセンスのため、出力には評価用シート（ランダムな位置に差し込まれるページ）が含まれます。この表ではそのページを除外し、ページ番号を元の PDF に合わせています。
