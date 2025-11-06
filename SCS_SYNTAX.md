# ScratchScript (.scs) 文法仕様

## 概要

ScratchScript（.scs）は Scratch にインスパイアされた簡易プログラミング言語です。
テキストベースで記述し、ブラウザ上の安全なサンドボックス環境で実行されます。

## 基本構文

### 1. 変数宣言と代入

```scs
set x to 10
set name to "Hello"
set isActive to true
```

### 2. 演算

```scs
set result to x + 5
set result to x - 3
set result to x * 2
set result to x / 2
```

### 3. 出力

```scs
say "Hello, World!"
say x
say "Result is: " + result
```

### 4. 条件分岐

```scs
if x > 10 then
  say "x is greater than 10"
else
  say "x is 10 or less"
end
```

### 5. 繰り返し

```scs
repeat 5 times
  say "Hello!"
end

set i to 0
while i < 10 do
  say i
  set i to i + 1
end
```

### 6. 関数定義（将来拡張用）

```scs
define greet with name
  say "Hello, " + name
end

call greet with "World"
```

## サンプルプログラム

### カウントアップ

```scs
set counter to 0
repeat 10 times
  say "Count: " + counter
  set counter to counter + 1
end
say "Done!"
```

### FizzBuzz

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

## 制約

- 最大実行時間: 5秒（無限ループ対策）
- 最大出力行数: 1000行
- 変数名: 英数字とアンダースコア（先頭は英字）
- 文字列: ダブルクォーテーションで囲む
- コメント: `#` で始まる行
