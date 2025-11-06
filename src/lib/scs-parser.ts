/**
 * ScratchScript (.scs) パーサー
 *
 * .scs ソースコードを抽象構文木 (AST) に変換します
 */

export type ASTNode =
  | { type: 'Program'; body: ASTNode[] }
  | { type: 'SetStatement'; variable: string; value: ASTNode }
  | { type: 'SayStatement'; value: ASTNode }
  | { type: 'IfStatement'; condition: ASTNode; thenBody: ASTNode[]; elseBody?: ASTNode[] }
  | { type: 'RepeatStatement'; times: ASTNode; body: ASTNode[] }
  | { type: 'WhileStatement'; condition: ASTNode; body: ASTNode[] }
  | { type: 'BinaryExpression'; operator: string; left: ASTNode; right: ASTNode }
  | { type: 'Identifier'; name: string }
  | { type: 'Literal'; value: string | number | boolean }
  | { type: 'Comment' }

export class SCSParser {
  private tokens: string[] = []
  private current = 0

  parse(source: string): ASTNode {
    this.tokens = this.tokenize(source)
    this.current = 0
    return this.parseProgram()
  }

  private tokenize(source: string): string[] {
    const tokens: string[] = []
    const lines = source.split('\n')

    for (const line of lines) {
      const trimmed = line.trim()

      // コメントまたは空行をスキップ
      if (trimmed.startsWith('#') || trimmed === '') {
        continue
      }

      // 文字列リテラルを保護しながらトークン化
      const parts: string[] = []
      let inString = false
      let currentToken = ''

      for (let i = 0; i < trimmed.length; i++) {
        const char = trimmed[i]

        if (char === '"') {
          if (inString) {
            currentToken += char
            parts.push(currentToken)
            currentToken = ''
            inString = false
          } else {
            if (currentToken) parts.push(currentToken)
            currentToken = char
            inString = true
          }
        } else if (inString) {
          currentToken += char
        } else if (/\s/.test(char)) {
          if (currentToken) parts.push(currentToken)
          currentToken = ''
        } else if (/[+\-*/%()><!=]/.test(char)) {
          if (currentToken) parts.push(currentToken)
          // 2文字演算子のチェック
          if (i + 1 < trimmed.length) {
            const next = trimmed[i + 1]
            if ((char === '=' && next === '=') ||
                (char === '!' && next === '=') ||
                (char === '>' && next === '=') ||
                (char === '<' && next === '=')) {
              parts.push(char + next)
              i++
              continue
            }
          }
          parts.push(char)
          currentToken = ''
        } else {
          currentToken += char
        }
      }

      if (currentToken) parts.push(currentToken)
      tokens.push(...parts)
    }

    return tokens
  }

  private parseProgram(): ASTNode {
    const body: ASTNode[] = []

    while (!this.isAtEnd()) {
      const stmt = this.parseStatement()
      if (stmt) body.push(stmt)
    }

    return { type: 'Program', body }
  }

  private parseStatement(): ASTNode | null {
    const token = this.peek()

    if (token === 'set') return this.parseSetStatement()
    if (token === 'say') return this.parseSayStatement()
    if (token === 'if') return this.parseIfStatement()
    if (token === 'repeat') return this.parseRepeatStatement()
    if (token === 'while') return this.parseWhileStatement()
    if (token === 'end') {
      this.advance()
      return null
    }

    throw new Error(`Unexpected token: ${token}`)
  }

  private parseSetStatement(): ASTNode {
    this.consume('set')
    const variable = this.advance()
    this.consume('to')
    const value = this.parseExpression()

    return {
      type: 'SetStatement',
      variable,
      value
    }
  }

  private parseSayStatement(): ASTNode {
    this.consume('say')
    const value = this.parseExpression()

    return {
      type: 'SayStatement',
      value
    }
  }

