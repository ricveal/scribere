export interface LoggerOptions {
  prefix?: string | Function
  severity?: number
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface ILogger {
  prefix: string | Function

  severity: number

  strategy: LoggerStrategy

  log: (msg: unknown) => void

  debug: (msg: unknown) => void

  warn: (msg: unknown) => void

  error: (msg: unknown) => void
}

export interface LoggerStrategy {
  trace: (
    data: any[],
    level: 'log' | 'debug' | 'warn' | 'error',
    instance: ILogger
  ) => void
}
