/* eslint-disable no-console */
import { Logger } from './logger'

describe('console.log strategy', () => {
  const logger = new Logger()
  let spy: jest.SpyInstance

  afterEach(() => {
    spy.mockClear()
  })

  it('log', () => {
    spy = jest.spyOn(console, 'log')
    expect(logger.log).toBeDefined()
    logger.log('something')
    expect(console.log).toBeCalledWith(expect.any(String), 'something')
  })

  it('debug', () => {
    spy = jest.spyOn(console, 'debug')
    expect(logger.debug).toBeDefined()
    logger.debug('something')
    expect(console.debug).toBeCalledWith(expect.any(String), 'something')
  })

  it('warn', () => {
    spy = jest.spyOn(console, 'warn')
    expect(logger.warn).toBeDefined()
    logger.warn('something')
    expect(console.warn).toBeCalledWith(expect.any(String), 'something')
  })

  it('error', () => {
    spy = jest.spyOn(console, 'error')
    expect(logger.error).toBeDefined()
    logger.error('something')
    expect(console.error).toBeCalledWith(expect.any(String), 'something')
  })
})

describe('severity works', () => {
  const logger = new Logger({ severity: 2 })
  let spy: jest.SpyInstance

  beforeEach(() => {
    spy && spy.mockClear()
  })

  it('severity is properly defined', () => {
    expect(logger.severity).toBe(2)
  })

  it('add level info', () => {
    spy = jest.spyOn(console, 'log')
    expect(logger.log).toBeDefined()
    logger.log('nothing')
    expect(console.log).not.toBeCalled()
  })

  it('add level info', () => {
    spy = jest.spyOn(console, 'debug')
    expect(logger.debug).toBeDefined()
    logger.debug('nothing')
    expect(console.debug).not.toBeCalled()
  })

  it('add level info', () => {
    spy = jest.spyOn(console, 'warn')
    expect(logger.warn).toBeDefined()
    logger.warn('nothing')
    expect(console.warn).toBeCalled()
  })

  it('add level info', () => {
    spy = jest.spyOn(console, 'error')
    expect(logger.error).toBeDefined()
    logger.error('nothing')
    expect(console.error).toBeCalled()
  })
})

describe('Log multiple data', () => {
  const logger = new Logger({ severity: 2 })
  let spy: jest.SpyInstance

  beforeEach(() => {
    spy && spy.mockClear()
  })

  it('should log be called with multiple info', () => {
    spy = jest.spyOn(console, 'error')
    expect(logger.error).toBeDefined()
    logger.error('nothing', 'else')
    expect(console.error).toBeCalledWith(expect.any(String), 'nothing', 'else')
  })
})
