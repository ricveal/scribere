# scribere

![Release](https://github.com/ricveal/scribere/workflows/Release/badge.svg)
[![Version](https://img.shields.io/npm/v/scribere.svg)](https://www.npmjs.com/package/scribere)
[![License](https://img.shields.io/npm/l/scribere.svg)](https://www.npmjs.com/package/scribere)
[![Downloads](https://img.shields.io/npm/dm/scribere.svg)](https://www.npmjs.com/package/scribere)

🇬🇧 Read the english documentation
[here](https://github.com/ricveal/scribere/blob/master/README.md)

> scribĕre, escribir en latín

Librería _core_ logger para ser empleada en proyectos con tecnología Javascript.

## Uso

La principal interfaz de la librería es la clase Logger, que debe ser
instanciada. No se implementa un patrón singleton, por lo que en un mismo
contexto, puedes tener varias instancias funcionando configuradas de diferente
forma.

```javascript
const logger = new Logger()
```

El logger trabaja con 4 niveles de severidad:

```javascript
const levels = ['log', 'debug', 'warn', 'error']
```

Cada instancia del logger cuenta con 4 métodos (uno para cada nivel de
severidad) que permiten _loguear_ mensajes.

Además, el logger cuenta con 3 propiedades adicionales:

- `prefix`: Es un fragmento que precede el mensaje de logging. Puede ser un
  _string_ o una función que devuelva un _string_.
- `severity`: Indica la severidad con la que está configurada esa instancia del
  logger. Es un número indicando a partir de que índice del array de niveles de
  severidad se mostrarán las trazas. De esta forma:
  - 0 -> 'log', 'debug', 'warn', 'error'
  - 1 -> 'debug', 'warn', 'error'
  - 2 -> 'warn', 'error'
  - 3 -> 'error'
- `strategy`: Define realmente que es lo que va a pasar cuando se vaya a pintar
  una traza. La idea es que puedas emplear la estrategia dada por el core o
  crear tu propia estrategia que te permita hacer otra clase de funcionalidad,
  por ejemplo, subir las trazas a un servidor. Es una instancia de una clase que
  implemente la interfaz `LoggerStrategy`. Puedes ver más información sobre este
  aspecto más adelante.

Estas 3 propiedades pueden definirse a la hora de instanciar el logger a través
del constructor:

- `options`: Define el prefijo y la severidad. Por defecto es este objeto:

```javascript
{
  prefix: new Date().toISOString(),
  severity: 0
}
```

- `strategy`: Define la estrategia y por defecto es `ConsoleLoggerStrategy` que
  a grandes rasgos, saca por consola el mensaje que deseemos, ajustándolo tanto
  a severidad como formateándolo con el prefijo: `PREFIX :: LEVEL :: data`

```javascript
const loggerWithOptions = new Logger(options)
```

Estas propiedades se pueden cambiar una vez instanciado el logger ya que son
accesibles.

### Ampliar funcionalidad

El logger emplea el patrón _Strategy_ delegando el qué hacer a la estrategia
definida.

Por defecto se ofrece la estrategia `ConsoleLoggerStrategy` pero puedes escribir
tus propias estrategias y emplearlas siguiendo tus necesidades.

Para ello, debes crear una clase que implemente la interfaz `LoggerStrategy` que
obliga a implementar el método `trace` que será ejecutado cuando por los métodos
`log`, `debug`, `warn` y `error` del logger cuando la severidad configurada
permita pintar una traza.

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

Una vez creada una estrategia, deberás indicar que quieres emplearla en el
momento de instanciar el logger:

```javascript
const loggerWithCustomStrategy = new Logger(options, new CustomStrategy())
```

### Uso con frameworks SPA

El diseño de `scribere` pretende crear un logger muy sencillo y agnóstico del
framework SPA empleado. A continuación, se exponen algunas posibles
integraciones con frameworks SPA:

#### React

En React, el uso de `scribere` es prácticamente inmediato, pudiendo directamente
importarlo en aquellos componentes y utilidades donde se desee utilizar.

A continuación se muestra una implementación donde la severidad se obtiene del
_local storage_ pero es completamente opcional.

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

A partir de este punto, importando el `ReactLogger` haya donde se quiera
registrar una anotación, sería suficiente. Esta estrategia de "pre-configurar"
el Logger es la que se debería seguir también en el caso de querer emplear una
configuración distinta a la por defecto.

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

Esta implementación del `logger` sigue el patrón
"[plugin](https://es.vuejs.org/v2/guide/plugins.html)" y por tanto, debe
declararse antes de iniciar la aplicación:

`main.js`

```js
import Vue from 'vue'
import VueLogger from './logger'

Vue.use(VueLogger)

new Vue({
  //... opciones
})
```

Opcionalmente puede pasar las opciones diferentes a las por defecto:

```js
Vue.use(VueLogger, {
  severity: 2,
})
```

#### Angular

Aunque en Angular podríamos seguir estrategias similares a otros frameworks
(especialmente la dada para React), creo que el patrón que más se acerca a la
filosofía "Angular" es implementar este _logger_ como un servicio.

Para ello:

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

Aunque esta es la forma más sencilla de implementarlo, puede que veas necesario
inyectar la opciones en vez de definirlas en el constructor. Para ello, creo que
la mejor manera sería emplear el mecanismo de inyección de Angular y
"providers".

La idea de este README no es entrar en profundidad en mecanismos específicos de
ningún framework, en este caso Angular pero la implementación sería algo tal
que:

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

## Comenzando 🚀

_Siguiendo estos pasos podrás tener una copia del proyecto en funcionamiento en
tu máquina local._

Mira **Deployment** para conocer como desplegar el proyecto.

### Pre-requisitos 📋

Necesitarás disponer de Node (v10.15.3) y npm (v6.4.1) instalados así como la
utilidad [Yarn](https://yarnpkg.com/lang/en/). Versiones superiores pueden
funcionar pero no ha sido probado.

### Instalación 🔧

La instalación es muy sencilla. Tan sólo tendrás que ejecutar sobre la raíz del
proyecto:

```
yarn
```

## Ejecutando las pruebas ⚙️

```
yarn test
```

Por debajo, estarás ejecutando [jest](https://jestjs.io/) por lo que puedes
añadir los parámetros que desees.

### Y las pruebas de estilo de codificación ⌨️

Utilizamos [eslint](https://eslint.org/) para asegurar la calidad del código y
que sea homogéneo entre diferentes desarrolladores.

```
yarn lint
```

Si deseas que la herramienta intente corregir los errores que pueda de forma
automática, puedes ejecutar:

```
yarn lint:fix
```

## Construido con 🛠️

- [Typescript](https://www.typescriptlang.org/)
- [Jest](https://jestjs.io/)
- [Eslint](https://eslint.org/)

## Contribuyendo 🖇️

Por favor lee el
[CONTRIBUTING.md](https://github.com/ricveal/scribere/blob/master/CONTRIBUTING.md)
para detalles de nuestro código de conducta, y el proceso para enviarnos pull
requests.

## Versionado 📌

Usamos [SemVer](http://semver.org/) para el versionado. Para todas las versiones
disponibles, mira los
[tags en este repositorio](https://github.com/ricveal/scribere/tags).

## Autores ✒️

- **Ricardo Vega Alonso** - [ricveal](https://github.com/ricveal)
