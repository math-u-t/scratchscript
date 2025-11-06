/**
 * ScratchScript (.scs) インタプリタ
 *
 * AST を実行して結果を返します
 */

import { SCSParser, type ASTNode } from './scs-parser'
import type { SCSExecutionResult } from '@/types'

const MAX_EXECUTION_TIME = 5000 // 5秒
const MAX_OUTPUT_LINES = 1000
const MAX_ITERATIONS = 1000000 // 無限ループ対策

export class SCSInterpreter {
  private variables: Map<string, any> = new Map()
  private output: string[] = []
  private logs: string[] = []
  private startTime = 0
  private iterationCount = 0

  async execute(source: string): Promise<SCSExecutionResult> {
    try {
      this.reset()
      this.startTime = Date.now()

      const parser = new SCSParser()
      const ast = parser.parse(source)

      await this.executeNode(ast)

      return {
        success: true,
        output: this.output,
        logs: this.logs
      }
    } catch (error) {
      return {
        success: false,
        output: this.output,
        logs: this.logs,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  private reset(): void {
    this.variables = new Map()
    this.output = []
    this.logs = []
    this.iterationCount = 0
  }

  private checkTimeout(): void {
    if (Date.now() - this.startTime > MAX_EXECUTION_TIME) {
      throw new Error('Execution timeout: Maximum execution time exceeded (5 seconds)')
    }

    this.iterationCount++
    if (this.iterationCount > MAX_ITERATIONS) {
      throw new Error('Iteration limit exceeded: Possible infinite loop detected')
    }
  }

  private async executeNode(node: ASTNode): Promise<any> {
    this.checkTimeout()

    switch (node.type) {
      case 'Program':
        for (const stmt of node.body) {
          await this.executeNode(stmt)
        }
        return

      case 'SetStatement':
        const value = await this.evaluateExpression(node.value)
        this.variables.set(node.variable, value)
        this.logs.push(`Set ${node.variable} = ${value}`)
        return

      case 'SayStatement':
        const output = await this.evaluateExpression(node.value)
        if (this.output.length >= MAX_OUTPUT_LINES) {
          throw new Error('Output limit exceeded: Maximum 1000 lines')
        }
        this.output.push(String(output))
        return

      case 'IfStatement':
        const condition = await this.evaluateExpression(node.condition)
        if (this.isTruthy(condition)) {
          for (const stmt of node.thenBody) {
            await this.executeNode(stmt)
          }
        } else if (node.elseBody) {
          for (const stmt of node.elseBody) {
            await this.executeNode(stmt)
          }
        }
        return

      case 'RepeatStatement':
        const times = await this.evaluateExpression(node.times)
        const timesNum = Number(times)
        if (!Number.isInteger(timesNum) || timesNum < 0) {
          throw new Error('Repeat times must be a positive integer')
        }
        for (let i = 0; i < timesNum; i++) {
          for (const stmt of node.body) {
            await this.executeNode(stmt)
          }
        }
        return

      case 'WhileStatement':
        while (this.isTruthy(await this.evaluateExpression(node.condition))) {
          for (const stmt of node.body) {
            await this.executeNode(stmt)
          }
        }
        return

      default:
        throw new Error(`Unknown node type: ${(node as any).type}`)
    }
  }

  private async evaluateExpression(node: ASTNode): Promise<any> {
    this.checkTimeout()

    switch (node.type) {
      case 'Literal':
        return node.value

      case 'Identifier':
        if (!this.variables.has(node.name)) {
          throw new Error(`Undefined variable: ${node.name}`)
        }
        return this.variables.get(node.name)

      case 'BinaryExpression':
        const left = await this.evaluateExpression(node.left)
        const right = await this.evaluateExpression(node.right)
        return this.evaluateBinaryOperation(node.operator, left, right)

      default:
        throw new Error(`Cannot evaluate node type: ${(node as any).type}`)
    }
  }

  private evaluateBinaryOperation(operator: string, left: any, right: any): any {
    // 文字列連結
    if (operator === '+' && (typeof left === 'string' || typeof right === 'string')) {
      return String(left) + String(right)
    }

    // 数値演算
    const leftNum = Number(left)
    const rightNum = Number(right)

    switch (operator) {
      case '+': return leftNum + rightNum
      case '-': return leftNum - rightNum
      case '*': return leftNum * rightNum
      case '/':
        if (rightNum === 0) throw new Error('Division by zero')
        return leftNum / rightNum
      case '%':
        if (rightNum === 0) throw new Error('Division by zero')
        return leftNum % rightNum
      case '==': return left == right
      case '!=': return left != right
      case '>': return leftNum > rightNum
      case '<': return leftNum < rightNum
      case '>=': return leftNum >= rightNum
      case '<=': return leftNum <= rightNum
      default:
        throw new Error(`Unknown operator: ${operator}`)
    }
  }

  private isTruthy(value: any): boolean {
    if (typeof value === 'boolean') return value
    if (typeof value === 'number') return value !== 0
    if (typeof value === 'string') return value !== ''
    return Boolean(value)
  }
}
