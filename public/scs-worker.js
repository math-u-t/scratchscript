/**
 * ScratchScript Web Worker
 *
 * メインスレッドから独立してコードを実行するための Worker
 */

// このファイルは public フォルダに配置されているため、
// TypeScript コンパイルの対象外です。

// メッセージを受信
self.onmessage = async (e) => {
  const { source } = e.data

  try {
    // インタプリタのコードを動的にインポート
    // 注意: この実装は簡略化されており、実際には parser と interpreter を
    // バンドルして worker で使用可能にする必要があります

    // 簡易実装: eval を使用（本番環境ではより安全な実装が必要）
    const result = await executeSimpleSCS(source)

    self.postMessage({
      success: true,
      output: result.output,
      logs: result.logs
    })
  } catch (error) {
    self.postMessage({
      success: false,
      output: [],
      logs: [],
      error: error.message || String(error)
    })
  }
}

// 簡易的な SCS 実行関数
async function executeSimpleSCS(source) {
  const output = []
  const logs = []
  const variables = {}

  const startTime = Date.now()
  const MAX_TIME = 5000
  let iterations = 0
  const MAX_ITERATIONS = 1000000

  // タイムアウトチェック
  function checkTimeout() {
    if (Date.now() - startTime > MAX_TIME) {
      throw new Error('実行時間制限を超過しました（5秒）')
    }
    iterations++
    if (iterations > MAX_ITERATIONS) {
      throw new Error('繰り返し回数の制限を超過しました（無限ループの可能性）')
    }
  }

  // 簡易パーサー（基本的なコマンドのみサポート）
  const lines = source.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'))

  let i = 0
  while (i < lines.length) {
    checkTimeout()
    const line = lines[i]

    // set 文
    if (line.startsWith('set ')) {
      const match = line.match(/^set\s+(\w+)\s+to\s+(.+)$/)
      if (match) {
        const [, varName, expr] = match
        variables[varName] = evalExpression(expr.trim(), variables)
        logs.push(`Set ${varName} = ${variables[varName]}`)
      }
      i++
      continue
    }

    // say 文
    if (line.startsWith('say ')) {
      const expr = line.substring(4).trim()
      const value = evalExpression(expr, variables)
      output.push(String(value))
      i++
      continue
    }

    // repeat 文
    if (line.startsWith('repeat ')) {
      const match = line.match(/^repeat\s+(.+?)\s+times$/)
      if (match) {
        const times = evalExpression(match[1].trim(), variables)
        const timesNum = Number(times)

        // repeat ブロックの範囲を見つける
        const blockStart = i + 1
        let blockEnd = blockStart
        let depth = 1

        while (blockEnd < lines.length && depth > 0) {
          if (lines[blockEnd].match(/^(repeat|while|if)\s/)) depth++
          if (lines[blockEnd] === 'end') depth--
          blockEnd++
        }

        const blockLines = lines.slice(blockStart, blockEnd - 1)

        for (let r = 0; r < timesNum; r++) {
          checkTimeout()
          await executeBlock(blockLines, variables, output, logs, checkTimeout)
        }

        i = blockEnd
        continue
      }
    }

    // while 文
    if (line.startsWith('while ')) {
      const match = line.match(/^while\s+(.+?)\s+do$/)
      if (match) {
        const conditionExpr = match[1].trim()

        // while ブロックの範囲を見つける
        const blockStart = i + 1
        let blockEnd = blockStart
        let depth = 1

        while (blockEnd < lines.length && depth > 0) {
          if (lines[blockEnd].match(/^(repeat|while|if)\s/)) depth++
          if (lines[blockEnd] === 'end') depth--
          blockEnd++
        }

        const blockLines = lines.slice(blockStart, blockEnd - 1)

        while (evalExpression(conditionExpr, variables)) {
          checkTimeout()
          await executeBlock(blockLines, variables, output, logs, checkTimeout)
        }

        i = blockEnd
        continue
      }
    }

    // if 文
    if (line.startsWith('if ')) {
      const match = line.match(/^if\s+(.+?)\s+then$/)
      if (match) {
        const condition = evalExpression(match[1].trim(), variables)

        // if/else ブロックの解析
        const blockStart = i + 1
        let elseIndex = -1
        let blockEnd = blockStart
        let depth = 1

        while (blockEnd < lines.length && depth > 0) {
          if (lines[blockEnd].match(/^(repeat|while|if)\s/)) depth++
          if (lines[blockEnd] === 'else' && depth === 1) elseIndex = blockEnd
          if (lines[blockEnd] === 'end') depth--
          blockEnd++
        }

        if (condition) {
          const thenLines = lines.slice(blockStart, elseIndex !== -1 ? elseIndex : blockEnd - 1)
          await executeBlock(thenLines, variables, output, logs, checkTimeout)
        } else if (elseIndex !== -1) {
          const elseLines = lines.slice(elseIndex + 1, blockEnd - 1)
          await executeBlock(elseLines, variables, output, logs, checkTimeout)
        }

        i = blockEnd
        continue
      }
    }

    i++
  }

  return { output, logs }
}

