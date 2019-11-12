export interface LoggerOptions {
  prefix?: string | Function
  severity?: number
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface ILogger {
  prefix: string | Function

  severity: number

  strategy: LoggerStrategy

  log: (...args: any[]) => void

  debug: (...args: any[]) => void

  warn: (...args: any[]) => void

  error: (...args: any[]) => void
}

export interface LoggerStrategy {
  trace: (
    data: any[],
    level: 'log' | 'debug' | 'warn' | 'error',
    instance: ILogger
  ) => void
}
