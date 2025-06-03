# Tauri v2 + React + TypeScript テンプレート

このプロジェクトはTauri v2を使用したデスクトップアプリ開発のテンプレートです。

## 含まれる機能

- ✅ Tauri v2 + React 19 + TypeScript
- ✅ Vite による高速開発環境
- ✅ クロスプラットフォーム自動ビルド（Windows/macOS/Linux）
- ✅ GitHub Actions CI/CD
- ✅ タグベースリリース管理
- ✅ ESLint 設定

## テンプレートから新プロジェクト作成

### 1. GitHubテンプレート使用
1. [Use this template] ボタンをクリック
2. 新しいリポジトリ名を入力
3. Clone してローカル開発開始

### 2. 手動セットアップ
```bash
# このリポジトリをクローン
git clone https://github.com/umekan/texture-utility-tools.git my-new-app
cd my-new-app

# Git履歴をリセット
rm -rf .git
git init
git branch -m main

# プロジェクト設定を更新
```

## カスタマイズが必要な項目

### 1. package.json
```json
{
  "name": "your-app-name",
  "version": "0.0.0",
  // その他の項目
}
```

### 2. src-tauri/tauri.conf.json
```json
{
  "productName": "Your App Name",
  "identifier": "com.yourname.your-app-name",
  // その他の設定
}
```

### 3. src-tauri/Cargo.toml
```toml
[package]
name = "your-app-name"
# その他の設定
```

## 開発開始

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run tauri:dev

# ビルド
npm run tauri:build
```

## リリース作成

```bash
# バージョンタグを作成
git tag -a v1.0.0 -m "First release"
git push origin v1.0.0

# GitHub Actions が自動でビルド&リリース作成
```

## 必要な環境

- Node.js (LTS)
- Rust
- プラットフォーム固有の依存関係（Tauri公式ドキュメント参照）