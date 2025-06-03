# GitHubテンプレートリポジトリ設定手順

## 1. このリポジトリをテンプレートに設定

1. GitHubでリポジトリページに移動
2. **Settings** タブをクリック
3. **General** セクションの **Template repository** にチェック
4. **Save** をクリック

## 2. テンプレートの使用方法

### 方法A: GitHub UI使用
1. テンプレートリポジトリページで **[Use this template]** ボタンをクリック
2. **Create a new repository** を選択
3. 新しいリポジトリ名を入力
4. **Create repository from template** をクリック

### 方法B: セットアップスクリプト使用
```bash
# テンプレートをクローン
git clone https://github.com/umekan/texture-utility-tools.git my-new-app
cd my-new-app

# セットアップスクリプト実行
./setup-new-project.sh

# 指示に従ってプロジェクト名等を入力
```

## 3. 自動化されるもの

✅ package.json のプロジェクト名更新  
✅ Tauri設定ファイルの更新  
✅ バンドル識別子の更新  
✅ README.md の生成  
✅ Git履歴のリセット  
✅ 初期コミットの作成  

## 4. 手動で必要な作業

- GitHubリポジトリの作成
- リモートリポジトリの設定
- 最初のプッシュ

これで数分でTauri v2プロジェクトが開始できます！