  private parseIfStatement(): ASTNode {
    this.consume('if')
    const condition = this.parseExpression()
    this.consume('then')

    const thenBody: ASTNode[] = []
    while (this.peek() !== 'else' && this.peek() !== 'end' && !this.isAtEnd()) {
      const stmt = this.parseStatement()
      if (stmt) thenBody.push(stmt)
    }

    let elseBody: ASTNode[] | undefined
    if (this.peek() === 'else') {
      this.advance()
      elseBody = []
      while (this.peek() !== 'end' && !this.isAtEnd()) {
        const stmt = this.parseStatement()
        if (stmt) elseBody.push(stmt)
      }
    }

    this.consume('end')

    return {
      type: 'IfStatement',
      condition,
      thenBody,
      elseBody
    }
  }

  private parseRepeatStatement(): ASTNode {
    this.consume('repeat')
    const times = this.parseExpression()
    this.consume('times')

    const body: ASTNode[] = []
    while (this.peek() !== 'end' && !this.isAtEnd()) {
      const stmt = this.parseStatement()
      if (stmt) body.push(stmt)
    }

    this.consume('end')

    return {
      type: 'RepeatStatement',
      times,
      body
    }
  }

  private parseWhileStatement(): ASTNode {
    this.consume('while')
    const condition = this.parseExpression()
    this.consume('do')

    const body: ASTNode[] = []
    while (this.peek() !== 'end' && !this.isAtEnd()) {
      const stmt = this.parseStatement()
      if (stmt) body.push(stmt)
    }

    this.consume('end')

    return {
      type: 'WhileStatement',
      condition,
      body
    }
  }

  private parseExpression(): ASTNode {
    return this.parseComparison()
  }

  private parseComparison(): ASTNode {
    let left = this.parseAdditive()

    while (['==', '!=', '>', '<', '>=', '<='].includes(this.peek())) {
      const operator = this.advance()
      const right = this.parseAdditive()
      left = { type: 'BinaryExpression', operator, left, right }
    }

    return left
  }

  private parseAdditive(): ASTNode {
    let left = this.parseMultiplicative()

    while (['+', '-'].includes(this.peek())) {
      const operator = this.advance()
      const right = this.parseMultiplicative()
      left = { type: 'BinaryExpression', operator, left, right }
    }

    return left
  }

  private parseMultiplicative(): ASTNode {
    let left = this.parsePrimary()

    while (['*', '/', '%'].includes(this.peek())) {
      const operator = this.advance()
      const right = this.parsePrimary()
      left = { type: 'BinaryExpression', operator, left, right }
    }

    return left
  }

  private parsePrimary(): ASTNode {
    const token = this.peek()

    // 文字列リテラル
    if (token.startsWith('"') && token.endsWith('"')) {
      this.advance()
      return { type: 'Literal', value: token.slice(1, -1) }
    }

    // 数値リテラル
    if (/^-?\d+(\.\d+)?$/.test(token)) {
      this.advance()
      return { type: 'Literal', value: parseFloat(token) }
    }

    // ブール値
    if (token === 'true' || token === 'false') {
      this.advance()
      return { type: 'Literal', value: token === 'true' }
    }

    // 括弧
    if (token === '(') {
      this.advance()
      const expr = this.parseExpression()
      this.consume(')')
      return expr
    }

    // 識別子（変数名）
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(token)) {
      this.advance()
      return { type: 'Identifier', name: token }
    }

    throw new Error(`Unexpected token in expression: ${token}`)
  }

  private peek(): string {
    if (this.isAtEnd()) return ''
    return this.tokens[this.current]
  }

  private advance(): string {
    if (!this.isAtEnd()) this.current++
    return this.tokens[this.current - 1]
  }

  private consume(expected: string): void {
    const token = this.peek()
    if (token !== expected) {
      throw new Error(`Expected '${expected}' but got '${token}'`)
    }
    this.advance()
  }

  private isAtEnd(): boolean {
    return this.current >= this.tokens.length
  }
}
