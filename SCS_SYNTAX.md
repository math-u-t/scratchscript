# ScratchScript (.scs) 言語仕様書

バージョン: 1.0.0
最終更新: 2025年

---

## 目次

1. [概要](#概要)
2. [設計思想と目的](#設計思想と目的)
3. [字句構造](#字句構造)
4. [データ型](#データ型)
5. [演算子](#演算子)
6. [変数とスコープ](#変数とスコープ)
7. [制御構造](#制御構造)
8. [実行モデル](#実行モデル)
9. [形式文法](#形式文法)
10. [サンプルプログラム](#サンプルプログラム)
11. [ベストプラクティス](#ベストプラクティス)
12. [エラーとトラブルシューティング](#エラーとトラブルシューティング)
13. [制約と制限](#制約と制限)
14. [将来の拡張](#将来の拡張)

---

## 概要

**ScratchScript**（.scs）は、MIT Media Lab の Scratch プロジェクトにインスパイアされた、教育用のテキストベースプログラミング言語です。初学者にも理解しやすい自然言語に近い構文を採用しつつ、プログラミングの基本概念（変数、制御構造、演算）を学習できます。

### 主な特徴

- **読みやすい構文**: 英語に近い自然な記述
- **動的型付け**: 変数の型宣言不要
- **サンドボックス実行**: ブラウザ上の Web Worker で安全に実行
- **エラーメッセージ**: 初学者にも分かりやすいエラー表示
- **実行時制限**: 無限ループ対策とリソース制限

---

## 設計思想と目的

### 設計目標

1. **学習の容易性**: プログラミング初学者が最初に学ぶ言語として最適
2. **可読性重視**: コードを読めば何をしているか理解できる
3. **安全性**: エラーが発生しても分かりやすく、システムに影響を与えない
4. **段階的学習**: 基本から高度な概念へ段階的に学習可能

### 対象ユーザー

- プログラミング初学者（小学生〜高校生）
- プログラミング教育の教材として
- アルゴリズムの学習と実験
- 簡単なスクリプトの作成

---

## 字句構造

### トークン

ScratchScript のプログラムは以下のトークンから構成されます：

#### 1. キーワード（予約語）

```
set, to, say, if, then, else, end, repeat, times, while, do
define, with, call
```

これらは変数名として使用できません。

#### 2. リテラル

**数値リテラル**:
```scs
42          # 整数
3.14        # 浮動小数点数
-10         # 負の数
0.5         # 小数
```

**文字列リテラル**:
```scs
"Hello"              # 文字列
"Hello, World!"      # スペース含む
"Line 1\nLine 2"     # エスケープシーケンスは未対応（将来拡張）
""                   # 空文字列
```

**ブール値リテラル**:
```scs
true       # 真
false      # 偽
```

#### 3. 識別子（変数名）

**規則**:
- 先頭は英字（a-z, A-Z）またはアンダースコア（_）
- 2文字目以降は英数字またはアンダースコア
- 大文字と小文字を区別（`count` と `Count` は別の変数）
- キーワードは使用不可

**有効な識別子の例**:
```scs
x
counter
user_name
totalScore
_temp
myVar123
```

**無効な識別子の例**:
```scs
123abc      # 数字で始まる
my-var      # ハイフンは使用不可
set         # キーワード
total score # スペースは使用不可
```

#### 4. 演算子

```
算術演算子:  +  -  *  /  %
比較演算子:  ==  !=  <  >  <=  >=
```

#### 5. デリミタ

```
改行        # 文の終端
#           # コメント開始
```

#### 6. 空白とコメント

**空白文字**: スペース、タブ、改行はトークンの区切りとして機能

**コメント**: `#` から行末までがコメント
```scs
# これはコメントです
set x to 10  # 変数 x に 10 を代入
```

---

## データ型

ScratchScript は動的型付け言語で、以下の3つの基本データ型をサポートします。

### 1. 数値型（Number）

整数と浮動小数点数を統一的に扱います。内部的には IEEE 754 倍精度浮動小数点数として表現されます。

```scs
set age to 25
set pi to 3.14159
set temperature to -5.5
```

**演算結果**:
```scs
set a to 10 / 3    # 3.333...
set b to 10 % 3    # 1 (剰余)
set c to 5 * 2     # 10
```

### 2. 文字列型（String）

ダブルクォーテーションで囲まれた文字の並び。

```scs
set message to "Hello, World!"
set name to "太郎"
set empty to ""
```

**文字列連結**:
```scs
set greeting to "Hello, " + "World"  # "Hello, World"
set mixed to "Count: " + 42          # "Count: 42"
```

### 3. ブール型（Boolean）

真偽値を表す型。

```scs
set isActive to true
set isDone to false
```

**ブール値への変換**:
- 数値: `0` は偽、それ以外は真
- 文字列: 空文字列 `""` は偽、それ以外は真
- ブール: そのまま

---

## 演算子

### 算術演算子

| 演算子 | 意味 | 例 | 結果 |
|--------|------|-----|------|
| `+` | 加算 | `5 + 3` | `8` |
| `-` | 減算 | `5 - 3` | `2` |
| `*` | 乗算 | `5 * 3` | `15` |
| `/` | 除算 | `6 / 2` | `3` |
| `%` | 剰余 | `7 % 3` | `1` |

**注意事項**:
- ゼロ除算はランタイムエラー
- 文字列と数値の `+` は文字列連結

```scs
set result to 10 / 0   # エラー: Division by zero
set text to "Value: " + 42  # "Value: 42"
```

### 比較演算子

| 演算子 | 意味 | 例 | 結果 |
|--------|------|-----|------|
| `==` | 等しい | `5 == 5` | `true` |
| `!=` | 等しくない | `5 != 3` | `true` |
| `<` | 小なり | `3 < 5` | `true` |
| `>` | 大なり | `5 > 3` | `true` |
| `<=` | 以下 | `5 <= 5` | `true` |
| `>=` | 以上 | `5 >= 3` | `true` |

**文字列の比較**:
```scs
"abc" == "abc"   # true
"abc" < "def"    # true（辞書順）
```

### 演算子の優先順位

優先度の高い順：

1. `()` - 括弧（グループ化）
2. `*`, `/`, `%` - 乗除、剰余
3. `+`, `-` - 加減
4. `<`, `>`, `<=`, `>=` - 比較
5. `==`, `!=` - 等価

**例**:
```scs
set result to 2 + 3 * 4      # 14 (not 20)
set result to (2 + 3) * 4    # 20
set result to 10 > 5 + 2     # true (10 > 7)
```

---

## 変数とスコープ

### 変数の宣言と代入

ScratchScript では変数宣言と代入を同時に行います。

```scs
set 変数名 to 式
```

**例**:
```scs
set x to 10
set name to "Alice"
set isValid to true
set result to x + 5
```

### スコープ規則

**現在の実装**: すべての変数はグローバルスコープ

```scs
set x to 10

if x > 5 then
  set y to 20    # グローバル変数 y を作成
end

say y            # 20 が出力される
```

**注意**: ローカルスコープは将来のバージョンで実装予定

### 変数の再代入

同じ変数名に異なる値を代入可能（型も変更可能）。

```scs
set x to 10        # x は数値
say x              # 10
set x to "Hello"   # x は文字列に変更
say x              # Hello
```

---

## 制御構造

### 1. 条件分岐（if-then-else）

```scs
if 条件式 then
  文...
end

if 条件式 then
  文...
else
  文...
end
```

**例**:
```scs
set age to 20

if age >= 18 then
  say "成人です"
else
  say "未成年です"
end
```

**ネストした条件分岐**:
```scs
set score to 85

if score >= 90 then
  say "優"
else
  if score >= 80 then
    say "良"
  else
    if score >= 70 then
      say "可"
    else
      say "不可"
    end
  end
end
```

**真偽値の評価**:
- 数値: `0` は偽、それ以外は真
- 文字列: 空文字列は偽、それ以外は真
- ブール: `true` は真、`false` は偽

### 2. 繰り返し（repeat）

指定回数だけ繰り返します。

```scs
repeat 回数 times
  文...
end
```

**例**:
```scs
repeat 5 times
  say "Hello!"
end

set count to 10
repeat count times
  say "Counting..."
end
```

**注意事項**:
- 回数は正の整数である必要があります
- 小数は整数に丸められます
- 負の数やゼロの場合、繰り返しは実行されません

### 3. 繰り返し（while）

条件が真の間、繰り返します。

```scs
while 条件式 do
  文...
end
```

**例**:
```scs
set i to 0
while i < 5 do
  say i
  set i to i + 1
end
```

**無限ループ対策**:
```scs
# このコードは5秒後にタイムアウトします
set i to 0
while i < 100000000 do
  set i to i + 1
end
# エラー: Execution timeout
```

### 4. 出力（say）

値を出力します。

```scs
say 式
```

**例**:
```scs
say "Hello, World!"
say 42
say 3.14
say true

set name to "Alice"
say "Hello, " + name
say "Result: " + (10 + 5)
```

**出力の制限**:
- 最大1000行まで出力可能
- それを超えるとエラーが発生します

---

## 実行モデル

### プログラムの実行

1. **パース**: ソースコードをトークン化し、抽象構文木（AST）を構築
2. **評価**: AST を順次実行
3. **出力**: `say` 文の結果を出力バッファに蓄積
4. **終了**: すべての文を実行するか、エラー/タイムアウトで終了

### 実行環境

- **サンドボックス**: Web Worker 内で実行され、メインスレッドと分離
- **タイムアウト**: 最大5秒で強制終了
- **反復回数制限**: 100万回の反復でエラー（無限ループ対策）
- **メモリ制限**: 変数の数や文字列のサイズに制限あり

### エラーハンドリング

エラーが発生すると、プログラムは即座に停止し、エラーメッセージが表示されます。

**エラーの種類**:

1. **構文エラー**: パース時に検出
   ```
   Error: Expected 'then' but got 'do'
   Error: Unexpected token: }
   ```

2. **ランタイムエラー**: 実行時に検出
   ```
   Error: Undefined variable: x
   Error: Division by zero
   Error: Invalid token format
   ```

3. **リソース制限エラー**:
   ```
   Error: Execution timeout (5 seconds)
   Error: Iteration limit exceeded
   Error: Output limit exceeded (1000 lines)
   ```

---

## 形式文法

EBNF（拡張バッカス記法）による文法定義：

```ebnf
program          = statement* ;

statement        = set_statement
                 | say_statement
                 | if_statement
                 | repeat_statement
                 | while_statement
                 | comment ;

set_statement    = "set" IDENTIFIER "to" expression ;
say_statement    = "say" expression ;

if_statement     = "if" expression "then"
                   statement*
                   [ "else" statement* ]
                   "end" ;

repeat_statement = "repeat" expression "times"
                   statement*
                   "end" ;

while_statement  = "while" expression "do"
                   statement*
                   "end" ;

expression       = comparison ;

comparison       = additive
                   [ ("==" | "!=" | "<" | ">" | "<=" | ">=") additive ] ;

additive         = multiplicative
                   [ ("+" | "-") multiplicative ]* ;

multiplicative   = primary
                   [ ("*" | "/" | "%") primary ]* ;

primary          = NUMBER
                 | STRING
                 | BOOLEAN
                 | IDENTIFIER
                 | "(" expression ")" ;

comment          = "#" [^\n]* "\n" ;

IDENTIFIER       = [a-zA-Z_][a-zA-Z0-9_]* ;
NUMBER           = [0-9]+ ("." [0-9]+)? ;
STRING           = '"' [^"]* '"' ;
BOOLEAN          = "true" | "false" ;
```

---

## サンプルプログラム

### 1. Hello World

最も基本的なプログラム：

```scs
say "Hello, World!"
```

### 2. 変数と演算

```scs
set x to 10
set y to 20
set sum to x + y
say "Sum: " + sum
```

### 3. 条件分岐（偶数・奇数判定）

```scs
set number to 7

if number % 2 == 0 then
  say number + " is even"
else
  say number + " is odd"
end
```

### 4. カウントアップ

```scs
set counter to 0
repeat 10 times
  say "Count: " + counter
  set counter to counter + 1
end
say "Done!"
```

### 5. FizzBuzz

```scs
set i to 1
while i <= 20 do
  if i % 15 == 0 then
    say "FizzBuzz"
  else
    if i % 3 == 0 then
      say "Fizz"
    else
      if i % 5 == 0 then
        say "Buzz"
      else
        say i
      end
    end
  end
  set i to i + 1
end
```

### 6. 階乗の計算

```scs
set n to 5
set factorial to 1
set i to 1

while i <= n do
  set factorial to factorial * i
  set i to i + 1
end

say "Factorial of " + n + " is " + factorial
```

### 7. 素数判定

```scs
set number to 17
set isPrime to true

if number <= 1 then
  set isPrime to false
else
  set i to 2
  while i * i <= number do
    if number % i == 0 then
      set isPrime to false
    end
    set i to i + 1
  end
end

if isPrime then
  say number + " is prime"
else
  say number + " is not prime"
end
```

### 8. フィボナッチ数列

```scs
set n to 10
set a to 0
set b to 1
set count to 0

say "Fibonacci sequence:"
while count < n do
  say a
  set temp to a + b
  set a to b
  set b to temp
  set count to count + 1
end
```

### 9. 最大公約数（ユークリッドの互除法）

```scs
set num1 to 48
set num2 to 18

while num2 != 0 do
  set temp to num2
  set num2 to num1 % num2
  set num1 to temp
end

say "GCD: " + num1
```

### 10. 九九の表

```scs
set i to 1
while i <= 9 do
  set j to 1
  while j <= 9 do
    say i + " x " + j + " = " + (i * j)
    set j to j + 1
  end
  set i to i + 1
end
```

---

## ベストプラクティス

### 1. 変数名の命名規則

**推奨**:
```scs
set userName to "Alice"      # キャメルケース
set total_score to 100       # スネークケース
set isActive to true         # ブール値には is/has を使う
```

**非推奨**:
```scs
set x to "Alice"    # 意味が不明
set a1 to 100       # 略語は避ける
set flag to true    # 何のフラグか不明
```

### 2. コメントの活用

```scs
# プログラムの目的を説明
# このプログラムは素数を判定します

set number to 17        # 判定する数値
set isPrime to true     # 素数フラグ

# 2からsqrt(number)までチェック
set i to 2
while i * i <= number do
  if number % i == 0 then
    set isPrime to false  # 割り切れたら素数ではない
  end
  set i to i + 1
end
```

### 3. マジックナンバーの回避

**推奨**:
```scs
set MAX_ATTEMPTS to 3
set count to 0

while count < MAX_ATTEMPTS do
  say "Attempt " + (count + 1)
  set count to count + 1
end
```

**非推奨**:
```scs
set count to 0
while count < 3 do  # 3は何を意味する？
  say "Attempt " + (count + 1)
  set count to count + 1
end
```

### 4. 適切なインデント

**推奨**:
```scs
if x > 0 then
  if y > 0 then
    say "Both positive"
  end
end
```

**非推奨**:
```scs
if x > 0 then
if y > 0 then
say "Both positive"
end
end
```

### 5. 複雑な条件の分解

**推奨**:
```scs
set isAdult to age >= 18
set hasPermission to isRegistered == true

if isAdult then
  if hasPermission then
    say "Access granted"
  end
end
```

**非推奨**:
```scs
if age >= 18 then
  if isRegistered == true then
    say "Access granted"
  end
end
```

---

## エラーとトラブルシューティング

### よくあるエラー

#### 1. 未定義の変数

**エラー**:
```
Error: Undefined variable: count
```

**原因**:
```scs
say count  # count が定義されていない
```

**解決**:
```scs
set count to 0
say count
```

#### 2. ゼロ除算

**エラー**:
```
Error: Division by zero
```

**原因**:
```scs
set result to 10 / 0
```

**解決**:
```scs
set divisor to 0
if divisor != 0 then
  set result to 10 / divisor
else
  say "Cannot divide by zero"
end
```

#### 3. 構文エラー

**エラー**:
```
Error: Expected 'then' but got 'do'
```

**原因**:
```scs
if x > 5 do  # 'then' を使うべき
  say "Big"
end
```

**解決**:
```scs
if x > 5 then
  say "Big"
end
```

#### 4. end の不足

**エラー**:
```
Error: Unexpected token
```

**原因**:
```scs
if x > 5 then
  say "Big"
# end が足りない

say "Done"
```

**解決**:
```scs
if x > 5 then
  say "Big"
end

say "Done"
```

#### 5. 実行時間の超過

**エラー**:
```
Error: Execution timeout (5 seconds)
```

**原因**:
```scs
set i to 0
while i < 10000000 do  # 時間がかかりすぎる
  set i to i + 1
end
```

**解決**:
- ループの条件を見直す
- 繰り返し回数を減らす
- アルゴリズムを最適化する

#### 6. 出力行数の超過

**エラー**:
```
Error: Output limit exceeded (1000 lines)
```

**原因**:
```scs
set i to 0
while i < 10000 do
  say i  # 1000行を超える出力
  set i to i + 1
end
```

**解決**:
```scs
set i to 0
while i < 100 do  # 出力を減らす
  say i
  set i to i + 1
end
```

### デバッグのヒント

#### 1. 変数の値を確認

```scs
set x to 10
say "x = " + x  # デバッグ出力

set y to x * 2
say "y = " + y  # デバッグ出力
```

#### 2. ループの進行を確認

```scs
set i to 0
while i < 10 do
  say "Loop iteration: " + i  # ループの進行を追跡
  set i to i + 1
end
```

#### 3. 条件分岐の追跡

```scs
if x > 5 then
  say "Branch: x > 5"  # どの分岐に入ったか確認
else
  say "Branch: x <= 5"
end
```

---

## 制約と制限

### 実行時の制限

| 項目 | 制限値 | 理由 |
|------|--------|------|
| 最大実行時間 | 5秒 | 無限ループ対策 |
| 最大反復回数 | 100万回 | リソース保護 |
| 最大出力行数 | 1000行 | メモリ保護 |
| 最大変数名長 | 制限なし | - |
| 最大文字列長 | 制限なし（実用上は数KB） | メモリ制限 |

### 言語機能の制限

**現在サポートされていない機能**:

1. **配列/リスト**: 複数の値をまとめて扱う機能
2. **オブジェクト/辞書**: キーと値のペアを格納
3. **関数定義**: ユーザー定義関数（構文は予約済み）
4. **ローカルスコープ**: すべての変数はグローバル
5. **ファイル I/O**: ファイルの読み書き
6. **外部ライブラリ**: インポート機能
7. **例外処理**: try-catch
8. **論理演算子**: `and`, `or`, `not`
9. **ビット演算**: `&`, `|`, `^`
10. **文字列メソッド**: `length`, `substring`, `indexOf` 等

### セキュリティ制限

- **サンドボックス実行**: DOM や Web API へのアクセス不可
- **ネットワークアクセス不可**: HTTP リクエスト等は不可
- **システムコール不可**: OS の機能を直接呼び出せない

---

## 将来の拡張

### 短期的な拡張（v1.1 - v1.5）

#### 1. 論理演算子

```scs
if x > 0 and y > 0 then
  say "Both positive"
end

if x < 0 or y < 0 then
  say "At least one negative"
end

if not isFinished then
  say "Still working..."
end
```

#### 2. 配列のサポート

```scs
set numbers to [1, 2, 3, 4, 5]
say numbers[0]  # 1

set length to size of numbers  # 5

repeat length times
  say numbers[i]
end
```

#### 3. 文字列メソッド

```scs
set text to "Hello, World!"
set len to length of text
set upper to uppercase of text
set lower to lowercase of text
```

#### 4. for ループ

```scs
for i from 1 to 10 do
  say i
end

for item in list do
  say item
end
```

### 中期的な拡張（v2.0）

#### 1. 関数定義

```scs
define factorial with n
  if n <= 1 then
    return 1
  else
    return n * factorial(n - 1)
  end
end

set result to call factorial with 5
say result  # 120
```

#### 2. オブジェクト/辞書

```scs
set person to {
  name: "Alice",
  age: 25,
  city: "Tokyo"
}

say person.name
say person["age"]
```

#### 3. 例外処理

```scs
try
  set result to 10 / 0
catch error
  say "Error occurred: " + error
end
```

### 長期的な拡張（v3.0+）

- **モジュールシステム**: コードの再利用
- **クラス定義**: オブジェクト指向プログラミング
- **非同期処理**: `wait`, `async`, `await`
- **標準ライブラリ**: 数学、文字列、日付など
- **デバッガー**: ステップ実行、ブレークポイント
- **パフォーマンス最適化**: JIT コンパイル

---

## 付録

### A. キーワード一覧

```
set, to, say, if, then, else, end, repeat, times, while, do
define, with, call, return
true, false
```

### B. 演算子一覧

```
算術: + - * / %
比較: == != < > <= >=
論理: and or not (将来実装)
```

### C. 組み込み定数（将来実装予定）

```scs
PI        # 3.14159265...
E         # 2.71828182...
```

### D. 参考資料

- [Scratch 公式サイト](https://scratch.mit.edu/)
- [プログラミング教育](https://code.org/)
- ScratchScript GitHub リポジトリ

---

**Copyright © 2025 ScratchScript Project**
**License: MIT**
