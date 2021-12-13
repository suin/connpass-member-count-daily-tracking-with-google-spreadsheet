# Google Spreadsheet に Connpass グループのメンバー数を記録する Google Apps Script

Connpass グループのメンバー数を定期的に Google Spredsheet に記録するツールです。

## 使い方

このリポジトリをローカルに git clone したら、PNPM で必要なライブラリをインストールする:

```sh
pnpm install
```

code.ts の`config`変数の`group`を記録したい Connpass グループのサブドメインにする。

Google にログインする:

```sh
pnpx clasp login
```

スプレッドシートを作る:

```sh
pnpx clasp create --title="Connpassグループメンバー数" --type=sheets --rootDir=.
```

出力されたスプレッドシートの URL を開き、「シート 1」の名前を「Data」にする。そのシートの 1 行目に次のような見出しを追加する。

|     |   A   |  B   |      C      |
| --- | :---: | :--: | :---------: |
| 1   | group | date | memberCount |

Google Apps Script をデプロイする:

```sh
pnpx clasp push
```

上の「スプレッドシートを作る」の出力結果の「Created new Google Sheets Add-on script」の URL を開いて、App Script のエディタを開く。code.gs ファイルを開いて、`trackConnpassMemberCount`を「実行」する。

すると、「承認が必要です」というダイアログが出るので、「権限を確認」を押し、許可をする。承認が済むと、自動的に実行が始まる。

実行ログにエラーが無いことを確認する。加えて、「Data」シートに記録が増えていることを確認する。

以上で問題なければデプロイは完了。

## トリガーの設定

定期実行するためにトリガーの設定が必要です。

Apps Script のトリガータブを開く。

「トリガーを追加」ボタンを押す。

「実行する関数を選択」: `trackConnpassMemberCount`

「イベントのソースを選択」:「時間主導型」

「時間ベースのトリガーのタイプを選択」:「日付ベースのタイマー」
