import { LoggerStrategy, ILogger } from '../logger-model'

export class ConsoleLoggerStrategy implements LoggerStrategy {
  // eslint-disable-next-line class-methods-use-this
  trace(
    data: any[],
    level: 'log' | 'debug' | 'warn' | 'error',
    instance: ILogger
  ) {
    const prefix =
      typeof instance.prefix === 'function'
        ? instance.prefix()
        : instance.prefix
    // Format: PREFIX :: LEVEL :: data
    // eslint-disable-next-line no-console
    console[level](`[${prefix} :: ${level}] ::`.toUpperCase(), ...data)
  }
}
