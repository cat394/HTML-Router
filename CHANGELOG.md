# Changelog

すべての重要な変更はこのファイルに記録されます。

## [0.0.2] - 2024-05-01

### ライフサイクル名の変更

- ライフサイクル名をシンプルにした。onBeforePreContentClearをonLoadに、onClearをonDestroyに変更した。

## [0.0.5] - 2024-05-01

### ContextオブジェクトのAPIの変更

- フックのcontextオブジェクトのcloneNodeでは、ブラウザのcloneNodeメソッドと名前が重複するためcloneに名前を変更した。

### 注意

- このバージョンはプレビュー用であり、本番環境では使用しないでください。
