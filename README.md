# AIおじ AR名刺

名刺画像を MindAR の画像認識ターゲットにして、スマホのWebブラウザで動画を重ねて再生する WebAR ページです。

## ファイル配置

```text
AI_Oji_AR_BusinessCard/
├── index.html
├── main.js
├── styles.css
├── vercel.json
├── package.json
├── scripts/
│   └── compile-target.mjs
└── public/
    ├── assets/
    │   ├── business-card.png          # 名刺画像
    │   └── business-card-video.mp4    # 重ねて再生する動画
    └── targets/
        └── business-card.mind         # MindAR用の認識データ
```

## ローカルで確認する

```bash
npm install
npm start
```

表示されたURLを開きます。スマホで確認する場合は、同じWi-Fi上でPCのローカルIPアドレスを使ってアクセスしてください。

iPhone Safari でカメラを使うには、公開URLまたはHTTPSのURLが必要です。Vercelに公開したURLならそのまま動作確認できます。

## Vercelで公開する

1. このフォルダをGitHubなどにアップロードします。
2. Vercelで「New Project」を選び、このリポジトリを選択します。
3. Framework Preset は「Other」のままでOKです。
4. Build Command は空欄、Output Directory も空欄のままでOKです。
5. Deployします。

公開後、iPhone SafariでVercelのURLを開き、「開始」を押してカメラを許可してください。名刺画像をカメラに映すと動画が名刺の上に固定表示されます。名刺が画面外に出ると動画は消えます。

## 素材を差し替える場合

- 名刺画像を差し替える: `public/assets/business-card.png` を同名で置き換え、MindAR用の `.mind` ファイルも作り直して `public/targets/business-card.mind` に置きます。
- 動画を差し替える: `public/assets/business-card-video.mp4` を同名で置き換えます。

動画は iPhone Safari で再生しやすい H.264/AAC の `.mp4` をおすすめします。

このプロジェクトでは、現在の名刺画像から作った `public/targets/business-card.mind` を同梱済みです。そのまま公開する場合は追加作業はいりません。
