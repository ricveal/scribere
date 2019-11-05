import { LoggerStrategy, LoggerOptions, ILogger } from './logger-model'
import { ConsoleLoggerStrategy } from './strategies/consoleLoggerStrategy'

// Default options
const defaultLogger = {
  prefix: new Date().toISOString(),
  severity: 0
  // 0 -> 'log', 'debug', 'warn', 'error'
  // 1 -> 'debug', 'warn', 'error'
  // 2 -> 'warn', 'error'
  // 3 -> 'error'
}

const levels = ['log', 'debug', 'warn', 'error']

export class Logger implements ILogger {
  prefix: string | Function

  severity: number

  strategy: LoggerStrategy

  log: (...args: any[]) => void

  debug: (...args: any[]) => void

  warn: (...args: any[]) => void

  error: (...args: any[]) => void

  // eslint-disable-next-line no-useless-constructor, no-empty-function
  constructor(
    options?: LoggerOptions,
    strategy: LoggerStrategy = new ConsoleLoggerStrategy()
  ) {
    this.prefix =
      options && options.prefix !== undefined
        ? options.prefix
        : defaultLogger.prefix
    this.severity =
      options && options.severity !== undefined
        ? options.severity
        : defaultLogger.severity
    this.log = (...args: any[]) => this.trace(args, 'log')
    this.debug = (...args: any[]) => this.trace(args, 'debug')
    this.warn = (...args: any[]) => this.trace(args, 'warn')
    this.error = (...args: any[]) => this.trace(args, 'error')
    this.strategy = strategy
  }

  private trace(data: any[], level: 'log' | 'debug' | 'warn' | 'error') {
    // If severity is greater than current level, we return nothing.
    if (this.severity > levels.indexOf(level)) return
    // If not, we configure the trace.
    this.strategy.trace(data, level, this)
  }
}
