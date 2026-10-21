export const profileDetails = {
  motivation: "自分のアイデアが実際に動き、形になったときに達成感があります。思い立ったことを試して、自分の技術でどこまでできるか確かめるのが好きです。",
  aspiration: "顧客との会話から、要望の背景にある課題を見つけられるシステムエンジニアを目指しています。",
  qualification: "基本情報技術者試験 合格",
  interests: "クラウド技術・UX設計",
  webExperience: "JavaのWeb開発（Servlet・DAO・Tomcat）",
  uxMethods: "ペルソナ法・カスタマージャーニーマップ・思考発話法",
  teamExperience: "飲食店のアルバイトではマネージャーを務め、育成の担当・期限をそろえ、進捗をノートで共有する仕組みを整えました。",
} as const;

export const personalStrengths = [
  {
    title: "手を動かして、完成まで進める",
    description: "思いついたことはまず試してみます。担当した機能ができた後も、追加でできることを探したくなります。わからないところは調べたりAIに質問したりして、途中で止めずに形にします。",
  },
  {
    title: "自分の案より、目的に合う案を選ぶ",
    description: "意見が違うときは、先に相手の説明や意図を聞きます。自分の意見を通すことより、何を実現したいかをそろえ、目的に合う案を選ぶことを大切にしています。",
  },
  {
    title: "相談に乗りながら、相手の担当を尊重する",
    description: "助けることと、代わりにやることは分けて考えています。質問や相談には応じつつ、相手が自分で考えて身につける時間も残したいと思っています。",
  },
] as const;

export const restaurantContribution = {
  slug: "restaurant-order-system",
  format: "大学の授業・4人チーム",
  duration: "約3か月",
  role: "システムフローとクラス構成の設計、Main・価格/カロリー検索・限定表示の実装、各機能の統合",
  coordination: "各担当の実装をつなぎ、入力の流れや出力形式を調整しました。チーム制作後には、個人で管理メニューの継続操作とメニュー・店舗商品登録を追加しました。",
} as const;
