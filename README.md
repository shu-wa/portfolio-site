# Portfolio Site

## 概要

就職活動で自身の制作物や技術経験を紹介するために作成したポートフォリオサイトです。

現在のコンセプトは「とりあえずなんでもやってみる！！」。AIとともに、小さく試して形にする好奇心を中心に、トップと制作物詳細をリニューアルしました。

TSUDOWAは一般公開向けの説明だけを表示し、内部システムの説明とGitHubリンクは公開APIにも含めません。管理画面のJSON取り込みと編集は引き続き利用できますが、Cognitoの `portfolio-admin` グループに所属する管理者だけを許可します。

検証・設定の詳細は [Security Review](docs/SECURITY_REVIEW.md) と [Design Review](docs/DESIGN_REVIEW.md) を参照してください。

Next.js、TypeScript、Tailwind CSSを用いてフロントエンドを実装し、AWS Amplify Hostingで公開しています。
また、お問い合わせフォーム、API、DynamoDB保存、Cognito認証付き管理画面を実装し、単なる静的サイトではなく、バックエンド連携を含むWebアプリケーションとして構築しました。
作品情報はDynamoDBで管理し、Cognito認証付き管理画面から追加・編集・削除できるようにしました。
お問い合わせ内容もDynamoDBに保存し、管理画面から確認・削除できます。

## 公開URL

https://main.d217a718xi2gst.amplifyapp.com/

## GitHub

https://github.com/shu-wa/portfolio-site

## 使用技術

* Next.js
* TypeScript
* Tailwind CSS
* AWS Amplify Hosting
* Amazon DynamoDB
* Amazon Cognito
* IAM
* Git / GitHub

## 主な機能

* 自己紹介の表示
* 制作物一覧の表示
* 制作物詳細ページ
* 作品情報取得API
* お問い合わせフォーム
* お問い合わせ内容のDynamoDB保存
* Cognitoによる管理者ログイン
* 管理画面でのお問い合わせ一覧表示
* GitHub連携による自動デプロイ

## システム構成

```text
ユーザー
↓
AWS Amplify Hosting
↓
Next.js
├─ 作品一覧・作品詳細ページ
├─ GET /api/projects
├─ POST /api/contact
└─ /admin 管理画面
     ↓
     Amazon Cognitoで認証
     ↓
     GET /api/contacts
     ↓
     DynamoDBからお問い合わせ一覧を取得
```

## AWS構成

### AWS Amplify Hosting

GitHubリポジトリと連携し、mainブランチにpushすると自動でビルド・デプロイされる構成にしています。

### Amazon DynamoDB

お問い合わせフォームから送信された内容を保存するために使用しています。

保存している主な項目は以下です。

* id
* name
* email
* message
* createdAt

### Amazon Cognito

管理画面のログイン機能に使用しています。
ログインUIでは新規登録を非表示にし、管理APIは `portfolio-admin` グループなどで明示した管理者だけを許可します。Cognito自体の新規登録禁止・MFAはAWS側で確認してください。

### IAM

AmplifyのCompute roleにDynamoDBへの書き込み・読み取り権限を付与し、アクセスキーをコードに直接書かずにAWSリソースへアクセスしています。

## 掲載している制作物

### 飲食店注文・在庫管理システム

JavaとMySQLを用いて、店舗選択、メニュー検索、注文、在庫管理、売上確認を行えるCLIシステムを作成しました。

### マインスイーパーRPG

PythonのPyxelを用いて、マインスイーパーにHP、敵の攻撃、旗による防御要素を追加したゲームを作成しました。

### 8パズル自動解法

Pythonで8パズルを実装し、幅優先探索による自動解法機能を追加しました。

## 工夫した点

* 作品データを分離し、トップページと詳細ページの両方で再利用できるようにしました。
* Next.jsの動的ルーティングを用いて、作品ごとの詳細ページを作成しました。
* API Routeを用いて、作品情報やお問い合わせ処理をAPI化しました。
* お問い合わせフォームから送信された内容をDynamoDBに保存できるようにしました。
* Cognitoによるログイン機能を追加し、管理者のみが問い合わせ一覧を確認できるようにしました。
* IAMロールを用いることで、アクセスキーをコードに書かずにAWSリソースへアクセスする構成にしました。
* GitHubにpushするとAWS Amplifyで自動デプロイされるようにしました。

## 今後の改善予定

* AWS上のMFA、最小権限、監視設定の継続確認
* 実機・スクリーンリーダーでの体験確認
* 制作物の実際のスクリーンショット・デモ映像の充実
