# scribere

![Release](https://github.com/ricveal/scribere/workflows/Release/badge.svg)
[![Version](https://img.shields.io/npm/v/scribere.svg)](https://www.npmjs.com/package/scribere)
[![License](https://img.shields.io/npm/l/scribere.svg)](https://www.npmjs.com/package/scribere)
[![Downloads](https://img.shields.io/npm/dm/scribere.svg)](https://www.npmjs.com/package/scribere)

🇪🇸 Lee la documentación en español
[aquí](https://github.com/ricveal/scribere/blob/master/docs/README_es.md)

> scribĕre, to write in latin

_Core_ logger library to be used in Javascript projects.

## How to use

The main interface of the library is the _Logger_ class which should be
instantiated. The singleton pattern is not implemented so, in a shared context,
you can use multiple instances working together.

```javascript
const logger = new Logger()
```

The logger works with 4 severity levels:

```javascript
const levels = ['log', 'debug', 'warn', 'error']
```

Each instance has 4 methods (one per severity level) which allows you logging
messages.

Furthermore, the logger has 3 additional properties:

- `prefix`: It is the fragment before the logging message. It could be a
  _string_ or a function which returns a _string_.
- `severity`: Indicates the severity level of the instance of the logger. It's a
  number indicating the index of the array of severity levels that is used as
  minimum:
  - 0 -> 'log', 'debug', 'warn', 'error'
  - 1 -> 'debug', 'warn', 'error'
  - 2 -> 'warn', 'error'
  - 3 -> 'error'
- `strategy`: Defines how the trace is really managed. The idea is to provide
  flexibility to use the strategy provided by the core or create a custom one
  which allows you to cover your requirements, for example, upload the traces to
  some remote server. It is an instance of a class which implements the
  `LoggerStrategy` interface. There is more information about it later on the
  text.

These 3 properties can be defined when the logger is instantiated, through the
constructor:

- `options`: Defines the prefix and severity. By default:

```javascript
{
  prefix: new Date().toISOString(),
  severity: 0
}
```

- `strategy`: Defines the strategy, by default `ConsoleLoggerStrategy` which
  mainly prints on browser console the trace, adjusting the severity and
  formatting it with: `PREFIX :: LEVEL :: data`

```javascript
const loggerWithOptions = new Logger(options)
```

These properties can be changed once the logger is instantiated because they are
accesibles.

### Custom strategies

The logger uses the _Strategy_ pattern, delegating what to do in the defined
strategy.

By default, the `ConsoleLoggerStrategy` strategy is offered but you can code
your own strategies following your needs.

You have to create a class implementing the `LoggerStrategy` strategy which
forces you to implement the `trace` method that will be executed by the `log`,
`debug`, `warn` and `error` method of the logger when the configured severity
allows the print of the trace.

```javascript
class CustomStrategy implements LoggerStrategy {

  trace(
    data: any,
    level: 'log' | 'debug' | 'warn' | 'error',
    instance: ILogger
  ) {
    // Implementation
    const prefix =
      typeof instance.prefix === 'function'
        ? instance.prefix()
        : instance.prefix
    alert(`${level} : ${prefix} - ${data})
  }

}
```

Once the strategy is created, you would select it in the instance process of the
logger:

```javascript
const loggerWithCustomStrategy = new Logger(options, new CustomStrategy())
```

### Use it with SPA frameworks

The design of `scribere` tries to create a simple logger, agnostic of the SPA
framework used. Following, some examples of integrations with SPA frameworks are
provided:

#### React

In React, the use of `scribere` is straightforward; you can import it directly
in the components and utilities which would use it.

Following, an implementation where the severity is retrieved from _local
storage_ is shown, but it is completely opcional.

```
- src
|-- logger
  |-- index.js
```

`index.js`

```js
import {Logger} from 'scribere'

const ReactLogger = new Logger()

/* Starting Extra optional configuration */
const severity = localStorage.getItem('LOGGER')
let severityLevel
if (severity === null) {
  localStorage.setItem('LOGGER', '2')
  severityLevel = 2
} else {
  severityLevel = Number(severity)
}
ReactLogger.severity = severityLevel
/* Ending Extra optional configuration */

export default ReactLogger
```

From this point, importing `ReactLogger` where a log is required would be
enough. This strategy of "pre-configuring" the logger should be followed when a
configuration differ from the default one.

#### Vue

```
- src
|-- main.js
|-- logger
  |-- index.js
  |-- install.js
```

`index.js`

```js
import install from './install'

const Log4Vue = {installed: false}
Log4Vue.install = install

export default Log4Vue
```

`install.js`

```js
import {Logger} from 'scribere'

export default function install(Vue, options = undefined) {
  if (this.installed) return
  const logger = options ? new Logger(options) : new Logger()
  // The logger will be accesible in this.$console
  Vue.prototype.$console = logger
  Vue.console = logger
  window.logger = logger
  this.installed = true
}
```

This implementation of the `logger` follows the
"[plugin](https://es.vuejs.org/v2/guide/plugins.html)" pattern so the _plugin_
should be declared before the application starts.

`main.js`

```js
import Vue from 'vue'
import VueLogger from './logger'

Vue.use(VueLogger)

new Vue({
  //... options
})
```

Optionally, you can use custom options:

```js
Vue.use(VueLogger, {
  severity: 2,
})
```

#### Angular

Although Angular could follow similar strategies to other frameworks (specially
React), I think the _service_ pattern is the closest to the "Angular
philosophy".

For that:

```ts
import {Injectable} from '@angular/core'
import {Logger, ILogger, LoggerOptions} from 'scribere'

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private _instance: ILogger

  constructor() {
    const options: LoggerOptions = {
      severity: 2,
    }
    this._instance = new Logger(options)
  }

  debug(...args: any[]) {
    return this._instance.debug(...args)
  }
  error(...args: any[]) {
    return this._instance.error(...args)
  }
  log(...args: any[]) {
    return this._instance.log(...args)
  }
  warn(...args: any[]) {
    return this._instance.warn(...args)
  }
}
```

Even though this is the most simple implementation, you could want to inject the
options instead of define them in the constructor. For that, I think the best
way would be to use the inject mechanism of Angular and its "providers".

This documentation does not try to deep on any specific implementation for any
framework but, as reference, the implementation should be something similar to:

```ts
export const LOGGER_CONFIG = new InjectionToken<LoggerOptions>('app.logger');

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  ...

  constructor(@Inject(LOGGER_CONFIG) options: LoggerOptions) {
    this._instance = new Logger(options);
  }

  ...

}
```

```ts
@NgModule({
...
providers: [LoggerService, { provide: LOGGER_CONFIG, useValue: { /* options */ } }]
...
}
```

## Starting 🚀

_Following these steps you will have a copy of the project working on your local
machine._

Check **Deployment** to know how to deploy the project.

### Pre-requirements 📋

You will need Node (v10.15.3) and npm (v6.4.1) installed and
[Yarn](https://yarnpkg.com/lang/en/). Upper versions could work but they aren't
tested.

### Install 🔧

In the root of the project, you should execute:

```
yarn
```

## Testing ⚙️

```
yarn test
```

Under the hood, you will be executing [jest](https://jestjs.io/) so any
parameter could be added following its documentation.

### Linting ⌨️

The project is using [eslint](https://eslint.org/) to ensure the code quality as
well as the standardization of code between developers.

```
yarn lint
```

You can try to fix _lint_ errors automatically using:

```
yarn lint:fix
```

## Built with 🛠️

- [Typescript](https://www.typescriptlang.org/)
- [Jest](https://jestjs.io/)
- [Eslint](https://eslint.org/)

## Contributing 🖇️

Please, read
[CONTRIBUTING.md](https://github.com/ricveal/scribere/blob/master/CONTRIBUTING.md)
which provides details about the code of conduct and the process to include pull
requests.

## Versioning 📌

The project uses [SemVer](http://semver.org/) for versioning. You can check all
available versions in the
[tags of this repository](https://github.com/ricveal/scribere/tags).

## Authors ✒️

- **Ricardo Vega Alonso** - [ricveal](https://github.com/ricveal)
