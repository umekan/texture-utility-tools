#!/bin/bash

# Tauri v2 テンプレートから新プロジェクト作成スクリプト

echo "🚀 Tauri v2 新プロジェクトセットアップ"
echo "=================================="

# プロジェクト名の入力
read -p "プロジェクト名を入力してください: " PROJECT_NAME
read -p "GitHub ユーザー名を入力してください: " GITHUB_USER
read -p "アプリ表示名を入力してください (例: My Awesome App): " APP_DISPLAY_NAME

if [ -z "$PROJECT_NAME" ] || [ -z "$GITHUB_USER" ] || [ -z "$APP_DISPLAY_NAME" ]; then
    echo "❌ 必要な情報が入力されていません"
    exit 1
fi

echo ""
echo "📝 設定内容:"
echo "  プロジェクト名: $PROJECT_NAME"
echo "  GitHub ユーザー: $GITHUB_USER"
echo "  アプリ名: $APP_DISPLAY_NAME"
echo ""

# package.json を更新
echo "📦 package.json を更新中..."
sed -i "s/\"name\": \"texture-utility-tools\"/\"name\": \"$PROJECT_NAME\"/" package.json

# tauri.conf.json を更新
echo "⚙️  tauri.conf.json を更新中..."
sed -i "s/\"productName\": \"Texture Utility Tools\"/\"productName\": \"$APP_DISPLAY_NAME\"/" src-tauri/tauri.conf.json
sed -i "s/\"title\": \"Texture Utility Tools\"/\"title\": \"$APP_DISPLAY_NAME\"/" src-tauri/tauri.conf.json
sed -i "s/\"identifier\": \"com.umekan.texture-utility-tools\"/\"identifier\": \"com.$GITHUB_USER.$PROJECT_NAME\"/" src-tauri/tauri.conf.json

# Cargo.toml を更新
echo "🦀 Cargo.toml を更新中..."
sed -i "s/name = \"texture-utility-tools\"/name = \"$PROJECT_NAME\"/" src-tauri/Cargo.toml

# README.md を更新
echo "📄 README.md を更新中..."
cat > README.md << EOF
# $APP_DISPLAY_NAME

Tauri v2 + React + TypeScript で開発されたデスクトップアプリケーション

## 開発開始

\`\`\`bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run tauri:dev

# ビルド
npm run tauri:build
\`\`\`

## リリース

\`\`\`bash
git tag -a v1.0.0 -m "First release"
git push origin v1.0.0
\`\`\`
EOF

# Git 設定
echo "🔧 Git を初期化中..."
rm -rf .git
git init
git branch -m main
git add .
git commit -m "Initial commit: Setup $APP_DISPLAY_NAME project

🤖 Generated with Tauri v2 template"

echo ""
echo "✅ セットアップ完了!"
echo ""
echo "📋 次のステップ:"
echo "1. GitHub でリポジトリを作成"
echo "2. git remote add origin https://github.com/$GITHUB_USER/$PROJECT_NAME.git"
echo "3. git push -u origin main"
echo "4. npm run tauri:dev で開発開始"
echo ""