// ブロック実行（再帰的に簡易実装）
async function executeBlock(blockLines, variables, output, logs, checkTimeout) {
  for (let j = 0; j < blockLines.length; j++) {
    checkTimeout()
    const line = blockLines[j]

    if (line.startsWith('set ')) {
      const match = line.match(/^set\s+(\w+)\s+to\s+(.+)$/)
      if (match) {
        const [, varName, expr] = match
        variables[varName] = evalExpression(expr.trim(), variables)
        logs.push(`Set ${varName} = ${variables[varName]}`)
      }
    } else if (line.startsWith('say ')) {
      const expr = line.substring(4).trim()
      const value = evalExpression(expr, variables)
      output.push(String(value))
    }
    // ネストした制御構造は省略（完全な実装では再帰的に処理）
  }
}

// 式の評価
function evalExpression(expr, variables) {
  // 文字列リテラル
  if (expr.startsWith('"') && expr.endsWith('"')) {
    return expr.slice(1, -1)
  }

  // ブール値
  if (expr === 'true') return true
  if (expr === 'false') return false

  // 数値
  if (/^-?\d+(\.\d+)?$/.test(expr)) {
    return parseFloat(expr)
  }

  // 変数
  if (/^[a-zA-Z_]\w*$/.test(expr) && expr in variables) {
    return variables[expr]
  }

  // 演算子を含む式
  // 比較演算子
  for (const op of ['==', '!=', '<=', '>=', '<', '>']) {
    if (expr.includes(op)) {
      const parts = expr.split(op).map(p => p.trim())
      if (parts.length === 2) {
        const left = evalExpression(parts[0], variables)
        const right = evalExpression(parts[1], variables)

        switch (op) {
          case '==': return left == right
          case '!=': return left != right
          case '<': return Number(left) < Number(right)
          case '>': return Number(left) > Number(right)
          case '<=': return Number(left) <= Number(right)
          case '>=': return Number(left) >= Number(right)
        }
      }
    }
  }

  // 算術演算子
  for (const op of ['+', '-', '*', '/', '%']) {
    const parts = expr.split(op)
    if (parts.length >= 2) {
      // 文字列連結
      if (op === '+' && (parts[0].includes('"') || parts[1].includes('"'))) {
        let result = evalExpression(parts[0].trim(), variables)
        for (let i = 1; i < parts.length; i++) {
          result = String(result) + String(evalExpression(parts[i].trim(), variables))
        }
        return result
      }

      // 数値演算
      let result = Number(evalExpression(parts[0].trim(), variables))
      for (let i = 1; i < parts.length; i++) {
        const val = Number(evalExpression(parts[i].trim(), variables))
        switch (op) {
          case '+': result += val; break
          case '-': result -= val; break
          case '*': result *= val; break
          case '/': result /= val; break
          case '%': result %= val; break
        }
      }
      return result
    }
  }

  // デフォルトは変数として扱う
  return variables[expr] !== undefined ? variables[expr] : expr
}
