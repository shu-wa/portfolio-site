# Security Review

2026-10-02。対象はポートフォリオサイトです。TSUDOWAアプリ自体の侵入テストや内部システムの監査ではありません。

## 参照資料

指定資料 [Webアプリケーションのセキュリティレビュー](https://bogus.jp/webapp_security_review.pdf) の認可、CSRF、XSS・CSPに関する章を重点確認しました。認証と認可を分け、更新系リクエストの送信元を検証し、ブラウザ側の防御だけに依存しない実装へ変更しました。

## 実装済み

- 公開作品APIとHTMLは許可したフィールドだけを返します。TSUDOWAは公開用データに置き換え、内部説明、技術スタック、設計詳細、GitHub URLを返しません。管理データはDynamoDBに残ります。
- 管理データの読み取りと全更新・削除APIは、CognitoのIDトークンを署名検証したうえで `portfolio-admin` グループ、または明示的な管理者subを要求します。
- 更新系APIと問い合わせAPIは、設定したサイトと完全一致するOriginだけを受け付けます。
- JSONの形式、型、文字数、リスト件数、slug、URL、表示順を検証し、本文の読み込み中にもサイズを制限します。不明な作品フィールドは保存しません。
- Reactのテキストエスケープを維持し、ユーザー入力をHTMLとして挿入しません。動画埋め込み先はYouTubeのプライバシー強化ドメインに制限します。
- nonce付きCSPを動的ページへ適用します。本番のスクリプトは `unsafe-inline` / `unsafe-eval` を許可しません。インラインスタイルは既存UIとReactのスタイル指定のため許可しています。
- `nosniff`、埋め込み拒否、Referrer Policy、Permissions Policy、HSTSを設定します。管理APIは `private, no-store`、エラー応答も `no-store` です。
- 問い合わせは、ハニーポットと同じメールアドレスから1時間3回までの共有送信制限を使います。DynamoDBの条件付きPutItemで同時リクエストにも対応します。
- 秘密のアクセスキーをクライアントへ追加していません。AWSは既存のCompute roleを使用します。
- 公開ページからAmplify認証UIを分離しました。管理画面は検索エンジンのインデックス対象外です。
- Next.jsを16.3.8へ更新し、互換性のある依存関係の修正版を適用しました。2026-10-02時点の `npm audit` は既知の脆弱性0件でした。再監査の結果は下記に記録しています。

## 2026-10-03の追加確認

- トップの操作デモと作品シャッフルはクライアント内の状態だけを変更します。JSON生成・ダウンロードにもAPI送信や永続保存はありません。入力はReactのテキスト表示と `JSON.stringify` で処理し、HTMLやコードとして実行しません。
- `npm audit --omit=dev` は既知の脆弱性0件。追加したMatter.jsも本番依存の監査対象です。
- 開発依存を含む監査はhigh 5件。根本は `braces` の深いパターンによるスタック枯渇の警告で、ESLint用の `micromatch` / `fast-glob` / Next.jsプラグインへ伝播しています。本番依存には含まれません。[アドバイザリ](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
- npmが示す自動修正は `eslint-config-next` の14系への非互換変更です。Next.js 16の構成を壊す `npm audit fix --force` は実行せず、互換性のある修正版の確認を残課題とします。

## 2026-10-04のメモアプリ

アイデアメモだけは `portfolio:idea-notes:v1` という専用キーでlocalStorageへ保存します。API通信、ログへの送信、管理データの変更はありません。最大12件・48文字、読み込みサイズ、型、IDの重複を検証し、ユーザー入力はReactのテキストとして表示します。破損データは初期メモへ戻し、保存が拒否された場合はページ内の一時保存に切り替えます。秘密情報を保存する機能ではなく、共有端末では同じブラウザの利用者にメモが見える点に留意してください。JSONデモとシャッフルには永続保存を追加していません。

## AWSで必要な設定

管理ユーザーを、既存ユーザープールの `portfolio-admin` グループへ追加してください。追加後は管理画面からログアウトして再ログインし、新しいトークンを取得します。グループにIAMロールを付ける必要はありません。[Cognito公式手順](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-user-groups.html)

任意の別設定:

- `ADMIN_COGNITO_GROUP`: グループ名を変える場合だけ設定。
- `ADMIN_COGNITO_SUBS`: 管理者subのカンマ区切り。指定者だけを許可します。メールアドレスではありません。
- `SITE_ORIGIN`: 独自ドメインへ変える場合の完全なOrigin。既定値は現在のAmplify URLです。
- `DYNAMODB_PROJECTS_TABLE_NAME` / `DYNAMODB_CONTACTS_TABLE_NAME`: 既定のテーブル名を変える場合だけ設定。
- `DYNAMODB_REGION`: 既存テーブルのシドニー以外へ移す場合だけ設定。ホスティングの汎用 `AWS_REGION` と混同しません。

問い合わせテーブルでTTL属性 `expiresAt` を有効にすると、期限切れの送信制限レコードを掃除できます。未設定でも制限は動きます。同じメールアドレスの記録は3枠を再利用し、通常のお問い合わせにはTTLを付けません。

## 残る運用上の課題

- メールアドレスを変える大量送信やネットワーク全体のDoSは、この制限だけでは防げません。WAF・CAPTCHA等の導入は費用と運用を確認して別途判断します。
- Cognitoの新規登録禁止、MFA、パスワードポリシー、Compute roleの最小権限、ログ・アラートはAWS上で確認が必要です。UIの `hideSignUp` だけで新規登録を禁止したとは判断しません。
- 非公開化前に第三者が取得したソースやキャッシュは回収できません。過去に秘密情報を公開していた場合は、非公開化とは別に該当する秘密情報を失効・更新してください。
- 自動検査の成功は、脆弱性が存在しないことや第三者によるセキュリティ審査の完了を意味しません。

## 回帰検査

```powershell
npm run test:security
npm run lint
npm run build
# Next.jsを3100で起動し、Chromeがインストールされた環境で実行
npm run test:browser
```

`test:security` は実装のTypeScriptを読み込み、JWT検証とDynamoDBの境界だけをモック化します。公開情報の分離、権限拒否、Origin、入力検証、8件同時送信で3件だけ成功する制限、管理一覧のページングを検査します。本番データを変更しません。
