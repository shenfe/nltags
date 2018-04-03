(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('buffer'), require('util'), require('crypto'), require('tty'), require('supports-color'), require('events'), require('stream'), require('assert'), require('fs'), require('path'), require('vm')) :
	typeof define === 'function' && define.amd ? define(['buffer', 'util', 'crypto', 'tty', 'supports-color', 'events', 'stream', 'assert', 'fs', 'path', 'vm'], factory) :
	(global.TGR = factory(global.buffer,global.util,global.crypto,global.tty,global.supportsColor,global.events,global.Stream,global.assert,global.fs,global.path,global.vm));
}(this, (function (buffer,util,crypto,tty,supportsColor,events,Stream,assert,fs,path,vm) { 'use strict';

	buffer = buffer && buffer.hasOwnProperty('default') ? buffer['default'] : buffer;
	util = util && util.hasOwnProperty('default') ? util['default'] : util;
	crypto = crypto && crypto.hasOwnProperty('default') ? crypto['default'] : crypto;
	tty = tty && tty.hasOwnProperty('default') ? tty['default'] : tty;
	supportsColor = supportsColor && supportsColor.hasOwnProperty('default') ? supportsColor['default'] : supportsColor;
	var events__default = 'default' in events ? events['default'] : events;
	Stream = Stream && Stream.hasOwnProperty('default') ? Stream['default'] : Stream;
	assert = assert && assert.hasOwnProperty('default') ? assert['default'] : assert;
	fs = fs && fs.hasOwnProperty('default') ? fs['default'] : fs;
	path = path && path.hasOwnProperty('default') ? path['default'] : path;
	vm = vm && vm.hasOwnProperty('default') ? vm['default'] : vm;

	var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function commonjsRequire () {
		throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var Mutation = commonjsGlobal.MutationObserver || commonjsGlobal.WebKitMutationObserver;

	var scheduleDrain;

	if (process.browser) {
	  if (Mutation) {
	    var called = 0;
	    var observer = new Mutation(nextTick);
	    var element = commonjsGlobal.document.createTextNode('');
	    observer.observe(element, {
	      characterData: true
	    });
	    scheduleDrain = function () {
	      element.data = (called = ++called % 2);
	    };
	  } else if (!commonjsGlobal.setImmediate && typeof commonjsGlobal.MessageChannel !== 'undefined') {
	    var channel = new commonjsGlobal.MessageChannel();
	    channel.port1.onmessage = nextTick;
	    scheduleDrain = function () {
	      channel.port2.postMessage(0);
	    };
	  } else if ('document' in commonjsGlobal && 'onreadystatechange' in commonjsGlobal.document.createElement('script')) {
	    scheduleDrain = function () {

	      // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
	      // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
	      var scriptEl = commonjsGlobal.document.createElement('script');
	      scriptEl.onreadystatechange = function () {
	        nextTick();

	        scriptEl.onreadystatechange = null;
	        scriptEl.parentNode.removeChild(scriptEl);
	        scriptEl = null;
	      };
	      commonjsGlobal.document.documentElement.appendChild(scriptEl);
	    };
	  } else {
	    scheduleDrain = function () {
	      setTimeout(nextTick, 0);
	    };
	  }
	} else {
	  scheduleDrain = function () {
	    process.nextTick(nextTick);
	  };
	}

	var draining;
	var queue = [];
	//named nextTick for less confusing stack traces
	function nextTick() {
	  draining = true;
	  var i, oldQueue;
	  var len = queue.length;
	  while (len) {
	    oldQueue = queue;
	    queue = [];
	    i = -1;
	    while (++i < len) {
	      oldQueue[i]();
	    }
	    len = queue.length;
	  }
	  draining = false;
	}

	var lib = immediate;
	function immediate(task) {
	  if (queue.push(task) === 1 && !draining) {
	    scheduleDrain();
	  }
	}

	/* istanbul ignore next */
	function INTERNAL() {}

	var handlers = {};

	var REJECTED = ['REJECTED'];
	var FULFILLED = ['FULFILLED'];
	var PENDING = ['PENDING'];
	/* istanbul ignore else */
	if (!process.browser) {
	  // in which we actually take advantage of JS scoping
	  var UNHANDLED = ['UNHANDLED'];
	}

	var lib$1 = Promise$1;

	function Promise$1(resolver) {
	  if (typeof resolver !== 'function') {
	    throw new TypeError('resolver must be a function');
	  }
	  this.state = PENDING;
	  this.queue = [];
	  this.outcome = void 0;
	  /* istanbul ignore else */
	  if (!process.browser) {
	    this.handled = UNHANDLED;
	  }
	  if (resolver !== INTERNAL) {
	    safelyResolveThenable(this, resolver);
	  }
	}

	Promise$1.prototype.catch = function (onRejected) {
	  return this.then(null, onRejected);
	};
	Promise$1.prototype.then = function (onFulfilled, onRejected) {
	  if (typeof onFulfilled !== 'function' && this.state === FULFILLED ||
	    typeof onRejected !== 'function' && this.state === REJECTED) {
	    return this;
	  }
	  var promise = new this.constructor(INTERNAL);
	  /* istanbul ignore else */
	  if (!process.browser) {
	    if (this.handled === UNHANDLED) {
	      this.handled = null;
	    }
	  }
	  if (this.state !== PENDING) {
	    var resolver = this.state === FULFILLED ? onFulfilled : onRejected;
	    unwrap(promise, resolver, this.outcome);
	  } else {
	    this.queue.push(new QueueItem(promise, onFulfilled, onRejected));
	  }

	  return promise;
	};
	function QueueItem(promise, onFulfilled, onRejected) {
	  this.promise = promise;
	  if (typeof onFulfilled === 'function') {
	    this.onFulfilled = onFulfilled;
	    this.callFulfilled = this.otherCallFulfilled;
	  }
	  if (typeof onRejected === 'function') {
	    this.onRejected = onRejected;
	    this.callRejected = this.otherCallRejected;
	  }
	}
	QueueItem.prototype.callFulfilled = function (value) {
	  handlers.resolve(this.promise, value);
	};
	QueueItem.prototype.otherCallFulfilled = function (value) {
	  unwrap(this.promise, this.onFulfilled, value);
	};
	QueueItem.prototype.callRejected = function (value) {
	  handlers.reject(this.promise, value);
	};
	QueueItem.prototype.otherCallRejected = function (value) {
	  unwrap(this.promise, this.onRejected, value);
	};

	function unwrap(promise, func, value) {
	  lib(function () {
	    var returnValue;
	    try {
	      returnValue = func(value);
	    } catch (e) {
	      return handlers.reject(promise, e);
	    }
	    if (returnValue === promise) {
	      handlers.reject(promise, new TypeError('Cannot resolve promise with itself'));
	    } else {
	      handlers.resolve(promise, returnValue);
	    }
	  });
	}

	handlers.resolve = function (self, value) {
	  var result = tryCatch(getThen, value);
	  if (result.status === 'error') {
	    return handlers.reject(self, result.value);
	  }
	  var thenable = result.value;

	  if (thenable) {
	    safelyResolveThenable(self, thenable);
	  } else {
	    self.state = FULFILLED;
	    self.outcome = value;
	    var i = -1;
	    var len = self.queue.length;
	    while (++i < len) {
	      self.queue[i].callFulfilled(value);
	    }
	  }
	  return self;
	};
	handlers.reject = function (self, error) {
	  self.state = REJECTED;
	  self.outcome = error;
	  /* istanbul ignore else */
	  if (!process.browser) {
	    if (self.handled === UNHANDLED) {
	      lib(function () {
	        if (self.handled === UNHANDLED) {
	          process.emit('unhandledRejection', error, self);
	        }
	      });
	    }
	  }
	  var i = -1;
	  var len = self.queue.length;
	  while (++i < len) {
	    self.queue[i].callRejected(error);
	  }
	  return self;
	};

	function getThen(obj) {
	  // Make sure we only access the accessor once as required by the spec
	  var then = obj && obj.then;
	  if (obj && (typeof obj === 'object' || typeof obj === 'function') && typeof then === 'function') {
	    return function appyThen() {
	      then.apply(obj, arguments);
	    };
	  }
	}

	function safelyResolveThenable(self, thenable) {
	  // Either fulfill, reject or reject with error
	  var called = false;
	  function onError(value) {
	    if (called) {
	      return;
	    }
	    called = true;
	    handlers.reject(self, value);
	  }

	  function onSuccess(value) {
	    if (called) {
	      return;
	    }
	    called = true;
	    handlers.resolve(self, value);
	  }

	  function tryToUnwrap() {
	    thenable(onSuccess, onError);
	  }

	  var result = tryCatch(tryToUnwrap);
	  if (result.status === 'error') {
	    onError(result.value);
	  }
	}

	function tryCatch(func, value) {
	  var out = {};
	  try {
	    out.value = func(value);
	    out.status = 'success';
	  } catch (e) {
	    out.status = 'error';
	    out.value = e;
	  }
	  return out;
	}

	Promise$1.resolve = resolve;
	function resolve(value) {
	  if (value instanceof this) {
	    return value;
	  }
	  return handlers.resolve(new this(INTERNAL), value);
	}

	Promise$1.reject = reject;
	function reject(reason) {
	  var promise = new this(INTERNAL);
	  return handlers.reject(promise, reason);
	}

	Promise$1.all = all;
	function all(iterable) {
	  var self = this;
	  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
	    return this.reject(new TypeError('must be an array'));
	  }

	  var len = iterable.length;
	  var called = false;
	  if (!len) {
	    return this.resolve([]);
	  }

	  var values = new Array(len);
	  var resolved = 0;
	  var i = -1;
	  var promise = new this(INTERNAL);

	  while (++i < len) {
	    allResolver(iterable[i], i);
	  }
	  return promise;
	  function allResolver(value, i) {
	    self.resolve(value).then(resolveFromAll, function (error) {
	      if (!called) {
	        called = true;
	        handlers.reject(promise, error);
	      }
	    });
	    function resolveFromAll(outValue) {
	      values[i] = outValue;
	      if (++resolved === len && !called) {
	        called = true;
	        handlers.resolve(promise, values);
	      }
	    }
	  }
	}

	Promise$1.race = race;
	function race(iterable) {
	  var self = this;
	  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
	    return this.reject(new TypeError('must be an array'));
	  }

	  var len = iterable.length;
	  var called = false;
	  if (!len) {
	    return this.resolve([]);
	  }

	  var i = -1;
	  var promise = new this(INTERNAL);

	  while (++i < len) {
	    resolver(iterable[i]);
	  }
	  return promise;
	  function resolver(value) {
	    self.resolve(value).then(function (response) {
	      if (!called) {
	        called = true;
	        handlers.resolve(promise, response);
	      }
	    }, function (error) {
	      if (!called) {
	        called = true;
	        handlers.reject(promise, error);
	      }
	    });
	  }
	}

	var Buffer$1 = buffer.Buffer;

	function hasFrom() {
	  // Node versions 5.x below 5.10 seem to have a `from` method
	  // However, it doesn't clone Buffers
	  // Luckily, it reports as `false` to hasOwnProperty
	  return (Buffer$1.hasOwnProperty('from') && typeof Buffer$1.from === 'function');
	}

	function cloneBuffer(buf) {
	  if (!Buffer$1.isBuffer(buf)) {
	    throw new Error('Can only clone Buffer.');
	  }

	  if (hasFrom()) {
	    return Buffer$1.from(buf);
	  }

	  var copy = new Buffer$1(buf.length);
	  buf.copy(copy);
	  return copy;
	}

	cloneBuffer.hasFrom = hasFrom;

	var cloneBuffer_1 = cloneBuffer;

	var argsarray = argsArray;

	function argsArray(fun) {
	  return function () {
	    var len = arguments.length;
	    if (len) {
	      var args = [];
	      var i = -1;
	      while (++i < len) {
	        args[i] = arguments[i];
	      }
	      return fun.call(this, args);
	    } else {
	      return fun.call(this, []);
	    }
	  };
	}

	var inherits_browser = createCommonjsModule(function (module) {
	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor;
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor;
	    var TempCtor = function () {};
	    TempCtor.prototype = superCtor.prototype;
	    ctor.prototype = new TempCtor();
	    ctor.prototype.constructor = ctor;
	  };
	}
	});

	var inherits = createCommonjsModule(function (module) {
	try {
	  var util$$1 = util;
	  if (typeof util$$1.inherits !== 'function') throw '';
	  module.exports = util$$1.inherits;
	} catch (e) {
	  module.exports = inherits_browser;
	}
	});

	// Unique ID creation requires a high quality random # generator.  In node.js
	// this is pretty straight-forward - we use the crypto API.



	var rng = function nodeRNG() {
	  return crypto.randomBytes(16);
	};

	/**
	 * Convert array of 16 byte values to UUID string format of the form:
	 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
	 */
	var byteToHex = [];
	for (var i = 0; i < 256; ++i) {
	  byteToHex[i] = (i + 0x100).toString(16).substr(1);
	}

	function bytesToUuid(buf, offset) {
	  var i = offset || 0;
	  var bth = byteToHex;
	  return bth[buf[i++]] + bth[buf[i++]] +
	          bth[buf[i++]] + bth[buf[i++]] + '-' +
	          bth[buf[i++]] + bth[buf[i++]] + '-' +
	          bth[buf[i++]] + bth[buf[i++]] + '-' +
	          bth[buf[i++]] + bth[buf[i++]] + '-' +
	          bth[buf[i++]] + bth[buf[i++]] +
	          bth[buf[i++]] + bth[buf[i++]] +
	          bth[buf[i++]] + bth[buf[i++]];
	}

	var bytesToUuid_1 = bytesToUuid;

	// **`v1()` - Generate time-based UUID**
	//
	// Inspired by https://github.com/LiosK/UUID.js
	// and http://docs.python.org/library/uuid.html

	var _nodeId;
	var _clockseq;

	// Previous uuid creation time
	var _lastMSecs = 0;
	var _lastNSecs = 0;

	// See https://github.com/broofa/node-uuid for API details
	function v1(options, buf, offset) {
	  var i = buf && offset || 0;
	  var b = buf || [];

	  options = options || {};
	  var node = options.node || _nodeId;
	  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

	  // node and clockseq need to be initialized to random values if they're not
	  // specified.  We do this lazily to minimize issues related to insufficient
	  // system entropy.  See #189
	  if (node == null || clockseq == null) {
	    var seedBytes = rng();
	    if (node == null) {
	      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
	      node = _nodeId = [
	        seedBytes[0] | 0x01,
	        seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]
	      ];
	    }
	    if (clockseq == null) {
	      // Per 4.2.2, randomize (14 bit) clockseq
	      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
	    }
	  }

	  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
	  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
	  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
	  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
	  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

	  // Per 4.2.1.2, use count of uuid's generated during the current clock
	  // cycle to simulate higher resolution clock
	  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

	  // Time since last uuid creation (in msecs)
	  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

	  // Per 4.2.1.2, Bump clockseq on clock regression
	  if (dt < 0 && options.clockseq === undefined) {
	    clockseq = clockseq + 1 & 0x3fff;
	  }

	  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
	  // time interval
	  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
	    nsecs = 0;
	  }

	  // Per 4.2.1.2 Throw error if too many uuids are requested
	  if (nsecs >= 10000) {
	    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
	  }

	  _lastMSecs = msecs;
	  _lastNSecs = nsecs;
	  _clockseq = clockseq;

	  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
	  msecs += 12219292800000;

	  // `time_low`
	  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
	  b[i++] = tl >>> 24 & 0xff;
	  b[i++] = tl >>> 16 & 0xff;
	  b[i++] = tl >>> 8 & 0xff;
	  b[i++] = tl & 0xff;

	  // `time_mid`
	  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
	  b[i++] = tmh >>> 8 & 0xff;
	  b[i++] = tmh & 0xff;

	  // `time_high_and_version`
	  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
	  b[i++] = tmh >>> 16 & 0xff;

	  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
	  b[i++] = clockseq >>> 8 | 0x80;

	  // `clock_seq_low`
	  b[i++] = clockseq & 0xff;

	  // `node`
	  for (var n = 0; n < 6; ++n) {
	    b[i + n] = node[n];
	  }

	  return buf ? buf : bytesToUuid_1(b);
	}

	var v1_1 = v1;

	function v4(options, buf, offset) {
	  var i = buf && offset || 0;

	  if (typeof(options) == 'string') {
	    buf = options === 'binary' ? new Array(16) : null;
	    options = null;
	  }
	  options = options || {};

	  var rnds = options.random || (options.rng || rng)();

	  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
	  rnds[6] = (rnds[6] & 0x0f) | 0x40;
	  rnds[8] = (rnds[8] & 0x3f) | 0x80;

	  // Copy bytes to buffer, if provided
	  if (buf) {
	    for (var ii = 0; ii < 16; ++ii) {
	      buf[i + ii] = rnds[ii];
	    }
	  }

	  return buf || bytesToUuid_1(rnds);
	}

	var v4_1 = v4;

	var uuid = v4_1;
	uuid.v1 = v1_1;
	uuid.v4 = v4_1;

	var uuid_1 = uuid;

	/**
	 * Helpers.
	 */

	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var y = d * 365.25;

	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} [options]
	 * @throws {Error} throw an error if val is not a non-empty string or a number
	 * @return {String|Number}
	 * @api public
	 */

	var ms = function(val, options) {
	  options = options || {};
	  var type = typeof val;
	  if (type === 'string' && val.length > 0) {
	    return parse(val);
	  } else if (type === 'number' && isNaN(val) === false) {
	    return options.long ? fmtLong(val) : fmtShort(val);
	  }
	  throw new Error(
	    'val is not a non-empty string or a valid number. val=' +
	      JSON.stringify(val)
	  );
	};

	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */

	function parse(str) {
	  str = String(str);
	  if (str.length > 100) {
	    return;
	  }
	  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
	    str
	  );
	  if (!match) {
	    return;
	  }
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	    default:
	      return undefined;
	  }
	}

	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtShort(ms) {
	  if (ms >= d) {
	    return Math.round(ms / d) + 'd';
	  }
	  if (ms >= h) {
	    return Math.round(ms / h) + 'h';
	  }
	  if (ms >= m) {
	    return Math.round(ms / m) + 'm';
	  }
	  if (ms >= s) {
	    return Math.round(ms / s) + 's';
	  }
	  return ms + 'ms';
	}

	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtLong(ms) {
	  return plural(ms, d, 'day') ||
	    plural(ms, h, 'hour') ||
	    plural(ms, m, 'minute') ||
	    plural(ms, s, 'second') ||
	    ms + ' ms';
	}

	/**
	 * Pluralization helper.
	 */

	function plural(ms, n, name) {
	  if (ms < n) {
	    return;
	  }
	  if (ms < n * 1.5) {
	    return Math.floor(ms / n) + ' ' + name;
	  }
	  return Math.ceil(ms / n) + ' ' + name + 's';
	}

	var debug = createCommonjsModule(function (module, exports) {
	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */

	exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
	exports.coerce = coerce;
	exports.disable = disable;
	exports.enable = enable;
	exports.enabled = enabled;
	exports.humanize = ms;

	/**
	 * Active `debug` instances.
	 */
	exports.instances = [];

	/**
	 * The currently active debug mode names, and names to skip.
	 */

	exports.names = [];
	exports.skips = [];

	/**
	 * Map of special "%n" handling functions, for the debug "format" argument.
	 *
	 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	 */

	exports.formatters = {};

	/**
	 * Select a color.
	 * @param {String} namespace
	 * @return {Number}
	 * @api private
	 */

	function selectColor(namespace) {
	  var hash = 0, i;

	  for (i in namespace) {
	    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
	    hash |= 0; // Convert to 32bit integer
	  }

	  return exports.colors[Math.abs(hash) % exports.colors.length];
	}

	/**
	 * Create a debugger with the given `namespace`.
	 *
	 * @param {String} namespace
	 * @return {Function}
	 * @api public
	 */

	function createDebug(namespace) {

	  var prevTime;

	  function debug() {
	    // disabled?
	    if (!debug.enabled) return;

	    var self = debug;

	    // set `diff` timestamp
	    var curr = +new Date();
	    var ms$$1 = curr - (prevTime || curr);
	    self.diff = ms$$1;
	    self.prev = prevTime;
	    self.curr = curr;
	    prevTime = curr;

	    // turn the `arguments` into a proper Array
	    var args = new Array(arguments.length);
	    for (var i = 0; i < args.length; i++) {
	      args[i] = arguments[i];
	    }

	    args[0] = exports.coerce(args[0]);

	    if ('string' !== typeof args[0]) {
	      // anything else let's inspect with %O
	      args.unshift('%O');
	    }

	    // apply any `formatters` transformations
	    var index = 0;
	    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
	      // if we encounter an escaped % then don't increase the array index
	      if (match === '%%') return match;
	      index++;
	      var formatter = exports.formatters[format];
	      if ('function' === typeof formatter) {
	        var val = args[index];
	        match = formatter.call(self, val);

	        // now we need to remove `args[index]` since it's inlined in the `format`
	        args.splice(index, 1);
	        index--;
	      }
	      return match;
	    });

	    // apply env-specific formatting (colors, etc.)
	    exports.formatArgs.call(self, args);

	    var logFn = debug.log || exports.log || console.log.bind(console);
	    logFn.apply(self, args);
	  }

	  debug.namespace = namespace;
	  debug.enabled = exports.enabled(namespace);
	  debug.useColors = exports.useColors();
	  debug.color = selectColor(namespace);
	  debug.destroy = destroy;

	  // env-specific initialization logic for debug instances
	  if ('function' === typeof exports.init) {
	    exports.init(debug);
	  }

	  exports.instances.push(debug);

	  return debug;
	}

	function destroy () {
	  var index = exports.instances.indexOf(this);
	  if (index !== -1) {
	    exports.instances.splice(index, 1);
	    return true;
	  } else {
	    return false;
	  }
	}

	/**
	 * Enables a debug mode by namespaces. This can include modes
	 * separated by a colon and wildcards.
	 *
	 * @param {String} namespaces
	 * @api public
	 */

	function enable(namespaces) {
	  exports.save(namespaces);

	  exports.names = [];
	  exports.skips = [];

	  var i;
	  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
	  var len = split.length;

	  for (i = 0; i < len; i++) {
	    if (!split[i]) continue; // ignore empty strings
	    namespaces = split[i].replace(/\*/g, '.*?');
	    if (namespaces[0] === '-') {
	      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
	    } else {
	      exports.names.push(new RegExp('^' + namespaces + '$'));
	    }
	  }

	  for (i = 0; i < exports.instances.length; i++) {
	    var instance = exports.instances[i];
	    instance.enabled = exports.enabled(instance.namespace);
	  }
	}

	/**
	 * Disable debug output.
	 *
	 * @api public
	 */

	function disable() {
	  exports.enable('');
	}

	/**
	 * Returns true if the given mode name is enabled, false otherwise.
	 *
	 * @param {String} name
	 * @return {Boolean}
	 * @api public
	 */

	function enabled(name) {
	  if (name[name.length - 1] === '*') {
	    return true;
	  }
	  var i, len;
	  for (i = 0, len = exports.skips.length; i < len; i++) {
	    if (exports.skips[i].test(name)) {
	      return false;
	    }
	  }
	  for (i = 0, len = exports.names.length; i < len; i++) {
	    if (exports.names[i].test(name)) {
	      return true;
	    }
	  }
	  return false;
	}

	/**
	 * Coerce `val`.
	 *
	 * @param {Mixed} val
	 * @return {Mixed}
	 * @api private
	 */

	function coerce(val) {
	  if (val instanceof Error) return val.stack || val.message;
	  return val;
	}
	});
	var debug_1 = debug.coerce;
	var debug_2 = debug.disable;
	var debug_3 = debug.enable;
	var debug_4 = debug.enabled;
	var debug_5 = debug.humanize;
	var debug_6 = debug.instances;
	var debug_7 = debug.names;
	var debug_8 = debug.skips;
	var debug_9 = debug.formatters;

	var browser = createCommonjsModule(function (module, exports) {
	/**
	 * This is the web browser implementation of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */

	exports = module.exports = debug;
	exports.log = log;
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;
	exports.storage = 'undefined' != typeof chrome
	               && 'undefined' != typeof chrome.storage
	                  ? chrome.storage.local
	                  : localstorage();

	/**
	 * Colors.
	 */

	exports.colors = [
	  '#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC',
	  '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF',
	  '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC',
	  '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF',
	  '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC',
	  '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033',
	  '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366',
	  '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933',
	  '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC',
	  '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF',
	  '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'
	];

	/**
	 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
	 * and the Firebug extension (any Firefox version) are known
	 * to support "%c" CSS customizations.
	 *
	 * TODO: add a `localStorage` variable to explicitly enable/disable colors
	 */

	function useColors() {
	  // NB: In an Electron preload script, document will be defined but not fully
	  // initialized. Since we know we're in Chrome, we'll just detect this case
	  // explicitly
	  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
	    return true;
	  }

	  // Internet Explorer and Edge do not support colors.
	  if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
	    return false;
	  }

	  // is webkit? http://stackoverflow.com/a/16459606/376773
	  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
	  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
	    // is firebug? http://stackoverflow.com/a/398120/376773
	    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
	    // is firefox >= v31?
	    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
	    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
	    // double check webkit in userAgent just in case we are in a worker
	    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
	}

	/**
	 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	 */

	exports.formatters.j = function(v) {
	  try {
	    return JSON.stringify(v);
	  } catch (err) {
	    return '[UnexpectedJSONParseError]: ' + err.message;
	  }
	};


	/**
	 * Colorize log arguments if enabled.
	 *
	 * @api public
	 */

	function formatArgs(args) {
	  var useColors = this.useColors;

	  args[0] = (useColors ? '%c' : '')
	    + this.namespace
	    + (useColors ? ' %c' : ' ')
	    + args[0]
	    + (useColors ? '%c ' : ' ')
	    + '+' + exports.humanize(this.diff);

	  if (!useColors) return;

	  var c = 'color: ' + this.color;
	  args.splice(1, 0, c, 'color: inherit');

	  // the final "%c" is somewhat tricky, because there could be other
	  // arguments passed either before or after the %c, so we need to
	  // figure out the correct index to insert the CSS into
	  var index = 0;
	  var lastC = 0;
	  args[0].replace(/%[a-zA-Z%]/g, function(match) {
	    if ('%%' === match) return;
	    index++;
	    if ('%c' === match) {
	      // we only are interested in the *last* %c
	      // (the user may have provided their own)
	      lastC = index;
	    }
	  });

	  args.splice(lastC, 0, c);
	}

	/**
	 * Invokes `console.log()` when available.
	 * No-op when `console.log` is not a "function".
	 *
	 * @api public
	 */

	function log() {
	  // this hackery is required for IE8/9, where
	  // the `console.log` function doesn't have 'apply'
	  return 'object' === typeof console
	    && console.log
	    && Function.prototype.apply.call(console.log, console, arguments);
	}

	/**
	 * Save `namespaces`.
	 *
	 * @param {String} namespaces
	 * @api private
	 */

	function save(namespaces) {
	  try {
	    if (null == namespaces) {
	      exports.storage.removeItem('debug');
	    } else {
	      exports.storage.debug = namespaces;
	    }
	  } catch(e) {}
	}

	/**
	 * Load `namespaces`.
	 *
	 * @return {String} returns the previously persisted debug modes
	 * @api private
	 */

	function load() {
	  var r;
	  try {
	    r = exports.storage.debug;
	  } catch(e) {}

	  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
	  if (!r && typeof process !== 'undefined' && 'env' in process) {
	    r = process.env.DEBUG;
	  }

	  return r;
	}

	/**
	 * Enable namespaces listed in `localStorage.debug` initially.
	 */

	exports.enable(load());

	/**
	 * Localstorage attempts to return the localstorage.
	 *
	 * This is necessary because safari throws
	 * when a user disables cookies/localstorage
	 * and you attempt to access it.
	 *
	 * @return {LocalStorage}
	 * @api private
	 */

	function localstorage() {
	  try {
	    return window.localStorage;
	  } catch (e) {}
	}
	});
	var browser_1 = browser.log;
	var browser_2 = browser.formatArgs;
	var browser_3 = browser.save;
	var browser_4 = browser.load;
	var browser_5 = browser.useColors;
	var browser_6 = browser.storage;
	var browser_7 = browser.colors;

	var node = createCommonjsModule(function (module, exports) {
	/**
	 * Module dependencies.
	 */




	/**
	 * This is the Node.js implementation of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */

	exports = module.exports = debug;
	exports.init = init;
	exports.log = log;
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;

	/**
	 * Colors.
	 */

	exports.colors = [ 6, 2, 3, 4, 5, 1 ];

	try {
	  var supportsColor$$1 = supportsColor;
	  if (supportsColor$$1 && supportsColor$$1.level >= 2) {
	    exports.colors = [
	      20, 21, 26, 27, 32, 33, 38, 39, 40, 41, 42, 43, 44, 45, 56, 57, 62, 63, 68,
	      69, 74, 75, 76, 77, 78, 79, 80, 81, 92, 93, 98, 99, 112, 113, 128, 129, 134,
	      135, 148, 149, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171,
	      172, 173, 178, 179, 184, 185, 196, 197, 198, 199, 200, 201, 202, 203, 204,
	      205, 206, 207, 208, 209, 214, 215, 220, 221
	    ];
	  }
	} catch (err) {
	  // swallow - we only care if `supports-color` is available; it doesn't have to be.
	}

	/**
	 * Build up the default `inspectOpts` object from the environment variables.
	 *
	 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
	 */

	exports.inspectOpts = Object.keys(process.env).filter(function (key) {
	  return /^debug_/i.test(key);
	}).reduce(function (obj, key) {
	  // camel-case
	  var prop = key
	    .substring(6)
	    .toLowerCase()
	    .replace(/_([a-z])/g, function (_, k) { return k.toUpperCase() });

	  // coerce string value into JS value
	  var val = process.env[key];
	  if (/^(yes|on|true|enabled)$/i.test(val)) val = true;
	  else if (/^(no|off|false|disabled)$/i.test(val)) val = false;
	  else if (val === 'null') val = null;
	  else val = Number(val);

	  obj[prop] = val;
	  return obj;
	}, {});

	/**
	 * Is stdout a TTY? Colored output is enabled when `true`.
	 */

	function useColors() {
	  return 'colors' in exports.inspectOpts
	    ? Boolean(exports.inspectOpts.colors)
	    : tty.isatty(process.stderr.fd);
	}

	/**
	 * Map %o to `util.inspect()`, all on a single line.
	 */

	exports.formatters.o = function(v) {
	  this.inspectOpts.colors = this.useColors;
	  return util.inspect(v, this.inspectOpts)
	    .split('\n').map(function(str) {
	      return str.trim()
	    }).join(' ');
	};

	/**
	 * Map %o to `util.inspect()`, allowing multiple lines if needed.
	 */

	exports.formatters.O = function(v) {
	  this.inspectOpts.colors = this.useColors;
	  return util.inspect(v, this.inspectOpts);
	};

	/**
	 * Adds ANSI color escape codes if enabled.
	 *
	 * @api public
	 */

	function formatArgs(args) {
	  var name = this.namespace;
	  var useColors = this.useColors;

	  if (useColors) {
	    var c = this.color;
	    var colorCode = '\u001b[3' + (c < 8 ? c : '8;5;' + c);
	    var prefix = '  ' + colorCode + ';1m' + name + ' ' + '\u001b[0m';

	    args[0] = prefix + args[0].split('\n').join('\n' + prefix);
	    args.push(colorCode + 'm+' + exports.humanize(this.diff) + '\u001b[0m');
	  } else {
	    args[0] = getDate() + name + ' ' + args[0];
	  }
	}

	function getDate() {
	  if (exports.inspectOpts.hideDate) {
	    return '';
	  } else {
	    return new Date().toISOString() + ' ';
	  }
	}

	/**
	 * Invokes `util.format()` with the specified arguments and writes to stderr.
	 */

	function log() {
	  return process.stderr.write(util.format.apply(util, arguments) + '\n');
	}

	/**
	 * Save `namespaces`.
	 *
	 * @param {String} namespaces
	 * @api private
	 */

	function save(namespaces) {
	  if (null == namespaces) {
	    // If you set a process.env field to null or undefined, it gets cast to the
	    // string 'null' or 'undefined'. Just delete instead.
	    delete process.env.DEBUG;
	  } else {
	    process.env.DEBUG = namespaces;
	  }
	}

	/**
	 * Load `namespaces`.
	 *
	 * @return {String} returns the previously persisted debug modes
	 * @api private
	 */

	function load() {
	  return process.env.DEBUG;
	}

	/**
	 * Init logic for `debug` instances.
	 *
	 * Create a new `inspectOpts` object in case `useColors` is set
	 * differently for a particular `debug` instance.
	 */

	function init (debug$$1) {
	  debug$$1.inspectOpts = {};

	  var keys = Object.keys(exports.inspectOpts);
	  for (var i = 0; i < keys.length; i++) {
	    debug$$1.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
	  }
	}

	/**
	 * Enable namespaces listed in `process.env.DEBUG` initially.
	 */

	exports.enable(load());
	});
	var node_1 = node.init;
	var node_2 = node.log;
	var node_3 = node.formatArgs;
	var node_4 = node.save;
	var node_5 = node.load;
	var node_6 = node.useColors;
	var node_7 = node.colors;
	var node_8 = node.inspectOpts;

	var src = createCommonjsModule(function (module) {
	/**
	 * Detect Electron renderer process, which is node, but we should
	 * treat as a browser.
	 */

	if (typeof process === 'undefined' || process.type === 'renderer') {
	  module.exports = browser;
	} else {
	  module.exports = node;
	}
	});

	var ltgt = createCommonjsModule(function (module, exports) {
	exports.compare = function (a, b) {

	  if(Buffer.isBuffer(a)) {
	    var l = Math.min(a.length, b.length);
	    for(var i = 0; i < l; i++) {
	      var cmp = a[i] - b[i];
	      if(cmp) return cmp
	    }
	    return a.length - b.length
	  }

	  return a < b ? -1 : a > b ? 1 : 0
	};

	function has(obj, key) {
	  return Object.hasOwnProperty.call(obj, key)
	}

	// to be compatible with the current abstract-leveldown tests
	// nullish or empty strings.
	// I could use !!val but I want to permit numbers and booleans,
	// if possible.

	function isDef (val) {
	  return val !== undefined && val !== ''
	}

	function has (range, name) {
	  return Object.hasOwnProperty.call(range, name)
	}

	function hasKey(range, name) {
	  return Object.hasOwnProperty.call(range, name) && name
	}

	var lowerBoundKey = exports.lowerBoundKey = function (range) {
	    return (
	       hasKey(range, 'gt')
	    || hasKey(range, 'gte')
	    || hasKey(range, 'min')
	    || (range.reverse ? hasKey(range, 'end') : hasKey(range, 'start'))
	    || undefined
	    )
	};

	var lowerBound = exports.lowerBound = function (range, def) {
	  var k = lowerBoundKey(range);
	  return k ? range[k] : def
	};

	var lowerBoundInclusive = exports.lowerBoundInclusive = function (range) {
	  return has(range, 'gt') ? false : true
	};

	var upperBoundInclusive = exports.upperBoundInclusive =
	  function (range) {
	    return (has(range, 'lt') /*&& !range.maxEx*/) ? false : true
	  };

	var lowerBoundExclusive = exports.lowerBoundExclusive =
	  function (range) {
	    return !lowerBoundInclusive(range)
	  };

	var upperBoundExclusive = exports.upperBoundExclusive =
	  function (range) {
	    return !upperBoundInclusive(range)
	  };

	var upperBoundKey = exports.upperBoundKey = function (range) {
	    return (
	       hasKey(range, 'lt')
	    || hasKey(range, 'lte')
	    || hasKey(range, 'max')
	    || (range.reverse ? hasKey(range, 'start') : hasKey(range, 'end'))
	    || undefined
	    )
	};

	var upperBound = exports.upperBound = function (range, def) {
	  var k = upperBoundKey(range);
	  return k ? range[k] : def
	};

	exports.start = function (range, def) {
	  return range.reverse ? upperBound(range, def) : lowerBound(range, def)
	};
	exports.end = function (range, def) {
	  return range.reverse ? lowerBound(range, def) : upperBound(range, def)
	};
	exports.startInclusive = function (range) {
	  return (
	    range.reverse
	  ? upperBoundInclusive(range)
	  : lowerBoundInclusive(range)
	  )
	};
	exports.endInclusive = function (range) {
	  return (
	    range.reverse
	  ? lowerBoundInclusive(range)
	  : upperBoundInclusive(range)
	  )
	};

	function id (e) { return e }

	exports.toLtgt = function (range, _range, map, lower, upper) {
	  _range = _range || {};
	  map = map || id;
	  var defaults = arguments.length > 3;
	  var lb = exports.lowerBoundKey(range);
	  var ub = exports.upperBoundKey(range);
	  if(lb) {
	    if(lb === 'gt') _range.gt = map(range.gt, false);
	    else            _range.gte = map(range[lb], false);
	  }
	  else if(defaults)
	    _range.gte = map(lower, false);

	  if(ub) {
	    if(ub === 'lt') _range.lt = map(range.lt, true);
	    else            _range.lte = map(range[ub], true);
	  }
	  else if(defaults)
	    _range.lte = map(upper, true);

	  if(range.reverse != null)
	    _range.reverse = !!range.reverse;

	  //if range was used mutably
	  //(in level-sublevel it's part of an options object
	  //that has more properties on it.)
	  if(has(_range, 'max'))   delete _range.max;
	  if(has(_range, 'min'))   delete _range.min;
	  if(has(_range, 'start')) delete _range.start;
	  if(has(_range, 'end'))   delete _range.end;

	  return _range
	};

	exports.contains = function (range, key, compare) {
	  compare = compare || exports.compare;

	  var lb = lowerBound(range);
	  if(isDef(lb)) {
	    var cmp = compare(key, lb);
	    if(cmp < 0 || (cmp === 0 && lowerBoundExclusive(range)))
	      return false
	  }

	  var ub = upperBound(range);
	  if(isDef(ub)) {
	    var cmp = compare(key, ub);
	    if(cmp > 0 || (cmp === 0) && upperBoundExclusive(range))
	      return false
	  }

	  return true
	};

	exports.filter = function (range, compare) {
	  return function (key) {
	    return exports.contains(range, key, compare)
	  }
	};
	});
	var ltgt_1 = ltgt.compare;
	var ltgt_2 = ltgt.lowerBoundKey;
	var ltgt_3 = ltgt.lowerBound;
	var ltgt_4 = ltgt.lowerBoundInclusive;
	var ltgt_5 = ltgt.upperBoundInclusive;
	var ltgt_6 = ltgt.lowerBoundExclusive;
	var ltgt_7 = ltgt.upperBoundExclusive;
	var ltgt_8 = ltgt.upperBoundKey;
	var ltgt_9 = ltgt.upperBound;
	var ltgt_10 = ltgt.start;
	var ltgt_11 = ltgt.end;
	var ltgt_12 = ltgt.startInclusive;
	var ltgt_13 = ltgt.endInclusive;
	var ltgt_14 = ltgt.toLtgt;
	var ltgt_15 = ltgt.contains;
	var ltgt_16 = ltgt.filter;

	var isarray = Array.isArray || function (arr) {
	  return Object.prototype.toString.call(arr) == '[object Array]';
	};

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.

	function isArray(arg) {
	  if (Array.isArray) {
	    return Array.isArray(arg);
	  }
	  return objectToString(arg) === '[object Array]';
	}
	var isArray_1 = isArray;

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	var isBoolean_1 = isBoolean;

	function isNull(arg) {
	  return arg === null;
	}
	var isNull_1 = isNull;

	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	var isNullOrUndefined_1 = isNullOrUndefined;

	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	var isNumber_1 = isNumber;

	function isString(arg) {
	  return typeof arg === 'string';
	}
	var isString_1 = isString;

	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	var isSymbol_1 = isSymbol;

	function isUndefined(arg) {
	  return arg === void 0;
	}
	var isUndefined_1 = isUndefined;

	function isRegExp(re) {
	  return objectToString(re) === '[object RegExp]';
	}
	var isRegExp_1 = isRegExp;

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	var isObject_1 = isObject;

	function isDate(d) {
	  return objectToString(d) === '[object Date]';
	}
	var isDate_1 = isDate;

	function isError(e) {
	  return (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	var isError_1 = isError;

	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	var isFunction_1 = isFunction;

	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	var isPrimitive_1 = isPrimitive;

	var isBuffer = Buffer.isBuffer;

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}

	var util$1 = {
		isArray: isArray_1,
		isBoolean: isBoolean_1,
		isNull: isNull_1,
		isNullOrUndefined: isNullOrUndefined_1,
		isNumber: isNumber_1,
		isString: isString_1,
		isSymbol: isSymbol_1,
		isUndefined: isUndefined_1,
		isRegExp: isRegExp_1,
		isObject: isObject_1,
		isDate: isDate_1,
		isError: isError_1,
		isFunction: isFunction_1,
		isPrimitive: isPrimitive_1,
		isBuffer: isBuffer
	};

	var string_decoder = createCommonjsModule(function (module, exports) {
	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var Buffer = buffer.Buffer;

	var isBufferEncoding = Buffer.isEncoding
	  || function(encoding) {
	       switch (encoding && encoding.toLowerCase()) {
	         case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
	         default: return false;
	       }
	     };


	function assertEncoding(encoding) {
	  if (encoding && !isBufferEncoding(encoding)) {
	    throw new Error('Unknown encoding: ' + encoding);
	  }
	}

	// StringDecoder provides an interface for efficiently splitting a series of
	// buffers into a series of JS strings without breaking apart multi-byte
	// characters. CESU-8 is handled as part of the UTF-8 encoding.
	//
	// @TODO Handling all encodings inside a single object makes it very difficult
	// to reason about this code, so it should be split up in the future.
	// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
	// points as used by CESU-8.
	var StringDecoder = exports.StringDecoder = function(encoding) {
	  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
	  assertEncoding(encoding);
	  switch (this.encoding) {
	    case 'utf8':
	      // CESU-8 represents each of Surrogate Pair by 3-bytes
	      this.surrogateSize = 3;
	      break;
	    case 'ucs2':
	    case 'utf16le':
	      // UTF-16 represents each of Surrogate Pair by 2-bytes
	      this.surrogateSize = 2;
	      this.detectIncompleteChar = utf16DetectIncompleteChar;
	      break;
	    case 'base64':
	      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
	      this.surrogateSize = 3;
	      this.detectIncompleteChar = base64DetectIncompleteChar;
	      break;
	    default:
	      this.write = passThroughWrite;
	      return;
	  }

	  // Enough space to store all bytes of a single character. UTF-8 needs 4
	  // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
	  this.charBuffer = new Buffer(6);
	  // Number of bytes received for the current incomplete multi-byte character.
	  this.charReceived = 0;
	  // Number of bytes expected for the current incomplete multi-byte character.
	  this.charLength = 0;
	};


	// write decodes the given buffer and returns it as JS string that is
	// guaranteed to not contain any partial multi-byte characters. Any partial
	// character found at the end of the buffer is buffered up, and will be
	// returned when calling write again with the remaining bytes.
	//
	// Note: Converting a Buffer containing an orphan surrogate to a String
	// currently works, but converting a String to a Buffer (via `new Buffer`, or
	// Buffer#write) will replace incomplete surrogates with the unicode
	// replacement character. See https://codereview.chromium.org/121173009/ .
	StringDecoder.prototype.write = function(buffer$$1) {
	  var charStr = '';
	  // if our last write ended with an incomplete multibyte character
	  while (this.charLength) {
	    // determine how many remaining bytes this buffer has to offer for this char
	    var available = (buffer$$1.length >= this.charLength - this.charReceived) ?
	        this.charLength - this.charReceived :
	        buffer$$1.length;

	    // add the new bytes to the char buffer
	    buffer$$1.copy(this.charBuffer, this.charReceived, 0, available);
	    this.charReceived += available;

	    if (this.charReceived < this.charLength) {
	      // still not enough chars in this buffer? wait for more ...
	      return '';
	    }

	    // remove bytes belonging to the current character from the buffer
	    buffer$$1 = buffer$$1.slice(available, buffer$$1.length);

	    // get the character that was split
	    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

	    // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
	    var charCode = charStr.charCodeAt(charStr.length - 1);
	    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
	      this.charLength += this.surrogateSize;
	      charStr = '';
	      continue;
	    }
	    this.charReceived = this.charLength = 0;

	    // if there are no more bytes in this buffer, just emit our char
	    if (buffer$$1.length === 0) {
	      return charStr;
	    }
	    break;
	  }

	  // determine and set charLength / charReceived
	  this.detectIncompleteChar(buffer$$1);

	  var end = buffer$$1.length;
	  if (this.charLength) {
	    // buffer the incomplete character bytes we got
	    buffer$$1.copy(this.charBuffer, 0, buffer$$1.length - this.charReceived, end);
	    end -= this.charReceived;
	  }

	  charStr += buffer$$1.toString(this.encoding, 0, end);

	  var end = charStr.length - 1;
	  var charCode = charStr.charCodeAt(end);
	  // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
	  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
	    var size = this.surrogateSize;
	    this.charLength += size;
	    this.charReceived += size;
	    this.charBuffer.copy(this.charBuffer, size, 0, size);
	    buffer$$1.copy(this.charBuffer, 0, 0, size);
	    return charStr.substring(0, end);
	  }

	  // or just emit the charStr
	  return charStr;
	};

	// detectIncompleteChar determines if there is an incomplete UTF-8 character at
	// the end of the given buffer. If so, it sets this.charLength to the byte
	// length that character, and sets this.charReceived to the number of bytes
	// that are available for this character.
	StringDecoder.prototype.detectIncompleteChar = function(buffer$$1) {
	  // determine how many bytes we have to check at the end of this buffer
	  var i = (buffer$$1.length >= 3) ? 3 : buffer$$1.length;

	  // Figure out if one of the last i bytes of our buffer announces an
	  // incomplete char.
	  for (; i > 0; i--) {
	    var c = buffer$$1[buffer$$1.length - i];

	    // See http://en.wikipedia.org/wiki/UTF-8#Description

	    // 110XXXXX
	    if (i == 1 && c >> 5 == 0x06) {
	      this.charLength = 2;
	      break;
	    }

	    // 1110XXXX
	    if (i <= 2 && c >> 4 == 0x0E) {
	      this.charLength = 3;
	      break;
	    }

	    // 11110XXX
	    if (i <= 3 && c >> 3 == 0x1E) {
	      this.charLength = 4;
	      break;
	    }
	  }
	  this.charReceived = i;
	};

	StringDecoder.prototype.end = function(buffer$$1) {
	  var res = '';
	  if (buffer$$1 && buffer$$1.length)
	    res = this.write(buffer$$1);

	  if (this.charReceived) {
	    var cr = this.charReceived;
	    var buf = this.charBuffer;
	    var enc = this.encoding;
	    res += buf.slice(0, cr).toString(enc);
	  }

	  return res;
	};

	function passThroughWrite(buffer$$1) {
	  return buffer$$1.toString(this.encoding);
	}

	function utf16DetectIncompleteChar(buffer$$1) {
	  this.charReceived = buffer$$1.length % 2;
	  this.charLength = this.charReceived ? 2 : 0;
	}

	function base64DetectIncompleteChar(buffer$$1) {
	  this.charReceived = buffer$$1.length % 3;
	  this.charLength = this.charReceived ? 3 : 0;
	}
	});
	var string_decoder_1 = string_decoder.StringDecoder;

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var _stream_readable = Readable;

	/*<replacement>*/

	/*</replacement>*/


	/*<replacement>*/
	var Buffer$2 = buffer.Buffer;
	/*</replacement>*/

	Readable.ReadableState = ReadableState;

	var EE = events__default.EventEmitter;

	/*<replacement>*/
	if (!EE.listenerCount) EE.listenerCount = function(emitter, type) {
	  return emitter.listeners(type).length;
	};
	/*</replacement>*/



	/*<replacement>*/

	util$1.inherits = inherits;
	/*</replacement>*/

	var StringDecoder;

	util$1.inherits(Readable, Stream);

	function ReadableState(options, stream) {
	  options = options || {};

	  // the point at which it stops calling _read() to fill the buffer
	  // Note: 0 is a valid value, means "don't call _read preemptively ever"
	  var hwm = options.highWaterMark;
	  this.highWaterMark = (hwm || hwm === 0) ? hwm : 16 * 1024;

	  // cast to ints.
	  this.highWaterMark = ~~this.highWaterMark;

	  this.buffer = [];
	  this.length = 0;
	  this.pipes = null;
	  this.pipesCount = 0;
	  this.flowing = false;
	  this.ended = false;
	  this.endEmitted = false;
	  this.reading = false;

	  // In streams that never have any data, and do push(null) right away,
	  // the consumer can miss the 'end' event if they do some I/O before
	  // consuming the stream.  So, we don't emit('end') until some reading
	  // happens.
	  this.calledRead = false;

	  // a flag to be able to tell if the onwrite cb is called immediately,
	  // or on a later tick.  We set this to true at first, becuase any
	  // actions that shouldn't happen until "later" should generally also
	  // not happen before the first write call.
	  this.sync = true;

	  // whenever we return null, then we set a flag to say
	  // that we're awaiting a 'readable' event emission.
	  this.needReadable = false;
	  this.emittedReadable = false;
	  this.readableListening = false;


	  // object stream flag. Used to make read(n) ignore n and to
	  // make all the buffer merging and length checks go away
	  this.objectMode = !!options.objectMode;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = options.defaultEncoding || 'utf8';

	  // when piping, we only care about 'readable' events that happen
	  // after read()ing all the bytes and not getting any pushback.
	  this.ranOut = false;

	  // the number of writers that are awaiting a drain event in .pipe()s
	  this.awaitDrain = 0;

	  // if true, a maybeReadMore has been scheduled
	  this.readingMore = false;

	  this.decoder = null;
	  this.encoding = null;
	  if (options.encoding) {
	    if (!StringDecoder)
	      StringDecoder = string_decoder.StringDecoder;
	    this.decoder = new StringDecoder(options.encoding);
	    this.encoding = options.encoding;
	  }
	}

	function Readable(options) {
	  if (!(this instanceof Readable))
	    return new Readable(options);

	  this._readableState = new ReadableState(options, this);

	  // legacy
	  this.readable = true;

	  Stream.call(this);
	}

	// Manually shove something into the read() buffer.
	// This returns true if the highWaterMark has not been hit yet,
	// similar to how Writable.write() returns true if you should
	// write() some more.
	Readable.prototype.push = function(chunk, encoding) {
	  var state = this._readableState;

	  if (typeof chunk === 'string' && !state.objectMode) {
	    encoding = encoding || state.defaultEncoding;
	    if (encoding !== state.encoding) {
	      chunk = new Buffer$2(chunk, encoding);
	      encoding = '';
	    }
	  }

	  return readableAddChunk(this, state, chunk, encoding, false);
	};

	// Unshift should *always* be something directly out of read()
	Readable.prototype.unshift = function(chunk) {
	  var state = this._readableState;
	  return readableAddChunk(this, state, chunk, '', true);
	};

	function readableAddChunk(stream, state, chunk, encoding, addToFront) {
	  var er = chunkInvalid(state, chunk);
	  if (er) {
	    stream.emit('error', er);
	  } else if (chunk === null || chunk === undefined) {
	    state.reading = false;
	    if (!state.ended)
	      onEofChunk(stream, state);
	  } else if (state.objectMode || chunk && chunk.length > 0) {
	    if (state.ended && !addToFront) {
	      var e = new Error('stream.push() after EOF');
	      stream.emit('error', e);
	    } else if (state.endEmitted && addToFront) {
	      var e = new Error('stream.unshift() after end event');
	      stream.emit('error', e);
	    } else {
	      if (state.decoder && !addToFront && !encoding)
	        chunk = state.decoder.write(chunk);

	      // update the buffer info.
	      state.length += state.objectMode ? 1 : chunk.length;
	      if (addToFront) {
	        state.buffer.unshift(chunk);
	      } else {
	        state.reading = false;
	        state.buffer.push(chunk);
	      }

	      if (state.needReadable)
	        emitReadable(stream);

	      maybeReadMore(stream, state);
	    }
	  } else if (!addToFront) {
	    state.reading = false;
	  }

	  return needMoreData(state);
	}



	// if it's past the high water mark, we can push in some more.
	// Also, if we have no data yet, we can stand some
	// more bytes.  This is to work around cases where hwm=0,
	// such as the repl.  Also, if the push() triggered a
	// readable event, and the user called read(largeNumber) such that
	// needReadable was set, then we ought to push more, so that another
	// 'readable' event will be triggered.
	function needMoreData(state) {
	  return !state.ended &&
	         (state.needReadable ||
	          state.length < state.highWaterMark ||
	          state.length === 0);
	}

	// backwards compatibility.
	Readable.prototype.setEncoding = function(enc) {
	  if (!StringDecoder)
	    StringDecoder = string_decoder.StringDecoder;
	  this._readableState.decoder = new StringDecoder(enc);
	  this._readableState.encoding = enc;
	};

	// Don't raise the hwm > 128MB
	var MAX_HWM = 0x800000;
	function roundUpToNextPowerOf2(n) {
	  if (n >= MAX_HWM) {
	    n = MAX_HWM;
	  } else {
	    // Get the next highest power of 2
	    n--;
	    for (var p = 1; p < 32; p <<= 1) n |= n >> p;
	    n++;
	  }
	  return n;
	}

	function howMuchToRead(n, state) {
	  if (state.length === 0 && state.ended)
	    return 0;

	  if (state.objectMode)
	    return n === 0 ? 0 : 1;

	  if (n === null || isNaN(n)) {
	    // only flow one buffer at a time
	    if (state.flowing && state.buffer.length)
	      return state.buffer[0].length;
	    else
	      return state.length;
	  }

	  if (n <= 0)
	    return 0;

	  // If we're asking for more than the target buffer level,
	  // then raise the water mark.  Bump up to the next highest
	  // power of 2, to prevent increasing it excessively in tiny
	  // amounts.
	  if (n > state.highWaterMark)
	    state.highWaterMark = roundUpToNextPowerOf2(n);

	  // don't have that much.  return null, unless we've ended.
	  if (n > state.length) {
	    if (!state.ended) {
	      state.needReadable = true;
	      return 0;
	    } else
	      return state.length;
	  }

	  return n;
	}

	// you can override either this method, or the async _read(n) below.
	Readable.prototype.read = function(n) {
	  var state = this._readableState;
	  state.calledRead = true;
	  var nOrig = n;
	  var ret;

	  if (typeof n !== 'number' || n > 0)
	    state.emittedReadable = false;

	  // if we're doing read(0) to trigger a readable event, but we
	  // already have a bunch of data in the buffer, then just trigger
	  // the 'readable' event and move on.
	  if (n === 0 &&
	      state.needReadable &&
	      (state.length >= state.highWaterMark || state.ended)) {
	    emitReadable(this);
	    return null;
	  }

	  n = howMuchToRead(n, state);

	  // if we've ended, and we're now clear, then finish it up.
	  if (n === 0 && state.ended) {
	    ret = null;

	    // In cases where the decoder did not receive enough data
	    // to produce a full chunk, then immediately received an
	    // EOF, state.buffer will contain [<Buffer >, <Buffer 00 ...>].
	    // howMuchToRead will see this and coerce the amount to
	    // read to zero (because it's looking at the length of the
	    // first <Buffer > in state.buffer), and we'll end up here.
	    //
	    // This can only happen via state.decoder -- no other venue
	    // exists for pushing a zero-length chunk into state.buffer
	    // and triggering this behavior. In this case, we return our
	    // remaining data and end the stream, if appropriate.
	    if (state.length > 0 && state.decoder) {
	      ret = fromList(n, state);
	      state.length -= ret.length;
	    }

	    if (state.length === 0)
	      endReadable(this);

	    return ret;
	  }

	  // All the actual chunk generation logic needs to be
	  // *below* the call to _read.  The reason is that in certain
	  // synthetic stream cases, such as passthrough streams, _read
	  // may be a completely synchronous operation which may change
	  // the state of the read buffer, providing enough data when
	  // before there was *not* enough.
	  //
	  // So, the steps are:
	  // 1. Figure out what the state of things will be after we do
	  // a read from the buffer.
	  //
	  // 2. If that resulting state will trigger a _read, then call _read.
	  // Note that this may be asynchronous, or synchronous.  Yes, it is
	  // deeply ugly to write APIs this way, but that still doesn't mean
	  // that the Readable class should behave improperly, as streams are
	  // designed to be sync/async agnostic.
	  // Take note if the _read call is sync or async (ie, if the read call
	  // has returned yet), so that we know whether or not it's safe to emit
	  // 'readable' etc.
	  //
	  // 3. Actually pull the requested chunks out of the buffer and return.

	  // if we need a readable event, then we need to do some reading.
	  var doRead = state.needReadable;

	  // if we currently have less than the highWaterMark, then also read some
	  if (state.length - n <= state.highWaterMark)
	    doRead = true;

	  // however, if we've ended, then there's no point, and if we're already
	  // reading, then it's unnecessary.
	  if (state.ended || state.reading)
	    doRead = false;

	  if (doRead) {
	    state.reading = true;
	    state.sync = true;
	    // if the length is currently zero, then we *need* a readable event.
	    if (state.length === 0)
	      state.needReadable = true;
	    // call internal read method
	    this._read(state.highWaterMark);
	    state.sync = false;
	  }

	  // If _read called its callback synchronously, then `reading`
	  // will be false, and we need to re-evaluate how much data we
	  // can return to the user.
	  if (doRead && !state.reading)
	    n = howMuchToRead(nOrig, state);

	  if (n > 0)
	    ret = fromList(n, state);
	  else
	    ret = null;

	  if (ret === null) {
	    state.needReadable = true;
	    n = 0;
	  }

	  state.length -= n;

	  // If we have nothing in the buffer, then we want to know
	  // as soon as we *do* get something into the buffer.
	  if (state.length === 0 && !state.ended)
	    state.needReadable = true;

	  // If we happened to read() exactly the remaining amount in the
	  // buffer, and the EOF has been seen at this point, then make sure
	  // that we emit 'end' on the very next tick.
	  if (state.ended && !state.endEmitted && state.length === 0)
	    endReadable(this);

	  return ret;
	};

	function chunkInvalid(state, chunk) {
	  var er = null;
	  if (!Buffer$2.isBuffer(chunk) &&
	      'string' !== typeof chunk &&
	      chunk !== null &&
	      chunk !== undefined &&
	      !state.objectMode) {
	    er = new TypeError('Invalid non-string/buffer chunk');
	  }
	  return er;
	}


	function onEofChunk(stream, state) {
	  if (state.decoder && !state.ended) {
	    var chunk = state.decoder.end();
	    if (chunk && chunk.length) {
	      state.buffer.push(chunk);
	      state.length += state.objectMode ? 1 : chunk.length;
	    }
	  }
	  state.ended = true;

	  // if we've ended and we have some data left, then emit
	  // 'readable' now to make sure it gets picked up.
	  if (state.length > 0)
	    emitReadable(stream);
	  else
	    endReadable(stream);
	}

	// Don't emit readable right away in sync mode, because this can trigger
	// another read() call => stack overflow.  This way, it might trigger
	// a nextTick recursion warning, but that's not so bad.
	function emitReadable(stream) {
	  var state = stream._readableState;
	  state.needReadable = false;
	  if (state.emittedReadable)
	    return;

	  state.emittedReadable = true;
	  if (state.sync)
	    process.nextTick(function() {
	      emitReadable_(stream);
	    });
	  else
	    emitReadable_(stream);
	}

	function emitReadable_(stream) {
	  stream.emit('readable');
	}


	// at this point, the user has presumably seen the 'readable' event,
	// and called read() to consume some data.  that may have triggered
	// in turn another _read(n) call, in which case reading = true if
	// it's in progress.
	// However, if we're not ended, or reading, and the length < hwm,
	// then go ahead and try to read some more preemptively.
	function maybeReadMore(stream, state) {
	  if (!state.readingMore) {
	    state.readingMore = true;
	    process.nextTick(function() {
	      maybeReadMore_(stream, state);
	    });
	  }
	}

	function maybeReadMore_(stream, state) {
	  var len = state.length;
	  while (!state.reading && !state.flowing && !state.ended &&
	         state.length < state.highWaterMark) {
	    stream.read(0);
	    if (len === state.length)
	      // didn't get any data, stop spinning.
	      break;
	    else
	      len = state.length;
	  }
	  state.readingMore = false;
	}

	// abstract method.  to be overridden in specific implementation classes.
	// call cb(er, data) where data is <= n in length.
	// for virtual (non-string, non-buffer) streams, "length" is somewhat
	// arbitrary, and perhaps not very meaningful.
	Readable.prototype._read = function(n) {
	  this.emit('error', new Error('not implemented'));
	};

	Readable.prototype.pipe = function(dest, pipeOpts) {
	  var src = this;
	  var state = this._readableState;

	  switch (state.pipesCount) {
	    case 0:
	      state.pipes = dest;
	      break;
	    case 1:
	      state.pipes = [state.pipes, dest];
	      break;
	    default:
	      state.pipes.push(dest);
	      break;
	  }
	  state.pipesCount += 1;

	  var doEnd = (!pipeOpts || pipeOpts.end !== false) &&
	              dest !== process.stdout &&
	              dest !== process.stderr;

	  var endFn = doEnd ? onend : cleanup;
	  if (state.endEmitted)
	    process.nextTick(endFn);
	  else
	    src.once('end', endFn);

	  dest.on('unpipe', onunpipe);
	  function onunpipe(readable) {
	    if (readable !== src) return;
	    cleanup();
	  }

	  function onend() {
	    dest.end();
	  }

	  // when the dest drains, it reduces the awaitDrain counter
	  // on the source.  This would be more elegant with a .once()
	  // handler in flow(), but adding and removing repeatedly is
	  // too slow.
	  var ondrain = pipeOnDrain(src);
	  dest.on('drain', ondrain);

	  function cleanup() {
	    // cleanup event handlers once the pipe is broken
	    dest.removeListener('close', onclose);
	    dest.removeListener('finish', onfinish);
	    dest.removeListener('drain', ondrain);
	    dest.removeListener('error', onerror);
	    dest.removeListener('unpipe', onunpipe);
	    src.removeListener('end', onend);
	    src.removeListener('end', cleanup);

	    // if the reader is waiting for a drain event from this
	    // specific writer, then it would cause it to never start
	    // flowing again.
	    // So, if this is awaiting a drain, then we just call it now.
	    // If we don't know, then assume that we are waiting for one.
	    if (!dest._writableState || dest._writableState.needDrain)
	      ondrain();
	  }

	  // if the dest has an error, then stop piping into it.
	  // however, don't suppress the throwing behavior for this.
	  function onerror(er) {
	    unpipe();
	    dest.removeListener('error', onerror);
	    if (EE.listenerCount(dest, 'error') === 0)
	      dest.emit('error', er);
	  }
	  // This is a brutally ugly hack to make sure that our error handler
	  // is attached before any userland ones.  NEVER DO THIS.
	  if (!dest._events || !dest._events.error)
	    dest.on('error', onerror);
	  else if (isarray(dest._events.error))
	    dest._events.error.unshift(onerror);
	  else
	    dest._events.error = [onerror, dest._events.error];



	  // Both close and finish should trigger unpipe, but only once.
	  function onclose() {
	    dest.removeListener('finish', onfinish);
	    unpipe();
	  }
	  dest.once('close', onclose);
	  function onfinish() {
	    dest.removeListener('close', onclose);
	    unpipe();
	  }
	  dest.once('finish', onfinish);

	  function unpipe() {
	    src.unpipe(dest);
	  }

	  // tell the dest that it's being piped to
	  dest.emit('pipe', src);

	  // start the flow if it hasn't been started already.
	  if (!state.flowing) {
	    // the handler that waits for readable events after all
	    // the data gets sucked out in flow.
	    // This would be easier to follow with a .once() handler
	    // in flow(), but that is too slow.
	    this.on('readable', pipeOnReadable);

	    state.flowing = true;
	    process.nextTick(function() {
	      flow(src);
	    });
	  }

	  return dest;
	};

	function pipeOnDrain(src) {
	  return function() {
	    var state = src._readableState;
	    state.awaitDrain--;
	    if (state.awaitDrain === 0)
	      flow(src);
	  };
	}

	function flow(src) {
	  var state = src._readableState;
	  var chunk;
	  state.awaitDrain = 0;

	  function write(dest, i, list) {
	    var written = dest.write(chunk);
	    if (false === written) {
	      state.awaitDrain++;
	    }
	  }

	  while (state.pipesCount && null !== (chunk = src.read())) {

	    if (state.pipesCount === 1)
	      write(state.pipes, 0, null);
	    else
	      forEach(state.pipes, write);

	    src.emit('data', chunk);

	    // if anyone needs a drain, then we have to wait for that.
	    if (state.awaitDrain > 0)
	      return;
	  }

	  // if every destination was unpiped, either before entering this
	  // function, or in the while loop, then stop flowing.
	  //
	  // NB: This is a pretty rare edge case.
	  if (state.pipesCount === 0) {
	    state.flowing = false;

	    // if there were data event listeners added, then switch to old mode.
	    if (EE.listenerCount(src, 'data') > 0)
	      emitDataEvents(src);
	    return;
	  }

	  // at this point, no one needed a drain, so we just ran out of data
	  // on the next readable event, start it over again.
	  state.ranOut = true;
	}

	function pipeOnReadable() {
	  if (this._readableState.ranOut) {
	    this._readableState.ranOut = false;
	    flow(this);
	  }
	}


	Readable.prototype.unpipe = function(dest) {
	  var state = this._readableState;

	  // if we're not piping anywhere, then do nothing.
	  if (state.pipesCount === 0)
	    return this;

	  // just one destination.  most common case.
	  if (state.pipesCount === 1) {
	    // passed in one, but it's not the right one.
	    if (dest && dest !== state.pipes)
	      return this;

	    if (!dest)
	      dest = state.pipes;

	    // got a match.
	    state.pipes = null;
	    state.pipesCount = 0;
	    this.removeListener('readable', pipeOnReadable);
	    state.flowing = false;
	    if (dest)
	      dest.emit('unpipe', this);
	    return this;
	  }

	  // slow case. multiple pipe destinations.

	  if (!dest) {
	    // remove all.
	    var dests = state.pipes;
	    var len = state.pipesCount;
	    state.pipes = null;
	    state.pipesCount = 0;
	    this.removeListener('readable', pipeOnReadable);
	    state.flowing = false;

	    for (var i = 0; i < len; i++)
	      dests[i].emit('unpipe', this);
	    return this;
	  }

	  // try to find the right one.
	  var i = indexOf(state.pipes, dest);
	  if (i === -1)
	    return this;

	  state.pipes.splice(i, 1);
	  state.pipesCount -= 1;
	  if (state.pipesCount === 1)
	    state.pipes = state.pipes[0];

	  dest.emit('unpipe', this);

	  return this;
	};

	// set up data events if they are asked for
	// Ensure readable listeners eventually get something
	Readable.prototype.on = function(ev, fn) {
	  var res = Stream.prototype.on.call(this, ev, fn);

	  if (ev === 'data' && !this._readableState.flowing)
	    emitDataEvents(this);

	  if (ev === 'readable' && this.readable) {
	    var state = this._readableState;
	    if (!state.readableListening) {
	      state.readableListening = true;
	      state.emittedReadable = false;
	      state.needReadable = true;
	      if (!state.reading) {
	        this.read(0);
	      } else if (state.length) {
	        emitReadable(this, state);
	      }
	    }
	  }

	  return res;
	};
	Readable.prototype.addListener = Readable.prototype.on;

	// pause() and resume() are remnants of the legacy readable stream API
	// If the user uses them, then switch into old mode.
	Readable.prototype.resume = function() {
	  emitDataEvents(this);
	  this.read(0);
	  this.emit('resume');
	};

	Readable.prototype.pause = function() {
	  emitDataEvents(this, true);
	  this.emit('pause');
	};

	function emitDataEvents(stream, startPaused) {
	  var state = stream._readableState;

	  if (state.flowing) {
	    // https://github.com/isaacs/readable-stream/issues/16
	    throw new Error('Cannot switch to old mode now.');
	  }

	  var paused = startPaused || false;
	  var readable = false;

	  // convert to an old-style stream.
	  stream.readable = true;
	  stream.pipe = Stream.prototype.pipe;
	  stream.on = stream.addListener = Stream.prototype.on;

	  stream.on('readable', function() {
	    readable = true;

	    var c;
	    while (!paused && (null !== (c = stream.read())))
	      stream.emit('data', c);

	    if (c === null) {
	      readable = false;
	      stream._readableState.needReadable = true;
	    }
	  });

	  stream.pause = function() {
	    paused = true;
	    this.emit('pause');
	  };

	  stream.resume = function() {
	    paused = false;
	    if (readable)
	      process.nextTick(function() {
	        stream.emit('readable');
	      });
	    else
	      this.read(0);
	    this.emit('resume');
	  };

	  // now make it start, just in case it hadn't already.
	  stream.emit('readable');
	}

	// wrap an old-style stream as the async data source.
	// This is *not* part of the readable stream interface.
	// It is an ugly unfortunate mess of history.
	Readable.prototype.wrap = function(stream) {
	  var state = this._readableState;
	  var paused = false;

	  var self = this;
	  stream.on('end', function() {
	    if (state.decoder && !state.ended) {
	      var chunk = state.decoder.end();
	      if (chunk && chunk.length)
	        self.push(chunk);
	    }

	    self.push(null);
	  });

	  stream.on('data', function(chunk) {
	    if (state.decoder)
	      chunk = state.decoder.write(chunk);

	    // don't skip over falsy values in objectMode
	    //if (state.objectMode && util.isNullOrUndefined(chunk))
	    if (state.objectMode && (chunk === null || chunk === undefined))
	      return;
	    else if (!state.objectMode && (!chunk || !chunk.length))
	      return;

	    var ret = self.push(chunk);
	    if (!ret) {
	      paused = true;
	      stream.pause();
	    }
	  });

	  // proxy all the other methods.
	  // important when wrapping filters and duplexes.
	  for (var i in stream) {
	    if (typeof stream[i] === 'function' &&
	        typeof this[i] === 'undefined') {
	      this[i] = function(method) { return function() {
	        return stream[method].apply(stream, arguments);
	      }}(i);
	    }
	  }

	  // proxy certain important events.
	  var events$$1 = ['error', 'close', 'destroy', 'pause', 'resume'];
	  forEach(events$$1, function(ev) {
	    stream.on(ev, self.emit.bind(self, ev));
	  });

	  // when we try to consume some more bytes, simply unpause the
	  // underlying stream.
	  self._read = function(n) {
	    if (paused) {
	      paused = false;
	      stream.resume();
	    }
	  };

	  return self;
	};



	// exposed for testing purposes only.
	Readable._fromList = fromList;

	// Pluck off n bytes from an array of buffers.
	// Length is the combined lengths of all the buffers in the list.
	function fromList(n, state) {
	  var list = state.buffer;
	  var length = state.length;
	  var stringMode = !!state.decoder;
	  var objectMode = !!state.objectMode;
	  var ret;

	  // nothing in the list, definitely empty.
	  if (list.length === 0)
	    return null;

	  if (length === 0)
	    ret = null;
	  else if (objectMode)
	    ret = list.shift();
	  else if (!n || n >= length) {
	    // read it all, truncate the array.
	    if (stringMode)
	      ret = list.join('');
	    else
	      ret = Buffer$2.concat(list, length);
	    list.length = 0;
	  } else {
	    // read just some of it.
	    if (n < list[0].length) {
	      // just take a part of the first list item.
	      // slice is the same for buffers and strings.
	      var buf = list[0];
	      ret = buf.slice(0, n);
	      list[0] = buf.slice(n);
	    } else if (n === list[0].length) {
	      // first list is a perfect match
	      ret = list.shift();
	    } else {
	      // complex case.
	      // we have enough to cover it, but it spans past the first buffer.
	      if (stringMode)
	        ret = '';
	      else
	        ret = new Buffer$2(n);

	      var c = 0;
	      for (var i = 0, l = list.length; i < l && c < n; i++) {
	        var buf = list[0];
	        var cpy = Math.min(n - c, buf.length);

	        if (stringMode)
	          ret += buf.slice(0, cpy);
	        else
	          buf.copy(ret, c, 0, cpy);

	        if (cpy < buf.length)
	          list[0] = buf.slice(cpy);
	        else
	          list.shift();

	        c += cpy;
	      }
	    }
	  }

	  return ret;
	}

	function endReadable(stream) {
	  var state = stream._readableState;

	  // If we get here before consuming all the bytes, then that is a
	  // bug in node.  Should never happen.
	  if (state.length > 0)
	    throw new Error('endReadable called on non-empty stream');

	  if (!state.endEmitted && state.calledRead) {
	    state.ended = true;
	    process.nextTick(function() {
	      // Check that we didn't get one last unshift.
	      if (!state.endEmitted && state.length === 0) {
	        state.endEmitted = true;
	        stream.readable = false;
	        stream.emit('end');
	      }
	    });
	  }
	}

	function forEach (xs, f) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    f(xs[i], i);
	  }
	}

	function indexOf (xs, x) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    if (xs[i] === x) return i;
	  }
	  return -1;
	}

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// a duplex stream is just a stream that is both readable and writable.
	// Since JS doesn't have multiple prototypal inheritance, this class
	// prototypally inherits from Readable, and then parasitically from
	// Writable.

	var _stream_duplex = Duplex;

	/*<replacement>*/
	var objectKeys = Object.keys || function (obj) {
	  var keys = [];
	  for (var key in obj) keys.push(key);
	  return keys;
	};
	/*</replacement>*/


	/*<replacement>*/

	util$1.inherits = inherits;
	/*</replacement>*/




	util$1.inherits(Duplex, _stream_readable);

	forEach$1(objectKeys(_stream_writable.prototype), function(method) {
	  if (!Duplex.prototype[method])
	    Duplex.prototype[method] = _stream_writable.prototype[method];
	});

	function Duplex(options) {
	  if (!(this instanceof Duplex))
	    return new Duplex(options);

	  _stream_readable.call(this, options);
	  _stream_writable.call(this, options);

	  if (options && options.readable === false)
	    this.readable = false;

	  if (options && options.writable === false)
	    this.writable = false;

	  this.allowHalfOpen = true;
	  if (options && options.allowHalfOpen === false)
	    this.allowHalfOpen = false;

	  this.once('end', onend);
	}

	// the no-half-open enforcer
	function onend() {
	  // if we allow half-open state, or if the writable side ended,
	  // then we're ok.
	  if (this.allowHalfOpen || this._writableState.ended)
	    return;

	  // no more data can be written.
	  // But allow more writes to happen in this tick.
	  process.nextTick(this.end.bind(this));
	}

	function forEach$1 (xs, f) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    f(xs[i], i);
	  }
	}

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// A bit simpler than readable streams.
	// Implement an async ._write(chunk, cb), and it'll handle all
	// the drain event emission and buffering.

	var _stream_writable = Writable;

	/*<replacement>*/
	var Buffer$3 = buffer.Buffer;
	/*</replacement>*/

	Writable.WritableState = WritableState;


	/*<replacement>*/

	util$1.inherits = inherits;
	/*</replacement>*/



	util$1.inherits(Writable, Stream);

	function WriteReq(chunk, encoding, cb) {
	  this.chunk = chunk;
	  this.encoding = encoding;
	  this.callback = cb;
	}

	function WritableState(options, stream) {
	  options = options || {};

	  // the point at which write() starts returning false
	  // Note: 0 is a valid value, means that we always return false if
	  // the entire buffer is not flushed immediately on write()
	  var hwm = options.highWaterMark;
	  this.highWaterMark = (hwm || hwm === 0) ? hwm : 16 * 1024;

	  // object stream flag to indicate whether or not this stream
	  // contains buffers or objects.
	  this.objectMode = !!options.objectMode;

	  // cast to ints.
	  this.highWaterMark = ~~this.highWaterMark;

	  this.needDrain = false;
	  // at the start of calling end()
	  this.ending = false;
	  // when end() has been called, and returned
	  this.ended = false;
	  // when 'finish' is emitted
	  this.finished = false;

	  // should we decode strings into buffers before passing to _write?
	  // this is here so that some node-core streams can optimize string
	  // handling at a lower level.
	  var noDecode = options.decodeStrings === false;
	  this.decodeStrings = !noDecode;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = options.defaultEncoding || 'utf8';

	  // not an actual buffer we keep track of, but a measurement
	  // of how much we're waiting to get pushed to some underlying
	  // socket or file.
	  this.length = 0;

	  // a flag to see when we're in the middle of a write.
	  this.writing = false;

	  // a flag to be able to tell if the onwrite cb is called immediately,
	  // or on a later tick.  We set this to true at first, becuase any
	  // actions that shouldn't happen until "later" should generally also
	  // not happen before the first write call.
	  this.sync = true;

	  // a flag to know if we're processing previously buffered items, which
	  // may call the _write() callback in the same tick, so that we don't
	  // end up in an overlapped onwrite situation.
	  this.bufferProcessing = false;

	  // the callback that's passed to _write(chunk,cb)
	  this.onwrite = function(er) {
	    onwrite(stream, er);
	  };

	  // the callback that the user supplies to write(chunk,encoding,cb)
	  this.writecb = null;

	  // the amount that is being written when _write is called.
	  this.writelen = 0;

	  this.buffer = [];

	  // True if the error was already emitted and should not be thrown again
	  this.errorEmitted = false;
	}

	function Writable(options) {
	  var Duplex = _stream_duplex;

	  // Writable ctor is applied to Duplexes, though they're not
	  // instanceof Writable, they're instanceof Readable.
	  if (!(this instanceof Writable) && !(this instanceof Duplex))
	    return new Writable(options);

	  this._writableState = new WritableState(options, this);

	  // legacy.
	  this.writable = true;

	  Stream.call(this);
	}

	// Otherwise people can pipe Writable streams, which is just wrong.
	Writable.prototype.pipe = function() {
	  this.emit('error', new Error('Cannot pipe. Not readable.'));
	};


	function writeAfterEnd(stream, state, cb) {
	  var er = new Error('write after end');
	  // TODO: defer error events consistently everywhere, not just the cb
	  stream.emit('error', er);
	  process.nextTick(function() {
	    cb(er);
	  });
	}

	// If we get something that is not a buffer, string, null, or undefined,
	// and we're not in objectMode, then that's an error.
	// Otherwise stream chunks are all considered to be of length=1, and the
	// watermarks determine how many objects to keep in the buffer, rather than
	// how many bytes or characters.
	function validChunk(stream, state, chunk, cb) {
	  var valid = true;
	  if (!Buffer$3.isBuffer(chunk) &&
	      'string' !== typeof chunk &&
	      chunk !== null &&
	      chunk !== undefined &&
	      !state.objectMode) {
	    var er = new TypeError('Invalid non-string/buffer chunk');
	    stream.emit('error', er);
	    process.nextTick(function() {
	      cb(er);
	    });
	    valid = false;
	  }
	  return valid;
	}

	Writable.prototype.write = function(chunk, encoding, cb) {
	  var state = this._writableState;
	  var ret = false;

	  if (typeof encoding === 'function') {
	    cb = encoding;
	    encoding = null;
	  }

	  if (Buffer$3.isBuffer(chunk))
	    encoding = 'buffer';
	  else if (!encoding)
	    encoding = state.defaultEncoding;

	  if (typeof cb !== 'function')
	    cb = function() {};

	  if (state.ended)
	    writeAfterEnd(this, state, cb);
	  else if (validChunk(this, state, chunk, cb))
	    ret = writeOrBuffer(this, state, chunk, encoding, cb);

	  return ret;
	};

	function decodeChunk(state, chunk, encoding) {
	  if (!state.objectMode &&
	      state.decodeStrings !== false &&
	      typeof chunk === 'string') {
	    chunk = new Buffer$3(chunk, encoding);
	  }
	  return chunk;
	}

	// if we're already writing something, then just put this
	// in the queue, and wait our turn.  Otherwise, call _write
	// If we return false, then we need a drain event, so set that flag.
	function writeOrBuffer(stream, state, chunk, encoding, cb) {
	  chunk = decodeChunk(state, chunk, encoding);
	  if (Buffer$3.isBuffer(chunk))
	    encoding = 'buffer';
	  var len = state.objectMode ? 1 : chunk.length;

	  state.length += len;

	  var ret = state.length < state.highWaterMark;
	  // we must ensure that previous needDrain will not be reset to false.
	  if (!ret)
	    state.needDrain = true;

	  if (state.writing)
	    state.buffer.push(new WriteReq(chunk, encoding, cb));
	  else
	    doWrite(stream, state, len, chunk, encoding, cb);

	  return ret;
	}

	function doWrite(stream, state, len, chunk, encoding, cb) {
	  state.writelen = len;
	  state.writecb = cb;
	  state.writing = true;
	  state.sync = true;
	  stream._write(chunk, encoding, state.onwrite);
	  state.sync = false;
	}

	function onwriteError(stream, state, sync, er, cb) {
	  if (sync)
	    process.nextTick(function() {
	      cb(er);
	    });
	  else
	    cb(er);

	  stream._writableState.errorEmitted = true;
	  stream.emit('error', er);
	}

	function onwriteStateUpdate(state) {
	  state.writing = false;
	  state.writecb = null;
	  state.length -= state.writelen;
	  state.writelen = 0;
	}

	function onwrite(stream, er) {
	  var state = stream._writableState;
	  var sync = state.sync;
	  var cb = state.writecb;

	  onwriteStateUpdate(state);

	  if (er)
	    onwriteError(stream, state, sync, er, cb);
	  else {
	    // Check if we're actually ready to finish, but don't emit yet
	    var finished = needFinish(stream, state);

	    if (!finished && !state.bufferProcessing && state.buffer.length)
	      clearBuffer(stream, state);

	    if (sync) {
	      process.nextTick(function() {
	        afterWrite(stream, state, finished, cb);
	      });
	    } else {
	      afterWrite(stream, state, finished, cb);
	    }
	  }
	}

	function afterWrite(stream, state, finished, cb) {
	  if (!finished)
	    onwriteDrain(stream, state);
	  cb();
	  if (finished)
	    finishMaybe(stream, state);
	}

	// Must force callback to be called on nextTick, so that we don't
	// emit 'drain' before the write() consumer gets the 'false' return
	// value, and has a chance to attach a 'drain' listener.
	function onwriteDrain(stream, state) {
	  if (state.length === 0 && state.needDrain) {
	    state.needDrain = false;
	    stream.emit('drain');
	  }
	}


	// if there's something in the buffer waiting, then process it
	function clearBuffer(stream, state) {
	  state.bufferProcessing = true;

	  for (var c = 0; c < state.buffer.length; c++) {
	    var entry = state.buffer[c];
	    var chunk = entry.chunk;
	    var encoding = entry.encoding;
	    var cb = entry.callback;
	    var len = state.objectMode ? 1 : chunk.length;

	    doWrite(stream, state, len, chunk, encoding, cb);

	    // if we didn't call the onwrite immediately, then
	    // it means that we need to wait until it does.
	    // also, that means that the chunk and cb are currently
	    // being processed, so move the buffer counter past them.
	    if (state.writing) {
	      c++;
	      break;
	    }
	  }

	  state.bufferProcessing = false;
	  if (c < state.buffer.length)
	    state.buffer = state.buffer.slice(c);
	  else
	    state.buffer.length = 0;
	}

	Writable.prototype._write = function(chunk, encoding, cb) {
	  cb(new Error('not implemented'));
	};

	Writable.prototype.end = function(chunk, encoding, cb) {
	  var state = this._writableState;

	  if (typeof chunk === 'function') {
	    cb = chunk;
	    chunk = null;
	    encoding = null;
	  } else if (typeof encoding === 'function') {
	    cb = encoding;
	    encoding = null;
	  }

	  if (typeof chunk !== 'undefined' && chunk !== null)
	    this.write(chunk, encoding);

	  // ignore unnecessary end() calls.
	  if (!state.ending && !state.finished)
	    endWritable(this, state, cb);
	};


	function needFinish(stream, state) {
	  return (state.ending &&
	          state.length === 0 &&
	          !state.finished &&
	          !state.writing);
	}

	function finishMaybe(stream, state) {
	  var need = needFinish(stream, state);
	  if (need) {
	    state.finished = true;
	    stream.emit('finish');
	  }
	  return need;
	}

	function endWritable(stream, state, cb) {
	  state.ending = true;
	  finishMaybe(stream, state);
	  if (cb) {
	    if (state.finished)
	      process.nextTick(cb);
	    else
	      stream.once('finish', cb);
	  }
	  state.ended = true;
	}

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.


	// a transform stream is a readable/writable stream where you do
	// something with the data.  Sometimes it's called a "filter",
	// but that's not a great name for it, since that implies a thing where
	// some bits pass through, and others are simply ignored.  (That would
	// be a valid example of a transform, of course.)
	//
	// While the output is causally related to the input, it's not a
	// necessarily symmetric or synchronous transformation.  For example,
	// a zlib stream might take multiple plain-text writes(), and then
	// emit a single compressed chunk some time in the future.
	//
	// Here's how this works:
	//
	// The Transform stream has all the aspects of the readable and writable
	// stream classes.  When you write(chunk), that calls _write(chunk,cb)
	// internally, and returns false if there's a lot of pending writes
	// buffered up.  When you call read(), that calls _read(n) until
	// there's enough pending readable data buffered up.
	//
	// In a transform stream, the written data is placed in a buffer.  When
	// _read(n) is called, it transforms the queued up data, calling the
	// buffered _write cb's as it consumes chunks.  If consuming a single
	// written chunk would result in multiple output chunks, then the first
	// outputted bit calls the readcb, and subsequent chunks just go into
	// the read buffer, and will cause it to emit 'readable' if necessary.
	//
	// This way, back-pressure is actually determined by the reading side,
	// since _read has to be called to start processing a new chunk.  However,
	// a pathological inflate type of transform can cause excessive buffering
	// here.  For example, imagine a stream where every byte of input is
	// interpreted as an integer from 0-255, and then results in that many
	// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
	// 1kb of data being output.  In this case, you could write a very small
	// amount of input, and end up with a very large amount of output.  In
	// such a pathological inflating mechanism, there'd be no way to tell
	// the system to stop doing the transform.  A single 4MB write could
	// cause the system to run out of memory.
	//
	// However, even in such a pathological case, only a single written chunk
	// would be consumed, and then the rest would wait (un-transformed) until
	// the results of the previous transformed chunk were consumed.

	var _stream_transform = Transform;



	/*<replacement>*/

	util$1.inherits = inherits;
	/*</replacement>*/

	util$1.inherits(Transform, _stream_duplex);


	function TransformState(options, stream) {
	  this.afterTransform = function(er, data) {
	    return afterTransform(stream, er, data);
	  };

	  this.needTransform = false;
	  this.transforming = false;
	  this.writecb = null;
	  this.writechunk = null;
	}

	function afterTransform(stream, er, data) {
	  var ts = stream._transformState;
	  ts.transforming = false;

	  var cb = ts.writecb;

	  if (!cb)
	    return stream.emit('error', new Error('no writecb in Transform class'));

	  ts.writechunk = null;
	  ts.writecb = null;

	  if (data !== null && data !== undefined)
	    stream.push(data);

	  if (cb)
	    cb(er);

	  var rs = stream._readableState;
	  rs.reading = false;
	  if (rs.needReadable || rs.length < rs.highWaterMark) {
	    stream._read(rs.highWaterMark);
	  }
	}


	function Transform(options) {
	  if (!(this instanceof Transform))
	    return new Transform(options);

	  _stream_duplex.call(this, options);

	  var ts = this._transformState = new TransformState(options, this);

	  // when the writable side finishes, then flush out anything remaining.
	  var stream = this;

	  // start out asking for a readable event once data is transformed.
	  this._readableState.needReadable = true;

	  // we have implemented the _read method, and done the other things
	  // that Readable wants before the first _read call, so unset the
	  // sync guard flag.
	  this._readableState.sync = false;

	  this.once('finish', function() {
	    if ('function' === typeof this._flush)
	      this._flush(function(er) {
	        done(stream, er);
	      });
	    else
	      done(stream);
	  });
	}

	Transform.prototype.push = function(chunk, encoding) {
	  this._transformState.needTransform = false;
	  return _stream_duplex.prototype.push.call(this, chunk, encoding);
	};

	// This is the part where you do stuff!
	// override this function in implementation classes.
	// 'chunk' is an input chunk.
	//
	// Call `push(newChunk)` to pass along transformed output
	// to the readable side.  You may call 'push' zero or more times.
	//
	// Call `cb(err)` when you are done with this chunk.  If you pass
	// an error, then that'll put the hurt on the whole operation.  If you
	// never call cb(), then you'll never get another chunk.
	Transform.prototype._transform = function(chunk, encoding, cb) {
	  throw new Error('not implemented');
	};

	Transform.prototype._write = function(chunk, encoding, cb) {
	  var ts = this._transformState;
	  ts.writecb = cb;
	  ts.writechunk = chunk;
	  ts.writeencoding = encoding;
	  if (!ts.transforming) {
	    var rs = this._readableState;
	    if (ts.needTransform ||
	        rs.needReadable ||
	        rs.length < rs.highWaterMark)
	      this._read(rs.highWaterMark);
	  }
	};

	// Doesn't matter what the args are here.
	// _transform does all the work.
	// That we got here means that the readable side wants more data.
	Transform.prototype._read = function(n) {
	  var ts = this._transformState;

	  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
	    ts.transforming = true;
	    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
	  } else {
	    // mark that we need a transform, so that any data that comes in
	    // will get processed, now that we've asked for it.
	    ts.needTransform = true;
	  }
	};


	function done(stream, er) {
	  if (er)
	    return stream.emit('error', er);

	  // if there's nothing in the write buffer, then that means
	  // that nothing more will ever be provided
	  var ws = stream._writableState;
	  var rs = stream._readableState;
	  var ts = stream._transformState;

	  if (ws.length)
	    throw new Error('calling transform done when ws.length != 0');

	  if (ts.transforming)
	    throw new Error('calling transform done when still transforming');

	  return stream.push(null);
	}

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// a passthrough stream.
	// basically just the most minimal sort of Transform stream.
	// Every written chunk gets output as-is.

	var _stream_passthrough = PassThrough;



	/*<replacement>*/

	util$1.inherits = inherits;
	/*</replacement>*/

	util$1.inherits(PassThrough, _stream_transform);

	function PassThrough(options) {
	  if (!(this instanceof PassThrough))
	    return new PassThrough(options);

	  _stream_transform.call(this, options);
	}

	PassThrough.prototype._transform = function(chunk, encoding, cb) {
	  cb(null, chunk);
	};

	var readable = createCommonjsModule(function (module, exports) {
	// hack to fix a circular dependency issue when used with browserify
	exports = module.exports = _stream_readable;
	exports.Stream = Stream;
	exports.Readable = exports;
	exports.Writable = _stream_writable;
	exports.Duplex = _stream_duplex;
	exports.Transform = _stream_transform;
	exports.PassThrough = _stream_passthrough;
	});
	var readable_1 = readable.Stream;
	var readable_2 = readable.Readable;
	var readable_3 = readable.Writable;
	var readable_4 = readable.Duplex;
	var readable_5 = readable.Transform;
	var readable_6 = readable.PassThrough;

	var encodings = createCommonjsModule(function (module, exports) {
	exports.utf8 = exports['utf-8'] = {
	  encode: function(data){
	    return isBinary(data)
	      ? data
	      : String(data);
	  },
	  decode: function(data){
	    return typeof data === 'string'
	      ? data
	      : String(data)
	  },
	  buffer: false,
	  type: 'utf8'
	};

	exports.json = {
	  encode: JSON.stringify,
	  decode: JSON.parse,
	  buffer: false,
	  type: 'json'
	};

	exports.binary = {
	  encode: function(data){
	    return isBinary(data)
	      ? data
	      : new Buffer(data);      
	  },
	  decode: identity,
	  buffer: true,
	  type: 'binary'
	};

	exports.none = {
	  encode: identity,
	  decode: identity,
	  buffer: false,
	  type: 'id'
	};

	exports.id = exports.none;

	var bufferEncodings = [
	  'hex',
	  'ascii',
	  'base64',
	  'ucs2',
	  'ucs-2',
	  'utf16le',
	  'utf-16le'
	];

	bufferEncodings.forEach(function(type){
	  exports[type] = {
	    encode: function(data){
	      return isBinary(data)
	        ? data
	        : new Buffer(data, type);
	    },
	    decode: function(buffer$$1){
	      return buffer$$1.toString(type);
	    },
	    buffer: true,
	    type: type
	  };
	});

	function identity(value){
	  return value;
	}

	function isBinary(data){
	  return data === undefined
	    || data === null
	    || Buffer.isBuffer(data);
	}
	});
	var encodings_1 = encodings.utf8;
	var encodings_2 = encodings.json;
	var encodings_3 = encodings.binary;
	var encodings_4 = encodings.none;
	var encodings_5 = encodings.id;

	var levelCodec = Codec;

	function Codec(opts){
	  this.opts = opts || {};
	  this.encodings = encodings;
	}

	Codec.prototype._encoding = function(encoding){
	  if (typeof encoding == 'string') encoding = encodings[encoding];
	  if (!encoding) encoding = encodings.id;
	  return encoding;
	};

	Codec.prototype._keyEncoding = function(opts, batchOpts){
	  return this._encoding(batchOpts && batchOpts.keyEncoding
	    || opts && opts.keyEncoding
	    || this.opts.keyEncoding);
	};

	Codec.prototype._valueEncoding = function(opts, batchOpts){
	  return this._encoding(
	    batchOpts && (batchOpts.valueEncoding || batchOpts.encoding)
	    || opts && (opts.valueEncoding || opts.encoding)
	    || (this.opts.valueEncoding || this.opts.encoding));
	};

	Codec.prototype.encodeKey = function(key, opts, batchOpts){
	  return this._keyEncoding(opts, batchOpts).encode(key);
	};

	Codec.prototype.encodeValue = function(value, opts, batchOpts){
	  return this._valueEncoding(opts, batchOpts).encode(value);
	};

	Codec.prototype.decodeKey = function(key, opts){
	  return this._keyEncoding(opts).decode(key);
	};

	Codec.prototype.decodeValue = function(value, opts){
	  return this._valueEncoding(opts).decode(value);
	};

	Codec.prototype.encodeBatch = function(ops, opts){
	  var self = this;

	  return ops.map(function(_op){
	    var op = {
	      type: _op.type,
	      key: self.encodeKey(_op.key, opts, _op)
	    };
	    if (self.keyAsBuffer(opts, _op)) op.keyEncoding = 'binary';
	    if (_op.prefix) op.prefix = _op.prefix;
	    if ('value' in _op) {
	      op.value = self.encodeValue(_op.value, opts, _op);
	      if (self.valueAsBuffer(opts, _op)) op.valueEncoding = 'binary';
	    }
	    return op;
	  });
	};

	var ltgtKeys = ['lt', 'gt', 'lte', 'gte', 'start', 'end'];

	Codec.prototype.encodeLtgt = function(ltgt){
	  var self = this;
	  var ret = {};
	  Object.keys(ltgt).forEach(function(key){
	    ret[key] = ltgtKeys.indexOf(key) > -1
	      ? self.encodeKey(ltgt[key], ltgt)
	      : ltgt[key];
	  });
	  return ret;
	};

	Codec.prototype.createStreamDecoder = function(opts){
	  var self = this;

	  if (opts.keys && opts.values) {
	    return function(key, value){
	      return {
	        key: self.decodeKey(key, opts),
	        value: self.decodeValue(value, opts)
	      };
	    };
	  } else if (opts.keys) {
	    return function(key) {
	      return self.decodeKey(key, opts);
	    }; 
	  } else if (opts.values) {
	    return function(_, value){
	      return self.decodeValue(value, opts);
	    }
	  } else {
	    return function(){};
	  }
	};

	Codec.prototype.keyAsBuffer = function(opts){
	  return this._keyEncoding(opts).buffer;
	};

	Codec.prototype.valueAsBuffer = function(opts){
	  return this._valueEncoding(opts).buffer;
	};

	/**
	 * @file Invokes function, returning an object of the results.
	 * @version 1.1.3
	 * @author Xotic750 <Xotic750@gmail.com>
	 * @copyright  Xotic750
	 * @license {@link <https://opensource.org/licenses/MIT> MIT}
	 * @module attempt-x
	 */

	var getArgs = function _getArgs(args) {
	  var length = args.length >>> 0;
	  var array = [];
	  var argLength = length - 1;
	  if (argLength < 1) {
	    return array;
	  }

	  array.length = argLength;
	  for (var index = 1; index < length; index += 1) {
	    array[index - 1] = args[index];
	  }

	  return array;
	};

	/**
	 * This method attempts to invoke the function, returning either the result or
	 * the caught error object. Any additional arguments are provided to the
	 * function when it's invoked.
	 *
	 * @param {Function} fn - The function to attempt.
	 * @param {...*} [args] - The arguments to invoke the function with.
	 * @returns {Object} Returns an object of the result.
	 * @example
	 * var attempt = require('attempt-x');
	 *
	 * function thrower() {
	 *   throw new Error('Threw');
	 * }
	 *
	 * attempt(thrower, 1, 2);
	 * // {
	 * //   threw: true,
	 * //   value: // Error('Threw') object
	 * // }
	 *
	 * function sumArgs(a, b) {
	 *   return a + b;
	 * }
	 *
	 * attempt(sumArgs, 1, 2);
	 * // {
	 * //   threw: false,
	 * //   value: 3
	 * // }
	 *
	 * var thisArg = [];
	 * function pusher(a, b) {
	 *   return this.push(a, b);
	 * }
	 *
	 * attempt.call(thisArg, pusher, 1, 2);
	 * // {
	 * //   threw: false,
	 * //   value: 2
	 * // }
	 * // thisArg => [1, 2];
	 */
	var attemptX = function attempt(fn) {
	  try {
	    return {
	      threw: false,
	      value: fn.apply(this, getArgs(arguments))
	    };
	  } catch (e) {
	    return {
	      threw: true,
	      value: e
	    };
	  }
	};

	/**
	 * @file Converts argument to a value of type Boolean.
	 * @version 1.0.3
	 * @author Xotic750 <Xotic750@gmail.com>
	 * @copyright  Xotic750
	 * @license {@link <https://opensource.org/licenses/MIT> MIT}
	 * @module to-boolean-x
	 */

	/**
	 * The abstract operation ToBoolean converts argument to a value of type Boolean.
	 *
	 * @param {*} value - The value to be converted.
	 * @returns {boolean} 'true' if value is truthy; otherwise 'false'.
	 * @example
	 * var toBoolean = require('to-boolean-x');
	 *
	 * toBoolean(null); // false
	 * toBoolean(''); // false
	 * toBoolean(1); // true
	 * toBoolean('0'); // true
	 */
	var toBooleanX = function toBoolean(value) {
	  return !!value;
	};

	/**
	 * This method tests if a given value is falsey.
	 *
	 * @param {*} value - The value to test.
	 * @returns {boolean} `true` if the value is falsey: otherwise `false`.
	 * @example
	 * var isFalsey = require('is-falsey-x');
	 *
	 * isFalsey(); // true
	 * isFalsey(0); // true
	 * isFalsey(''); // true
	 * isFalsey(false); // true
	 * isFalsey(null); // true
	 *
	 * isFalsey(true); // false
	 * isFalsey([]); // false
	 * isFalsey(1); // false
	 * isFalsey(function () {}); // false
	 */
	var isFalseyX = function isFalsey(value) {
	  return toBooleanX(value) === false;
	};

	/**
	 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modern modularize exports="npm" -o ./`
	 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */

	/**
	 * Checks if `value` is `null`.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is `null`, else `false`.
	 * @example
	 *
	 * _.isNull(null);
	 * // => true
	 *
	 * _.isNull(void 0);
	 * // => false
	 */
	function isNull$1(value) {
	  return value === null;
	}

	var lodash_isnull = isNull$1;

	/**
	*
	*	VALIDATE: undefined
	*
	*
	*	DESCRIPTION:
	*		- Validates if a value is undefined.
	*
	*
	*	NOTES:
	*		[1]
	*
	*
	*	TODO:
	*		[1]
	*
	*
	*	LICENSE:
	*		MIT
	*
	*	Copyright (c) 2014. Athan Reines.
	*
	*
	*	AUTHOR:
	*		Athan Reines. kgryte@gmail.com. 2014.
	*
	*/

	/**
	* FUNCTION: isUndefined( value )
	*	Validates if a value is undefined.
	*
	* @param {*} value - value to be validated
	* @returns {Boolean} boolean indicating whether value is undefined
	*/
	function isUndefined$1( value ) {
		return value === void 0;
	} // end FUNCTION isUndefined()


	// EXPORTS //

	var lib$2 = isUndefined$1;

	var toStr = {}.toString;

	/**
	 * The `toStringTag` method returns "[object type]", where type is the
	 * object type.
	 *
	 * @param {*} value - The object of which to get the object type string.
	 * @returns {string} The object type string.
	 * @example
	 * var toStringTag = require('to-string-tag-x');
	 *
	 * var o = new Object();
	 * toStringTag(o); // returns '[object Object]'
	 */
	var toStringTagX = function toStringTag(value) {
	  if (lodash_isnull(value)) {
	    return '[object Null]';
	  }

	  if (lib$2(value)) {
	    return '[object Undefined]';
	  }

	  return toStr.call(value);
	};

	/**
	 * @file Tests if ES6 Symbol is supported.
	 * @version 1.4.2
	 * @author Xotic750 <Xotic750@gmail.com>
	 * @copyright  Xotic750
	 * @license {@link <https://opensource.org/licenses/MIT> MIT}
	 * @module has-symbol-support-x
	 */

	/**
	 * Indicates if `Symbol`exists and creates the correct type.
	 * `true`, if it exists and creates the correct type, otherwise `false`.
	 *
	 * @type boolean
	 */
	var hasSymbolSupportX = typeof Symbol === 'function' && typeof Symbol('') === 'symbol';

	/**
	 * Indicates if `Symbol.toStringTag`exists and is the correct type.
	 * `true`, if it exists and is the correct type, otherwise `false`.
	 *
	 * @type boolean
	 */
	var hasToStringTagX = hasSymbolSupportX && typeof Symbol.toStringTag === 'symbol';

	/*!
	 * is-primitive <https://github.com/jonschlinkert/is-primitive>
	 *
	 * Copyright (c) 2014-2015, Jon Schlinkert.
	 * Licensed under the MIT License.
	 */

	// see http://jsperf.com/testing-value-is-primitive/7
	var isPrimitive$1 = function isPrimitive(value) {
	  return value == null || (typeof value !== 'function' && typeof value !== 'object');
	};

	/**
	 * Checks if `value` is `null` or `undefined`.
	 *
	 * @param {*} value - The value to check.
	 * @returns {boolean} Returns `true` if `value` is nullish, else `false`.
	 * @example
	 * var isNil = require('is-nil-x');
	 *
	 * isNil(null); // => true
	 * isNil(void 0); // => true
	 * isNil(NaN); // => false
	 */
	var isNilX = function isNil(value) {
	  return lodash_isnull(value) || lib$2(value);
	};

	/**
	 * The abstract operation RequireObjectCoercible throws an error if argument
	 * is a value that cannot be converted to an Object using ToObject.
	 *
	 * @param {*} value - The `value` to check.
	 * @throws {TypeError} If `value` is a `null` or `undefined`.
	 * @returns {string} The `value`.
	 * @example
	 * var RequireObjectCoercible = require('require-object-coercible-x');
	 *
	 * RequireObjectCoercible(); // TypeError
	 * RequireObjectCoercible(null); // TypeError
	 * RequireObjectCoercible('abc'); // 'abc'
	 * RequireObjectCoercible(true); // true
	 * RequireObjectCoercible(Symbol('foo')); // Symbol('foo')
	 */
	var requireObjectCoercibleX = function RequireObjectCoercible(value) {
	  if (isNilX(value)) {
	    throw new TypeError('Cannot call method on ' + value);
	  }

	  return value;
	};

	/**
	 * @file Constructors cached from literals.
	 * @version 1.0.2
	 * @author Xotic750 <Xotic750@gmail.com>
	 * @copyright  Xotic750
	 * @license {@link <https://opensource.org/licenses/MIT> MIT}
	 * @module cached-constructors-x
	 */

	/**
	 * Constructors cached from literals.
	 *
	 * @type Object
	 * @example
	 * var constructors = require('cached-constructors-x');
	 */
	var cachedConstructorsX = {
	  Array: [].constructor,
	  Boolean: true.constructor,
	  Function: function () {}.constructor,
	  Number: (0).constructor,
	  Object: {}.constructor,
	  RegExp: (/(?:)/).constructor,
	  String: ''.constructor
	};

	var isSymbol$1 = createCommonjsModule(function (module) {

	var toStr = Object.prototype.toString;
	var hasSymbols = typeof Symbol === 'function' && typeof Symbol() === 'symbol';

	if (hasSymbols) {
		var symToStr = Symbol.prototype.toString;
		var symStringRegex = /^Symbol\(.*\)$/;
		var isSymbolObject = function isSymbolObject(value) {
			if (typeof value.valueOf() !== 'symbol') { return false; }
			return symStringRegex.test(symToStr.call(value));
		};
		module.exports = function isSymbol(value) {
			if (typeof value === 'symbol') { return true; }
			if (toStr.call(value) !== '[object Symbol]') { return false; }
			try {
				return isSymbolObject(value);
			} catch (e) {
				return false;
			}
		};
	} else {
		module.exports = function isSymbol(value) {
			// this environment does not support Symbols.
			return false;
		};
	}
	});

	var castString = cachedConstructorsX.String;


	/**
	 * The abstract operation ToString converts argument to a value of type String.
	 *
	 * @param {*} value - The value to convert to a string.
	 * @throws {TypeError} If `value` is a Symbol.
	 * @returns {string} The converted value.
	 * @example
	 * var $toString = require('to-string-x');
	 *
	 * $toString(); // 'undefined'
	 * $toString(null); // 'null'
	 * $toString('abc'); // 'abc'
	 * $toString(true); // 'true'
	 * $toString(Symbol('foo')); // TypeError
	 * $toString(Symbol.iterator); // TypeError
	 * $toString(Object(Symbol.iterator)); // TypeError
	 * $toString(Object.create(null)); // TypeError
	 */
	var toStringX = function ToString(value) {
	  if (isSymbol$1(value)) {
	    throw new TypeError('Cannot convert a Symbol value to a string');
	  }

	  return castString(value);
	};

	/**
	 * This method requires an argument is corecible then converts using ToString.
	 *
	 * @param {*} value - The value to converted to a string.
	 * @throws {TypeError} If value is null or undefined.
	 * @returns {string} The value as a string.
	 * @example
	 * var requireCoercibleToString = require('require-coercible-to-string-x');
	 *
	 * requireCoercibleToString(); // TypeError
	 * requireCoercibleToString(null); // TypeError
	 * requireCoercibleToString(Symbol('')); // TypeError
	 * requireCoercibleToString(Object.create(null)); // TypeError
	 * requireCoercibleToString(1); // '1'
	 * requireCoercibleToString(true); // 'true'
	 */
	var requireCoercibleToStringX = function requireCoercibleToString(value) {
	  return toStringX(requireObjectCoercibleX(value));
	};

	/**
	 * @file List of ECMAScript white space characters.
	 * @version 3.0.1
	 * @author Xotic750 <Xotic750@gmail.com>
	 * @copyright  Xotic750
	 * @license {@link <https://opensource.org/licenses/MIT> MIT}
	 * @module white-space-x
	 */

	/**
	 * A record of a white space character.
	 *
	 * @typedef {Object} CharRecord
	 * @property {number} code - The character code.
	 * @property {string} description - A description of the character.
	 * @property {boolean} es5 - Whether the spec lists this as a white space.
	 * @property {boolean} es2015 - Whether the spec lists this as a white space.
	 * @property {boolean} es2016 - Whether the spec lists this as a white space.
	 * @property {boolean} es2017 - Whether the spec lists this as a white space.
	 * @property {boolean} es2018 - Whether the spec lists this as a white space.
	 * @property {string} string - The character string.
	 */

	/**
	 * An array of the whitespace char codes, string, descriptions and language
	 * presence in the specifications.
	 *
	 * @private
	 * @type Array.<CharRecord>
	 */
	var list = [
	  {
	    code: 0x0009,
	    description: 'Tab',
	    es5: true,
	    es2015: true,
	    es2016: true,
	    es2017: true,
	    es2018: true,
	    string: '\u0009'
	  },
	  {
	    code: 0x000a,
	    description: 'Line Feed',
	    es5: true,
	    es2015: true,
	    es2016: true,
	    es2017: true,
	    es2018: true,
	    string: '\u000a'
	  },
	  {
	    code: 0x000b,
	    description: 'Vertical Tab',
	    es5: true,
	    es2015: true,
	    es2016: true,
	    es2017: true,
	    es2018: true,
	    string: '\u000b'
	  },
	  {
	    code: 0x000c,
	    description: 'Form Feed',
	    es5: true,
	    es2015: true,
	    es2016: true,
	    es2017: true,
	    es2018: true,
	    string: '\u000c'
	  },
	  {
	    code: 0x000d,
	    description: 'Carriage Return',
	    es5: true,
	    es2015: true,
	    es2016: true,
	    es2017: true,
	    es2018: true,
	    string: '\u000d'
	  },
	  {
	    code: 0x0020,
	    description: 'Space',
	    es5: true,
	    es2015: true,
	    es2016: true,
	    es2017: true,
	    es2018: true,
	    string: '\u0020'
	  },
	  /*
	  {
	    code: 0x0085,
	    description: 'Next line',
	    es5: false,
	    es2015: false,
	    es2016: false,
	    es2017: false,
	    es2018: false,
	    string: '\u0085'
	  }
	  */
	  {
	    code: 0x00a0,
	    description: 'No-break space',
	    es5: true,
	    es2015: true,
	    es2016: true,
	    es2017: true,
	    es2018: true,
	    string: '\u00a0'
	  },
	  {
	    code: 0x1680,
	    description: 'Ogham space mark',
	    es5: true,
	    es2015: true,
	    es2016: true,
	    es2017: true,
	    es2018: true,
	    string: '\u1680'
	  },
	  {
	    code: 0x180e,
	    description: 'Mongolian vowel separator',
	    es5: true,
	    es2015: true,
	    es2016: true,
	    es2017: false,
	    es2018: false,
	    string: '\u180e'
	  },
	  {
	    code: 0x2000,
	    description: 'En quad',
	    es5: true,
	    es2015: true,
	    es2016: true,
	    es2017: true,
	    es2018: true,
	    string: '\u2000'
	  },
	  {
	    code: 0x2001,
	    description: 'Em quad',
	    es5: true,
	    es2015: true,
	    es2016: true,
	    es2017: true,
	    es2018: true,
	    string: '\u2001'
	  },
	  {
	    code: 0x2002,
	    description: 'En space',
	    es5: true,
	    es2015: true,
	    es2016: true,
	    es2017: true,
	    es2018: true,
	    string: '\u2002'
	  },
	  {
	    code: 0x2003,
	    description: 'Em space',
	    es5: true,
	    es2015: true,
	    es2016: true,
	    es2017: true,
	    es2018: true,
	    string: '\u2003'
	  },
	  {
	    code: 0x2004,
	    description: 'Three-per-em space',
	    es5: true,
	    es2015: true,
	    es2016: true,
	    es2017: true,
	    es2018: true,
	    string: '\u2004'
	  },
	  {
	    code: 0x2005,
	    description: 'Four-per-em space',
	    es5: true,
	    es2015: true,
	    es2016: true,
	    es2017: true,
	    es2018: true,
	    string: '\u2005'
	  },
	  {
	    code: 0x2006,
	    description: 'Six-per-em space',
	    es5: true,
	    es2015: true,
	    es2016: true,
	    es2017: true,
	    es2018: true,
	    string: '\u2006'
	  },
	  {
	    code: 0x2007,
	    description: 'Figure space',
	    es5: true,
	    es2015: true,
	    es2016: true,
	    es2017: true,
	    es2018: true,
	    string: '\u2007'
	  },
	  {
	    code: 0x2008,
	    description: 'Punctuation space',
	    es5: true,
	    es2015: true,
	    es2016: true,
	    es2017: true,
	    es2018: true,
	    string: '\u2008'
	  },
	  {
	    code: 0x2009,
	    description: 'Thin space',
	    es5: true,
	    es2015: true,
	    es2016: true,
	    es2017: true,
	    es2018: true,
	    string: '\u2009'
	  },
	  {
	    code: 0x200a,
	    description: 'Hair space',
	    es5: true,
	    es2015: true,
	    es2016: true,
	    es2017: true,
	    es2018: true,
	    string: '\u200a'
	  },
	  /*
	  {
	    code: 0x200b,
	    description: 'Zero width space',
	    es5: false,
	    es2015: false,
	    es2016: false,
	    es2017: false,
	    es2018: false,
	    string: '\u200b'
	  },
	  */
	  {
	    code: 0x2028,
	    description: 'Line separator',
	    es5: true,
	    es2015: true,
	    es2016: true,
	    es2017: true,
	    es2018: true,
	    string: '\u2028'
	  },
	  {
	    code: 0x2029,
	    description: 'Paragraph separator',
	    es5: true,
	    es2015: true,
	    es2016: true,
	    es2017: true,
	    es2018: true,
	    string: '\u2029'
	  },
	  {
	    code: 0x202f,
	    description: 'Narrow no-break space',
	    es5: true,
	    es2015: true,
	    es2016: true,
	    es2017: true,
	    es2018: true,
	    string: '\u202f'
	  },
	  {
	    code: 0x205f,
	    description: 'Medium mathematical space',
	    es5: true,
	    es2015: true,
	    es2016: true,
	    es2017: true,
	    es2018: true,
	    string: '\u205f'
	  },
	  {
	    code: 0x3000,
	    description: 'Ideographic space',
	    es5: true,
	    es2015: true,
	    es2016: true,
	    es2017: true,
	    es2018: true,
	    string: '\u3000'
	  },
	  {
	    code: 0xfeff,
	    description: 'Byte Order Mark',
	    es5: true,
	    es2015: true,
	    es2016: true,
	    es2017: true,
	    es2018: true,
	    string: '\ufeff'
	  }
	];

	var stringES2016 = '';
	var stringES2018 = '';
	var length = list.length;
	for (var i$1 = 0; i$1 < length; i$1 += 1) {
	  if (list[i$1].es2016) {
	    stringES2016 += list[i$1].string;
	  }

	  if (list[i$1].es2018) {
	    stringES2018 += list[i$1].string;
	  }
	}

	var whiteSpaceX = {
	  /**
	   * An array of the whitespace char codes, string, descriptions and language
	   * presence in the specifications.
	   *
	   * @type Array.<CharRecord>
	   * @example
	   * var whiteSpace = require('white-space-x');
	   * whiteSpaces.list.foreach(function (item) {
	   *   console.log(lib.description, item.code, item.string);
	   * });
	   */
	  list: list,
	  /**
	   * A string of the ES2017 to ES2018 whitespace characters.
	   *
	   * @type string
	   */
	  string: stringES2018,

	  /**
	   * A string of the ES5 to ES2016 whitespace characters.
	   *
	   * @type string
	   */
	  string5: stringES2016,

	  /**
	   * A string of the ES5 to ES2016 whitespace characters.
	   *
	   * @type string
	   */
	  string2015: stringES2016,

	  /**
	   * A string of the ES5 to ES2016 whitespace characters.
	   *
	   * @type string
	   * @example
	   * var whiteSpace = require('white-space-x');
	   * var characters = [
	   *   '\u0009',
	   *   '\u000a',
	   *   '\u000b',
	   *   '\u000c',
	   *   '\u000d',
	   *   '\u0020',
	   *   '\u00a0',
	   *   '\u1680',
	   *   '\u180e',
	   *   '\u2000',
	   *   '\u2001',
	   *   '\u2002',
	   *   '\u2003',
	   *   '\u2004',
	   *   '\u2005',
	   *   '\u2006',
	   *   '\u2007',
	   *   '\u2008',
	   *   '\u2009',
	   *   '\u200a',
	   *   '\u2028',
	   *   '\u2029',
	   *   '\u202f',
	   *   '\u205f',
	   *   '\u3000',
	   *   '\ufeff'
	   * ];
	   * var ws = characters.join('');
	   * var re1 = new RegExp('^[' + whiteSpace.string2016 + ']+$)');
	   * re1.test(ws); // true
	   */
	  string2016: stringES2016,

	  /**
	   * A string of the ES2017 to ES2018 whitespace characters.
	   *
	   * @type string
	   */
	  string2017: stringES2018,

	  /**
	   * A string of the ES2017 to ES2018 whitespace characters.
	   *
	   * @type string
	   * @example
	   * var whiteSpace = require('white-space-x');
	   * var characters = [
	   *   '\u0009',
	   *   '\u000a',
	   *   '\u000b',
	   *   '\u000c',
	   *   '\u000d',
	   *   '\u0020',
	   *   '\u00a0',
	   *   '\u1680',
	   *   '\u2000',
	   *   '\u2001',
	   *   '\u2002',
	   *   '\u2003',
	   *   '\u2004',
	   *   '\u2005',
	   *   '\u2006',
	   *   '\u2007',
	   *   '\u2008',
	   *   '\u2009',
	   *   '\u200a',
	   *   '\u2028',
	   *   '\u2029',
	   *   '\u202f',
	   *   '\u205f',
	   *   '\u3000',
	   *   '\ufeff'
	   * ];
	   * var ws = characters.join('');
	   * var re1 = new RegExp('^[' + whiteSpace.string2018 + ']+$)');
	   * re1.test(ws); // true
	   */
	  string2018: stringES2018
	};

	var Rx = cachedConstructorsX.RegExp;
	var reLeft2016 = new Rx('^[' + whiteSpaceX.string2016 + ']+');
	var reLeft2018 = new Rx('^[' + whiteSpaceX.string2018 + ']+');
	var replace = ''.replace;

	var $trimLeft2016 = function trimLeft2016(string) {
	  return replace.call(requireCoercibleToStringX(string), reLeft2016, '');
	};

	var $trimLeft2018 = function trimLeft2018(string) {
	  return replace.call(requireCoercibleToStringX(string), reLeft2018, '');
	};

	var trimLeftX = {
	  /**
	   * A reference to leftTrim2018.
	   */
	  trimLeft: $trimLeft2018,

	  /**
	   * This method removes whitespace from the left end of a string. (ES2016)
	   *
	   * @param {string} string - The string to trim the left end whitespace from.
	   * @throws {TypeError} If string is null or undefined or not coercible.
	   * @returns {string} The left trimmed string.
	   * @example
	   * var trimLeft = require('trim-left-x').trimLeft2016;
	   *
	   * trimLeft(' \t\na \t\n') === 'a \t\n'; // true
	   */
	  trimLeft2016: $trimLeft2016,

	  /**
	   * This method removes whitespace from the left end of a string. (ES2018)
	   *
	   * @param {string} string - The string to trim the left end whitespace from.
	   * @throws {TypeError} If string is null or undefined or not coercible.
	   * @returns {string} The left trimmed string.
	   * @example
	   * var trimLeft = require('trim-left-x').trimLeft2018;
	   *
	   * trimLeft(' \t\na \t\n') === 'a \t\n'; // true
	   */
	  trimLeft2018: $trimLeft2018
	};

	var Rx$1 = cachedConstructorsX.RegExp;
	var reRight2016 = new Rx$1('[' + whiteSpaceX.string2016 + ']+$');
	var reRight2018 = new Rx$1('[' + whiteSpaceX.string2018 + ']+$');
	var replace$1 = ''.replace;

	var $trimRight2016 = function trimRight2016(string) {
	  return replace$1.call(requireCoercibleToStringX(string), reRight2016, '');
	};

	var $trimRight2018 = function trimRight2018(string) {
	  return replace$1.call(requireCoercibleToStringX(string), reRight2018, '');
	};

	var trimRightX = {
	  /**
	   * A reference to trimRight2018.
	   */
	  trimRight: $trimRight2018,

	  /**
	   * This method removes whitespace from the right end of a string. (ES2016)
	   *
	   * @param {string} string - The string to trim the right end whitespace from.
	   * @throws {TypeError} If string is null or undefined or not coercible.
	   * @returns {string} The right trimmed string.
	   * @example
	   * var trimRight = require('trim-right-x');
	   *
	   * trimRight(' \t\na \t\n') === ' \t\na'; // true
	   */
	  trimRight2016: $trimRight2016,

	  /**
	   * This method removes whitespace from the right end of a string. (ES2018)
	   *
	   * @param {string} string - The string to trim the right end whitespace from.
	   * @throws {TypeError} If string is null or undefined or not coercible.
	   * @returns {string} The right trimmed string.
	   * @example
	   * var trimRight = require('trim-right-x');
	   *
	   * trimRight(' \t\na \t\n') === ' \t\na'; // true
	   */
	  trimRight2018: $trimRight2018
	};

	var trimLeft2016 = trimLeftX.trimLeft2016;
	var trimLeft2018 = trimLeftX.trimLeft2018;

	var trimRight2016 = trimRightX.trimRight2016;
	var trimRight2018 = trimRightX.trimRight2016;

	var $trim2016 = function trim2016(string) {
	  return trimLeft2016(trimRight2016(string));
	};

	var $trim2018 = function trim2018(string) {
	  return trimLeft2018(trimRight2018(string));
	};

	var trimX = {
	  /**
	   * A reference to trim2018.
	   */
	  trim: $trim2018,

	  /**
	   * This method removes whitespace from the left and right end of a string.
	   * (ES2016)
	   * @param {string} string - The string to trim the whitespace from.
	   * @throws {TypeError} If string is null or undefined or not coercible.
	   * @returns {string} The trimmed string.
	   * @example
	   * var trim = require('trim-x');
	   *
	   * trim(' \t\na \t\n') === 'a'; // true
	   */
	  trim2016: $trim2016,

	  /**
	   * This method removes whitespace from the left and right end of a string.
	   * (ES2018)
	   *
	   * @param {string} string - The string to trim the whitespace from.
	   * @throws {TypeError} If string is null or undefined or not coercible.
	   * @returns {string} The trimmed string.
	   * @example
	   * var trim = require('trim-x');
	   *
	   * trim(' \t\na \t\n') === 'a'; // true
	   */
	  trim2018: $trim2018
	};

	var trim2016 = trimX.trim2016;
	var trim2018 = trimX.trim2018;
	var Rx$2 = cachedConstructorsX.RegExp;

	var reNormalize2016 = new Rx$2('[' + whiteSpaceX.string2016 + ']+', 'g');
	var reNormalize2018 = new Rx$2('[' + whiteSpaceX.string2018 + ']+', 'g');
	var replace$2 = ''.replace;

	var $normalizeSpace2016 = function normalizeSpace2016(string) {
	  return replace$2.call(trim2016(string), reNormalize2016, ' ');
	};

	var $normalizeSpace2018 = function normalizeSpace2018(string) {
	  return replace$2.call(trim2018(string), reNormalize2018, ' ');
	};

	var normalizeSpaceX = {
	  /**
	   * Reference to normalizeSpace2018.
	   */
	  normalizeSpace: $normalizeSpace2018,

	  /**
	   * This method strips leading and trailing white-space from a string,
	   * replaces sequences of whitespace characters by a single space,
	   * and returns the resulting string. (ES2016)
	   *
	   * @param {string} string - The string to be normalized.
	   * @throws {TypeError} If string is null or undefined or not coercible.
	   * @returns {string} The normalized string.
	   * @example
	   * var normalizeSpace = require('normalize-space-x');
	   *
	   * normalizeSpace(' \t\na \t\nb \t\n') === 'a b'; // true
	   */
	  normalizeSpace2016: $normalizeSpace2016,

	  /**
	   * This method strips leading and trailing white-space from a string,
	   * replaces sequences of whitespace characters by a single space,
	   * and returns the resulting string. (ES2018)
	   *
	   * @param {string} string - The string to be normalized.
	   * @throws {TypeError} If string is null or undefined or not coercible.
	   * @returns {string} The normalized string.
	   * @example
	   * var normalizeSpace = require('normalize-space-x');
	   *
	   * normalizeSpace(' \t\na \t\nb \t\n') === 'a b'; // true
	   */
	  normalizeSpace2018: $normalizeSpace2018
	};

	var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
	var replace$3 = ''.replace;

	/**
	 * This method replaces comments in a string.
	 *
	 * @param {string} string - The string to be stripped.
	 * @param {string} [replacement] - The string to be used as a replacement.
	 * @throws {TypeError} If string is null or undefined or not coercible.
	 * @throws {TypeError} If replacement is not coercible.
	 * @returns {string} The new string with the comments replaced.
	 * @example
	 * var replaceComments = require('replace-comments-x');
	 *
	 * replaceComments(test;/* test * /, ''), // 'test;'
	 * replaceComments(test; // test, ''), // 'test;'
	 */
	var replaceCommentsX = function replaceComments(string) {
	  return replace$3.call(requireCoercibleToStringX(string), STRIP_COMMENTS, arguments.length > 1 ? toStringX(arguments[1]) : '');
	};

	var fToString = Function.prototype.toString;





	var normalise = normalizeSpaceX.normalizeSpace;

	var funcTag = '[object Function]';
	var genTag = '[object GeneratorFunction]';
	var asyncTag = '[object AsyncFunction]';
	var ctrRx = /^class /;
	var test = ctrRx.test;

	var hasNativeClass = attemptX(function () {
	  // eslint-disable-next-line no-new-func
	  return Function('"use strict"; return class My {};')();
	}).threw === false;

	var testClassstring = function _testClassstring(value) {
	  return test.call(ctrRx, normalise(replaceCommentsX(fToString.call(value), ' ')));
	};

	var isES6ClassFn = function isES6ClassFunc(value) {
	  var result = attemptX(testClassstring, value);

	  return result.threw === false && result.value;
	};

	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @private
	 * @param {*} value - The value to check.
	 * @param {boolean} allowClass - Whether to filter ES6 classes.
	 * @returns {boolean} Returns `true` if `value` is correctly classified,
	 * else `false`.
	 */
	var tryFuncToString = function funcToString(value, allowClass) {
	  if (hasNativeClass && allowClass === false && isES6ClassFn(value)) {
	    return false;
	  }

	  return attemptX.call(value, fToString).threw === false;
	};

	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @param {*} value - The value to check.
	 * @param {boolean} [allowClass=false] - Whether to filter ES6 classes.
	 * @returns {boolean} Returns `true` if `value` is correctly classified,
	 * else `false`.
	 * @example
	 * var isFunction = require('is-function-x');
	 *
	 * isFunction(); // false
	 * isFunction(Number.MIN_VALUE); // false
	 * isFunction('abc'); // false
	 * isFunction(true); // false
	 * isFunction({ name: 'abc' }); // false
	 * isFunction(function () {}); // true
	 * isFunction(new Function ()); // true
	 * isFunction(function* test1() {}); // true
	 * isFunction(function test2(a, b) {}); // true
	 * isFunction(async function test3() {}); // true
	 * isFunction(class Test {}); // false
	 * isFunction(class Test {}, true); // true
	 * isFunction((x, y) => {return this;}); // true
	 */
	var isFunctionX = function isFunction(value) {
	  if (isPrimitive$1(value)) {
	    return false;
	  }

	  if (hasToStringTagX) {
	    return tryFuncToString(value, toBooleanX(arguments[1]));
	  }

	  if (hasNativeClass && isFalseyX(arguments[1]) && isES6ClassFn(value)) {
	    return false;
	  }

	  var strTag = toStringTagX(value);
	  return strTag === funcTag || strTag === genTag || strTag === asyncTag;
	};

	/*!
	 * is-primitive <https://github.com/jonschlinkert/is-primitive>
	 *
	 * Copyright (c) 2014-2017, Jon Schlinkert.
	 * Released under the MIT License.
	 */

	var isPrimitive$2 = function isPrimitive(val) {
	  switch (typeof val) {
	    case 'boolean':
	    case 'number':
	    case 'string':
	    case 'symbol':
	    case 'undefined':
	      return true;
	    default: {
	      return val === null;
	    }
	  }
	};

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not a
	 * primitive and not a function.
	 *
	 * @param {*} value - The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 * var isObjectLike = require('is-object-like-x');
	 *
	 * isObjectLike({});
	 * // => true
	 *
	 * isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * isObjectLike(_.noop);
	 * // => false
	 *
	 * isObjectLike(null);
	 * // => false
	 */
	var isObjectLikeX = function isObjectLike(value) {
	  return isPrimitive$2(value) === false && isFunctionX(value, true) === false;
	};

	var castObject = cachedConstructorsX.Object;

	/**
	 * The abstract operation ToObject converts argument to a value of
	 * type Object.
	 *
	 * @param {*} value - The `value` to convert.
	 * @throws {TypeError} If `value` is a `null` or `undefined`.
	 * @returns {!Object} The `value` converted to an object.
	 * @example
	 * var ToObject = require('to-object-x');
	 *
	 * ToObject(); // TypeError
	 * ToObject(null); // TypeError
	 * ToObject('abc'); // Object('abc')
	 * ToObject(true); // Object(true)
	 * ToObject(Symbol('foo')); // Object(Symbol('foo'))
	 */
	var toObjectX = function toObject(value) {
	  return castObject(requireObjectCoercibleX(value));
	};

	var getDay = Date.prototype.getDay;
	var tryDateObject = function tryDateObject(value) {
		try {
			getDay.call(value);
			return true;
		} catch (e) {
			return false;
		}
	};

	var toStr$1 = Object.prototype.toString;
	var dateClass = '[object Date]';
	var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

	var isDateObject = function isDateObject(value) {
		if (typeof value !== 'object' || value === null) { return false; }
		return hasToStringTag ? tryDateObject(value) : toStr$1.call(value) === dateClass;
	};

	var symToPrimitive = hasSymbolSupportX && Symbol.toPrimitive;
	var symValueOf = hasSymbolSupportX && Symbol.prototype.valueOf;

	var toStringOrder = ['toString', 'valueOf'];
	var toNumberOrder = ['valueOf', 'toString'];
	var orderLength = 2;

	var ordinaryToPrimitive = function _ordinaryToPrimitive(O, hint) {
	  requireObjectCoercibleX(O);
	  if (typeof hint !== 'string' || (hint !== 'number' && hint !== 'string')) {
	    throw new TypeError('hint must be "string" or "number"');
	  }

	  var methodNames = hint === 'string' ? toStringOrder : toNumberOrder;
	  var method;
	  var result;
	  for (var i = 0; i < orderLength; i += 1) {
	    method = O[methodNames[i]];
	    if (isFunctionX(method)) {
	      result = method.call(O);
	      if (isPrimitive$1(result)) {
	        return result;
	      }
	    }
	  }

	  throw new TypeError('No default value');
	};

	var getMethod = function _getMethod(O, P) {
	  var func = O[P];
	  if (isNilX(func) === false) {
	    if (isFunctionX(func) === false) {
	      throw new TypeError(func + ' returned for property ' + P + ' of object ' + O + ' is not a function');
	    }

	    return func;
	  }

	  return void 0;
	};

	// http://www.ecma-international.org/ecma-262/6.0/#sec-toprimitive

	/**
	 * This method converts a JavaScript object to a primitive value.
	 * Note: When toPrimitive is called with no hint, then it generally behaves as
	 * if the hint were Number. However, objects may over-ride this behaviour by
	 * defining a @@toPrimitive method. Of the objects defined in this specification
	 * only Date objects (see 20.3.4.45) and Symbol objects (see 19.4.3.4) over-ride
	 * the default ToPrimitive behaviour. Date objects treat no hint as if the hint
	 * were String.
	 *
	 * @param {*} input - The input to convert.
	 * @param {constructor} [prefferedtype] - The preffered type (String or Number).
	 * @throws {TypeError} If unable to convert input to a primitive.
	 * @returns {string|number} The converted input as a primitive.
	 * @example
	 * var toPrimitive = require('to-primitive-x');
	 *
	 * var date = new Date(0);
	 * toPrimitive(date)); // Thu Jan 01 1970 01:00:00 GMT+0100 (CET)
	 * toPrimitive(date, String)); // Thu Jan 01 1970 01:00:00 GMT+0100 (CET)
	 * toPrimitive(date, Number)); // 0
	 */
	var toPrimitiveX = function toPrimitive(input, preferredType) {
	  if (isPrimitive$1(input)) {
	    return input;
	  }

	  var hint = 'default';
	  if (arguments.length > 1) {
	    if (preferredType === String) {
	      hint = 'string';
	    } else if (preferredType === Number) {
	      hint = 'number';
	    }
	  }

	  var exoticToPrim;
	  if (hasSymbolSupportX) {
	    if (symToPrimitive) {
	      exoticToPrim = getMethod(input, symToPrimitive);
	    } else if (isSymbol$1(input)) {
	      exoticToPrim = symValueOf;
	    }
	  }

	  if (lib$2(exoticToPrim) === false) {
	    var result = exoticToPrim.call(input, hint);
	    if (isPrimitive$1(result)) {
	      return result;
	    }

	    throw new TypeError('unable to convert exotic object to primitive');
	  }

	  if (hint === 'default' && (isDateObject(input) || isSymbol$1(input))) {
	    hint = 'string';
	  }

	  return ordinaryToPrimitive(input, hint === 'default' ? 'number' : hint);
	};

	/**
	 * This method Converts argument to a value that can be used as a property key.
	 *
	 * @param {*} argument - The argument to onvert to a property key.
	 * @throws {TypeError} If argument is not a symbol and is not coercible to a string.
	 * @returns {string|symbol} The converted argument.
	 * @example
	 * var toPropertyKey = require('to-property-key-x');
	 *
	 * toPropertyKey(); // 'undefined'
	 * toPropertyKey(1); // '1'
	 * toPropertyKey(true); // 'true'
	 *
	 * var symbol = Symbol('a');
	 * toPropertyKey(symbol); // symbol
	 *
	 * toPropertyKey(Object.create(null)); // TypeError
	 */
	var toPropertyKeyX = function toPropertyKey(argument) {
	  var key = toPrimitiveX(argument, String);
	  return hasSymbolSupportX && typeof key === 'symbol' ? key : toStringX(key);
	};

	var hop = cachedConstructorsX.Object.prototype.hasOwnProperty;

	/**
	 * The `hasOwnProperty` method returns a boolean indicating whether
	 * the `object` has the specified `property`. Does not attempt to fix known
	 * issues in older browsers, but does ES6ify the method.
	 *
	 * @param {!Object} object - The object to test.
	 * @throws {TypeError} If object is null or undefined.
	 * @param {string|Symbol} property - The name or Symbol of the property to test.
	 * @returns {boolean} `true` if the property is set on `object`, else `false`.
	 * @example
	 * var hasOwnProperty = require('has-own-property-x');
	 * var o = {
	 *   foo: 'bar'
	 * };
	 *
	 *
	 * hasOwnProperty(o, 'bar'); // false
	 * hasOwnProperty(o, 'foo'); // true
	 * hasOwnProperty(undefined, 'foo');
	 *                   // TypeError: Cannot convert undefined or null to object
	 */
	var hasOwnPropertyX = function hasOwnProperty(object, property) {
	  return hop.call(toObjectX(object), toPropertyKeyX(property));
	};

	var strValue = String.prototype.valueOf;
	var tryStringObject = function tryStringObject(value) {
		try {
			strValue.call(value);
			return true;
		} catch (e) {
			return false;
		}
	};
	var toStr$2 = Object.prototype.toString;
	var strClass = '[object String]';
	var hasToStringTag$1 = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

	var isString$1 = function isString(value) {
		if (typeof value === 'string') { return true; }
		if (typeof value !== 'object') { return false; }
		return hasToStringTag$1 ? tryStringObject(value) : toStr$2.call(value) === strClass;
	};

	var castString$1 = cachedConstructorsX.String;
	var pToString = hasSymbolSupportX && Symbol.prototype.toString;
	var isSymbol$2 = typeof pToString === 'function' && isSymbol$1;

	/**
	 * The abstract operation ToString converts argument to a value of type String,
	 * however the specification states that if the argument is a Symbol then a
	 * 'TypeError' is thrown. This version also allows Symbols be converted to
	 * a string. Other uncoercible exotics will still throw though.
	 *
	 * @param {*} value - The value to convert to a string.
	 * @returns {string} The converted value.
	 * @example
	 * var toStringSymbolsSupported = require('to-string-symbols-supported-x');
	 *
	 * toStringSymbolsSupported(); // 'undefined'
	 * toStringSymbolsSupported(null); // 'null'
	 * toStringSymbolsSupported('abc'); // 'abc'
	 * toStringSymbolsSupported(true); // 'true'
	 * toStringSymbolsSupported(Symbol('foo')); // 'Symbol('foo')'
	 * toStringSymbolsSupported(Object(Symbol('foo'))); // 'Symbol('foo')'
	 * toStringSymbolsSupported(Object.create(null)); // TypeError
	 */
	var toStringSymbolsSupportedX = function toStringSymbolsSupported(value) {
	  return isSymbol$2 && isSymbol$2(value) ? pToString.call(value) : castString$1(value);
	};

	/**
	 * @file The constant NaN derived mathematically by 0 / 0.
	 * @version 1.0.2
	 * @author Xotic750 <Xotic750@gmail.com>
	 * @copyright  Xotic750
	 * @license {@link <https://opensource.org/licenses/MIT> MIT}
	 * @module nan-x
	 */

	/**
	 * The constant NaN derived mathematically by 0 / 0.
	 *
	 * @type number
	 * @example
	 * var NAN = require('nan-x');
	 *
	 * NAN !== NAN; // true
	 * NAN === NAN; // false
	 */
	var nanX = 0 / 0;

	var nativeParseInt = parseInt;


	var trimLeft2016$1 = trimLeftX.trimLeft2016;
	var trimLeft2018$1 = trimLeftX.trimLeft2018;

	var castNumber = cachedConstructorsX.Number;
	var charAt = cachedConstructorsX.String.prototype.charAt;
	var hexRegex = /^[-+]?0[xX]/;
	var test$1 = hexRegex.test;

	var $parseInt2016 = function parseInt2016(string, radix) {
	  var str = trimLeft2016$1(toStringX(string));

	  return nativeParseInt(str, castNumber(radix) || (test$1.call(hexRegex, str) ? 16 : 10));
	};

	var $parseInt2018 = function parseInt2018(string, radix) {
	  var str = trimLeft2018$1(toStringX(string));
	  if (charAt.call(str, 0) === '\u180E') {
	    return nanX;
	  }

	  return nativeParseInt(str, castNumber(radix) || (test$1.call(hexRegex, str) ? 16 : 10));
	};

	var parseIntX = {
	  /**
	   * Reference to parseInt2018.
	   */
	  parseInt: $parseInt2018,

	  /**
	   * This method parses a string argument and returns an integer of the specified
	   * radix (the base in mathematical numeral systems). (ES2016)
	   *
	   * @param {string} string - The value to parse. If the string argument is not a
	   *  string, then it is converted to a string (using the ToString abstract
	   *  operation). Leading whitespace in the string argument is ignored.
	   * @param {number} radix - An integer between 2 and 36 that represents the radix
	   *  (the base in mathematical numeral systems) of the above mentioned string.
	   *  Specify 10 for the decimal numeral system commonly used by humans. Always
	   *  specify this parameter to eliminate reader confusion and to guarantee
	   *  predictable behavior. Different implementations produce different results
	   *  when a radix is not specified, usually defaulting the value to 10.
	   * @throws {TypeError} If target is a Symbol or is not coercible.
	   * @returns {number} An integer number parsed from the given string. If the first
	   *  character cannot be converted to a number, NaN is returned.
	   * @example
	   * var $parseInt = require('parse-int-x').parseInt2016;
	   *
	   * // The following examples all return 15
	   * $parseInt(' 0xF', 16);
	   * $parseInt(' F', 16);
	   * $parseInt('17', 8);
	   * $parseInt(021, 8);
	   * $parseInt('015', 10);   // $parseInt(015, 10); will return 15
	   * $parseInt(15.99, 10);
	   * $parseInt('15,123', 10);
	   * $parseInt('FXX123', 16);
	   * $parseInt('1111', 2);
	   * $parseInt('15 * 3', 10);
	   * $parseInt('15e2', 10);
	   * $parseInt('15px', 10);
	   * $parseInt('12', 13);
	   *
	   * //The following examples all return NaN:
	   * $parseInt('Hello', 8); // Not a number at all
	   * $parseInt('546', 2);   // Digits are not valid for binary representations
	   */
	  parseInt2016: $parseInt2016,

	  /**
	   * This method parses a string argument and returns an integer of the specified
	   * radix (the base in mathematical numeral systems). (ES2018)
	   *
	   * @param {string} string - The value to parse. If the string argument is not a
	   *  string, then it is converted to a string (using the ToString abstract
	   *  operation). Leading whitespace in the string argument is ignored.
	   * @param {number} radix - An integer between 2 and 36 that represents the radix
	   *  (the base in mathematical numeral systems) of the above mentioned string.
	   *  Specify 10 for the decimal numeral system commonly used by humans. Always
	   *  specify this parameter to eliminate reader confusion and to guarantee
	   *  predictable behavior. Different implementations produce different results
	   *  when a radix is not specified, usually defaulting the value to 10.
	   * @throws {TypeError} If target is a Symbol or is not coercible.
	   * @returns {number} An integer number parsed from the given string. If the first
	   *  character cannot be converted to a number, NaN is returned.
	   * @example
	   * var $parseInt = require('parse-int-x').parseInt2018;
	   *
	   * // The following examples all return 15
	   * $parseInt(' 0xF', 16);
	   * $parseInt(' F', 16);
	   * $parseInt('17', 8);
	   * $parseInt(021, 8);
	   * $parseInt('015', 10);   // $parseInt(015, 10); will return 15
	   * $parseInt(15.99, 10);
	   * $parseInt('15,123', 10);
	   * $parseInt('FXX123', 16);
	   * $parseInt('1111', 2);
	   * $parseInt('15 * 3', 10);
	   * $parseInt('15e2', 10);
	   * $parseInt('15px', 10);
	   * $parseInt('12', 13);
	   *
	   * //The following examples all return NaN:
	   * $parseInt('Hello', 8); // Not a number at all
	   * $parseInt('546', 2);   // Digits are not valid for binary representations
	   */
	  parseInt2018: $parseInt2018
	};

	var castNumber$1 = cachedConstructorsX.Number;
	var Rx$3 = cachedConstructorsX.RegExp;


	var trim2016$1 = trimX.trim2016;
	var trim2018$1 = trimX.trim2018;

	var $parseInt2016$1 = parseIntX.parseInt2016;
	var $parseInt2018$1 = parseIntX.parseInt2018;
	var pStrSlice = cachedConstructorsX.String.prototype.slice;


	var binaryRegex = /^0b[01]+$/i;
	// Note that in IE 8, RegExp.prototype.test doesn't seem to exist: ie, "test" is
	// an own property of regexes. wtf.
	var test$2 = binaryRegex.test;
	var isBinary = function _isBinary(value) {
	  return test$2.call(binaryRegex, value);
	};

	var octalRegex = /^0o[0-7]+$/i;
	var isOctal = function _isOctal(value) {
	  return test$2.call(octalRegex, value);
	};

	var nonWSregex2016 = new Rx$3('[\u0085\u200b\ufffe]', 'g');
	var hasNonWS2016 = function _hasNonWS(value) {
	  return test$2.call(nonWSregex2016, value);
	};

	var nonWSregex2018 = new Rx$3('[\u0085\u180e\u200b\ufffe]', 'g');
	var hasNonWS2018 = function _hasNonWS(value) {
	  return test$2.call(nonWSregex2018, value);
	};

	var invalidHexLiteral = /^[-+]0x[0-9a-f]+$/i;
	var isInvalidHexLiteral = function _isInvalidHexLiteral(value) {
	  return test$2.call(invalidHexLiteral, value);
	};

	var $toNumber2016 = function toNumber2016(argument) {
	  var value = toPrimitiveX(argument, Number);
	  if (typeof value === 'symbol') {
	    throw new TypeError('Cannot convert a Symbol value to a number');
	  }

	  if (typeof value === 'string') {
	    if (isBinary(value)) {
	      return toNumber2016($parseInt2016$1(pStrSlice.call(value, 2), 2));
	    }

	    if (isOctal(value)) {
	      return toNumber2016($parseInt2016$1(pStrSlice.call(value, 2), 8));
	    }

	    if (hasNonWS2016(value) || isInvalidHexLiteral(value)) {
	      return nanX;
	    }

	    var trimmed = trim2016$1(value);
	    if (trimmed !== value) {
	      return toNumber2016(trimmed);
	    }
	  }

	  return castNumber$1(value);
	};

	var $toNumber2018 = function toNumber2018(argument) {
	  var value = toPrimitiveX(argument, Number);
	  if (typeof value === 'symbol') {
	    throw new TypeError('Cannot convert a Symbol value to a number');
	  }

	  if (typeof value === 'string') {
	    if (isBinary(value)) {
	      return toNumber2018($parseInt2018$1(pStrSlice.call(value, 2), 2));
	    }

	    if (isOctal(value)) {
	      return toNumber2018($parseInt2018$1(pStrSlice.call(value, 2), 8));
	    }

	    if (hasNonWS2018(value) || isInvalidHexLiteral(value)) {
	      return nanX;
	    }

	    var trimmed = trim2018$1(value);
	    if (trimmed !== value) {
	      return toNumber2018(trimmed);
	    }
	  }

	  return castNumber$1(value);
	};

	var toNumberX = {
	  /**
	   * reference to toNumber2018.
	   */
	  toNumber: $toNumber2018,

	  /**
	   * This method converts argument to a value of type Number. (ES2016)

	   * @param {*} argument - The argument to convert to a number.
	   * @throws {TypeError} - If argument is a Symbol or not coercible.
	   * @returns {*} The argument converted to a number.
	   * @example
	   * var toNumber = require('to-number-x').toNumber2016;
	   *
	   * toNumber('1'); // 1
	   * toNumber(null); // 0
	   * toNumber(true); // 1
	   * toNumber('0o10'); // 8
	   * toNumber('0b10'); // 2
	   * toNumber('0xF'); // 16
	   *
	   * toNumber(' 1 '); // 1
	   *
	   * toNumber(Symbol('')) // TypeError
	   * toNumber(Object.create(null)) // TypeError
	   */
	  toNumber2016: $toNumber2016,

	  /**
	   * This method converts argument to a value of type Number. (ES2018)

	   * @param {*} argument - The argument to convert to a number.
	   * @throws {TypeError} - If argument is a Symbol or not coercible.
	   * @returns {*} The argument converted to a number.
	   * @example
	   * var toNumber = require('to-number-x').toNumber2018;
	   *
	   * toNumber('1'); // 1
	   * toNumber(null); // 0
	   * toNumber(true); // 1
	   * toNumber('0o10'); // 8
	   * toNumber('0b10'); // 2
	   * toNumber('0xF'); // 16
	   *
	   * toNumber(' 1 '); // 1
	   *
	   * toNumber(Symbol('')) // TypeError
	   * toNumber(Object.create(null)) // TypeError
	   */
	  toNumber2018: $toNumber2018
	};

	/**
	 * @file ES6-compliant shim for Number.isNaN - the global isNaN returns false positives.
	 * @version 1.0.3
	 * @author Xotic750 <Xotic750@gmail.com>
	 * @copyright  Xotic750
	 * @license {@link <https://opensource.org/licenses/MIT> MIT}
	 * @module is-nan-x
	 */

	/**
	 * This method determines whether the passed value is NaN and its type is
	 * `Number`. It is a more robust version of the original, global isNaN().
	 *
	 * @param {*} value - The value to be tested for NaN.
	 * @returns {boolean} `true` if the given value is NaN and its type is Number;
	 *  otherwise, `false`.
	 * @example
	 * var numberIsNaN = require('is-nan-x');
	 *
	 * numberIsNaN(NaN);        // true
	 * numberIsNaN(Number.NaN); // true
	 * numberIsNaN(0 / 0);      // true
	 *
	 * // e.g. these would have been true with global isNaN()
	 * numberIsNaN('NaN');      // false
	 * numberIsNaN(undefined);  // false
	 * numberIsNaN({});         // false
	 * numberIsNaN('blabla');   // false
	 *
	 * // These all return false
	 * numberIsNaN(true);
	 * numberIsNaN(null);
	 * numberIsNaN(37);
	 * numberIsNaN('37');
	 * numberIsNaN('37.37');
	 * numberIsNaN('');
	 * numberIsNaN(' ');
	 */
	var isNanX = function isNaN(value) {
	  return value !== value;
	};

	/**
	 * @file The constant value Infinity.
	 * @version 1.0.2
	 * @author Xotic750 <Xotic750@gmail.com>
	 * @copyright  Xotic750
	 * @license {@link <https://opensource.org/licenses/MIT> MIT}
	 * @module infinity-x
	 */

	/**
	 * The constant value Infinity derived mathematically by 1 / 0.
	 *
	 * @type number
	 * @example
	 * var INFINITY = require('infinity-x');
	 *
	 * INFINITY === Infinity; // true
	 * -INFINITY === -Infinity; // true
	 * INFINITY === -Infinity; // false
	 */
	var infinityX = 1 / 0;

	/**
	 * This method determines whether the passed value is a finite number.
	 *
	 * @param {*} number - The value to be tested for finiteness.
	 * @returns {boolean} A Boolean indicating whether or not the given value is a finite number.
	 * @example
	 * var numIsFinite = require('is-finite-x');
	 *
	 * numIsFinite(Infinity);  // false
	 * numIsFinite(NaN);       // false
	 * numIsFinite(-Infinity); // false
	 *
	 * numIsFinite(0);         // true
	 * numIsFinite(2e64);      // true
	 *
	 * numIsFinite('0');       // false, would've been true with
	 *                         // global isFinite('0')
	 * numIsFinite(null);      // false, would've been true with
	 */
	var isFiniteX = function isFinite(number) {
	  return typeof number === 'number' && isNanX(number) === false && number !== infinityX && number !== -infinityX;
	};

	var toNumber2016 = toNumberX.toNumber2016;
	var toNumber2018 = toNumberX.toNumber2018;


	var $sign2016 = function sign2016(x) {
	  var n = toNumber2016(x);
	  if (n === 0 || isNanX(n)) {
	    return n;
	  }

	  return n > 0 ? 1 : -1;
	};

	var $sign2018 = function sign2018(x) {
	  var n = toNumber2018(x);
	  if (n === 0 || isNanX(n)) {
	    return n;
	  }

	  return n > 0 ? 1 : -1;
	};

	var mathSignX = {
	  /**
	   * Reference to sign2018.
	   */
	  sign: $sign2018,

	  /**
	   * This method returns the sign of a number, indicating whether the number is positive,
	   * negative or zero. (ES2016)
	   *
	   * @param {*} x - A number.
	   * @returns {number} A number representing the sign of the given argument. If the argument
	   * is a positive number, negative number, positive zero or negative zero, the function will
	   * return 1, -1, 0 or -0 respectively. Otherwise, NaN is returned.
	   * @example
	   * var mathSign = require('math-sign-x').sign2016;
	   *
	   * mathSign(3);     //  1
	   * mathSign(-3);    // -1
	   * mathSign('-3');  // -1
	   * mathSign(0);     //  0
	   * mathSign(-0);    // -0
	   * mathSign(NaN);   // NaN
	   * mathSign('foo'); // NaN
	   * mathSign();      // NaN
	   */
	  sign2016: $sign2016,

	  /**
	   * This method returns the sign of a number, indicating whether the number is positive,
	   * negative or zero. (ES2018)
	   *
	   * @param {*} x - A number.
	   * @returns {number} A number representing the sign of the given argument. If the argument
	   * is a positive number, negative number, positive zero or negative zero, the function will
	   * return 1, -1, 0 or -0 respectively. Otherwise, NaN is returned.
	   * @example
	   * var mathSign = require('math-sign-x').sign2018;
	   *
	   * mathSign(3);     //  1
	   * mathSign(-3);    // -1
	   * mathSign('-3');  // -1
	   * mathSign(0);     //  0
	   * mathSign(-0);    // -0
	   * mathSign(NaN);   // NaN
	   * mathSign('foo'); // NaN
	   * mathSign();      // NaN
	   */
	  sign2018: $sign2018
	};

	var toNumber2016$1 = toNumberX.toNumber2016;
	var toNumber2018$1 = toNumberX.toNumber2018;



	var mathSign2016 = mathSignX.sign2016;
	var mathSign2018 = mathSignX.sign2018;
	var mathFloor = Math.floor;
	var mathAbs = Math.abs;

	var $toInteger2016 = function toInteger2016(value) {
	  var number = toNumber2016$1(value);
	  if (isNanX(number)) {
	    return 0;
	  }

	  if (number === 0 || isFiniteX(number) === false) {
	    return number;
	  }

	  return mathSign2016(number) * mathFloor(mathAbs(number));
	};

	var $toInteger2018 = function toInteger2018(value) {
	  var number = toNumber2018$1(value);
	  if (isNanX(number)) {
	    return 0;
	  }

	  if (number === 0 || isFiniteX(number) === false) {
	    return number;
	  }

	  return mathSign2018(number) * mathFloor(mathAbs(number));
	};

	var toIntegerX = {
	  /**
	   * Reference to toInteger2018.
	   */
	  toInteger: $toInteger2018,

	  /**
	   * Converts `value` to an integer. (ES2016)
	   *
	   * @param {*} value - The value to convert.
	   * @returns {number} Returns the converted integer.
	   *
	   * @example
	   * var toInteger = require('to-integer-x').toInteger2016;
	   * toInteger(3); // 3
	   * toInteger(Number.MIN_VALUE); // 0
	   * toInteger(Infinity); // 1.7976931348623157e+308
	   * toInteger('3'); // 3
	   */
	  toInteger2016: $toInteger2016,

	  /**
	   * Converts `value` to an integer. (ES2018)
	   *
	   * @param {*} value - The value to convert.
	   * @returns {number} Returns the converted integer.
	   *
	   * @example
	   * var toInteger = require('to-integer-x').toInteger2018;
	   * toInteger(3); // 3
	   * toInteger(Number.MIN_VALUE); // 0
	   * toInteger(Infinity); // 1.7976931348623157e+308
	   * toInteger('3'); // 3
	   */
	  toInteger2018: $toInteger2018
	};

	var toNumber = toNumberX.toNumber2018;

	/**
	 * This method clamp a number to min and max limits inclusive.
	 *
	 * @param {number} value - The number to be clamped.
	 * @param {number} [min=0] - The minimum number.
	 * @param {number} max - The maximum number.
	 * @throws {RangeError} If min > max.
	 * @return {number} The clamped number.
	 * @example
	 * var mathClamp = require('math-clamp-x');
	 */
	var mathClampX = function clamp(value) {
	  var number = toNumber(value);
	  var argsLength = arguments.length;
	  if (argsLength < 2) {
	    return number;
	  }

	  var min = toNumber(arguments[1]);
	  var max;
	  if (argsLength < 3) {
	    max = min;
	    min = 0;
	  } else {
	    max = toNumber(arguments[2]);
	  }

	  if (min > max) {
	    throw new RangeError('"min" must be less than "max"');
	  }

	  if (number < min) {
	    return min;
	  }

	  if (number > max) {
	    return max;
	  }

	  return number;
	};

	var maxSafeInteger = 9007199254740991;

	var toInteger = toIntegerX.toInteger2018;
	var toNumber$1 = toNumberX.toNumber2018;


	var reIsUint = /^(?:0|[1-9]\d*)$/;
	var rxTest = reIsUint.test;

	/**
	 * This method determines whether the passed value is a zero based index.
	 * JavaScript arrays are zero-indexed: the first element of an array is at
	 * index 0, and the last element is at the index equal to the value of the
	 * array's length property minus 1.
	 *
	 * @param {number|string} value - The value to be tested for being a zero based index.
	 * @param {number} [length=MAX_SAFE_INTEGER] - The length that sets the upper bound.
	 * @returns {boolean} A Boolean indicating whether or not the given value is a
	 * zero based index within bounds.
	 * @example
	 * var isIndex = require('is-index-x');
	 *
	 * isIndex(0);                    // true
	 * isIndex(1);                    // true
	 * isIndex('10');                 // true
	 *
	 * isIndex(-100000);              // false
	 * isIndex(Math.pow(2, 53));      // false
	 * isIndex(0.1);                  // false
	 * isIndex(Math.PI);              // false
	 * isIndex(NaN);                  // false
	 * isIndex(Infinity);             // false
	 * isIndex(-Infinity);            // false
	 * isIndex(true);                 // false
	 * isIndex(false);                // false
	 * isIndex([1]);                  // false
	 * isIndex(10, 10);               // false
	 */
	var isIndexX = function isIndex(value) {
	  var string = toStringSymbolsSupportedX(value);
	  if (rxTest.call(reIsUint, string) === false) {
	    return false;
	  }

	  var number = toNumber$1(string);
	  if (arguments.length > 1) {
	    return number < mathClampX(toInteger(arguments[1]), maxSafeInteger);
	  }

	  return number < maxSafeInteger;
	};

	var propIsEnumerable = Object.prototype.propertyIsEnumerable;

	/**
	 * This method returns a Boolean indicating whether the specified property is
	 * enumerable. Does not attempt to fix bugs in IE<9 or old Opera, otherwise it
	 * does ES6ify the method.
	 *
	 * @param {!Object} object - The object on which to test the property.
	 * @param {string|Symbol} property - The name of the property to test.
	 * @throws {TypeError} If target is null or undefined.
	 * @returns {boolean} A Boolean indicating whether the specified property is
	 *  enumerable.
	 * @example
	 * var propertyIsEnumerable = require('property-is-enumerable-x');
	 *
	 * var o = {};
	 * var a = [];
	 * o.prop = 'is enumerable';
	 * a[0] = 'is enumerable';
	 *
	 * propertyIsEnumerable(o, 'prop'); // true
	 * propertyIsEnumerable(a, 0); // true
	 */
	var propertyIsEnumerableX = function propertyIsEnumerable(object, property) {
	  return propIsEnumerable.call(toObjectX(object), toPropertyKeyX(property));
	};

	var nativeGOPD = typeof Object.getOwnPropertyDescriptor === 'function' && Object.getOwnPropertyDescriptor;
	var getOPDFallback1;
	var getOPDFallback2;

	// ES5 15.2.3.3
	// http://es5.github.com/#x15.2.3.3

	var doesGOPDWork = function (object, prop) {
	  object[toPropertyKeyX(prop)] = 0;
	  var testResult = attemptX(nativeGOPD, object, prop);
	  return testResult.threw === false && testResult.value.value === 0;
	};

	// check whether getOwnPropertyDescriptor works if it's given. Otherwise, shim partially.
	var $getOwnPropertyDescriptor;
	if (nativeGOPD) {
	  var doc = typeof document !== 'undefined' && document;
	  var getOPDWorksOnDom = doc ? doesGOPDWork(doc.createElement('div'), 'sentinel') : true;
	  if (getOPDWorksOnDom) {
	    var res = attemptX(nativeGOPD, Object('abc'), 1);
	    var worksWithStr = res.threw === false && res.value && res.value.value === 'b';
	    if (worksWithStr) {
	      var getOPDWorksOnObject = doesGOPDWork({}, 'sentinel');
	      if (getOPDWorksOnObject) {
	        var worksWithPrim = attemptX(nativeGOPD, 42, 'name').threw === false;
	        var worksWithObjSym = hasSymbolSupportX && doesGOPDWork({}, Object(Symbol('')));
	        // eslint-disable-next-line max-depth
	        if (worksWithObjSym) {
	          // eslint-disable-next-line max-depth
	          if (worksWithPrim) {
	            $getOwnPropertyDescriptor = nativeGOPD;
	          } else {
	            $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(object, property) {
	              return nativeGOPD(toObjectX(object), property);
	            };
	          }
	        } else if (worksWithPrim) {
	          $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(object, property) {
	            return nativeGOPD(object, toPropertyKeyX(property));
	          };
	        } else {
	          $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(object, property) {
	            return nativeGOPD(toObjectX(object), toPropertyKeyX(property));
	          };
	        }
	      } else {
	        getOPDFallback1 = nativeGOPD;
	      }
	    } else {
	      getOPDFallback2 = nativeGOPD;
	    }
	  }
	}

	if (isFalseyX($getOwnPropertyDescriptor) || getOPDFallback1 || getOPDFallback2) {
	  var owns = hasOwnPropertyX;
	  var isPrimitive$3 = isPrimitive$1;
	  var isString$2 = isString$1;
	  var isIndex = isIndexX;
	  var propertyIsEnumerable = propertyIsEnumerableX;
	  var prototypeOfObject = Object.prototype;

	  // If JS engine supports accessors creating shortcuts.
	  var lookupGetter;
	  var lookupSetter;
	  var supportsAccessors = owns(prototypeOfObject, '__defineGetter__');
	  if (supportsAccessors) {
	    // eslint-disable-next-line no-underscore-dangle
	    var lg = prototypeOfObject.__lookupGetter__;
	    // eslint-disable-next-line no-underscore-dangle
	    var ls = prototypeOfObject.__lookupSetter__;
	    lookupGetter = function (object, property) {
	      return lg.call(object, property);
	    };

	    lookupSetter = function (object, property) {
	      return ls.call(object, property);
	    };
	  }

	  $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(object, property) {
	    var obj = toObjectX(object);
	    var propKey = toPropertyKeyX(property);

	    var result;
	    // make a valiant attempt to use the real getOwnPropertyDescriptor for I8's DOM elements.
	    if (getOPDFallback1) {
	      result = attemptX.call(Object, getOPDFallback1, obj, propKey);
	      if (result.threw === false) {
	        return result.value;
	      }
	      // try the shim if the real one doesn't work
	    }

	    var isStringIndex = isString$2(obj) && isIndex(propKey, obj.length);
	    if (getOPDFallback2 && isStringIndex === false) {
	      result = attemptX.call(Object, getOPDFallback2, obj, propKey);
	      if (result.threw === false) {
	        return result.value;
	      }
	      // try the shim if the real one doesn't work
	    }

	    var descriptor;
	    // If object does not owns property return undefined immediately.
	    if (isStringIndex === false && owns(obj, propKey) === false) {
	      return descriptor;
	    }

	    // If object has a property then it's for sure `configurable`, and
	    // probably `enumerable`. Detect enumerability though.
	    descriptor = {
	      configurable: isPrimitive$3(object) === false && isStringIndex === false,
	      enumerable: propertyIsEnumerable(obj, propKey)
	    };

	    // If JS engine supports accessor properties then property may be a
	    // getter or setter.
	    if (supportsAccessors) {
	      // Unfortunately `__lookupGetter__` will return a getter even
	      // if object has own non getter property along with a same named
	      // inherited getter. To avoid misbehavior we temporary remove
	      // `__proto__` so that `__lookupGetter__` will return getter only
	      // if it's owned by an object.
	      // eslint-disable-next-line no-proto
	      var prototype = obj.__proto__;
	      var notPrototypeOfObject = obj !== prototypeOfObject;
	      // avoid recursion problem, breaking in Opera Mini when
	      // Object.getOwnPropertyDescriptor(Object.prototype, 'toString')
	      // or any other Object.prototype accessor
	      if (notPrototypeOfObject) {
	        // eslint-disable-next-line no-proto
	        obj.__proto__ = prototypeOfObject;
	      }

	      var getter = lookupGetter(obj, propKey);
	      var setter = lookupSetter(obj, propKey);

	      if (notPrototypeOfObject) {
	        // Once we have getter and setter we can put values back.
	        // eslint-disable-next-line no-proto
	        obj.__proto__ = prototype;
	      }

	      if (getter || setter) {
	        if (getter) {
	          descriptor.get = getter;
	        }

	        if (setter) {
	          descriptor.set = setter;
	        }

	        // If it was accessor property we're done and return here
	        // in order to avoid adding `value` to the descriptor.
	        return descriptor;
	      }
	    }

	    // If we got this far we know that object has an own property that is
	    // not an accessor so we set it as a value and return descriptor.
	    if (isStringIndex) {
	      descriptor.value = obj.charAt(propKey);
	      descriptor.writable = false;
	    } else {
	      descriptor.value = obj[propKey];
	      descriptor.writable = true;
	    }

	    return descriptor;
	  };
	}

	/**
	 * This method returns a property descriptor for an own property (that is,
	 * one directly present on an object and not in the object's prototype chain)
	 * of a given object.
	 *
	 * @param {*} object - The object in which to look for the property.
	 * @param {*} property - The name of the property whose description is to be retrieved.
	 * @returns {Object} A property descriptor of the given property if it exists on the object, undefined otherwise.
	 * @example
	 * var getOwnPropertyDescriptor = require('object-get-own-property-descriptor-x');
	 * var obj = { bar: 42 };
	 * var d = getOwnPropertyDescriptor(o, 'bar');
	 * // d is {
	 * //   configurable: true,
	 * //   enumerable: true,
	 * //   value: 42,
	 * //   writable: true
	 * // }
	 */
	var objectGetOwnPropertyDescriptorX = $getOwnPropertyDescriptor;

	var hasABuf = typeof ArrayBuffer === 'function';
	var bLength = false;
	var toStringTag;
	var aBufTag;

	if (hasABuf) {
	  if (hasToStringTagX) {
	    var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptorX;
	    var descriptor = getOwnPropertyDescriptor(ArrayBuffer.prototype, 'byteLength');
	    if (descriptor && typeof descriptor.get === 'function') {
	      var res$1 = attemptX(function () {
	        return new ArrayBuffer(4);
	      });

	      if (res$1.threw === false && isObjectLikeX(res$1.value)) {
	        res$1 = attemptX.call(res$1.value, descriptor.get);
	        bLength = res$1.threw === false && typeof res$1.value === 'number' && descriptor.get;
	      }
	    }
	  }

	  if (bLength === false) {
	    toStringTag = toStringTagX;
	    aBufTag = '[object ArrayBuffer]';
	  }
	}

	/**
	 * Determine if an `object` is an `ArrayBuffer`.
	 *
	 * @param {*} object - The object to test.
	 * @returns {boolean} `true` if the `object` is an `ArrayBuffer`,
	 *  else false`.
	 * @example
	 * var isArrayBuffer = require('is-array-buffer-x');
	 *
	 * isArrayBuffer(new ArrayBuffer(4)); // true
	 * isArrayBuffer(null); // false
	 * isArrayBuffer([]); // false
	 */
	var isArrayBufferX = function isArrayBuffer(object) {
	  if (hasABuf === false || isObjectLikeX(object) === false) {
	    return false;
	  }

	  if (bLength === false) {
	    return toStringTag(object) === aBufTag;
	  }

	  var result = attemptX.call(object, bLength);
	  return result.threw === false && typeof result.value === 'number';
	};

	var isModern = (
	  typeof Buffer.alloc === 'function' &&
	  typeof Buffer.allocUnsafe === 'function' &&
	  typeof Buffer.from === 'function'
	);

	function fromArrayBuffer (obj, byteOffset, length) {
	  byteOffset >>>= 0;

	  var maxLength = obj.byteLength - byteOffset;

	  if (maxLength < 0) {
	    throw new RangeError("'offset' is out of bounds")
	  }

	  if (length === undefined) {
	    length = maxLength;
	  } else {
	    length >>>= 0;

	    if (length > maxLength) {
	      throw new RangeError("'length' is out of bounds")
	    }
	  }

	  return isModern
	    ? Buffer.from(obj.slice(byteOffset, byteOffset + length))
	    : new Buffer(new Uint8Array(obj.slice(byteOffset, byteOffset + length)))
	}

	function fromString (string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') {
	    encoding = 'utf8';
	  }

	  if (!Buffer.isEncoding(encoding)) {
	    throw new TypeError('"encoding" must be a valid string encoding')
	  }

	  return isModern
	    ? Buffer.from(string, encoding)
	    : new Buffer(string, encoding)
	}

	function bufferFrom (value, encodingOrOffset, length) {
	  if (typeof value === 'number') {
	    throw new TypeError('"value" argument must not be a number')
	  }

	  if (isArrayBufferX(value)) {
	    return fromArrayBuffer(value, encodingOrOffset, length)
	  }

	  if (typeof value === 'string') {
	    return fromString(value, encodingOrOffset)
	  }

	  return isModern
	    ? Buffer.from(value)
	    : new Buffer(value)
	}

	var bufferFrom_1 = bufferFrom;

	/**
	 * Stringify/parse functions that don't operate
	 * recursively, so they avoid call stack exceeded
	 * errors.
	 */
	var stringify = function stringify(input) {
	  var queue = [];
	  queue.push({obj: input});

	  var res = '';
	  var next, obj, prefix, val, i, arrayPrefix, keys, k, key, value, objPrefix;
	  while ((next = queue.pop())) {
	    obj = next.obj;
	    prefix = next.prefix || '';
	    val = next.val || '';
	    res += prefix;
	    if (val) {
	      res += val;
	    } else if (typeof obj !== 'object') {
	      res += typeof obj === 'undefined' ? null : JSON.stringify(obj);
	    } else if (obj === null) {
	      res += 'null';
	    } else if (Array.isArray(obj)) {
	      queue.push({val: ']'});
	      for (i = obj.length - 1; i >= 0; i--) {
	        arrayPrefix = i === 0 ? '' : ',';
	        queue.push({obj: obj[i], prefix: arrayPrefix});
	      }
	      queue.push({val: '['});
	    } else { // object
	      keys = [];
	      for (k in obj) {
	        if (obj.hasOwnProperty(k)) {
	          keys.push(k);
	        }
	      }
	      queue.push({val: '}'});
	      for (i = keys.length - 1; i >= 0; i--) {
	        key = keys[i];
	        value = obj[key];
	        objPrefix = (i > 0 ? ',' : '');
	        objPrefix += JSON.stringify(key) + ':';
	        queue.push({obj: value, prefix: objPrefix});
	      }
	      queue.push({val: '{'});
	    }
	  }
	  return res;
	};

	// Convenience function for the parse function.
	// This pop function is basically copied from
	// pouchCollate.parseIndexableString
	function pop(obj, stack, metaStack) {
	  var lastMetaElement = metaStack[metaStack.length - 1];
	  if (obj === lastMetaElement.element) {
	    // popping a meta-element, e.g. an object whose value is another object
	    metaStack.pop();
	    lastMetaElement = metaStack[metaStack.length - 1];
	  }
	  var element = lastMetaElement.element;
	  var lastElementIndex = lastMetaElement.index;
	  if (Array.isArray(element)) {
	    element.push(obj);
	  } else if (lastElementIndex === stack.length - 2) { // obj with key+value
	    var key = stack.pop();
	    element[key] = obj;
	  } else {
	    stack.push(obj); // obj with key only
	  }
	}

	var parse$1 = function (str) {
	  var stack = [];
	  var metaStack = []; // stack for arrays and objects
	  var i = 0;
	  var collationIndex,parsedNum,numChar;
	  var parsedString,lastCh,numConsecutiveSlashes,ch;
	  var arrayElement, objElement;
	  while (true) {
	    collationIndex = str[i++];
	    if (collationIndex === '}' ||
	        collationIndex === ']' ||
	        typeof collationIndex === 'undefined') {
	      if (stack.length === 1) {
	        return stack.pop();
	      } else {
	        pop(stack.pop(), stack, metaStack);
	        continue;
	      }
	    }
	    switch (collationIndex) {
	      case ' ':
	      case '\t':
	      case '\n':
	      case ':':
	      case ',':
	        break;
	      case 'n':
	        i += 3; // 'ull'
	        pop(null, stack, metaStack);
	        break;
	      case 't':
	        i += 3; // 'rue'
	        pop(true, stack, metaStack);
	        break;
	      case 'f':
	        i += 4; // 'alse'
	        pop(false, stack, metaStack);
	        break;
	      case '0':
	      case '1':
	      case '2':
	      case '3':
	      case '4':
	      case '5':
	      case '6':
	      case '7':
	      case '8':
	      case '9':
	      case '-':
	        parsedNum = '';
	        i--;
	        while (true) {
	          numChar = str[i++];
	          if (/[\d\.\-e\+]/.test(numChar)) {
	            parsedNum += numChar;
	          } else {
	            i--;
	            break;
	          }
	        }
	        pop(parseFloat(parsedNum), stack, metaStack);
	        break;
	      case '"':
	        parsedString = '';
	        lastCh = void 0;
	        numConsecutiveSlashes = 0;
	        while (true) {
	          ch = str[i++];
	          if (ch !== '"' || (lastCh === '\\' &&
	              numConsecutiveSlashes % 2 === 1)) {
	            parsedString += ch;
	            lastCh = ch;
	            if (lastCh === '\\') {
	              numConsecutiveSlashes++;
	            } else {
	              numConsecutiveSlashes = 0;
	            }
	          } else {
	            break;
	          }
	        }
	        pop(JSON.parse('"' + parsedString + '"'), stack, metaStack);
	        break;
	      case '[':
	        arrayElement = { element: [], index: stack.length };
	        stack.push(arrayElement.element);
	        metaStack.push(arrayElement);
	        break;
	      case '{':
	        objElement = { element: {}, index: stack.length };
	        stack.push(objElement.element);
	        metaStack.push(objElement);
	        break;
	      default:
	        throw new Error(
	          'unexpectedly reached end of input: ' + collationIndex);
	    }
	  }
	};

	var vuvuzela = {
		stringify: stringify,
		parse: parse$1
	};

	var immutable = extend;

	var hasOwnProperty = Object.prototype.hasOwnProperty;

	function extend() {
	    var target = {};

	    for (var i = 0; i < arguments.length; i++) {
	        var source = arguments[i];

	        for (var key in source) {
	            if (hasOwnProperty.call(source, key)) {
	                target[key] = source[key];
	            }
	        }
	    }

	    return target
	}

	/* Copyright (c) 2017 Rod Vagg, MIT License */

	function AbstractIterator (db) {
	  this.db = db;
	  this._ended = false;
	  this._nexting = false;
	}

	AbstractIterator.prototype.next = function (callback) {
	  var self = this;

	  if (typeof callback != 'function')
	    throw new Error('next() requires a callback argument')

	  if (self._ended)
	    return callback(new Error('cannot call next() after end()'))
	  if (self._nexting)
	    return callback(new Error('cannot call next() before previous next() has completed'))

	  self._nexting = true;
	  if (typeof self._next == 'function') {
	    return self._next(function () {
	      self._nexting = false;
	      callback.apply(null, arguments);
	    })
	  }

	  process.nextTick(function () {
	    self._nexting = false;
	    callback();
	  });
	};

	AbstractIterator.prototype.end = function (callback) {
	  if (typeof callback != 'function')
	    throw new Error('end() requires a callback argument')

	  if (this._ended)
	    return callback(new Error('end() already called on iterator'))

	  this._ended = true;

	  if (typeof this._end == 'function')
	    return this._end(callback)

	  process.nextTick(callback);
	};

	var abstractIterator = AbstractIterator;

	/* Copyright (c) 2017 Rod Vagg, MIT License */

	function AbstractChainedBatch (db) {
	  this._db         = db;
	  this._operations = [];
	  this._written    = false;
	}

	AbstractChainedBatch.prototype._serializeKey = function (key) {
	  return this._db._serializeKey(key)
	};

	AbstractChainedBatch.prototype._serializeValue = function (value) {
	  return this._db._serializeValue(value)
	};

	AbstractChainedBatch.prototype._checkWritten = function () {
	  if (this._written)
	    throw new Error('write() already called on this batch')
	};

	AbstractChainedBatch.prototype.put = function (key, value) {
	  this._checkWritten();

	  var err = this._db._checkKey(key, 'key', this._db._isBuffer);
	  if (err)
	    throw err

	  key = this._serializeKey(key);
	  value = this._serializeValue(value);

	  if (typeof this._put == 'function' )
	    this._put(key, value);
	  else
	    this._operations.push({ type: 'put', key: key, value: value });

	  return this
	};

	AbstractChainedBatch.prototype.del = function (key) {
	  this._checkWritten();

	  var err = this._db._checkKey(key, 'key', this._db._isBuffer);
	  if (err) throw err

	  key = this._serializeKey(key);

	  if (typeof this._del == 'function' )
	    this._del(key);
	  else
	    this._operations.push({ type: 'del', key: key });

	  return this
	};

	AbstractChainedBatch.prototype.clear = function () {
	  this._checkWritten();

	  this._operations = [];

	  if (typeof this._clear == 'function' )
	    this._clear();

	  return this
	};

	AbstractChainedBatch.prototype.write = function (options, callback) {
	  this._checkWritten();

	  if (typeof options == 'function')
	    callback = options;
	  if (typeof callback != 'function')
	    throw new Error('write() requires a callback argument')
	  if (typeof options != 'object')
	    options = {};

	  this._written = true;

	  if (typeof this._write == 'function' )
	    return this._write(callback)

	  if (typeof this._db._batch == 'function')
	    return this._db._batch(this._operations, options, callback)

	  process.nextTick(callback);
	};

	var abstractChainedBatch = AbstractChainedBatch;

	/* Copyright (c) 2017 Rod Vagg, MIT License */



	function AbstractLevelDOWN (location) {
	  if (!arguments.length || location === undefined)
	    throw new Error('constructor requires at least a location argument')

	  if (typeof location != 'string')
	    throw new Error('constructor requires a location string argument')

	  this.location = location;
	  this.status = 'new';
	}

	AbstractLevelDOWN.prototype.open = function (options, callback) {
	  var self      = this
	    , oldStatus = this.status;

	  if (typeof options == 'function')
	    callback = options;

	  if (typeof callback != 'function')
	    throw new Error('open() requires a callback argument')

	  if (typeof options != 'object')
	    options = {};

	  options.createIfMissing = options.createIfMissing != false;
	  options.errorIfExists = !!options.errorIfExists;

	  if (typeof this._open == 'function') {
	    this.status = 'opening';
	    this._open(options, function (err) {
	      if (err) {
	        self.status = oldStatus;
	        return callback(err)
	      }
	      self.status = 'open';
	      callback();
	    });
	  } else {
	    this.status = 'open';
	    process.nextTick(callback);
	  }
	};

	AbstractLevelDOWN.prototype.close = function (callback) {
	  var self      = this
	    , oldStatus = this.status;

	  if (typeof callback != 'function')
	    throw new Error('close() requires a callback argument')

	  if (typeof this._close == 'function') {
	    this.status = 'closing';
	    this._close(function (err) {
	      if (err) {
	        self.status = oldStatus;
	        return callback(err)
	      }
	      self.status = 'closed';
	      callback();
	    });
	  } else {
	    this.status = 'closed';
	    process.nextTick(callback);
	  }
	};

	AbstractLevelDOWN.prototype.get = function (key, options, callback) {
	  var err;

	  if (typeof options == 'function')
	    callback = options;

	  if (typeof callback != 'function')
	    throw new Error('get() requires a callback argument')

	  if (err = this._checkKey(key, 'key'))
	    return callback(err)

	  key = this._serializeKey(key);

	  if (typeof options != 'object')
	    options = {};

	  options.asBuffer = options.asBuffer != false;

	  if (typeof this._get == 'function')
	    return this._get(key, options, callback)

	  process.nextTick(function () { callback(new Error('NotFound')); });
	};

	AbstractLevelDOWN.prototype.put = function (key, value, options, callback) {
	  var err;

	  if (typeof options == 'function')
	    callback = options;

	  if (typeof callback != 'function')
	    throw new Error('put() requires a callback argument')

	  if (err = this._checkKey(key, 'key'))
	    return callback(err)

	  key = this._serializeKey(key);
	  value = this._serializeValue(value);

	  if (typeof options != 'object')
	    options = {};

	  if (typeof this._put == 'function')
	    return this._put(key, value, options, callback)

	  process.nextTick(callback);
	};

	AbstractLevelDOWN.prototype.del = function (key, options, callback) {
	  var err;

	  if (typeof options == 'function')
	    callback = options;

	  if (typeof callback != 'function')
	    throw new Error('del() requires a callback argument')

	  if (err = this._checkKey(key, 'key'))
	    return callback(err)

	  key = this._serializeKey(key);

	  if (typeof options != 'object')
	    options = {};

	  if (typeof this._del == 'function')
	    return this._del(key, options, callback)

	  process.nextTick(callback);
	};

	AbstractLevelDOWN.prototype.batch = function (array, options, callback) {
	  if (!arguments.length)
	    return this._chainedBatch()

	  if (typeof options == 'function')
	    callback = options;

	  if (typeof array == 'function')
	    callback = array;

	  if (typeof callback != 'function')
	    throw new Error('batch(array) requires a callback argument')

	  if (!Array.isArray(array))
	    return callback(new Error('batch(array) requires an array argument'))

	  if (!options || typeof options != 'object')
	    options = {};

	  var i = 0
	    , l = array.length
	    , e
	    , err;

	  for (; i < l; i++) {
	    e = array[i];
	    if (typeof e != 'object')
	      continue

	    if (err = this._checkKey(e.type, 'type'))
	      return callback(err)

	    if (err = this._checkKey(e.key, 'key'))
	      return callback(err)
	  }

	  if (typeof this._batch == 'function')
	    return this._batch(array, options, callback)

	  process.nextTick(callback);
	};

	//TODO: remove from here, not a necessary primitive
	AbstractLevelDOWN.prototype.approximateSize = function (start, end, callback) {
	  if (   start == null
	      || end == null
	      || typeof start == 'function'
	      || typeof end == 'function') {
	    throw new Error('approximateSize() requires valid `start`, `end` and `callback` arguments')
	  }

	  if (typeof callback != 'function')
	    throw new Error('approximateSize() requires a callback argument')

	  start = this._serializeKey(start);
	  end = this._serializeKey(end);

	  if (typeof this._approximateSize == 'function')
	    return this._approximateSize(start, end, callback)

	  process.nextTick(function () {
	    callback(null, 0);
	  });
	};

	AbstractLevelDOWN.prototype._setupIteratorOptions = function (options) {
	  var self = this;

	  options = immutable(options)

	  ;[ 'start', 'end', 'gt', 'gte', 'lt', 'lte' ].forEach(function (o) {
	    if (options[o] && self._isBuffer(options[o]) && options[o].length === 0)
	      delete options[o];
	  });

	  options.reverse = !!options.reverse;
	  options.keys = options.keys != false;
	  options.values = options.values != false;
	  options.limit = 'limit' in options ? options.limit : -1;
	  options.keyAsBuffer = options.keyAsBuffer != false;
	  options.valueAsBuffer = options.valueAsBuffer != false;

	  return options
	};

	AbstractLevelDOWN.prototype.iterator = function (options) {
	  if (typeof options != 'object')
	    options = {};

	  options = this._setupIteratorOptions(options);

	  if (typeof this._iterator == 'function')
	    return this._iterator(options)

	  return new abstractIterator(this)
	};

	AbstractLevelDOWN.prototype._chainedBatch = function () {
	  return new abstractChainedBatch(this)
	};

	AbstractLevelDOWN.prototype._isBuffer = function (obj) {
	  return Buffer.isBuffer(obj)
	};

	AbstractLevelDOWN.prototype._serializeKey = function (key) {
	  return this._isBuffer(key)
	    ? key
	    : String(key)
	};

	AbstractLevelDOWN.prototype._serializeValue = function (value) {
	  if (value == null) return ''
	  return this._isBuffer(value) || process.browser ? value : String(value)
	};

	AbstractLevelDOWN.prototype._checkKey = function (obj, type) {
	  if (obj === null || obj === undefined)
	    return new Error(type + ' cannot be `null` or `undefined`')

	  if (this._isBuffer(obj) && obj.length === 0)
	    return new Error(type + ' cannot be an empty Buffer')
	  else if (String(obj) === '')
	    return new Error(type + ' cannot be an empty String')
	};

	var abstractLeveldown = AbstractLevelDOWN;

	function isLevelDOWN (db) {
	  if (!db || typeof db !== 'object')
	    return false
	  return Object.keys(abstractLeveldown.prototype).filter(function (name) {
	    // TODO remove approximateSize check when method is gone
	    return name[0] != '_' && name != 'approximateSize'
	  }).every(function (name) {
	    return typeof db[name] == 'function'
	  })
	}

	var isLeveldown = isLevelDOWN;

	var AbstractLevelDOWN$1    = abstractLeveldown;
	var AbstractIterator$1     = abstractIterator;
	var AbstractChainedBatch$1 = abstractChainedBatch;
	var isLevelDOWN$1          = isLeveldown;

	var abstractLeveldown$1 = {
		AbstractLevelDOWN: AbstractLevelDOWN$1,
		AbstractIterator: AbstractIterator$1,
		AbstractChainedBatch: AbstractChainedBatch$1,
		isLevelDOWN: isLevelDOWN$1
	};

	var AbstractIterator$2 = abstractLeveldown$1.AbstractIterator;

	function DeferredIterator (options) {
	  AbstractIterator$2.call(this, options);

	  this._options = options;
	  this._iterator = null;
	  this._operations = [];
	}

	util.inherits(DeferredIterator, AbstractIterator$2);

	DeferredIterator.prototype.setDb = function (db) {
	  var it = this._iterator = db.iterator(this._options);
	  this._operations.forEach(function (op) {
	    it[op.method].apply(it, op.args);
	  });
	};

	DeferredIterator.prototype._operation = function (method, args) {
	  if (this._iterator) return this._iterator[method].apply(this._iterator, args)
	  this._operations.push({ method: method, args: args });
	};

	'next end'.split(' ').forEach(function (m) {
	  DeferredIterator.prototype['_' + m] = function () {
	    this._operation(m, arguments);
	  };
	});

	var deferredIterator = DeferredIterator;

	var AbstractLevelDOWN$2 = abstractLeveldown$1.AbstractLevelDOWN;

	var deferrables = 'put get del batch approximateSize'.split(' ');

	function DeferredLevelDOWN (db) {
	  AbstractLevelDOWN$2.call(this, '');
	  this._db = db;
	  this._operations = [];
	  this._iterators = [];
	}

	util.inherits(DeferredLevelDOWN, AbstractLevelDOWN$2);

	DeferredLevelDOWN.prototype._open = function (options, callback) {
	  var self = this;

	  this._db.open(options, function (err) {
	    if (err) return callback(err)

	    self._operations.forEach(function (op) {
	      self._db[op.method].apply(self._db, op.args);
	    });
	    self._operations = [];
	    self._iterators.forEach(function (it) {
	      it.setDb(self._db);
	    });
	    self._iterators = [];
	    open(self);
	    callback();
	  });
	};

	DeferredLevelDOWN.prototype._close = function (callback) {
	  var self = this;

	  this._db.close(function (err) {
	    if (err) return callback(err)
	    closed(self);
	    callback();
	  });
	};

	function open (obj) {
	  deferrables.concat('iterator').forEach(function (m) {
	    obj['_' + m] = function () {
	      return this._db[m].apply(this._db, arguments)
	    };
	  });
	}

	function closed (obj) {
	  deferrables.forEach(function (m) {
	    obj['_' + m] = function () {
	      this._operations.push({ method: m, args: arguments });
	    };
	  });
	  obj._iterator = function (options) {
	    var it = new deferredIterator(options);
	    this._iterators.push(it);
	    return it
	  };
	}

	closed(DeferredLevelDOWN.prototype);

	DeferredLevelDOWN.prototype._isBuffer = function (obj) {
	  return Buffer.isBuffer(obj)
	};

	DeferredLevelDOWN.prototype._serializeKey = function (key) {
	  return key
	};

	DeferredLevelDOWN.prototype._serializeValue = function (value) {
	  return value
	};

	var deferredLeveldown = DeferredLevelDOWN;
	var DeferredIterator_1 = deferredIterator;
	deferredLeveldown.DeferredIterator = DeferredIterator_1;

	var processNextickArgs = createCommonjsModule(function (module) {

	if (!process.version ||
	    process.version.indexOf('v0.') === 0 ||
	    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
	  module.exports = { nextTick: nextTick };
	} else {
	  module.exports = process;
	}

	function nextTick(fn, arg1, arg2, arg3) {
	  if (typeof fn !== 'function') {
	    throw new TypeError('"callback" argument must be a function');
	  }
	  var len = arguments.length;
	  var args, i;
	  switch (len) {
	  case 0:
	  case 1:
	    return process.nextTick(fn);
	  case 2:
	    return process.nextTick(function afterTickOne() {
	      fn.call(null, arg1);
	    });
	  case 3:
	    return process.nextTick(function afterTickTwo() {
	      fn.call(null, arg1, arg2);
	    });
	  case 4:
	    return process.nextTick(function afterTickThree() {
	      fn.call(null, arg1, arg2, arg3);
	    });
	  default:
	    args = new Array(len - 1);
	    i = 0;
	    while (i < args.length) {
	      args[i++] = arguments[i];
	    }
	    return process.nextTick(function afterTick() {
	      fn.apply(null, args);
	    });
	  }
	}
	});
	var processNextickArgs_1 = processNextickArgs.nextTick;

	var toString = {}.toString;

	var isarray$1 = Array.isArray || function (arr) {
	  return toString.call(arr) == '[object Array]';
	};

	var stream = Stream;

	var safeBuffer = createCommonjsModule(function (module, exports) {
	/* eslint-disable node/no-deprecated-api */

	var Buffer = buffer.Buffer;

	// alternative to using Object.keys for old browsers
	function copyProps (src, dst) {
	  for (var key in src) {
	    dst[key] = src[key];
	  }
	}
	if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
	  module.exports = buffer;
	} else {
	  // Copy properties from require('buffer')
	  copyProps(buffer, exports);
	  exports.Buffer = SafeBuffer;
	}

	function SafeBuffer (arg, encodingOrOffset, length) {
	  return Buffer(arg, encodingOrOffset, length)
	}

	// Copy static methods from Buffer
	copyProps(Buffer, SafeBuffer);

	SafeBuffer.from = function (arg, encodingOrOffset, length) {
	  if (typeof arg === 'number') {
	    throw new TypeError('Argument must not be a number')
	  }
	  return Buffer(arg, encodingOrOffset, length)
	};

	SafeBuffer.alloc = function (size, fill, encoding) {
	  if (typeof size !== 'number') {
	    throw new TypeError('Argument must be a number')
	  }
	  var buf = Buffer(size);
	  if (fill !== undefined) {
	    if (typeof encoding === 'string') {
	      buf.fill(fill, encoding);
	    } else {
	      buf.fill(fill);
	    }
	  } else {
	    buf.fill(0);
	  }
	  return buf
	};

	SafeBuffer.allocUnsafe = function (size) {
	  if (typeof size !== 'number') {
	    throw new TypeError('Argument must be a number')
	  }
	  return Buffer(size)
	};

	SafeBuffer.allocUnsafeSlow = function (size) {
	  if (typeof size !== 'number') {
	    throw new TypeError('Argument must be a number')
	  }
	  return buffer.SlowBuffer(size)
	};
	});
	var safeBuffer_1 = safeBuffer.Buffer;

	var BufferList = createCommonjsModule(function (module) {

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Buffer = safeBuffer.Buffer;


	function copyBuffer(src, target, offset) {
	  src.copy(target, offset);
	}

	module.exports = function () {
	  function BufferList() {
	    _classCallCheck(this, BufferList);

	    this.head = null;
	    this.tail = null;
	    this.length = 0;
	  }

	  BufferList.prototype.push = function push(v) {
	    var entry = { data: v, next: null };
	    if (this.length > 0) this.tail.next = entry;else this.head = entry;
	    this.tail = entry;
	    ++this.length;
	  };

	  BufferList.prototype.unshift = function unshift(v) {
	    var entry = { data: v, next: this.head };
	    if (this.length === 0) this.tail = entry;
	    this.head = entry;
	    ++this.length;
	  };

	  BufferList.prototype.shift = function shift() {
	    if (this.length === 0) return;
	    var ret = this.head.data;
	    if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
	    --this.length;
	    return ret;
	  };

	  BufferList.prototype.clear = function clear() {
	    this.head = this.tail = null;
	    this.length = 0;
	  };

	  BufferList.prototype.join = function join(s) {
	    if (this.length === 0) return '';
	    var p = this.head;
	    var ret = '' + p.data;
	    while (p = p.next) {
	      ret += s + p.data;
	    }return ret;
	  };

	  BufferList.prototype.concat = function concat(n) {
	    if (this.length === 0) return Buffer.alloc(0);
	    if (this.length === 1) return this.head.data;
	    var ret = Buffer.allocUnsafe(n >>> 0);
	    var p = this.head;
	    var i = 0;
	    while (p) {
	      copyBuffer(p.data, ret, i);
	      i += p.data.length;
	      p = p.next;
	    }
	    return ret;
	  };

	  return BufferList;
	}();

	if (util && util.inspect && util.inspect.custom) {
	  module.exports.prototype[util.inspect.custom] = function () {
	    var obj = util.inspect({ length: this.length });
	    return this.constructor.name + ' ' + obj;
	  };
	}
	});

	/*<replacement>*/


	/*</replacement>*/

	// undocumented cb() API, needed for core, not for public API
	function destroy(err, cb) {
	  var _this = this;

	  var readableDestroyed = this._readableState && this._readableState.destroyed;
	  var writableDestroyed = this._writableState && this._writableState.destroyed;

	  if (readableDestroyed || writableDestroyed) {
	    if (cb) {
	      cb(err);
	    } else if (err && (!this._writableState || !this._writableState.errorEmitted)) {
	      processNextickArgs.nextTick(emitErrorNT, this, err);
	    }
	    return this;
	  }

	  // we set destroyed to true before firing error callbacks in order
	  // to make it re-entrance safe in case destroy() is called within callbacks

	  if (this._readableState) {
	    this._readableState.destroyed = true;
	  }

	  // if this is a duplex stream mark the writable part as destroyed as well
	  if (this._writableState) {
	    this._writableState.destroyed = true;
	  }

	  this._destroy(err || null, function (err) {
	    if (!cb && err) {
	      processNextickArgs.nextTick(emitErrorNT, _this, err);
	      if (_this._writableState) {
	        _this._writableState.errorEmitted = true;
	      }
	    } else if (cb) {
	      cb(err);
	    }
	  });

	  return this;
	}

	function undestroy() {
	  if (this._readableState) {
	    this._readableState.destroyed = false;
	    this._readableState.reading = false;
	    this._readableState.ended = false;
	    this._readableState.endEmitted = false;
	  }

	  if (this._writableState) {
	    this._writableState.destroyed = false;
	    this._writableState.ended = false;
	    this._writableState.ending = false;
	    this._writableState.finished = false;
	    this._writableState.errorEmitted = false;
	  }
	}

	function emitErrorNT(self, err) {
	  self.emit('error', err);
	}

	var destroy_1 = {
	  destroy: destroy,
	  undestroy: undestroy
	};

	/**
	 * For Node.js, simply re-export the core `util.deprecate` function.
	 */

	var node$1 = util.deprecate;

	/*<replacement>*/


	/*</replacement>*/

	var _stream_writable$1 = Writable$1;

	// It seems a linked list but it is not
	// there will be only 2 of these for each stream
	function CorkedRequest(state) {
	  var _this = this;

	  this.next = null;
	  this.entry = null;
	  this.finish = function () {
	    onCorkedFinish(_this, state);
	  };
	}
	/* </replacement> */

	/*<replacement>*/
	var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : processNextickArgs.nextTick;
	/*</replacement>*/

	/*<replacement>*/
	var Duplex$1;
	/*</replacement>*/

	Writable$1.WritableState = WritableState$1;

	/*<replacement>*/

	util$1.inherits = inherits;
	/*</replacement>*/

	/*<replacement>*/
	var internalUtil = {
	  deprecate: node$1
	};
	/*</replacement>*/

	/*<replacement>*/

	/*</replacement>*/

	/*<replacement>*/

	var Buffer$4 = safeBuffer.Buffer;
	var OurUint8Array = commonjsGlobal.Uint8Array || function () {};
	function _uint8ArrayToBuffer(chunk) {
	  return Buffer$4.from(chunk);
	}
	function _isUint8Array(obj) {
	  return Buffer$4.isBuffer(obj) || obj instanceof OurUint8Array;
	}

	/*</replacement>*/



	util$1.inherits(Writable$1, stream);

	function nop() {}

	function WritableState$1(options, stream$$1) {
	  Duplex$1 = Duplex$1 || _stream_duplex$1;

	  options = options || {};

	  // Duplex streams are both readable and writable, but share
	  // the same options object.
	  // However, some cases require setting options to different
	  // values for the readable and the writable sides of the duplex stream.
	  // These options can be provided separately as readableXXX and writableXXX.
	  var isDuplex = stream$$1 instanceof Duplex$1;

	  // object stream flag to indicate whether or not this stream
	  // contains buffers or objects.
	  this.objectMode = !!options.objectMode;

	  if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

	  // the point at which write() starts returning false
	  // Note: 0 is a valid value, means that we always return false if
	  // the entire buffer is not flushed immediately on write()
	  var hwm = options.highWaterMark;
	  var writableHwm = options.writableHighWaterMark;
	  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

	  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (writableHwm || writableHwm === 0)) this.highWaterMark = writableHwm;else this.highWaterMark = defaultHwm;

	  // cast to ints.
	  this.highWaterMark = Math.floor(this.highWaterMark);

	  // if _final has been called
	  this.finalCalled = false;

	  // drain event flag.
	  this.needDrain = false;
	  // at the start of calling end()
	  this.ending = false;
	  // when end() has been called, and returned
	  this.ended = false;
	  // when 'finish' is emitted
	  this.finished = false;

	  // has it been destroyed
	  this.destroyed = false;

	  // should we decode strings into buffers before passing to _write?
	  // this is here so that some node-core streams can optimize string
	  // handling at a lower level.
	  var noDecode = options.decodeStrings === false;
	  this.decodeStrings = !noDecode;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = options.defaultEncoding || 'utf8';

	  // not an actual buffer we keep track of, but a measurement
	  // of how much we're waiting to get pushed to some underlying
	  // socket or file.
	  this.length = 0;

	  // a flag to see when we're in the middle of a write.
	  this.writing = false;

	  // when true all writes will be buffered until .uncork() call
	  this.corked = 0;

	  // a flag to be able to tell if the onwrite cb is called immediately,
	  // or on a later tick.  We set this to true at first, because any
	  // actions that shouldn't happen until "later" should generally also
	  // not happen before the first write call.
	  this.sync = true;

	  // a flag to know if we're processing previously buffered items, which
	  // may call the _write() callback in the same tick, so that we don't
	  // end up in an overlapped onwrite situation.
	  this.bufferProcessing = false;

	  // the callback that's passed to _write(chunk,cb)
	  this.onwrite = function (er) {
	    onwrite$1(stream$$1, er);
	  };

	  // the callback that the user supplies to write(chunk,encoding,cb)
	  this.writecb = null;

	  // the amount that is being written when _write is called.
	  this.writelen = 0;

	  this.bufferedRequest = null;
	  this.lastBufferedRequest = null;

	  // number of pending user-supplied write callbacks
	  // this must be 0 before 'finish' can be emitted
	  this.pendingcb = 0;

	  // emit prefinish if the only thing we're waiting for is _write cbs
	  // This is relevant for synchronous Transform streams
	  this.prefinished = false;

	  // True if the error was already emitted and should not be thrown again
	  this.errorEmitted = false;

	  // count buffered requests
	  this.bufferedRequestCount = 0;

	  // allocate the first CorkedRequest, there is always
	  // one allocated and free to use, and we maintain at most two
	  this.corkedRequestsFree = new CorkedRequest(this);
	}

	WritableState$1.prototype.getBuffer = function getBuffer() {
	  var current = this.bufferedRequest;
	  var out = [];
	  while (current) {
	    out.push(current);
	    current = current.next;
	  }
	  return out;
	};

	(function () {
	  try {
	    Object.defineProperty(WritableState$1.prototype, 'buffer', {
	      get: internalUtil.deprecate(function () {
	        return this.getBuffer();
	      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
	    });
	  } catch (_) {}
	})();

	// Test _writableState for inheritance to account for Duplex streams,
	// whose prototype chain only points to Readable.
	var realHasInstance;
	if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
	  realHasInstance = Function.prototype[Symbol.hasInstance];
	  Object.defineProperty(Writable$1, Symbol.hasInstance, {
	    value: function (object) {
	      if (realHasInstance.call(this, object)) return true;
	      if (this !== Writable$1) return false;

	      return object && object._writableState instanceof WritableState$1;
	    }
	  });
	} else {
	  realHasInstance = function (object) {
	    return object instanceof this;
	  };
	}

	function Writable$1(options) {
	  Duplex$1 = Duplex$1 || _stream_duplex$1;

	  // Writable ctor is applied to Duplexes, too.
	  // `realHasInstance` is necessary because using plain `instanceof`
	  // would return false, as no `_writableState` property is attached.

	  // Trying to use the custom `instanceof` for Writable here will also break the
	  // Node.js LazyTransform implementation, which has a non-trivial getter for
	  // `_writableState` that would lead to infinite recursion.
	  if (!realHasInstance.call(Writable$1, this) && !(this instanceof Duplex$1)) {
	    return new Writable$1(options);
	  }

	  this._writableState = new WritableState$1(options, this);

	  // legacy.
	  this.writable = true;

	  if (options) {
	    if (typeof options.write === 'function') this._write = options.write;

	    if (typeof options.writev === 'function') this._writev = options.writev;

	    if (typeof options.destroy === 'function') this._destroy = options.destroy;

	    if (typeof options.final === 'function') this._final = options.final;
	  }

	  stream.call(this);
	}

	// Otherwise people can pipe Writable streams, which is just wrong.
	Writable$1.prototype.pipe = function () {
	  this.emit('error', new Error('Cannot pipe, not readable'));
	};

	function writeAfterEnd$1(stream$$1, cb) {
	  var er = new Error('write after end');
	  // TODO: defer error events consistently everywhere, not just the cb
	  stream$$1.emit('error', er);
	  processNextickArgs.nextTick(cb, er);
	}

	// Checks that a user-supplied chunk is valid, especially for the particular
	// mode the stream is in. Currently this means that `null` is never accepted
	// and undefined/non-string values are only allowed in object mode.
	function validChunk$1(stream$$1, state, chunk, cb) {
	  var valid = true;
	  var er = false;

	  if (chunk === null) {
	    er = new TypeError('May not write null values to stream');
	  } else if (typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
	    er = new TypeError('Invalid non-string/buffer chunk');
	  }
	  if (er) {
	    stream$$1.emit('error', er);
	    processNextickArgs.nextTick(cb, er);
	    valid = false;
	  }
	  return valid;
	}

	Writable$1.prototype.write = function (chunk, encoding, cb) {
	  var state = this._writableState;
	  var ret = false;
	  var isBuf = !state.objectMode && _isUint8Array(chunk);

	  if (isBuf && !Buffer$4.isBuffer(chunk)) {
	    chunk = _uint8ArrayToBuffer(chunk);
	  }

	  if (typeof encoding === 'function') {
	    cb = encoding;
	    encoding = null;
	  }

	  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

	  if (typeof cb !== 'function') cb = nop;

	  if (state.ended) writeAfterEnd$1(this, cb);else if (isBuf || validChunk$1(this, state, chunk, cb)) {
	    state.pendingcb++;
	    ret = writeOrBuffer$1(this, state, isBuf, chunk, encoding, cb);
	  }

	  return ret;
	};

	Writable$1.prototype.cork = function () {
	  var state = this._writableState;

	  state.corked++;
	};

	Writable$1.prototype.uncork = function () {
	  var state = this._writableState;

	  if (state.corked) {
	    state.corked--;

	    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer$1(this, state);
	  }
	};

	Writable$1.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
	  // node::ParseEncoding() requires lower case.
	  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
	  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
	  this._writableState.defaultEncoding = encoding;
	  return this;
	};

	function decodeChunk$1(state, chunk, encoding) {
	  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
	    chunk = Buffer$4.from(chunk, encoding);
	  }
	  return chunk;
	}

	// if we're already writing something, then just put this
	// in the queue, and wait our turn.  Otherwise, call _write
	// If we return false, then we need a drain event, so set that flag.
	function writeOrBuffer$1(stream$$1, state, isBuf, chunk, encoding, cb) {
	  if (!isBuf) {
	    var newChunk = decodeChunk$1(state, chunk, encoding);
	    if (chunk !== newChunk) {
	      isBuf = true;
	      encoding = 'buffer';
	      chunk = newChunk;
	    }
	  }
	  var len = state.objectMode ? 1 : chunk.length;

	  state.length += len;

	  var ret = state.length < state.highWaterMark;
	  // we must ensure that previous needDrain will not be reset to false.
	  if (!ret) state.needDrain = true;

	  if (state.writing || state.corked) {
	    var last = state.lastBufferedRequest;
	    state.lastBufferedRequest = {
	      chunk: chunk,
	      encoding: encoding,
	      isBuf: isBuf,
	      callback: cb,
	      next: null
	    };
	    if (last) {
	      last.next = state.lastBufferedRequest;
	    } else {
	      state.bufferedRequest = state.lastBufferedRequest;
	    }
	    state.bufferedRequestCount += 1;
	  } else {
	    doWrite$1(stream$$1, state, false, len, chunk, encoding, cb);
	  }

	  return ret;
	}

	function doWrite$1(stream$$1, state, writev, len, chunk, encoding, cb) {
	  state.writelen = len;
	  state.writecb = cb;
	  state.writing = true;
	  state.sync = true;
	  if (writev) stream$$1._writev(chunk, state.onwrite);else stream$$1._write(chunk, encoding, state.onwrite);
	  state.sync = false;
	}

	function onwriteError$1(stream$$1, state, sync, er, cb) {
	  --state.pendingcb;

	  if (sync) {
	    // defer the callback if we are being called synchronously
	    // to avoid piling up things on the stack
	    processNextickArgs.nextTick(cb, er);
	    // this can emit finish, and it will always happen
	    // after error
	    processNextickArgs.nextTick(finishMaybe$1, stream$$1, state);
	    stream$$1._writableState.errorEmitted = true;
	    stream$$1.emit('error', er);
	  } else {
	    // the caller expect this to happen before if
	    // it is async
	    cb(er);
	    stream$$1._writableState.errorEmitted = true;
	    stream$$1.emit('error', er);
	    // this can emit finish, but finish must
	    // always follow error
	    finishMaybe$1(stream$$1, state);
	  }
	}

	function onwriteStateUpdate$1(state) {
	  state.writing = false;
	  state.writecb = null;
	  state.length -= state.writelen;
	  state.writelen = 0;
	}

	function onwrite$1(stream$$1, er) {
	  var state = stream$$1._writableState;
	  var sync = state.sync;
	  var cb = state.writecb;

	  onwriteStateUpdate$1(state);

	  if (er) onwriteError$1(stream$$1, state, sync, er, cb);else {
	    // Check if we're actually ready to finish, but don't emit yet
	    var finished = needFinish$1(state);

	    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
	      clearBuffer$1(stream$$1, state);
	    }

	    if (sync) {
	      /*<replacement>*/
	      asyncWrite(afterWrite$1, stream$$1, state, finished, cb);
	      /*</replacement>*/
	    } else {
	      afterWrite$1(stream$$1, state, finished, cb);
	    }
	  }
	}

	function afterWrite$1(stream$$1, state, finished, cb) {
	  if (!finished) onwriteDrain$1(stream$$1, state);
	  state.pendingcb--;
	  cb();
	  finishMaybe$1(stream$$1, state);
	}

	// Must force callback to be called on nextTick, so that we don't
	// emit 'drain' before the write() consumer gets the 'false' return
	// value, and has a chance to attach a 'drain' listener.
	function onwriteDrain$1(stream$$1, state) {
	  if (state.length === 0 && state.needDrain) {
	    state.needDrain = false;
	    stream$$1.emit('drain');
	  }
	}

	// if there's something in the buffer waiting, then process it
	function clearBuffer$1(stream$$1, state) {
	  state.bufferProcessing = true;
	  var entry = state.bufferedRequest;

	  if (stream$$1._writev && entry && entry.next) {
	    // Fast case, write everything using _writev()
	    var l = state.bufferedRequestCount;
	    var buffer$$1 = new Array(l);
	    var holder = state.corkedRequestsFree;
	    holder.entry = entry;

	    var count = 0;
	    var allBuffers = true;
	    while (entry) {
	      buffer$$1[count] = entry;
	      if (!entry.isBuf) allBuffers = false;
	      entry = entry.next;
	      count += 1;
	    }
	    buffer$$1.allBuffers = allBuffers;

	    doWrite$1(stream$$1, state, true, state.length, buffer$$1, '', holder.finish);

	    // doWrite is almost always async, defer these to save a bit of time
	    // as the hot path ends with doWrite
	    state.pendingcb++;
	    state.lastBufferedRequest = null;
	    if (holder.next) {
	      state.corkedRequestsFree = holder.next;
	      holder.next = null;
	    } else {
	      state.corkedRequestsFree = new CorkedRequest(state);
	    }
	    state.bufferedRequestCount = 0;
	  } else {
	    // Slow case, write chunks one-by-one
	    while (entry) {
	      var chunk = entry.chunk;
	      var encoding = entry.encoding;
	      var cb = entry.callback;
	      var len = state.objectMode ? 1 : chunk.length;

	      doWrite$1(stream$$1, state, false, len, chunk, encoding, cb);
	      entry = entry.next;
	      state.bufferedRequestCount--;
	      // if we didn't call the onwrite immediately, then
	      // it means that we need to wait until it does.
	      // also, that means that the chunk and cb are currently
	      // being processed, so move the buffer counter past them.
	      if (state.writing) {
	        break;
	      }
	    }

	    if (entry === null) state.lastBufferedRequest = null;
	  }

	  state.bufferedRequest = entry;
	  state.bufferProcessing = false;
	}

	Writable$1.prototype._write = function (chunk, encoding, cb) {
	  cb(new Error('_write() is not implemented'));
	};

	Writable$1.prototype._writev = null;

	Writable$1.prototype.end = function (chunk, encoding, cb) {
	  var state = this._writableState;

	  if (typeof chunk === 'function') {
	    cb = chunk;
	    chunk = null;
	    encoding = null;
	  } else if (typeof encoding === 'function') {
	    cb = encoding;
	    encoding = null;
	  }

	  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

	  // .end() fully uncorks
	  if (state.corked) {
	    state.corked = 1;
	    this.uncork();
	  }

	  // ignore unnecessary end() calls.
	  if (!state.ending && !state.finished) endWritable$1(this, state, cb);
	};

	function needFinish$1(state) {
	  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
	}
	function callFinal(stream$$1, state) {
	  stream$$1._final(function (err) {
	    state.pendingcb--;
	    if (err) {
	      stream$$1.emit('error', err);
	    }
	    state.prefinished = true;
	    stream$$1.emit('prefinish');
	    finishMaybe$1(stream$$1, state);
	  });
	}
	function prefinish(stream$$1, state) {
	  if (!state.prefinished && !state.finalCalled) {
	    if (typeof stream$$1._final === 'function') {
	      state.pendingcb++;
	      state.finalCalled = true;
	      processNextickArgs.nextTick(callFinal, stream$$1, state);
	    } else {
	      state.prefinished = true;
	      stream$$1.emit('prefinish');
	    }
	  }
	}

	function finishMaybe$1(stream$$1, state) {
	  var need = needFinish$1(state);
	  if (need) {
	    prefinish(stream$$1, state);
	    if (state.pendingcb === 0) {
	      state.finished = true;
	      stream$$1.emit('finish');
	    }
	  }
	  return need;
	}

	function endWritable$1(stream$$1, state, cb) {
	  state.ending = true;
	  finishMaybe$1(stream$$1, state);
	  if (cb) {
	    if (state.finished) processNextickArgs.nextTick(cb);else stream$$1.once('finish', cb);
	  }
	  state.ended = true;
	  stream$$1.writable = false;
	}

	function onCorkedFinish(corkReq, state, err) {
	  var entry = corkReq.entry;
	  corkReq.entry = null;
	  while (entry) {
	    var cb = entry.callback;
	    state.pendingcb--;
	    cb(err);
	    entry = entry.next;
	  }
	  if (state.corkedRequestsFree) {
	    state.corkedRequestsFree.next = corkReq;
	  } else {
	    state.corkedRequestsFree = corkReq;
	  }
	}

	Object.defineProperty(Writable$1.prototype, 'destroyed', {
	  get: function () {
	    if (this._writableState === undefined) {
	      return false;
	    }
	    return this._writableState.destroyed;
	  },
	  set: function (value) {
	    // we ignore the value if the stream
	    // has not been initialized yet
	    if (!this._writableState) {
	      return;
	    }

	    // backward compatibility, the user is explicitly
	    // managing destroyed
	    this._writableState.destroyed = value;
	  }
	});

	Writable$1.prototype.destroy = destroy_1.destroy;
	Writable$1.prototype._undestroy = destroy_1.undestroy;
	Writable$1.prototype._destroy = function (err, cb) {
	  this.end();
	  cb(err);
	};

	/*<replacement>*/


	/*</replacement>*/

	/*<replacement>*/
	var objectKeys$1 = Object.keys || function (obj) {
	  var keys = [];
	  for (var key in obj) {
	    keys.push(key);
	  }return keys;
	};
	/*</replacement>*/

	var _stream_duplex$1 = Duplex$2;

	/*<replacement>*/

	util$1.inherits = inherits;
	/*</replacement>*/




	util$1.inherits(Duplex$2, _stream_readable$1);

	var keys = objectKeys$1(_stream_writable$1.prototype);
	for (var v = 0; v < keys.length; v++) {
	  var method = keys[v];
	  if (!Duplex$2.prototype[method]) Duplex$2.prototype[method] = _stream_writable$1.prototype[method];
	}

	function Duplex$2(options) {
	  if (!(this instanceof Duplex$2)) return new Duplex$2(options);

	  _stream_readable$1.call(this, options);
	  _stream_writable$1.call(this, options);

	  if (options && options.readable === false) this.readable = false;

	  if (options && options.writable === false) this.writable = false;

	  this.allowHalfOpen = true;
	  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

	  this.once('end', onend$1);
	}

	// the no-half-open enforcer
	function onend$1() {
	  // if we allow half-open state, or if the writable side ended,
	  // then we're ok.
	  if (this.allowHalfOpen || this._writableState.ended) return;

	  // no more data can be written.
	  // But allow more writes to happen in this tick.
	  processNextickArgs.nextTick(onEndNT, this);
	}

	function onEndNT(self) {
	  self.end();
	}

	Object.defineProperty(Duplex$2.prototype, 'destroyed', {
	  get: function () {
	    if (this._readableState === undefined || this._writableState === undefined) {
	      return false;
	    }
	    return this._readableState.destroyed && this._writableState.destroyed;
	  },
	  set: function (value) {
	    // we ignore the value if the stream
	    // has not been initialized yet
	    if (this._readableState === undefined || this._writableState === undefined) {
	      return;
	    }

	    // backward compatibility, the user is explicitly
	    // managing destroyed
	    this._readableState.destroyed = value;
	    this._writableState.destroyed = value;
	  }
	});

	Duplex$2.prototype._destroy = function (err, cb) {
	  this.push(null);
	  this.end();

	  processNextickArgs.nextTick(cb, err);
	};

	var Buffer$5 = safeBuffer.Buffer;

	var isEncoding = Buffer$5.isEncoding || function (encoding) {
	  encoding = '' + encoding;
	  switch (encoding && encoding.toLowerCase()) {
	    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
	      return true;
	    default:
	      return false;
	  }
	};

	function _normalizeEncoding(enc) {
	  if (!enc) return 'utf8';
	  var retried;
	  while (true) {
	    switch (enc) {
	      case 'utf8':
	      case 'utf-8':
	        return 'utf8';
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return 'utf16le';
	      case 'latin1':
	      case 'binary':
	        return 'latin1';
	      case 'base64':
	      case 'ascii':
	      case 'hex':
	        return enc;
	      default:
	        if (retried) return; // undefined
	        enc = ('' + enc).toLowerCase();
	        retried = true;
	    }
	  }
	}
	// Do not cache `Buffer.isEncoding` when checking encoding names as some
	// modules monkey-patch it to support additional encodings
	function normalizeEncoding(enc) {
	  var nenc = _normalizeEncoding(enc);
	  if (typeof nenc !== 'string' && (Buffer$5.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
	  return nenc || enc;
	}

	// StringDecoder provides an interface for efficiently splitting a series of
	// buffers into a series of JS strings without breaking apart multi-byte
	// characters.
	var StringDecoder_1 = StringDecoder$1;
	function StringDecoder$1(encoding) {
	  this.encoding = normalizeEncoding(encoding);
	  var nb;
	  switch (this.encoding) {
	    case 'utf16le':
	      this.text = utf16Text;
	      this.end = utf16End;
	      nb = 4;
	      break;
	    case 'utf8':
	      this.fillLast = utf8FillLast;
	      nb = 4;
	      break;
	    case 'base64':
	      this.text = base64Text;
	      this.end = base64End;
	      nb = 3;
	      break;
	    default:
	      this.write = simpleWrite;
	      this.end = simpleEnd;
	      return;
	  }
	  this.lastNeed = 0;
	  this.lastTotal = 0;
	  this.lastChar = Buffer$5.allocUnsafe(nb);
	}

	StringDecoder$1.prototype.write = function (buf) {
	  if (buf.length === 0) return '';
	  var r;
	  var i;
	  if (this.lastNeed) {
	    r = this.fillLast(buf);
	    if (r === undefined) return '';
	    i = this.lastNeed;
	    this.lastNeed = 0;
	  } else {
	    i = 0;
	  }
	  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
	  return r || '';
	};

	StringDecoder$1.prototype.end = utf8End;

	// Returns only complete characters in a Buffer
	StringDecoder$1.prototype.text = utf8Text;

	// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
	StringDecoder$1.prototype.fillLast = function (buf) {
	  if (this.lastNeed <= buf.length) {
	    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
	    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
	  }
	  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
	  this.lastNeed -= buf.length;
	};

	// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
	// continuation byte.
	function utf8CheckByte(byte) {
	  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
	  return -1;
	}

	// Checks at most 3 bytes at the end of a Buffer in order to detect an
	// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
	// needed to complete the UTF-8 character (if applicable) are returned.
	function utf8CheckIncomplete(self, buf, i) {
	  var j = buf.length - 1;
	  if (j < i) return 0;
	  var nb = utf8CheckByte(buf[j]);
	  if (nb >= 0) {
	    if (nb > 0) self.lastNeed = nb - 1;
	    return nb;
	  }
	  if (--j < i) return 0;
	  nb = utf8CheckByte(buf[j]);
	  if (nb >= 0) {
	    if (nb > 0) self.lastNeed = nb - 2;
	    return nb;
	  }
	  if (--j < i) return 0;
	  nb = utf8CheckByte(buf[j]);
	  if (nb >= 0) {
	    if (nb > 0) {
	      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
	    }
	    return nb;
	  }
	  return 0;
	}

	// Validates as many continuation bytes for a multi-byte UTF-8 character as
	// needed or are available. If we see a non-continuation byte where we expect
	// one, we "replace" the validated continuation bytes we've seen so far with
	// UTF-8 replacement characters ('\ufffd'), to match v8's UTF-8 decoding
	// behavior. The continuation byte check is included three times in the case
	// where all of the continuation bytes for a character exist in the same buffer.
	// It is also done this way as a slight performance increase instead of using a
	// loop.
	function utf8CheckExtraBytes(self, buf, p) {
	  if ((buf[0] & 0xC0) !== 0x80) {
	    self.lastNeed = 0;
	    return '\ufffd'.repeat(p);
	  }
	  if (self.lastNeed > 1 && buf.length > 1) {
	    if ((buf[1] & 0xC0) !== 0x80) {
	      self.lastNeed = 1;
	      return '\ufffd'.repeat(p + 1);
	    }
	    if (self.lastNeed > 2 && buf.length > 2) {
	      if ((buf[2] & 0xC0) !== 0x80) {
	        self.lastNeed = 2;
	        return '\ufffd'.repeat(p + 2);
	      }
	    }
	  }
	}

	// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
	function utf8FillLast(buf) {
	  var p = this.lastTotal - this.lastNeed;
	  var r = utf8CheckExtraBytes(this, buf, p);
	  if (r !== undefined) return r;
	  if (this.lastNeed <= buf.length) {
	    buf.copy(this.lastChar, p, 0, this.lastNeed);
	    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
	  }
	  buf.copy(this.lastChar, p, 0, buf.length);
	  this.lastNeed -= buf.length;
	}

	// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
	// partial character, the character's bytes are buffered until the required
	// number of bytes are available.
	function utf8Text(buf, i) {
	  var total = utf8CheckIncomplete(this, buf, i);
	  if (!this.lastNeed) return buf.toString('utf8', i);
	  this.lastTotal = total;
	  var end = buf.length - (total - this.lastNeed);
	  buf.copy(this.lastChar, 0, end);
	  return buf.toString('utf8', i, end);
	}

	// For UTF-8, a replacement character for each buffered byte of a (partial)
	// character needs to be added to the output.
	function utf8End(buf) {
	  var r = buf && buf.length ? this.write(buf) : '';
	  if (this.lastNeed) return r + '\ufffd'.repeat(this.lastTotal - this.lastNeed);
	  return r;
	}

	// UTF-16LE typically needs two bytes per character, but even if we have an even
	// number of bytes available, we need to check if we end on a leading/high
	// surrogate. In that case, we need to wait for the next two bytes in order to
	// decode the last character properly.
	function utf16Text(buf, i) {
	  if ((buf.length - i) % 2 === 0) {
	    var r = buf.toString('utf16le', i);
	    if (r) {
	      var c = r.charCodeAt(r.length - 1);
	      if (c >= 0xD800 && c <= 0xDBFF) {
	        this.lastNeed = 2;
	        this.lastTotal = 4;
	        this.lastChar[0] = buf[buf.length - 2];
	        this.lastChar[1] = buf[buf.length - 1];
	        return r.slice(0, -1);
	      }
	    }
	    return r;
	  }
	  this.lastNeed = 1;
	  this.lastTotal = 2;
	  this.lastChar[0] = buf[buf.length - 1];
	  return buf.toString('utf16le', i, buf.length - 1);
	}

	// For UTF-16LE we do not explicitly append special replacement characters if we
	// end on a partial character, we simply let v8 handle that.
	function utf16End(buf) {
	  var r = buf && buf.length ? this.write(buf) : '';
	  if (this.lastNeed) {
	    var end = this.lastTotal - this.lastNeed;
	    return r + this.lastChar.toString('utf16le', 0, end);
	  }
	  return r;
	}

	function base64Text(buf, i) {
	  var n = (buf.length - i) % 3;
	  if (n === 0) return buf.toString('base64', i);
	  this.lastNeed = 3 - n;
	  this.lastTotal = 3;
	  if (n === 1) {
	    this.lastChar[0] = buf[buf.length - 1];
	  } else {
	    this.lastChar[0] = buf[buf.length - 2];
	    this.lastChar[1] = buf[buf.length - 1];
	  }
	  return buf.toString('base64', i, buf.length - n);
	}

	function base64End(buf) {
	  var r = buf && buf.length ? this.write(buf) : '';
	  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
	  return r;
	}

	// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
	function simpleWrite(buf) {
	  return buf.toString(this.encoding);
	}

	function simpleEnd(buf) {
	  return buf && buf.length ? this.write(buf) : '';
	}

	var string_decoder$1 = {
		StringDecoder: StringDecoder_1
	};

	/*<replacement>*/


	/*</replacement>*/

	var _stream_readable$1 = Readable$1;

	/*<replacement>*/

	/*</replacement>*/

	/*<replacement>*/
	var Duplex$3;
	/*</replacement>*/

	Readable$1.ReadableState = ReadableState$1;

	/*<replacement>*/
	var EE$1 = events__default.EventEmitter;

	var EElistenerCount = function (emitter, type) {
	  return emitter.listeners(type).length;
	};
	/*</replacement>*/

	/*<replacement>*/

	/*</replacement>*/

	/*<replacement>*/

	var Buffer$6 = safeBuffer.Buffer;
	var OurUint8Array$1 = commonjsGlobal.Uint8Array || function () {};
	function _uint8ArrayToBuffer$1(chunk) {
	  return Buffer$6.from(chunk);
	}
	function _isUint8Array$1(obj) {
	  return Buffer$6.isBuffer(obj) || obj instanceof OurUint8Array$1;
	}

	/*</replacement>*/

	/*<replacement>*/

	util$1.inherits = inherits;
	/*</replacement>*/

	/*<replacement>*/

	var debug$1 = void 0;
	if (util && util.debuglog) {
	  debug$1 = util.debuglog('stream');
	} else {
	  debug$1 = function () {};
	}
	/*</replacement>*/



	var StringDecoder$2;

	util$1.inherits(Readable$1, stream);

	var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

	function prependListener(emitter, event, fn) {
	  // Sadly this is not cacheable as some libraries bundle their own
	  // event emitter implementation with them.
	  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn);

	  // This is a hack to make sure that our error handler is attached before any
	  // userland ones.  NEVER DO THIS. This is here only because this code needs
	  // to continue to work with older versions of Node.js that do not include
	  // the prependListener() method. The goal is to eventually remove this hack.
	  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isarray$1(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
	}

	function ReadableState$1(options, stream$$1) {
	  Duplex$3 = Duplex$3 || _stream_duplex$1;

	  options = options || {};

	  // Duplex streams are both readable and writable, but share
	  // the same options object.
	  // However, some cases require setting options to different
	  // values for the readable and the writable sides of the duplex stream.
	  // These options can be provided separately as readableXXX and writableXXX.
	  var isDuplex = stream$$1 instanceof Duplex$3;

	  // object stream flag. Used to make read(n) ignore n and to
	  // make all the buffer merging and length checks go away
	  this.objectMode = !!options.objectMode;

	  if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

	  // the point at which it stops calling _read() to fill the buffer
	  // Note: 0 is a valid value, means "don't call _read preemptively ever"
	  var hwm = options.highWaterMark;
	  var readableHwm = options.readableHighWaterMark;
	  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

	  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (readableHwm || readableHwm === 0)) this.highWaterMark = readableHwm;else this.highWaterMark = defaultHwm;

	  // cast to ints.
	  this.highWaterMark = Math.floor(this.highWaterMark);

	  // A linked list is used to store data chunks instead of an array because the
	  // linked list can remove elements from the beginning faster than
	  // array.shift()
	  this.buffer = new BufferList();
	  this.length = 0;
	  this.pipes = null;
	  this.pipesCount = 0;
	  this.flowing = null;
	  this.ended = false;
	  this.endEmitted = false;
	  this.reading = false;

	  // a flag to be able to tell if the event 'readable'/'data' is emitted
	  // immediately, or on a later tick.  We set this to true at first, because
	  // any actions that shouldn't happen until "later" should generally also
	  // not happen before the first read call.
	  this.sync = true;

	  // whenever we return null, then we set a flag to say
	  // that we're awaiting a 'readable' event emission.
	  this.needReadable = false;
	  this.emittedReadable = false;
	  this.readableListening = false;
	  this.resumeScheduled = false;

	  // has it been destroyed
	  this.destroyed = false;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = options.defaultEncoding || 'utf8';

	  // the number of writers that are awaiting a drain event in .pipe()s
	  this.awaitDrain = 0;

	  // if true, a maybeReadMore has been scheduled
	  this.readingMore = false;

	  this.decoder = null;
	  this.encoding = null;
	  if (options.encoding) {
	    if (!StringDecoder$2) StringDecoder$2 = string_decoder$1.StringDecoder;
	    this.decoder = new StringDecoder$2(options.encoding);
	    this.encoding = options.encoding;
	  }
	}

	function Readable$1(options) {
	  Duplex$3 = Duplex$3 || _stream_duplex$1;

	  if (!(this instanceof Readable$1)) return new Readable$1(options);

	  this._readableState = new ReadableState$1(options, this);

	  // legacy
	  this.readable = true;

	  if (options) {
	    if (typeof options.read === 'function') this._read = options.read;

	    if (typeof options.destroy === 'function') this._destroy = options.destroy;
	  }

	  stream.call(this);
	}

	Object.defineProperty(Readable$1.prototype, 'destroyed', {
	  get: function () {
	    if (this._readableState === undefined) {
	      return false;
	    }
	    return this._readableState.destroyed;
	  },
	  set: function (value) {
	    // we ignore the value if the stream
	    // has not been initialized yet
	    if (!this._readableState) {
	      return;
	    }

	    // backward compatibility, the user is explicitly
	    // managing destroyed
	    this._readableState.destroyed = value;
	  }
	});

	Readable$1.prototype.destroy = destroy_1.destroy;
	Readable$1.prototype._undestroy = destroy_1.undestroy;
	Readable$1.prototype._destroy = function (err, cb) {
	  this.push(null);
	  cb(err);
	};

	// Manually shove something into the read() buffer.
	// This returns true if the highWaterMark has not been hit yet,
	// similar to how Writable.write() returns true if you should
	// write() some more.
	Readable$1.prototype.push = function (chunk, encoding) {
	  var state = this._readableState;
	  var skipChunkCheck;

	  if (!state.objectMode) {
	    if (typeof chunk === 'string') {
	      encoding = encoding || state.defaultEncoding;
	      if (encoding !== state.encoding) {
	        chunk = Buffer$6.from(chunk, encoding);
	        encoding = '';
	      }
	      skipChunkCheck = true;
	    }
	  } else {
	    skipChunkCheck = true;
	  }

	  return readableAddChunk$1(this, chunk, encoding, false, skipChunkCheck);
	};

	// Unshift should *always* be something directly out of read()
	Readable$1.prototype.unshift = function (chunk) {
	  return readableAddChunk$1(this, chunk, null, true, false);
	};

	function readableAddChunk$1(stream$$1, chunk, encoding, addToFront, skipChunkCheck) {
	  var state = stream$$1._readableState;
	  if (chunk === null) {
	    state.reading = false;
	    onEofChunk$1(stream$$1, state);
	  } else {
	    var er;
	    if (!skipChunkCheck) er = chunkInvalid$1(state, chunk);
	    if (er) {
	      stream$$1.emit('error', er);
	    } else if (state.objectMode || chunk && chunk.length > 0) {
	      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer$6.prototype) {
	        chunk = _uint8ArrayToBuffer$1(chunk);
	      }

	      if (addToFront) {
	        if (state.endEmitted) stream$$1.emit('error', new Error('stream.unshift() after end event'));else addChunk(stream$$1, state, chunk, true);
	      } else if (state.ended) {
	        stream$$1.emit('error', new Error('stream.push() after EOF'));
	      } else {
	        state.reading = false;
	        if (state.decoder && !encoding) {
	          chunk = state.decoder.write(chunk);
	          if (state.objectMode || chunk.length !== 0) addChunk(stream$$1, state, chunk, false);else maybeReadMore$1(stream$$1, state);
	        } else {
	          addChunk(stream$$1, state, chunk, false);
	        }
	      }
	    } else if (!addToFront) {
	      state.reading = false;
	    }
	  }

	  return needMoreData$1(state);
	}

	function addChunk(stream$$1, state, chunk, addToFront) {
	  if (state.flowing && state.length === 0 && !state.sync) {
	    stream$$1.emit('data', chunk);
	    stream$$1.read(0);
	  } else {
	    // update the buffer info.
	    state.length += state.objectMode ? 1 : chunk.length;
	    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

	    if (state.needReadable) emitReadable$1(stream$$1);
	  }
	  maybeReadMore$1(stream$$1, state);
	}

	function chunkInvalid$1(state, chunk) {
	  var er;
	  if (!_isUint8Array$1(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
	    er = new TypeError('Invalid non-string/buffer chunk');
	  }
	  return er;
	}

	// if it's past the high water mark, we can push in some more.
	// Also, if we have no data yet, we can stand some
	// more bytes.  This is to work around cases where hwm=0,
	// such as the repl.  Also, if the push() triggered a
	// readable event, and the user called read(largeNumber) such that
	// needReadable was set, then we ought to push more, so that another
	// 'readable' event will be triggered.
	function needMoreData$1(state) {
	  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
	}

	Readable$1.prototype.isPaused = function () {
	  return this._readableState.flowing === false;
	};

	// backwards compatibility.
	Readable$1.prototype.setEncoding = function (enc) {
	  if (!StringDecoder$2) StringDecoder$2 = string_decoder$1.StringDecoder;
	  this._readableState.decoder = new StringDecoder$2(enc);
	  this._readableState.encoding = enc;
	  return this;
	};

	// Don't raise the hwm > 8MB
	var MAX_HWM$1 = 0x800000;
	function computeNewHighWaterMark(n) {
	  if (n >= MAX_HWM$1) {
	    n = MAX_HWM$1;
	  } else {
	    // Get the next highest power of 2 to prevent increasing hwm excessively in
	    // tiny amounts
	    n--;
	    n |= n >>> 1;
	    n |= n >>> 2;
	    n |= n >>> 4;
	    n |= n >>> 8;
	    n |= n >>> 16;
	    n++;
	  }
	  return n;
	}

	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function howMuchToRead$1(n, state) {
	  if (n <= 0 || state.length === 0 && state.ended) return 0;
	  if (state.objectMode) return 1;
	  if (n !== n) {
	    // Only flow one buffer at a time
	    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
	  }
	  // If we're asking for more than the current hwm, then raise the hwm.
	  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
	  if (n <= state.length) return n;
	  // Don't have enough
	  if (!state.ended) {
	    state.needReadable = true;
	    return 0;
	  }
	  return state.length;
	}

	// you can override either this method, or the async _read(n) below.
	Readable$1.prototype.read = function (n) {
	  debug$1('read', n);
	  n = parseInt(n, 10);
	  var state = this._readableState;
	  var nOrig = n;

	  if (n !== 0) state.emittedReadable = false;

	  // if we're doing read(0) to trigger a readable event, but we
	  // already have a bunch of data in the buffer, then just trigger
	  // the 'readable' event and move on.
	  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
	    debug$1('read: emitReadable', state.length, state.ended);
	    if (state.length === 0 && state.ended) endReadable$1(this);else emitReadable$1(this);
	    return null;
	  }

	  n = howMuchToRead$1(n, state);

	  // if we've ended, and we're now clear, then finish it up.
	  if (n === 0 && state.ended) {
	    if (state.length === 0) endReadable$1(this);
	    return null;
	  }

	  // All the actual chunk generation logic needs to be
	  // *below* the call to _read.  The reason is that in certain
	  // synthetic stream cases, such as passthrough streams, _read
	  // may be a completely synchronous operation which may change
	  // the state of the read buffer, providing enough data when
	  // before there was *not* enough.
	  //
	  // So, the steps are:
	  // 1. Figure out what the state of things will be after we do
	  // a read from the buffer.
	  //
	  // 2. If that resulting state will trigger a _read, then call _read.
	  // Note that this may be asynchronous, or synchronous.  Yes, it is
	  // deeply ugly to write APIs this way, but that still doesn't mean
	  // that the Readable class should behave improperly, as streams are
	  // designed to be sync/async agnostic.
	  // Take note if the _read call is sync or async (ie, if the read call
	  // has returned yet), so that we know whether or not it's safe to emit
	  // 'readable' etc.
	  //
	  // 3. Actually pull the requested chunks out of the buffer and return.

	  // if we need a readable event, then we need to do some reading.
	  var doRead = state.needReadable;
	  debug$1('need readable', doRead);

	  // if we currently have less than the highWaterMark, then also read some
	  if (state.length === 0 || state.length - n < state.highWaterMark) {
	    doRead = true;
	    debug$1('length less than watermark', doRead);
	  }

	  // however, if we've ended, then there's no point, and if we're already
	  // reading, then it's unnecessary.
	  if (state.ended || state.reading) {
	    doRead = false;
	    debug$1('reading or ended', doRead);
	  } else if (doRead) {
	    debug$1('do read');
	    state.reading = true;
	    state.sync = true;
	    // if the length is currently zero, then we *need* a readable event.
	    if (state.length === 0) state.needReadable = true;
	    // call internal read method
	    this._read(state.highWaterMark);
	    state.sync = false;
	    // If _read pushed data synchronously, then `reading` will be false,
	    // and we need to re-evaluate how much data we can return to the user.
	    if (!state.reading) n = howMuchToRead$1(nOrig, state);
	  }

	  var ret;
	  if (n > 0) ret = fromList$1(n, state);else ret = null;

	  if (ret === null) {
	    state.needReadable = true;
	    n = 0;
	  } else {
	    state.length -= n;
	  }

	  if (state.length === 0) {
	    // If we have nothing in the buffer, then we want to know
	    // as soon as we *do* get something into the buffer.
	    if (!state.ended) state.needReadable = true;

	    // If we tried to read() past the EOF, then emit end on the next tick.
	    if (nOrig !== n && state.ended) endReadable$1(this);
	  }

	  if (ret !== null) this.emit('data', ret);

	  return ret;
	};

	function onEofChunk$1(stream$$1, state) {
	  if (state.ended) return;
	  if (state.decoder) {
	    var chunk = state.decoder.end();
	    if (chunk && chunk.length) {
	      state.buffer.push(chunk);
	      state.length += state.objectMode ? 1 : chunk.length;
	    }
	  }
	  state.ended = true;

	  // emit 'readable' now to make sure it gets picked up.
	  emitReadable$1(stream$$1);
	}

	// Don't emit readable right away in sync mode, because this can trigger
	// another read() call => stack overflow.  This way, it might trigger
	// a nextTick recursion warning, but that's not so bad.
	function emitReadable$1(stream$$1) {
	  var state = stream$$1._readableState;
	  state.needReadable = false;
	  if (!state.emittedReadable) {
	    debug$1('emitReadable', state.flowing);
	    state.emittedReadable = true;
	    if (state.sync) processNextickArgs.nextTick(emitReadable_$1, stream$$1);else emitReadable_$1(stream$$1);
	  }
	}

	function emitReadable_$1(stream$$1) {
	  debug$1('emit readable');
	  stream$$1.emit('readable');
	  flow$1(stream$$1);
	}

	// at this point, the user has presumably seen the 'readable' event,
	// and called read() to consume some data.  that may have triggered
	// in turn another _read(n) call, in which case reading = true if
	// it's in progress.
	// However, if we're not ended, or reading, and the length < hwm,
	// then go ahead and try to read some more preemptively.
	function maybeReadMore$1(stream$$1, state) {
	  if (!state.readingMore) {
	    state.readingMore = true;
	    processNextickArgs.nextTick(maybeReadMore_$1, stream$$1, state);
	  }
	}

	function maybeReadMore_$1(stream$$1, state) {
	  var len = state.length;
	  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
	    debug$1('maybeReadMore read 0');
	    stream$$1.read(0);
	    if (len === state.length)
	      // didn't get any data, stop spinning.
	      break;else len = state.length;
	  }
	  state.readingMore = false;
	}

	// abstract method.  to be overridden in specific implementation classes.
	// call cb(er, data) where data is <= n in length.
	// for virtual (non-string, non-buffer) streams, "length" is somewhat
	// arbitrary, and perhaps not very meaningful.
	Readable$1.prototype._read = function (n) {
	  this.emit('error', new Error('_read() is not implemented'));
	};

	Readable$1.prototype.pipe = function (dest, pipeOpts) {
	  var src = this;
	  var state = this._readableState;

	  switch (state.pipesCount) {
	    case 0:
	      state.pipes = dest;
	      break;
	    case 1:
	      state.pipes = [state.pipes, dest];
	      break;
	    default:
	      state.pipes.push(dest);
	      break;
	  }
	  state.pipesCount += 1;
	  debug$1('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

	  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

	  var endFn = doEnd ? onend : unpipe;
	  if (state.endEmitted) processNextickArgs.nextTick(endFn);else src.once('end', endFn);

	  dest.on('unpipe', onunpipe);
	  function onunpipe(readable, unpipeInfo) {
	    debug$1('onunpipe');
	    if (readable === src) {
	      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
	        unpipeInfo.hasUnpiped = true;
	        cleanup();
	      }
	    }
	  }

	  function onend() {
	    debug$1('onend');
	    dest.end();
	  }

	  // when the dest drains, it reduces the awaitDrain counter
	  // on the source.  This would be more elegant with a .once()
	  // handler in flow(), but adding and removing repeatedly is
	  // too slow.
	  var ondrain = pipeOnDrain$1(src);
	  dest.on('drain', ondrain);

	  var cleanedUp = false;
	  function cleanup() {
	    debug$1('cleanup');
	    // cleanup event handlers once the pipe is broken
	    dest.removeListener('close', onclose);
	    dest.removeListener('finish', onfinish);
	    dest.removeListener('drain', ondrain);
	    dest.removeListener('error', onerror);
	    dest.removeListener('unpipe', onunpipe);
	    src.removeListener('end', onend);
	    src.removeListener('end', unpipe);
	    src.removeListener('data', ondata);

	    cleanedUp = true;

	    // if the reader is waiting for a drain event from this
	    // specific writer, then it would cause it to never start
	    // flowing again.
	    // So, if this is awaiting a drain, then we just call it now.
	    // If we don't know, then assume that we are waiting for one.
	    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
	  }

	  // If the user pushes more data while we're writing to dest then we'll end up
	  // in ondata again. However, we only want to increase awaitDrain once because
	  // dest will only emit one 'drain' event for the multiple writes.
	  // => Introduce a guard on increasing awaitDrain.
	  var increasedAwaitDrain = false;
	  src.on('data', ondata);
	  function ondata(chunk) {
	    debug$1('ondata');
	    increasedAwaitDrain = false;
	    var ret = dest.write(chunk);
	    if (false === ret && !increasedAwaitDrain) {
	      // If the user unpiped during `dest.write()`, it is possible
	      // to get stuck in a permanently paused state if that write
	      // also returned false.
	      // => Check whether `dest` is still a piping destination.
	      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf$1(state.pipes, dest) !== -1) && !cleanedUp) {
	        debug$1('false write response, pause', src._readableState.awaitDrain);
	        src._readableState.awaitDrain++;
	        increasedAwaitDrain = true;
	      }
	      src.pause();
	    }
	  }

	  // if the dest has an error, then stop piping into it.
	  // however, don't suppress the throwing behavior for this.
	  function onerror(er) {
	    debug$1('onerror', er);
	    unpipe();
	    dest.removeListener('error', onerror);
	    if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
	  }

	  // Make sure our error handler is attached before userland ones.
	  prependListener(dest, 'error', onerror);

	  // Both close and finish should trigger unpipe, but only once.
	  function onclose() {
	    dest.removeListener('finish', onfinish);
	    unpipe();
	  }
	  dest.once('close', onclose);
	  function onfinish() {
	    debug$1('onfinish');
	    dest.removeListener('close', onclose);
	    unpipe();
	  }
	  dest.once('finish', onfinish);

	  function unpipe() {
	    debug$1('unpipe');
	    src.unpipe(dest);
	  }

	  // tell the dest that it's being piped to
	  dest.emit('pipe', src);

	  // start the flow if it hasn't been started already.
	  if (!state.flowing) {
	    debug$1('pipe resume');
	    src.resume();
	  }

	  return dest;
	};

	function pipeOnDrain$1(src) {
	  return function () {
	    var state = src._readableState;
	    debug$1('pipeOnDrain', state.awaitDrain);
	    if (state.awaitDrain) state.awaitDrain--;
	    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
	      state.flowing = true;
	      flow$1(src);
	    }
	  };
	}

	Readable$1.prototype.unpipe = function (dest) {
	  var state = this._readableState;
	  var unpipeInfo = { hasUnpiped: false };

	  // if we're not piping anywhere, then do nothing.
	  if (state.pipesCount === 0) return this;

	  // just one destination.  most common case.
	  if (state.pipesCount === 1) {
	    // passed in one, but it's not the right one.
	    if (dest && dest !== state.pipes) return this;

	    if (!dest) dest = state.pipes;

	    // got a match.
	    state.pipes = null;
	    state.pipesCount = 0;
	    state.flowing = false;
	    if (dest) dest.emit('unpipe', this, unpipeInfo);
	    return this;
	  }

	  // slow case. multiple pipe destinations.

	  if (!dest) {
	    // remove all.
	    var dests = state.pipes;
	    var len = state.pipesCount;
	    state.pipes = null;
	    state.pipesCount = 0;
	    state.flowing = false;

	    for (var i = 0; i < len; i++) {
	      dests[i].emit('unpipe', this, unpipeInfo);
	    }return this;
	  }

	  // try to find the right one.
	  var index = indexOf$1(state.pipes, dest);
	  if (index === -1) return this;

	  state.pipes.splice(index, 1);
	  state.pipesCount -= 1;
	  if (state.pipesCount === 1) state.pipes = state.pipes[0];

	  dest.emit('unpipe', this, unpipeInfo);

	  return this;
	};

	// set up data events if they are asked for
	// Ensure readable listeners eventually get something
	Readable$1.prototype.on = function (ev, fn) {
	  var res = stream.prototype.on.call(this, ev, fn);

	  if (ev === 'data') {
	    // Start flowing on next tick if stream isn't explicitly paused
	    if (this._readableState.flowing !== false) this.resume();
	  } else if (ev === 'readable') {
	    var state = this._readableState;
	    if (!state.endEmitted && !state.readableListening) {
	      state.readableListening = state.needReadable = true;
	      state.emittedReadable = false;
	      if (!state.reading) {
	        processNextickArgs.nextTick(nReadingNextTick, this);
	      } else if (state.length) {
	        emitReadable$1(this);
	      }
	    }
	  }

	  return res;
	};
	Readable$1.prototype.addListener = Readable$1.prototype.on;

	function nReadingNextTick(self) {
	  debug$1('readable nexttick read 0');
	  self.read(0);
	}

	// pause() and resume() are remnants of the legacy readable stream API
	// If the user uses them, then switch into old mode.
	Readable$1.prototype.resume = function () {
	  var state = this._readableState;
	  if (!state.flowing) {
	    debug$1('resume');
	    state.flowing = true;
	    resume(this, state);
	  }
	  return this;
	};

	function resume(stream$$1, state) {
	  if (!state.resumeScheduled) {
	    state.resumeScheduled = true;
	    processNextickArgs.nextTick(resume_, stream$$1, state);
	  }
	}

	function resume_(stream$$1, state) {
	  if (!state.reading) {
	    debug$1('resume read 0');
	    stream$$1.read(0);
	  }

	  state.resumeScheduled = false;
	  state.awaitDrain = 0;
	  stream$$1.emit('resume');
	  flow$1(stream$$1);
	  if (state.flowing && !state.reading) stream$$1.read(0);
	}

	Readable$1.prototype.pause = function () {
	  debug$1('call pause flowing=%j', this._readableState.flowing);
	  if (false !== this._readableState.flowing) {
	    debug$1('pause');
	    this._readableState.flowing = false;
	    this.emit('pause');
	  }
	  return this;
	};

	function flow$1(stream$$1) {
	  var state = stream$$1._readableState;
	  debug$1('flow', state.flowing);
	  while (state.flowing && stream$$1.read() !== null) {}
	}

	// wrap an old-style stream as the async data source.
	// This is *not* part of the readable stream interface.
	// It is an ugly unfortunate mess of history.
	Readable$1.prototype.wrap = function (stream$$1) {
	  var _this = this;

	  var state = this._readableState;
	  var paused = false;

	  stream$$1.on('end', function () {
	    debug$1('wrapped end');
	    if (state.decoder && !state.ended) {
	      var chunk = state.decoder.end();
	      if (chunk && chunk.length) _this.push(chunk);
	    }

	    _this.push(null);
	  });

	  stream$$1.on('data', function (chunk) {
	    debug$1('wrapped data');
	    if (state.decoder) chunk = state.decoder.write(chunk);

	    // don't skip over falsy values in objectMode
	    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

	    var ret = _this.push(chunk);
	    if (!ret) {
	      paused = true;
	      stream$$1.pause();
	    }
	  });

	  // proxy all the other methods.
	  // important when wrapping filters and duplexes.
	  for (var i in stream$$1) {
	    if (this[i] === undefined && typeof stream$$1[i] === 'function') {
	      this[i] = function (method) {
	        return function () {
	          return stream$$1[method].apply(stream$$1, arguments);
	        };
	      }(i);
	    }
	  }

	  // proxy certain important events.
	  for (var n = 0; n < kProxyEvents.length; n++) {
	    stream$$1.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
	  }

	  // when we try to consume some more bytes, simply unpause the
	  // underlying stream.
	  this._read = function (n) {
	    debug$1('wrapped _read', n);
	    if (paused) {
	      paused = false;
	      stream$$1.resume();
	    }
	  };

	  return this;
	};

	// exposed for testing purposes only.
	Readable$1._fromList = fromList$1;

	// Pluck off n bytes from an array of buffers.
	// Length is the combined lengths of all the buffers in the list.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function fromList$1(n, state) {
	  // nothing buffered
	  if (state.length === 0) return null;

	  var ret;
	  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
	    // read it all, truncate the list
	    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
	    state.buffer.clear();
	  } else {
	    // read part of list
	    ret = fromListPartial(n, state.buffer, state.decoder);
	  }

	  return ret;
	}

	// Extracts only enough buffered data to satisfy the amount requested.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function fromListPartial(n, list, hasStrings) {
	  var ret;
	  if (n < list.head.data.length) {
	    // slice is the same for buffers and strings
	    ret = list.head.data.slice(0, n);
	    list.head.data = list.head.data.slice(n);
	  } else if (n === list.head.data.length) {
	    // first chunk is a perfect match
	    ret = list.shift();
	  } else {
	    // result spans more than one buffer
	    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
	  }
	  return ret;
	}

	// Copies a specified amount of characters from the list of buffered data
	// chunks.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function copyFromBufferString(n, list) {
	  var p = list.head;
	  var c = 1;
	  var ret = p.data;
	  n -= ret.length;
	  while (p = p.next) {
	    var str = p.data;
	    var nb = n > str.length ? str.length : n;
	    if (nb === str.length) ret += str;else ret += str.slice(0, n);
	    n -= nb;
	    if (n === 0) {
	      if (nb === str.length) {
	        ++c;
	        if (p.next) list.head = p.next;else list.head = list.tail = null;
	      } else {
	        list.head = p;
	        p.data = str.slice(nb);
	      }
	      break;
	    }
	    ++c;
	  }
	  list.length -= c;
	  return ret;
	}

	// Copies a specified amount of bytes from the list of buffered data chunks.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function copyFromBuffer(n, list) {
	  var ret = Buffer$6.allocUnsafe(n);
	  var p = list.head;
	  var c = 1;
	  p.data.copy(ret);
	  n -= p.data.length;
	  while (p = p.next) {
	    var buf = p.data;
	    var nb = n > buf.length ? buf.length : n;
	    buf.copy(ret, ret.length - n, 0, nb);
	    n -= nb;
	    if (n === 0) {
	      if (nb === buf.length) {
	        ++c;
	        if (p.next) list.head = p.next;else list.head = list.tail = null;
	      } else {
	        list.head = p;
	        p.data = buf.slice(nb);
	      }
	      break;
	    }
	    ++c;
	  }
	  list.length -= c;
	  return ret;
	}

	function endReadable$1(stream$$1) {
	  var state = stream$$1._readableState;

	  // If we get here before consuming all the bytes, then that is a
	  // bug in node.  Should never happen.
	  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

	  if (!state.endEmitted) {
	    state.ended = true;
	    processNextickArgs.nextTick(endReadableNT, state, stream$$1);
	  }
	}

	function endReadableNT(state, stream$$1) {
	  // Check that we didn't get one last unshift.
	  if (!state.endEmitted && state.length === 0) {
	    state.endEmitted = true;
	    stream$$1.readable = false;
	    stream$$1.emit('end');
	  }
	}

	function indexOf$1(xs, x) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    if (xs[i] === x) return i;
	  }
	  return -1;
	}

	var _stream_transform$1 = Transform$1;



	/*<replacement>*/

	util$1.inherits = inherits;
	/*</replacement>*/

	util$1.inherits(Transform$1, _stream_duplex$1);

	function afterTransform$1(er, data) {
	  var ts = this._transformState;
	  ts.transforming = false;

	  var cb = ts.writecb;

	  if (!cb) {
	    return this.emit('error', new Error('write callback called multiple times'));
	  }

	  ts.writechunk = null;
	  ts.writecb = null;

	  if (data != null) // single equals check for both `null` and `undefined`
	    this.push(data);

	  cb(er);

	  var rs = this._readableState;
	  rs.reading = false;
	  if (rs.needReadable || rs.length < rs.highWaterMark) {
	    this._read(rs.highWaterMark);
	  }
	}

	function Transform$1(options) {
	  if (!(this instanceof Transform$1)) return new Transform$1(options);

	  _stream_duplex$1.call(this, options);

	  this._transformState = {
	    afterTransform: afterTransform$1.bind(this),
	    needTransform: false,
	    transforming: false,
	    writecb: null,
	    writechunk: null,
	    writeencoding: null
	  };

	  // start out asking for a readable event once data is transformed.
	  this._readableState.needReadable = true;

	  // we have implemented the _read method, and done the other things
	  // that Readable wants before the first _read call, so unset the
	  // sync guard flag.
	  this._readableState.sync = false;

	  if (options) {
	    if (typeof options.transform === 'function') this._transform = options.transform;

	    if (typeof options.flush === 'function') this._flush = options.flush;
	  }

	  // When the writable side finishes, then flush out anything remaining.
	  this.on('prefinish', prefinish$1);
	}

	function prefinish$1() {
	  var _this = this;

	  if (typeof this._flush === 'function') {
	    this._flush(function (er, data) {
	      done$1(_this, er, data);
	    });
	  } else {
	    done$1(this, null, null);
	  }
	}

	Transform$1.prototype.push = function (chunk, encoding) {
	  this._transformState.needTransform = false;
	  return _stream_duplex$1.prototype.push.call(this, chunk, encoding);
	};

	// This is the part where you do stuff!
	// override this function in implementation classes.
	// 'chunk' is an input chunk.
	//
	// Call `push(newChunk)` to pass along transformed output
	// to the readable side.  You may call 'push' zero or more times.
	//
	// Call `cb(err)` when you are done with this chunk.  If you pass
	// an error, then that'll put the hurt on the whole operation.  If you
	// never call cb(), then you'll never get another chunk.
	Transform$1.prototype._transform = function (chunk, encoding, cb) {
	  throw new Error('_transform() is not implemented');
	};

	Transform$1.prototype._write = function (chunk, encoding, cb) {
	  var ts = this._transformState;
	  ts.writecb = cb;
	  ts.writechunk = chunk;
	  ts.writeencoding = encoding;
	  if (!ts.transforming) {
	    var rs = this._readableState;
	    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
	  }
	};

	// Doesn't matter what the args are here.
	// _transform does all the work.
	// That we got here means that the readable side wants more data.
	Transform$1.prototype._read = function (n) {
	  var ts = this._transformState;

	  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
	    ts.transforming = true;
	    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
	  } else {
	    // mark that we need a transform, so that any data that comes in
	    // will get processed, now that we've asked for it.
	    ts.needTransform = true;
	  }
	};

	Transform$1.prototype._destroy = function (err, cb) {
	  var _this2 = this;

	  _stream_duplex$1.prototype._destroy.call(this, err, function (err2) {
	    cb(err2);
	    _this2.emit('close');
	  });
	};

	function done$1(stream, er, data) {
	  if (er) return stream.emit('error', er);

	  if (data != null) // single equals check for both `null` and `undefined`
	    stream.push(data);

	  // if there's nothing in the write buffer, then that means
	  // that nothing more will ever be provided
	  if (stream._writableState.length) throw new Error('Calling transform done when ws.length != 0');

	  if (stream._transformState.transforming) throw new Error('Calling transform done when still transforming');

	  return stream.push(null);
	}

	var _stream_passthrough$1 = PassThrough$1;



	/*<replacement>*/

	util$1.inherits = inherits;
	/*</replacement>*/

	util$1.inherits(PassThrough$1, _stream_transform$1);

	function PassThrough$1(options) {
	  if (!(this instanceof PassThrough$1)) return new PassThrough$1(options);

	  _stream_transform$1.call(this, options);
	}

	PassThrough$1.prototype._transform = function (chunk, encoding, cb) {
	  cb(null, chunk);
	};

	var readable$1 = createCommonjsModule(function (module, exports) {
	if (process.env.READABLE_STREAM === 'disable' && Stream) {
	  module.exports = Stream;
	  exports = module.exports = Stream.Readable;
	  exports.Readable = Stream.Readable;
	  exports.Writable = Stream.Writable;
	  exports.Duplex = Stream.Duplex;
	  exports.Transform = Stream.Transform;
	  exports.PassThrough = Stream.PassThrough;
	  exports.Stream = Stream;
	} else {
	  exports = module.exports = _stream_readable$1;
	  exports.Stream = Stream || exports;
	  exports.Readable = exports;
	  exports.Writable = _stream_writable$1;
	  exports.Duplex = _stream_duplex$1;
	  exports.Transform = _stream_transform$1;
	  exports.PassThrough = _stream_passthrough$1;
	}
	});
	var readable_1$1 = readable$1.Readable;
	var readable_2$1 = readable$1.Writable;
	var readable_3$1 = readable$1.Duplex;
	var readable_4$1 = readable$1.Transform;
	var readable_5$1 = readable$1.PassThrough;
	var readable_6$1 = readable$1.Stream;

	var Readable$2 = readable$1.Readable;


	var levelIteratorStream = ReadStream;
	inherits(ReadStream, Readable$2);

	function ReadStream (iterator, options) {
	  if (!(this instanceof ReadStream)) return new ReadStream(iterator, options)
	  options = options || {};
	  Readable$2.call(this, immutable(options, {
	    objectMode: true
	  }));
	  this._iterator = iterator;
	  this._destroyed = false;
	  this._options = options;
	  this.on('end', this._cleanup.bind(this));
	}

	ReadStream.prototype._read = function () {
	  var self = this;
	  var options = this._options;
	  if (this._destroyed) return

	  this._iterator.next(function (err, key, value) {
	    if (self._destroyed) return
	    if (err) return self.emit('error', err)
	    if (key === undefined && value === undefined) {
	      self.push(null);
	    } else if (options.keys !== false && options.values === false) {
	      self.push(key);
	    } else if (options.keys === false && options.values !== false) {
	      self.push(value);
	    } else {
	      self.push({ key: key, value: value });
	    }
	  });
	};

	ReadStream.prototype.destroy =
	ReadStream.prototype._cleanup = function () {
	  var self = this;
	  if (this._destroyed) return
	  this._destroyed = true;

	  this._iterator.end(function (err) {
	    if (err) return self.emit('error', err)
	    self.emit('close');
	  });
	};

	var prr = createCommonjsModule(function (module) {
	/*!
	  * prr
	  * (c) 2013 Rod Vagg <rod@vagg.org>
	  * https://github.com/rvagg/prr
	  * License: MIT
	  */

	(function (name, context, definition) {
	  if ('object' != 'undefined' && module.exports)
	    module.exports = definition();
	  else
	    context[name] = definition();
	})('prr', commonjsGlobal, function() {

	  var setProperty = typeof Object.defineProperty == 'function'
	      ? function (obj, key, options) {
	          Object.defineProperty(obj, key, options);
	          return obj
	        }
	      : function (obj, key, options) { // < es5
	          obj[key] = options.value;
	          return obj
	        }

	    , makeOptions = function (value, options) {
	        var oo = typeof options == 'object'
	          , os = !oo && typeof options == 'string'
	          , op = function (p) {
	              return oo
	                ? !!options[p]
	                : os
	                  ? options.indexOf(p[0]) > -1
	                  : false
	            };

	        return {
	            enumerable   : op('enumerable')
	          , configurable : op('configurable')
	          , writable     : op('writable')
	          , value        : value
	        }
	      }

	    , prr = function (obj, key, value, options) {
	        var k;

	        options = makeOptions(value, options);

	        if (typeof key == 'object') {
	          for (k in key) {
	            if (Object.hasOwnProperty.call(key, k)) {
	              options.value = key[k];
	              setProperty(obj, k, options);
	            }
	          }
	          return obj
	        }

	        return setProperty(obj, key, options)
	      };

	  return prr
	});
	});

	function init (type, message, cause) {
	  if (!!message && typeof message != 'string') {
	    message = message.message || message.name;
	  }
	  prr(this, {
	      type    : type
	    , name    : type
	      // can be passed just a 'cause'
	    , cause   : typeof message != 'string' ? message : cause
	    , message : message
	  }, 'ewr');
	}

	// generic prototype, not intended to be actually used - helpful for `instanceof`
	function CustomError (message, cause) {
	  Error.call(this);
	  if (Error.captureStackTrace)
	    Error.captureStackTrace(this, this.constructor);
	  init.call(this, 'CustomError', message, cause);
	}

	CustomError.prototype = new Error();

	function createError (errno, type, proto) {
	  var err = function (message, cause) {
	    init.call(this, type, message, cause);
	    //TODO: the specificity here is stupid, errno should be available everywhere
	    if (type == 'FilesystemError') {
	      this.code    = this.cause.code;
	      this.path    = this.cause.path;
	      this.errno   = this.cause.errno;
	      this.message =
	        (errno.errno[this.cause.errno]
	          ? errno.errno[this.cause.errno].description
	          : this.cause.message)
	        + (this.cause.path ? ' [' + this.cause.path + ']' : '');
	    }
	    Error.call(this);
	    if (Error.captureStackTrace)
	      Error.captureStackTrace(this, err);
	  };
	  err.prototype = !!proto ? new proto() : new CustomError();
	  return err
	}

	var custom = function (errno) {
	  var ce = function (type, proto) {
	    return createError(errno, type, proto)
	  };
	  return {
	      CustomError     : CustomError
	    , FilesystemError : ce('FilesystemError')
	    , createError     : ce
	  }
	};

	var errno = createCommonjsModule(function (module) {
	var all = module.exports.all = [
	  {
	    errno: -2,
	    code: 'ENOENT',
	    description: 'no such file or directory'
	  },
	  {
	    errno: -1,
	    code: 'UNKNOWN',
	    description: 'unknown error'
	  },
	  {
	    errno: 0,
	    code: 'OK',
	    description: 'success'
	  },
	  {
	    errno: 1,
	    code: 'EOF',
	    description: 'end of file'
	  },
	  {
	    errno: 2,
	    code: 'EADDRINFO',
	    description: 'getaddrinfo error'
	  },
	  {
	    errno: 3,
	    code: 'EACCES',
	    description: 'permission denied'
	  },
	  {
	    errno: 4,
	    code: 'EAGAIN',
	    description: 'resource temporarily unavailable'
	  },
	  {
	    errno: 5,
	    code: 'EADDRINUSE',
	    description: 'address already in use'
	  },
	  {
	    errno: 6,
	    code: 'EADDRNOTAVAIL',
	    description: 'address not available'
	  },
	  {
	    errno: 7,
	    code: 'EAFNOSUPPORT',
	    description: 'address family not supported'
	  },
	  {
	    errno: 8,
	    code: 'EALREADY',
	    description: 'connection already in progress'
	  },
	  {
	    errno: 9,
	    code: 'EBADF',
	    description: 'bad file descriptor'
	  },
	  {
	    errno: 10,
	    code: 'EBUSY',
	    description: 'resource busy or locked'
	  },
	  {
	    errno: 11,
	    code: 'ECONNABORTED',
	    description: 'software caused connection abort'
	  },
	  {
	    errno: 12,
	    code: 'ECONNREFUSED',
	    description: 'connection refused'
	  },
	  {
	    errno: 13,
	    code: 'ECONNRESET',
	    description: 'connection reset by peer'
	  },
	  {
	    errno: 14,
	    code: 'EDESTADDRREQ',
	    description: 'destination address required'
	  },
	  {
	    errno: 15,
	    code: 'EFAULT',
	    description: 'bad address in system call argument'
	  },
	  {
	    errno: 16,
	    code: 'EHOSTUNREACH',
	    description: 'host is unreachable'
	  },
	  {
	    errno: 17,
	    code: 'EINTR',
	    description: 'interrupted system call'
	  },
	  {
	    errno: 18,
	    code: 'EINVAL',
	    description: 'invalid argument'
	  },
	  {
	    errno: 19,
	    code: 'EISCONN',
	    description: 'socket is already connected'
	  },
	  {
	    errno: 20,
	    code: 'EMFILE',
	    description: 'too many open files'
	  },
	  {
	    errno: 21,
	    code: 'EMSGSIZE',
	    description: 'message too long'
	  },
	  {
	    errno: 22,
	    code: 'ENETDOWN',
	    description: 'network is down'
	  },
	  {
	    errno: 23,
	    code: 'ENETUNREACH',
	    description: 'network is unreachable'
	  },
	  {
	    errno: 24,
	    code: 'ENFILE',
	    description: 'file table overflow'
	  },
	  {
	    errno: 25,
	    code: 'ENOBUFS',
	    description: 'no buffer space available'
	  },
	  {
	    errno: 26,
	    code: 'ENOMEM',
	    description: 'not enough memory'
	  },
	  {
	    errno: 27,
	    code: 'ENOTDIR',
	    description: 'not a directory'
	  },
	  {
	    errno: 28,
	    code: 'EISDIR',
	    description: 'illegal operation on a directory'
	  },
	  {
	    errno: 29,
	    code: 'ENONET',
	    description: 'machine is not on the network'
	  },
	  {
	    errno: 31,
	    code: 'ENOTCONN',
	    description: 'socket is not connected'
	  },
	  {
	    errno: 32,
	    code: 'ENOTSOCK',
	    description: 'socket operation on non-socket'
	  },
	  {
	    errno: 33,
	    code: 'ENOTSUP',
	    description: 'operation not supported on socket'
	  },
	  {
	    errno: 34,
	    code: 'ENOENT',
	    description: 'no such file or directory'
	  },
	  {
	    errno: 35,
	    code: 'ENOSYS',
	    description: 'function not implemented'
	  },
	  {
	    errno: 36,
	    code: 'EPIPE',
	    description: 'broken pipe'
	  },
	  {
	    errno: 37,
	    code: 'EPROTO',
	    description: 'protocol error'
	  },
	  {
	    errno: 38,
	    code: 'EPROTONOSUPPORT',
	    description: 'protocol not supported'
	  },
	  {
	    errno: 39,
	    code: 'EPROTOTYPE',
	    description: 'protocol wrong type for socket'
	  },
	  {
	    errno: 40,
	    code: 'ETIMEDOUT',
	    description: 'connection timed out'
	  },
	  {
	    errno: 41,
	    code: 'ECHARSET',
	    description: 'invalid Unicode character'
	  },
	  {
	    errno: 42,
	    code: 'EAIFAMNOSUPPORT',
	    description: 'address family for hostname not supported'
	  },
	  {
	    errno: 44,
	    code: 'EAISERVICE',
	    description: 'servname not supported for ai_socktype'
	  },
	  {
	    errno: 45,
	    code: 'EAISOCKTYPE',
	    description: 'ai_socktype not supported'
	  },
	  {
	    errno: 46,
	    code: 'ESHUTDOWN',
	    description: 'cannot send after transport endpoint shutdown'
	  },
	  {
	    errno: 47,
	    code: 'EEXIST',
	    description: 'file already exists'
	  },
	  {
	    errno: 48,
	    code: 'ESRCH',
	    description: 'no such process'
	  },
	  {
	    errno: 49,
	    code: 'ENAMETOOLONG',
	    description: 'name too long'
	  },
	  {
	    errno: 50,
	    code: 'EPERM',
	    description: 'operation not permitted'
	  },
	  {
	    errno: 51,
	    code: 'ELOOP',
	    description: 'too many symbolic links encountered'
	  },
	  {
	    errno: 52,
	    code: 'EXDEV',
	    description: 'cross-device link not permitted'
	  },
	  {
	    errno: 53,
	    code: 'ENOTEMPTY',
	    description: 'directory not empty'
	  },
	  {
	    errno: 54,
	    code: 'ENOSPC',
	    description: 'no space left on device'
	  },
	  {
	    errno: 55,
	    code: 'EIO',
	    description: 'i/o error'
	  },
	  {
	    errno: 56,
	    code: 'EROFS',
	    description: 'read-only file system'
	  },
	  {
	    errno: 57,
	    code: 'ENODEV',
	    description: 'no such device'
	  },
	  {
	    errno: 58,
	    code: 'ESPIPE',
	    description: 'invalid seek'
	  },
	  {
	    errno: 59,
	    code: 'ECANCELED',
	    description: 'operation canceled'
	  }
	];

	module.exports.errno = {};
	module.exports.code = {};

	all.forEach(function (error) {
	  module.exports.errno[error.errno] = error;
	  module.exports.code[error.code] = error;
	});

	module.exports.custom = custom(module.exports);
	module.exports.create = module.exports.custom.createError;
	});
	var errno_1 = errno.all;
	var errno_2 = errno.errno;
	var errno_3 = errno.code;
	var errno_4 = errno.custom;
	var errno_5 = errno.create;

	/* Copyright (c) 2012-2017 LevelUP contributors
	 * See list at <https://github.com/rvagg/node-levelup#contributing>
	 * MIT License
	 * <https://github.com/rvagg/node-levelup/blob/master/LICENSE.md>
	 */

	var createError$1 = errno.create;
	var LevelUPError = createError$1('LevelUPError');
	var NotFoundError = createError$1('NotFoundError', LevelUPError);

	NotFoundError.prototype.notFound = true;
	NotFoundError.prototype.status = 404;

	var errors = {
	  LevelUPError: LevelUPError,
	  InitializationError: createError$1('InitializationError', LevelUPError),
	  OpenError: createError$1('OpenError', LevelUPError),
	  ReadError: createError$1('ReadError', LevelUPError),
	  WriteError: createError$1('WriteError', LevelUPError),
	  NotFoundError: NotFoundError,
	  EncodingError: createError$1('EncodingError', LevelUPError)
	};

	/* Copyright (c) 2012-2017 LevelUP contributors
	 * See list at <https://github.com/level/levelup#contributing>
	 * MIT License
	 * <https://github.com/level/levelup/blob/master/LICENSE.md>
	 */

	function promisify () {
	  var callback;
	  var promise = new Promise(function (resolve, reject) {
	    callback = function callback (err, value) {
	      if (err) reject(err);
	      else resolve(value);
	    };
	  });
	  callback.promise = promise;
	  return callback
	}

	var promisify_1 = promisify;

	/* Copyright (c) 2012-2017 LevelUP contributors
	 * See list at <https://github.com/level/levelup#contributing>
	 * MIT License
	 * <https://github.com/level/levelup/blob/master/LICENSE.md>
	 */

	var WriteError = errors.WriteError;


	function Batch (levelup) {
	  this._levelup = levelup;
	  this.batch = levelup.db.batch();
	  this.ops = [];
	  this.length = 0;
	}

	Batch.prototype.put = function (key, value) {
	  try {
	    this.batch.put(key, value);
	  } catch (e) {
	    throw new WriteError(e)
	  }

	  this.ops.push({ type: 'put', key: key, value: value });
	  this.length++;

	  return this
	};

	Batch.prototype.del = function (key) {
	  try {
	    this.batch.del(key);
	  } catch (err) {
	    throw new WriteError(err)
	  }

	  this.ops.push({ type: 'del', key: key });
	  this.length++;

	  return this
	};

	Batch.prototype.clear = function () {
	  try {
	    this.batch.clear();
	  } catch (err) {
	    throw new WriteError(err)
	  }

	  this.ops = [];
	  this.length = 0;

	  return this
	};

	Batch.prototype.write = function (callback) {
	  var levelup = this._levelup;
	  var ops = this.ops;
	  var promise;

	  if (!callback) {
	    callback = promisify_1();
	    promise = callback.promise;
	  }

	  try {
	    this.batch.write(function (err) {
	      if (err) { return callback(new WriteError(err)) }
	      levelup.emit('batch', ops);
	      callback();
	    });
	  } catch (err) {
	    throw new WriteError(err)
	  }

	  return promise
	};

	var batch = Batch;

	/* Copyright (c) 2012-2017 LevelUP contributors
	 * See list at <https://github.com/level/levelup#contributing>
	 * MIT License
	 * <https://github.com/level/levelup/blob/master/LICENSE.md>
	 */

	var EventEmitter = events__default.EventEmitter;
	var inherits$1 = util.inherits;








	var WriteError$1 = errors.WriteError;
	var ReadError = errors.ReadError;
	var NotFoundError$1 = errors.NotFoundError;
	var OpenError = errors.OpenError;
	var InitializationError = errors.InitializationError;

	// Possible AbstractLevelDOWN#status values:
	//  - 'new'     - newly created, not opened or closed
	//  - 'opening' - waiting for the database to be opened, post open()
	//  - 'open'    - successfully opened the database, available for use
	//  - 'closing' - waiting for the database to be closed, post close()
	//  - 'closed'  - database has been successfully closed, should not be
	//                 used except for another open() operation

	function LevelUP (db, options, callback) {
	  if (!(this instanceof LevelUP)) {
	    return new LevelUP(db, options, callback)
	  }

	  var error;

	  EventEmitter.call(this);
	  this.setMaxListeners(Infinity);

	  if (typeof options === 'function') {
	    callback = options;
	    options = {};
	  }

	  options = options || {};

	  if (!db || typeof db !== 'object') {
	    error = new InitializationError('Must provide db');
	    if (typeof callback === 'function') {
	      return process.nextTick(callback, error)
	    }
	    throw error
	  }

	  assert.equal(typeof db.status, 'string', '.status required, old abstract-leveldown');

	  this.options = getOptions(options);
	  this._db = db;
	  this.db = new deferredLeveldown(db);
	  this.open(callback);
	}

	LevelUP.prototype.emit = EventEmitter.prototype.emit;
	LevelUP.prototype.once = EventEmitter.prototype.once;
	inherits$1(LevelUP, EventEmitter);

	LevelUP.prototype.open = function (callback) {
	  var self = this;
	  var promise;

	  if (!callback) {
	    callback = promisify_1();
	    promise = callback.promise;
	  }

	  if (this.isOpen()) {
	    process.nextTick(callback, null, self);
	    return promise
	  }

	  if (this._isOpening()) {
	    this.once('open', function () { callback(null, self); });
	    return promise
	  }

	  this.emit('opening');

	  this.db.open(this.options, function (err) {
	    if (err) {
	      return callback(new OpenError(err))
	    }
	    self.db = self._db;
	    callback(null, self);
	    self.emit('open');
	    self.emit('ready');
	  });

	  return promise
	};

	LevelUP.prototype.close = function (callback) {
	  var self = this;
	  var promise;

	  if (!callback) {
	    callback = promisify_1();
	    promise = callback.promise;
	  }

	  if (this.isOpen()) {
	    this.db.close(function () {
	      self.emit('closed');
	      callback.apply(null, arguments);
	    });
	    this.emit('closing');
	    this.db = new deferredLeveldown(this._db);
	  } else if (this.isClosed()) {
	    process.nextTick(callback);
	  } else if (this.db.status === 'closing') {
	    this.once('closed', callback);
	  } else if (this._isOpening()) {
	    this.once('open', function () {
	      self.close(callback);
	    });
	  }

	  return promise
	};

	LevelUP.prototype.isOpen = function () {
	  return this.db.status === 'open'
	};

	LevelUP.prototype._isOpening = function () {
	  return this.db.status === 'opening'
	};

	LevelUP.prototype.isClosed = function () {
	  return (/^clos|new/).test(this.db.status)
	};

	LevelUP.prototype.get = function (key, options, callback) {
	  if (key === null || key === undefined) {
	    throw new ReadError('get() requires a key argument')
	  }

	  var promise;

	  callback = getCallback(options, callback);

	  if (!callback) {
	    callback = promisify_1();
	    promise = callback.promise;
	  }

	  if (maybeError(this, callback)) { return promise }

	  options = getOptions(options);

	  this.db.get(key, options, function (err, value) {
	    if (err) {
	      if ((/notfound/i).test(err) || err.notFound) {
	        err = new NotFoundError$1('Key not found in database [' + key + ']', err);
	      } else {
	        err = new ReadError(err);
	      }
	      return callback(err)
	    }
	    callback(null, value);
	  });

	  return promise
	};

	LevelUP.prototype.put = function (key, value, options, callback) {
	  if (key === null || key === undefined) {
	    throw new WriteError$1('put() requires a key argument')
	  }

	  var self = this;
	  var promise;

	  callback = getCallback(options, callback);

	  if (!callback) {
	    callback = promisify_1();
	    promise = callback.promise;
	  }

	  if (maybeError(this, callback)) { return promise }

	  options = getOptions(options);

	  this.db.put(key, value, options, function (err) {
	    if (err) {
	      return callback(new WriteError$1(err))
	    }
	    self.emit('put', key, value);
	    callback();
	  });

	  return promise
	};

	LevelUP.prototype.del = function (key, options, callback) {
	  if (key === null || key === undefined) {
	    throw new WriteError$1('del() requires a key argument')
	  }

	  var self = this;
	  var promise;

	  callback = getCallback(options, callback);

	  if (!callback) {
	    callback = promisify_1();
	    promise = callback.promise;
	  }

	  if (maybeError(this, callback)) { return promise }

	  options = getOptions(options);

	  this.db.del(key, options, function (err) {
	    if (err) {
	      return callback(new WriteError$1(err))
	    }
	    self.emit('del', key);
	    callback();
	  });

	  return promise
	};

	LevelUP.prototype.batch = function (arr, options, callback) {
	  if (!arguments.length) {
	    return new batch(this)
	  }

	  if (!Array.isArray(arr)) {
	    throw new WriteError$1('batch() requires an array argument')
	  }

	  var self = this;
	  var promise;

	  callback = getCallback(options, callback);

	  if (!callback) {
	    callback = promisify_1();
	    promise = callback.promise;
	  }

	  if (maybeError(this, callback)) { return promise }

	  options = getOptions(options);

	  arr = arr.map(function (op) {
	    if (!op.type && op.key !== undefined && op.value !== undefined) { op.type = 'put'; }
	    return op
	  });

	  this.db.batch(arr, options, function (err) {
	    if (err) {
	      return callback(new WriteError$1(err))
	    }
	    self.emit('batch', arr);
	    callback();
	  });

	  return promise
	};

	LevelUP.prototype.readStream =
	LevelUP.prototype.createReadStream = function (options) {
	  options = immutable({ keys: true, values: true }, options);
	  if (typeof options.limit !== 'number') { options.limit = -1; }
	  return new levelIteratorStream(this.db.iterator(options), options)
	};

	LevelUP.prototype.keyStream =
	LevelUP.prototype.createKeyStream = function (options) {
	  return this.createReadStream(immutable(options, { keys: true, values: false }))
	};

	LevelUP.prototype.valueStream =
	LevelUP.prototype.createValueStream = function (options) {
	  return this.createReadStream(immutable(options, { keys: false, values: true }))
	};

	LevelUP.prototype.toString = function () {
	  return 'LevelUP'
	};

	function getCallback (options, callback) {
	  return typeof options === 'function' ? options : callback
	}

	function getOptions (options) {
	  return typeof options === 'object' && options !== null ? options : {}
	}

	function maybeError (db, callback) {
	  if (!db._isOpening() && !db.isOpen()) {
	    process.nextTick(callback, new ReadError('Database is not open'));
	    return true
	  }
	}

	LevelUP.errors = errors;
	var levelup = LevelUP.default = LevelUP;

	var stream$1 = Stream;

	var BufferList$1 = createCommonjsModule(function (module) {

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Buffer = safeBuffer.Buffer;


	function copyBuffer(src, target, offset) {
	  src.copy(target, offset);
	}

	module.exports = function () {
	  function BufferList() {
	    _classCallCheck(this, BufferList);

	    this.head = null;
	    this.tail = null;
	    this.length = 0;
	  }

	  BufferList.prototype.push = function push(v) {
	    var entry = { data: v, next: null };
	    if (this.length > 0) this.tail.next = entry;else this.head = entry;
	    this.tail = entry;
	    ++this.length;
	  };

	  BufferList.prototype.unshift = function unshift(v) {
	    var entry = { data: v, next: this.head };
	    if (this.length === 0) this.tail = entry;
	    this.head = entry;
	    ++this.length;
	  };

	  BufferList.prototype.shift = function shift() {
	    if (this.length === 0) return;
	    var ret = this.head.data;
	    if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
	    --this.length;
	    return ret;
	  };

	  BufferList.prototype.clear = function clear() {
	    this.head = this.tail = null;
	    this.length = 0;
	  };

	  BufferList.prototype.join = function join(s) {
	    if (this.length === 0) return '';
	    var p = this.head;
	    var ret = '' + p.data;
	    while (p = p.next) {
	      ret += s + p.data;
	    }return ret;
	  };

	  BufferList.prototype.concat = function concat(n) {
	    if (this.length === 0) return Buffer.alloc(0);
	    if (this.length === 1) return this.head.data;
	    var ret = Buffer.allocUnsafe(n >>> 0);
	    var p = this.head;
	    var i = 0;
	    while (p) {
	      copyBuffer(p.data, ret, i);
	      i += p.data.length;
	      p = p.next;
	    }
	    return ret;
	  };

	  return BufferList;
	}();

	if (util && util.inspect && util.inspect.custom) {
	  module.exports.prototype[util.inspect.custom] = function () {
	    var obj = util.inspect({ length: this.length });
	    return this.constructor.name + ' ' + obj;
	  };
	}
	});

	/*<replacement>*/


	/*</replacement>*/

	// undocumented cb() API, needed for core, not for public API
	function destroy$1(err, cb) {
	  var _this = this;

	  var readableDestroyed = this._readableState && this._readableState.destroyed;
	  var writableDestroyed = this._writableState && this._writableState.destroyed;

	  if (readableDestroyed || writableDestroyed) {
	    if (cb) {
	      cb(err);
	    } else if (err && (!this._writableState || !this._writableState.errorEmitted)) {
	      processNextickArgs.nextTick(emitErrorNT$1, this, err);
	    }
	    return this;
	  }

	  // we set destroyed to true before firing error callbacks in order
	  // to make it re-entrance safe in case destroy() is called within callbacks

	  if (this._readableState) {
	    this._readableState.destroyed = true;
	  }

	  // if this is a duplex stream mark the writable part as destroyed as well
	  if (this._writableState) {
	    this._writableState.destroyed = true;
	  }

	  this._destroy(err || null, function (err) {
	    if (!cb && err) {
	      processNextickArgs.nextTick(emitErrorNT$1, _this, err);
	      if (_this._writableState) {
	        _this._writableState.errorEmitted = true;
	      }
	    } else if (cb) {
	      cb(err);
	    }
	  });

	  return this;
	}

	function undestroy$1() {
	  if (this._readableState) {
	    this._readableState.destroyed = false;
	    this._readableState.reading = false;
	    this._readableState.ended = false;
	    this._readableState.endEmitted = false;
	  }

	  if (this._writableState) {
	    this._writableState.destroyed = false;
	    this._writableState.ended = false;
	    this._writableState.ending = false;
	    this._writableState.finished = false;
	    this._writableState.errorEmitted = false;
	  }
	}

	function emitErrorNT$1(self, err) {
	  self.emit('error', err);
	}

	var destroy_1$1 = {
	  destroy: destroy$1,
	  undestroy: undestroy$1
	};

	/*<replacement>*/


	/*</replacement>*/

	var _stream_writable$2 = Writable$2;

	// It seems a linked list but it is not
	// there will be only 2 of these for each stream
	function CorkedRequest$1(state) {
	  var _this = this;

	  this.next = null;
	  this.entry = null;
	  this.finish = function () {
	    onCorkedFinish$1(_this, state);
	  };
	}
	/* </replacement> */

	/*<replacement>*/
	var asyncWrite$1 = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : processNextickArgs.nextTick;
	/*</replacement>*/

	/*<replacement>*/
	var Duplex$4;
	/*</replacement>*/

	Writable$2.WritableState = WritableState$2;

	/*<replacement>*/

	util$1.inherits = inherits;
	/*</replacement>*/

	/*<replacement>*/
	var internalUtil$1 = {
	  deprecate: node$1
	};
	/*</replacement>*/

	/*<replacement>*/

	/*</replacement>*/

	/*<replacement>*/

	var Buffer$7 = safeBuffer.Buffer;
	var OurUint8Array$2 = commonjsGlobal.Uint8Array || function () {};
	function _uint8ArrayToBuffer$2(chunk) {
	  return Buffer$7.from(chunk);
	}
	function _isUint8Array$2(obj) {
	  return Buffer$7.isBuffer(obj) || obj instanceof OurUint8Array$2;
	}

	/*</replacement>*/



	util$1.inherits(Writable$2, stream$1);

	function nop$1() {}

	function WritableState$2(options, stream) {
	  Duplex$4 = Duplex$4 || _stream_duplex$2;

	  options = options || {};

	  // Duplex streams are both readable and writable, but share
	  // the same options object.
	  // However, some cases require setting options to different
	  // values for the readable and the writable sides of the duplex stream.
	  // These options can be provided separately as readableXXX and writableXXX.
	  var isDuplex = stream instanceof Duplex$4;

	  // object stream flag to indicate whether or not this stream
	  // contains buffers or objects.
	  this.objectMode = !!options.objectMode;

	  if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

	  // the point at which write() starts returning false
	  // Note: 0 is a valid value, means that we always return false if
	  // the entire buffer is not flushed immediately on write()
	  var hwm = options.highWaterMark;
	  var writableHwm = options.writableHighWaterMark;
	  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

	  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (writableHwm || writableHwm === 0)) this.highWaterMark = writableHwm;else this.highWaterMark = defaultHwm;

	  // cast to ints.
	  this.highWaterMark = Math.floor(this.highWaterMark);

	  // if _final has been called
	  this.finalCalled = false;

	  // drain event flag.
	  this.needDrain = false;
	  // at the start of calling end()
	  this.ending = false;
	  // when end() has been called, and returned
	  this.ended = false;
	  // when 'finish' is emitted
	  this.finished = false;

	  // has it been destroyed
	  this.destroyed = false;

	  // should we decode strings into buffers before passing to _write?
	  // this is here so that some node-core streams can optimize string
	  // handling at a lower level.
	  var noDecode = options.decodeStrings === false;
	  this.decodeStrings = !noDecode;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = options.defaultEncoding || 'utf8';

	  // not an actual buffer we keep track of, but a measurement
	  // of how much we're waiting to get pushed to some underlying
	  // socket or file.
	  this.length = 0;

	  // a flag to see when we're in the middle of a write.
	  this.writing = false;

	  // when true all writes will be buffered until .uncork() call
	  this.corked = 0;

	  // a flag to be able to tell if the onwrite cb is called immediately,
	  // or on a later tick.  We set this to true at first, because any
	  // actions that shouldn't happen until "later" should generally also
	  // not happen before the first write call.
	  this.sync = true;

	  // a flag to know if we're processing previously buffered items, which
	  // may call the _write() callback in the same tick, so that we don't
	  // end up in an overlapped onwrite situation.
	  this.bufferProcessing = false;

	  // the callback that's passed to _write(chunk,cb)
	  this.onwrite = function (er) {
	    onwrite$2(stream, er);
	  };

	  // the callback that the user supplies to write(chunk,encoding,cb)
	  this.writecb = null;

	  // the amount that is being written when _write is called.
	  this.writelen = 0;

	  this.bufferedRequest = null;
	  this.lastBufferedRequest = null;

	  // number of pending user-supplied write callbacks
	  // this must be 0 before 'finish' can be emitted
	  this.pendingcb = 0;

	  // emit prefinish if the only thing we're waiting for is _write cbs
	  // This is relevant for synchronous Transform streams
	  this.prefinished = false;

	  // True if the error was already emitted and should not be thrown again
	  this.errorEmitted = false;

	  // count buffered requests
	  this.bufferedRequestCount = 0;

	  // allocate the first CorkedRequest, there is always
	  // one allocated and free to use, and we maintain at most two
	  this.corkedRequestsFree = new CorkedRequest$1(this);
	}

	WritableState$2.prototype.getBuffer = function getBuffer() {
	  var current = this.bufferedRequest;
	  var out = [];
	  while (current) {
	    out.push(current);
	    current = current.next;
	  }
	  return out;
	};

	(function () {
	  try {
	    Object.defineProperty(WritableState$2.prototype, 'buffer', {
	      get: internalUtil$1.deprecate(function () {
	        return this.getBuffer();
	      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
	    });
	  } catch (_) {}
	})();

	// Test _writableState for inheritance to account for Duplex streams,
	// whose prototype chain only points to Readable.
	var realHasInstance$1;
	if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
	  realHasInstance$1 = Function.prototype[Symbol.hasInstance];
	  Object.defineProperty(Writable$2, Symbol.hasInstance, {
	    value: function (object) {
	      if (realHasInstance$1.call(this, object)) return true;
	      if (this !== Writable$2) return false;

	      return object && object._writableState instanceof WritableState$2;
	    }
	  });
	} else {
	  realHasInstance$1 = function (object) {
	    return object instanceof this;
	  };
	}

	function Writable$2(options) {
	  Duplex$4 = Duplex$4 || _stream_duplex$2;

	  // Writable ctor is applied to Duplexes, too.
	  // `realHasInstance` is necessary because using plain `instanceof`
	  // would return false, as no `_writableState` property is attached.

	  // Trying to use the custom `instanceof` for Writable here will also break the
	  // Node.js LazyTransform implementation, which has a non-trivial getter for
	  // `_writableState` that would lead to infinite recursion.
	  if (!realHasInstance$1.call(Writable$2, this) && !(this instanceof Duplex$4)) {
	    return new Writable$2(options);
	  }

	  this._writableState = new WritableState$2(options, this);

	  // legacy.
	  this.writable = true;

	  if (options) {
	    if (typeof options.write === 'function') this._write = options.write;

	    if (typeof options.writev === 'function') this._writev = options.writev;

	    if (typeof options.destroy === 'function') this._destroy = options.destroy;

	    if (typeof options.final === 'function') this._final = options.final;
	  }

	  stream$1.call(this);
	}

	// Otherwise people can pipe Writable streams, which is just wrong.
	Writable$2.prototype.pipe = function () {
	  this.emit('error', new Error('Cannot pipe, not readable'));
	};

	function writeAfterEnd$2(stream, cb) {
	  var er = new Error('write after end');
	  // TODO: defer error events consistently everywhere, not just the cb
	  stream.emit('error', er);
	  processNextickArgs.nextTick(cb, er);
	}

	// Checks that a user-supplied chunk is valid, especially for the particular
	// mode the stream is in. Currently this means that `null` is never accepted
	// and undefined/non-string values are only allowed in object mode.
	function validChunk$2(stream, state, chunk, cb) {
	  var valid = true;
	  var er = false;

	  if (chunk === null) {
	    er = new TypeError('May not write null values to stream');
	  } else if (typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
	    er = new TypeError('Invalid non-string/buffer chunk');
	  }
	  if (er) {
	    stream.emit('error', er);
	    processNextickArgs.nextTick(cb, er);
	    valid = false;
	  }
	  return valid;
	}

	Writable$2.prototype.write = function (chunk, encoding, cb) {
	  var state = this._writableState;
	  var ret = false;
	  var isBuf = !state.objectMode && _isUint8Array$2(chunk);

	  if (isBuf && !Buffer$7.isBuffer(chunk)) {
	    chunk = _uint8ArrayToBuffer$2(chunk);
	  }

	  if (typeof encoding === 'function') {
	    cb = encoding;
	    encoding = null;
	  }

	  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

	  if (typeof cb !== 'function') cb = nop$1;

	  if (state.ended) writeAfterEnd$2(this, cb);else if (isBuf || validChunk$2(this, state, chunk, cb)) {
	    state.pendingcb++;
	    ret = writeOrBuffer$2(this, state, isBuf, chunk, encoding, cb);
	  }

	  return ret;
	};

	Writable$2.prototype.cork = function () {
	  var state = this._writableState;

	  state.corked++;
	};

	Writable$2.prototype.uncork = function () {
	  var state = this._writableState;

	  if (state.corked) {
	    state.corked--;

	    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer$2(this, state);
	  }
	};

	Writable$2.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
	  // node::ParseEncoding() requires lower case.
	  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
	  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
	  this._writableState.defaultEncoding = encoding;
	  return this;
	};

	function decodeChunk$2(state, chunk, encoding) {
	  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
	    chunk = Buffer$7.from(chunk, encoding);
	  }
	  return chunk;
	}

	// if we're already writing something, then just put this
	// in the queue, and wait our turn.  Otherwise, call _write
	// If we return false, then we need a drain event, so set that flag.
	function writeOrBuffer$2(stream, state, isBuf, chunk, encoding, cb) {
	  if (!isBuf) {
	    var newChunk = decodeChunk$2(state, chunk, encoding);
	    if (chunk !== newChunk) {
	      isBuf = true;
	      encoding = 'buffer';
	      chunk = newChunk;
	    }
	  }
	  var len = state.objectMode ? 1 : chunk.length;

	  state.length += len;

	  var ret = state.length < state.highWaterMark;
	  // we must ensure that previous needDrain will not be reset to false.
	  if (!ret) state.needDrain = true;

	  if (state.writing || state.corked) {
	    var last = state.lastBufferedRequest;
	    state.lastBufferedRequest = {
	      chunk: chunk,
	      encoding: encoding,
	      isBuf: isBuf,
	      callback: cb,
	      next: null
	    };
	    if (last) {
	      last.next = state.lastBufferedRequest;
	    } else {
	      state.bufferedRequest = state.lastBufferedRequest;
	    }
	    state.bufferedRequestCount += 1;
	  } else {
	    doWrite$2(stream, state, false, len, chunk, encoding, cb);
	  }

	  return ret;
	}

	function doWrite$2(stream, state, writev, len, chunk, encoding, cb) {
	  state.writelen = len;
	  state.writecb = cb;
	  state.writing = true;
	  state.sync = true;
	  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
	  state.sync = false;
	}

	function onwriteError$2(stream, state, sync, er, cb) {
	  --state.pendingcb;

	  if (sync) {
	    // defer the callback if we are being called synchronously
	    // to avoid piling up things on the stack
	    processNextickArgs.nextTick(cb, er);
	    // this can emit finish, and it will always happen
	    // after error
	    processNextickArgs.nextTick(finishMaybe$2, stream, state);
	    stream._writableState.errorEmitted = true;
	    stream.emit('error', er);
	  } else {
	    // the caller expect this to happen before if
	    // it is async
	    cb(er);
	    stream._writableState.errorEmitted = true;
	    stream.emit('error', er);
	    // this can emit finish, but finish must
	    // always follow error
	    finishMaybe$2(stream, state);
	  }
	}

	function onwriteStateUpdate$2(state) {
	  state.writing = false;
	  state.writecb = null;
	  state.length -= state.writelen;
	  state.writelen = 0;
	}

	function onwrite$2(stream, er) {
	  var state = stream._writableState;
	  var sync = state.sync;
	  var cb = state.writecb;

	  onwriteStateUpdate$2(state);

	  if (er) onwriteError$2(stream, state, sync, er, cb);else {
	    // Check if we're actually ready to finish, but don't emit yet
	    var finished = needFinish$2(state);

	    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
	      clearBuffer$2(stream, state);
	    }

	    if (sync) {
	      /*<replacement>*/
	      asyncWrite$1(afterWrite$2, stream, state, finished, cb);
	      /*</replacement>*/
	    } else {
	      afterWrite$2(stream, state, finished, cb);
	    }
	  }
	}

	function afterWrite$2(stream, state, finished, cb) {
	  if (!finished) onwriteDrain$2(stream, state);
	  state.pendingcb--;
	  cb();
	  finishMaybe$2(stream, state);
	}

	// Must force callback to be called on nextTick, so that we don't
	// emit 'drain' before the write() consumer gets the 'false' return
	// value, and has a chance to attach a 'drain' listener.
	function onwriteDrain$2(stream, state) {
	  if (state.length === 0 && state.needDrain) {
	    state.needDrain = false;
	    stream.emit('drain');
	  }
	}

	// if there's something in the buffer waiting, then process it
	function clearBuffer$2(stream, state) {
	  state.bufferProcessing = true;
	  var entry = state.bufferedRequest;

	  if (stream._writev && entry && entry.next) {
	    // Fast case, write everything using _writev()
	    var l = state.bufferedRequestCount;
	    var buffer$$1 = new Array(l);
	    var holder = state.corkedRequestsFree;
	    holder.entry = entry;

	    var count = 0;
	    var allBuffers = true;
	    while (entry) {
	      buffer$$1[count] = entry;
	      if (!entry.isBuf) allBuffers = false;
	      entry = entry.next;
	      count += 1;
	    }
	    buffer$$1.allBuffers = allBuffers;

	    doWrite$2(stream, state, true, state.length, buffer$$1, '', holder.finish);

	    // doWrite is almost always async, defer these to save a bit of time
	    // as the hot path ends with doWrite
	    state.pendingcb++;
	    state.lastBufferedRequest = null;
	    if (holder.next) {
	      state.corkedRequestsFree = holder.next;
	      holder.next = null;
	    } else {
	      state.corkedRequestsFree = new CorkedRequest$1(state);
	    }
	    state.bufferedRequestCount = 0;
	  } else {
	    // Slow case, write chunks one-by-one
	    while (entry) {
	      var chunk = entry.chunk;
	      var encoding = entry.encoding;
	      var cb = entry.callback;
	      var len = state.objectMode ? 1 : chunk.length;

	      doWrite$2(stream, state, false, len, chunk, encoding, cb);
	      entry = entry.next;
	      state.bufferedRequestCount--;
	      // if we didn't call the onwrite immediately, then
	      // it means that we need to wait until it does.
	      // also, that means that the chunk and cb are currently
	      // being processed, so move the buffer counter past them.
	      if (state.writing) {
	        break;
	      }
	    }

	    if (entry === null) state.lastBufferedRequest = null;
	  }

	  state.bufferedRequest = entry;
	  state.bufferProcessing = false;
	}

	Writable$2.prototype._write = function (chunk, encoding, cb) {
	  cb(new Error('_write() is not implemented'));
	};

	Writable$2.prototype._writev = null;

	Writable$2.prototype.end = function (chunk, encoding, cb) {
	  var state = this._writableState;

	  if (typeof chunk === 'function') {
	    cb = chunk;
	    chunk = null;
	    encoding = null;
	  } else if (typeof encoding === 'function') {
	    cb = encoding;
	    encoding = null;
	  }

	  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

	  // .end() fully uncorks
	  if (state.corked) {
	    state.corked = 1;
	    this.uncork();
	  }

	  // ignore unnecessary end() calls.
	  if (!state.ending && !state.finished) endWritable$2(this, state, cb);
	};

	function needFinish$2(state) {
	  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
	}
	function callFinal$1(stream, state) {
	  stream._final(function (err) {
	    state.pendingcb--;
	    if (err) {
	      stream.emit('error', err);
	    }
	    state.prefinished = true;
	    stream.emit('prefinish');
	    finishMaybe$2(stream, state);
	  });
	}
	function prefinish$2(stream, state) {
	  if (!state.prefinished && !state.finalCalled) {
	    if (typeof stream._final === 'function') {
	      state.pendingcb++;
	      state.finalCalled = true;
	      processNextickArgs.nextTick(callFinal$1, stream, state);
	    } else {
	      state.prefinished = true;
	      stream.emit('prefinish');
	    }
	  }
	}

	function finishMaybe$2(stream, state) {
	  var need = needFinish$2(state);
	  if (need) {
	    prefinish$2(stream, state);
	    if (state.pendingcb === 0) {
	      state.finished = true;
	      stream.emit('finish');
	    }
	  }
	  return need;
	}

	function endWritable$2(stream, state, cb) {
	  state.ending = true;
	  finishMaybe$2(stream, state);
	  if (cb) {
	    if (state.finished) processNextickArgs.nextTick(cb);else stream.once('finish', cb);
	  }
	  state.ended = true;
	  stream.writable = false;
	}

	function onCorkedFinish$1(corkReq, state, err) {
	  var entry = corkReq.entry;
	  corkReq.entry = null;
	  while (entry) {
	    var cb = entry.callback;
	    state.pendingcb--;
	    cb(err);
	    entry = entry.next;
	  }
	  if (state.corkedRequestsFree) {
	    state.corkedRequestsFree.next = corkReq;
	  } else {
	    state.corkedRequestsFree = corkReq;
	  }
	}

	Object.defineProperty(Writable$2.prototype, 'destroyed', {
	  get: function () {
	    if (this._writableState === undefined) {
	      return false;
	    }
	    return this._writableState.destroyed;
	  },
	  set: function (value) {
	    // we ignore the value if the stream
	    // has not been initialized yet
	    if (!this._writableState) {
	      return;
	    }

	    // backward compatibility, the user is explicitly
	    // managing destroyed
	    this._writableState.destroyed = value;
	  }
	});

	Writable$2.prototype.destroy = destroy_1$1.destroy;
	Writable$2.prototype._undestroy = destroy_1$1.undestroy;
	Writable$2.prototype._destroy = function (err, cb) {
	  this.end();
	  cb(err);
	};

	/*<replacement>*/


	/*</replacement>*/

	/*<replacement>*/
	var objectKeys$2 = Object.keys || function (obj) {
	  var keys = [];
	  for (var key in obj) {
	    keys.push(key);
	  }return keys;
	};
	/*</replacement>*/

	var _stream_duplex$2 = Duplex$5;

	/*<replacement>*/

	util$1.inherits = inherits;
	/*</replacement>*/




	util$1.inherits(Duplex$5, _stream_readable$2);

	var keys$1 = objectKeys$2(_stream_writable$2.prototype);
	for (var v$1 = 0; v$1 < keys$1.length; v$1++) {
	  var method$1 = keys$1[v$1];
	  if (!Duplex$5.prototype[method$1]) Duplex$5.prototype[method$1] = _stream_writable$2.prototype[method$1];
	}

	function Duplex$5(options) {
	  if (!(this instanceof Duplex$5)) return new Duplex$5(options);

	  _stream_readable$2.call(this, options);
	  _stream_writable$2.call(this, options);

	  if (options && options.readable === false) this.readable = false;

	  if (options && options.writable === false) this.writable = false;

	  this.allowHalfOpen = true;
	  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

	  this.once('end', onend$2);
	}

	// the no-half-open enforcer
	function onend$2() {
	  // if we allow half-open state, or if the writable side ended,
	  // then we're ok.
	  if (this.allowHalfOpen || this._writableState.ended) return;

	  // no more data can be written.
	  // But allow more writes to happen in this tick.
	  processNextickArgs.nextTick(onEndNT$1, this);
	}

	function onEndNT$1(self) {
	  self.end();
	}

	Object.defineProperty(Duplex$5.prototype, 'destroyed', {
	  get: function () {
	    if (this._readableState === undefined || this._writableState === undefined) {
	      return false;
	    }
	    return this._readableState.destroyed && this._writableState.destroyed;
	  },
	  set: function (value) {
	    // we ignore the value if the stream
	    // has not been initialized yet
	    if (this._readableState === undefined || this._writableState === undefined) {
	      return;
	    }

	    // backward compatibility, the user is explicitly
	    // managing destroyed
	    this._readableState.destroyed = value;
	    this._writableState.destroyed = value;
	  }
	});

	Duplex$5.prototype._destroy = function (err, cb) {
	  this.push(null);
	  this.end();

	  processNextickArgs.nextTick(cb, err);
	};

	/*<replacement>*/


	/*</replacement>*/

	var _stream_readable$2 = Readable$3;

	/*<replacement>*/

	/*</replacement>*/

	/*<replacement>*/
	var Duplex$6;
	/*</replacement>*/

	Readable$3.ReadableState = ReadableState$2;

	/*<replacement>*/
	var EE$2 = events__default.EventEmitter;

	var EElistenerCount$1 = function (emitter, type) {
	  return emitter.listeners(type).length;
	};
	/*</replacement>*/

	/*<replacement>*/

	/*</replacement>*/

	/*<replacement>*/

	var Buffer$8 = safeBuffer.Buffer;
	var OurUint8Array$3 = commonjsGlobal.Uint8Array || function () {};
	function _uint8ArrayToBuffer$3(chunk) {
	  return Buffer$8.from(chunk);
	}
	function _isUint8Array$3(obj) {
	  return Buffer$8.isBuffer(obj) || obj instanceof OurUint8Array$3;
	}

	/*</replacement>*/

	/*<replacement>*/

	util$1.inherits = inherits;
	/*</replacement>*/

	/*<replacement>*/

	var debug$2 = void 0;
	if (util && util.debuglog) {
	  debug$2 = util.debuglog('stream');
	} else {
	  debug$2 = function () {};
	}
	/*</replacement>*/



	var StringDecoder$3;

	util$1.inherits(Readable$3, stream$1);

	var kProxyEvents$1 = ['error', 'close', 'destroy', 'pause', 'resume'];

	function prependListener$1(emitter, event, fn) {
	  // Sadly this is not cacheable as some libraries bundle their own
	  // event emitter implementation with them.
	  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn);

	  // This is a hack to make sure that our error handler is attached before any
	  // userland ones.  NEVER DO THIS. This is here only because this code needs
	  // to continue to work with older versions of Node.js that do not include
	  // the prependListener() method. The goal is to eventually remove this hack.
	  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isarray$1(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
	}

	function ReadableState$2(options, stream) {
	  Duplex$6 = Duplex$6 || _stream_duplex$2;

	  options = options || {};

	  // Duplex streams are both readable and writable, but share
	  // the same options object.
	  // However, some cases require setting options to different
	  // values for the readable and the writable sides of the duplex stream.
	  // These options can be provided separately as readableXXX and writableXXX.
	  var isDuplex = stream instanceof Duplex$6;

	  // object stream flag. Used to make read(n) ignore n and to
	  // make all the buffer merging and length checks go away
	  this.objectMode = !!options.objectMode;

	  if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

	  // the point at which it stops calling _read() to fill the buffer
	  // Note: 0 is a valid value, means "don't call _read preemptively ever"
	  var hwm = options.highWaterMark;
	  var readableHwm = options.readableHighWaterMark;
	  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

	  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (readableHwm || readableHwm === 0)) this.highWaterMark = readableHwm;else this.highWaterMark = defaultHwm;

	  // cast to ints.
	  this.highWaterMark = Math.floor(this.highWaterMark);

	  // A linked list is used to store data chunks instead of an array because the
	  // linked list can remove elements from the beginning faster than
	  // array.shift()
	  this.buffer = new BufferList$1();
	  this.length = 0;
	  this.pipes = null;
	  this.pipesCount = 0;
	  this.flowing = null;
	  this.ended = false;
	  this.endEmitted = false;
	  this.reading = false;

	  // a flag to be able to tell if the event 'readable'/'data' is emitted
	  // immediately, or on a later tick.  We set this to true at first, because
	  // any actions that shouldn't happen until "later" should generally also
	  // not happen before the first read call.
	  this.sync = true;

	  // whenever we return null, then we set a flag to say
	  // that we're awaiting a 'readable' event emission.
	  this.needReadable = false;
	  this.emittedReadable = false;
	  this.readableListening = false;
	  this.resumeScheduled = false;

	  // has it been destroyed
	  this.destroyed = false;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = options.defaultEncoding || 'utf8';

	  // the number of writers that are awaiting a drain event in .pipe()s
	  this.awaitDrain = 0;

	  // if true, a maybeReadMore has been scheduled
	  this.readingMore = false;

	  this.decoder = null;
	  this.encoding = null;
	  if (options.encoding) {
	    if (!StringDecoder$3) StringDecoder$3 = string_decoder$1.StringDecoder;
	    this.decoder = new StringDecoder$3(options.encoding);
	    this.encoding = options.encoding;
	  }
	}

	function Readable$3(options) {
	  Duplex$6 = Duplex$6 || _stream_duplex$2;

	  if (!(this instanceof Readable$3)) return new Readable$3(options);

	  this._readableState = new ReadableState$2(options, this);

	  // legacy
	  this.readable = true;

	  if (options) {
	    if (typeof options.read === 'function') this._read = options.read;

	    if (typeof options.destroy === 'function') this._destroy = options.destroy;
	  }

	  stream$1.call(this);
	}

	Object.defineProperty(Readable$3.prototype, 'destroyed', {
	  get: function () {
	    if (this._readableState === undefined) {
	      return false;
	    }
	    return this._readableState.destroyed;
	  },
	  set: function (value) {
	    // we ignore the value if the stream
	    // has not been initialized yet
	    if (!this._readableState) {
	      return;
	    }

	    // backward compatibility, the user is explicitly
	    // managing destroyed
	    this._readableState.destroyed = value;
	  }
	});

	Readable$3.prototype.destroy = destroy_1$1.destroy;
	Readable$3.prototype._undestroy = destroy_1$1.undestroy;
	Readable$3.prototype._destroy = function (err, cb) {
	  this.push(null);
	  cb(err);
	};

	// Manually shove something into the read() buffer.
	// This returns true if the highWaterMark has not been hit yet,
	// similar to how Writable.write() returns true if you should
	// write() some more.
	Readable$3.prototype.push = function (chunk, encoding) {
	  var state = this._readableState;
	  var skipChunkCheck;

	  if (!state.objectMode) {
	    if (typeof chunk === 'string') {
	      encoding = encoding || state.defaultEncoding;
	      if (encoding !== state.encoding) {
	        chunk = Buffer$8.from(chunk, encoding);
	        encoding = '';
	      }
	      skipChunkCheck = true;
	    }
	  } else {
	    skipChunkCheck = true;
	  }

	  return readableAddChunk$2(this, chunk, encoding, false, skipChunkCheck);
	};

	// Unshift should *always* be something directly out of read()
	Readable$3.prototype.unshift = function (chunk) {
	  return readableAddChunk$2(this, chunk, null, true, false);
	};

	function readableAddChunk$2(stream, chunk, encoding, addToFront, skipChunkCheck) {
	  var state = stream._readableState;
	  if (chunk === null) {
	    state.reading = false;
	    onEofChunk$2(stream, state);
	  } else {
	    var er;
	    if (!skipChunkCheck) er = chunkInvalid$2(state, chunk);
	    if (er) {
	      stream.emit('error', er);
	    } else if (state.objectMode || chunk && chunk.length > 0) {
	      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer$8.prototype) {
	        chunk = _uint8ArrayToBuffer$3(chunk);
	      }

	      if (addToFront) {
	        if (state.endEmitted) stream.emit('error', new Error('stream.unshift() after end event'));else addChunk$1(stream, state, chunk, true);
	      } else if (state.ended) {
	        stream.emit('error', new Error('stream.push() after EOF'));
	      } else {
	        state.reading = false;
	        if (state.decoder && !encoding) {
	          chunk = state.decoder.write(chunk);
	          if (state.objectMode || chunk.length !== 0) addChunk$1(stream, state, chunk, false);else maybeReadMore$2(stream, state);
	        } else {
	          addChunk$1(stream, state, chunk, false);
	        }
	      }
	    } else if (!addToFront) {
	      state.reading = false;
	    }
	  }

	  return needMoreData$2(state);
	}

	function addChunk$1(stream, state, chunk, addToFront) {
	  if (state.flowing && state.length === 0 && !state.sync) {
	    stream.emit('data', chunk);
	    stream.read(0);
	  } else {
	    // update the buffer info.
	    state.length += state.objectMode ? 1 : chunk.length;
	    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

	    if (state.needReadable) emitReadable$2(stream);
	  }
	  maybeReadMore$2(stream, state);
	}

	function chunkInvalid$2(state, chunk) {
	  var er;
	  if (!_isUint8Array$3(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
	    er = new TypeError('Invalid non-string/buffer chunk');
	  }
	  return er;
	}

	// if it's past the high water mark, we can push in some more.
	// Also, if we have no data yet, we can stand some
	// more bytes.  This is to work around cases where hwm=0,
	// such as the repl.  Also, if the push() triggered a
	// readable event, and the user called read(largeNumber) such that
	// needReadable was set, then we ought to push more, so that another
	// 'readable' event will be triggered.
	function needMoreData$2(state) {
	  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
	}

	Readable$3.prototype.isPaused = function () {
	  return this._readableState.flowing === false;
	};

	// backwards compatibility.
	Readable$3.prototype.setEncoding = function (enc) {
	  if (!StringDecoder$3) StringDecoder$3 = string_decoder$1.StringDecoder;
	  this._readableState.decoder = new StringDecoder$3(enc);
	  this._readableState.encoding = enc;
	  return this;
	};

	// Don't raise the hwm > 8MB
	var MAX_HWM$2 = 0x800000;
	function computeNewHighWaterMark$1(n) {
	  if (n >= MAX_HWM$2) {
	    n = MAX_HWM$2;
	  } else {
	    // Get the next highest power of 2 to prevent increasing hwm excessively in
	    // tiny amounts
	    n--;
	    n |= n >>> 1;
	    n |= n >>> 2;
	    n |= n >>> 4;
	    n |= n >>> 8;
	    n |= n >>> 16;
	    n++;
	  }
	  return n;
	}

	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function howMuchToRead$2(n, state) {
	  if (n <= 0 || state.length === 0 && state.ended) return 0;
	  if (state.objectMode) return 1;
	  if (n !== n) {
	    // Only flow one buffer at a time
	    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
	  }
	  // If we're asking for more than the current hwm, then raise the hwm.
	  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark$1(n);
	  if (n <= state.length) return n;
	  // Don't have enough
	  if (!state.ended) {
	    state.needReadable = true;
	    return 0;
	  }
	  return state.length;
	}

	// you can override either this method, or the async _read(n) below.
	Readable$3.prototype.read = function (n) {
	  debug$2('read', n);
	  n = parseInt(n, 10);
	  var state = this._readableState;
	  var nOrig = n;

	  if (n !== 0) state.emittedReadable = false;

	  // if we're doing read(0) to trigger a readable event, but we
	  // already have a bunch of data in the buffer, then just trigger
	  // the 'readable' event and move on.
	  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
	    debug$2('read: emitReadable', state.length, state.ended);
	    if (state.length === 0 && state.ended) endReadable$2(this);else emitReadable$2(this);
	    return null;
	  }

	  n = howMuchToRead$2(n, state);

	  // if we've ended, and we're now clear, then finish it up.
	  if (n === 0 && state.ended) {
	    if (state.length === 0) endReadable$2(this);
	    return null;
	  }

	  // All the actual chunk generation logic needs to be
	  // *below* the call to _read.  The reason is that in certain
	  // synthetic stream cases, such as passthrough streams, _read
	  // may be a completely synchronous operation which may change
	  // the state of the read buffer, providing enough data when
	  // before there was *not* enough.
	  //
	  // So, the steps are:
	  // 1. Figure out what the state of things will be after we do
	  // a read from the buffer.
	  //
	  // 2. If that resulting state will trigger a _read, then call _read.
	  // Note that this may be asynchronous, or synchronous.  Yes, it is
	  // deeply ugly to write APIs this way, but that still doesn't mean
	  // that the Readable class should behave improperly, as streams are
	  // designed to be sync/async agnostic.
	  // Take note if the _read call is sync or async (ie, if the read call
	  // has returned yet), so that we know whether or not it's safe to emit
	  // 'readable' etc.
	  //
	  // 3. Actually pull the requested chunks out of the buffer and return.

	  // if we need a readable event, then we need to do some reading.
	  var doRead = state.needReadable;
	  debug$2('need readable', doRead);

	  // if we currently have less than the highWaterMark, then also read some
	  if (state.length === 0 || state.length - n < state.highWaterMark) {
	    doRead = true;
	    debug$2('length less than watermark', doRead);
	  }

	  // however, if we've ended, then there's no point, and if we're already
	  // reading, then it's unnecessary.
	  if (state.ended || state.reading) {
	    doRead = false;
	    debug$2('reading or ended', doRead);
	  } else if (doRead) {
	    debug$2('do read');
	    state.reading = true;
	    state.sync = true;
	    // if the length is currently zero, then we *need* a readable event.
	    if (state.length === 0) state.needReadable = true;
	    // call internal read method
	    this._read(state.highWaterMark);
	    state.sync = false;
	    // If _read pushed data synchronously, then `reading` will be false,
	    // and we need to re-evaluate how much data we can return to the user.
	    if (!state.reading) n = howMuchToRead$2(nOrig, state);
	  }

	  var ret;
	  if (n > 0) ret = fromList$2(n, state);else ret = null;

	  if (ret === null) {
	    state.needReadable = true;
	    n = 0;
	  } else {
	    state.length -= n;
	  }

	  if (state.length === 0) {
	    // If we have nothing in the buffer, then we want to know
	    // as soon as we *do* get something into the buffer.
	    if (!state.ended) state.needReadable = true;

	    // If we tried to read() past the EOF, then emit end on the next tick.
	    if (nOrig !== n && state.ended) endReadable$2(this);
	  }

	  if (ret !== null) this.emit('data', ret);

	  return ret;
	};

	function onEofChunk$2(stream, state) {
	  if (state.ended) return;
	  if (state.decoder) {
	    var chunk = state.decoder.end();
	    if (chunk && chunk.length) {
	      state.buffer.push(chunk);
	      state.length += state.objectMode ? 1 : chunk.length;
	    }
	  }
	  state.ended = true;

	  // emit 'readable' now to make sure it gets picked up.
	  emitReadable$2(stream);
	}

	// Don't emit readable right away in sync mode, because this can trigger
	// another read() call => stack overflow.  This way, it might trigger
	// a nextTick recursion warning, but that's not so bad.
	function emitReadable$2(stream) {
	  var state = stream._readableState;
	  state.needReadable = false;
	  if (!state.emittedReadable) {
	    debug$2('emitReadable', state.flowing);
	    state.emittedReadable = true;
	    if (state.sync) processNextickArgs.nextTick(emitReadable_$2, stream);else emitReadable_$2(stream);
	  }
	}

	function emitReadable_$2(stream) {
	  debug$2('emit readable');
	  stream.emit('readable');
	  flow$2(stream);
	}

	// at this point, the user has presumably seen the 'readable' event,
	// and called read() to consume some data.  that may have triggered
	// in turn another _read(n) call, in which case reading = true if
	// it's in progress.
	// However, if we're not ended, or reading, and the length < hwm,
	// then go ahead and try to read some more preemptively.
	function maybeReadMore$2(stream, state) {
	  if (!state.readingMore) {
	    state.readingMore = true;
	    processNextickArgs.nextTick(maybeReadMore_$2, stream, state);
	  }
	}

	function maybeReadMore_$2(stream, state) {
	  var len = state.length;
	  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
	    debug$2('maybeReadMore read 0');
	    stream.read(0);
	    if (len === state.length)
	      // didn't get any data, stop spinning.
	      break;else len = state.length;
	  }
	  state.readingMore = false;
	}

	// abstract method.  to be overridden in specific implementation classes.
	// call cb(er, data) where data is <= n in length.
	// for virtual (non-string, non-buffer) streams, "length" is somewhat
	// arbitrary, and perhaps not very meaningful.
	Readable$3.prototype._read = function (n) {
	  this.emit('error', new Error('_read() is not implemented'));
	};

	Readable$3.prototype.pipe = function (dest, pipeOpts) {
	  var src = this;
	  var state = this._readableState;

	  switch (state.pipesCount) {
	    case 0:
	      state.pipes = dest;
	      break;
	    case 1:
	      state.pipes = [state.pipes, dest];
	      break;
	    default:
	      state.pipes.push(dest);
	      break;
	  }
	  state.pipesCount += 1;
	  debug$2('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

	  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

	  var endFn = doEnd ? onend : unpipe;
	  if (state.endEmitted) processNextickArgs.nextTick(endFn);else src.once('end', endFn);

	  dest.on('unpipe', onunpipe);
	  function onunpipe(readable, unpipeInfo) {
	    debug$2('onunpipe');
	    if (readable === src) {
	      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
	        unpipeInfo.hasUnpiped = true;
	        cleanup();
	      }
	    }
	  }

	  function onend() {
	    debug$2('onend');
	    dest.end();
	  }

	  // when the dest drains, it reduces the awaitDrain counter
	  // on the source.  This would be more elegant with a .once()
	  // handler in flow(), but adding and removing repeatedly is
	  // too slow.
	  var ondrain = pipeOnDrain$2(src);
	  dest.on('drain', ondrain);

	  var cleanedUp = false;
	  function cleanup() {
	    debug$2('cleanup');
	    // cleanup event handlers once the pipe is broken
	    dest.removeListener('close', onclose);
	    dest.removeListener('finish', onfinish);
	    dest.removeListener('drain', ondrain);
	    dest.removeListener('error', onerror);
	    dest.removeListener('unpipe', onunpipe);
	    src.removeListener('end', onend);
	    src.removeListener('end', unpipe);
	    src.removeListener('data', ondata);

	    cleanedUp = true;

	    // if the reader is waiting for a drain event from this
	    // specific writer, then it would cause it to never start
	    // flowing again.
	    // So, if this is awaiting a drain, then we just call it now.
	    // If we don't know, then assume that we are waiting for one.
	    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
	  }

	  // If the user pushes more data while we're writing to dest then we'll end up
	  // in ondata again. However, we only want to increase awaitDrain once because
	  // dest will only emit one 'drain' event for the multiple writes.
	  // => Introduce a guard on increasing awaitDrain.
	  var increasedAwaitDrain = false;
	  src.on('data', ondata);
	  function ondata(chunk) {
	    debug$2('ondata');
	    increasedAwaitDrain = false;
	    var ret = dest.write(chunk);
	    if (false === ret && !increasedAwaitDrain) {
	      // If the user unpiped during `dest.write()`, it is possible
	      // to get stuck in a permanently paused state if that write
	      // also returned false.
	      // => Check whether `dest` is still a piping destination.
	      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf$2(state.pipes, dest) !== -1) && !cleanedUp) {
	        debug$2('false write response, pause', src._readableState.awaitDrain);
	        src._readableState.awaitDrain++;
	        increasedAwaitDrain = true;
	      }
	      src.pause();
	    }
	  }

	  // if the dest has an error, then stop piping into it.
	  // however, don't suppress the throwing behavior for this.
	  function onerror(er) {
	    debug$2('onerror', er);
	    unpipe();
	    dest.removeListener('error', onerror);
	    if (EElistenerCount$1(dest, 'error') === 0) dest.emit('error', er);
	  }

	  // Make sure our error handler is attached before userland ones.
	  prependListener$1(dest, 'error', onerror);

	  // Both close and finish should trigger unpipe, but only once.
	  function onclose() {
	    dest.removeListener('finish', onfinish);
	    unpipe();
	  }
	  dest.once('close', onclose);
	  function onfinish() {
	    debug$2('onfinish');
	    dest.removeListener('close', onclose);
	    unpipe();
	  }
	  dest.once('finish', onfinish);

	  function unpipe() {
	    debug$2('unpipe');
	    src.unpipe(dest);
	  }

	  // tell the dest that it's being piped to
	  dest.emit('pipe', src);

	  // start the flow if it hasn't been started already.
	  if (!state.flowing) {
	    debug$2('pipe resume');
	    src.resume();
	  }

	  return dest;
	};

	function pipeOnDrain$2(src) {
	  return function () {
	    var state = src._readableState;
	    debug$2('pipeOnDrain', state.awaitDrain);
	    if (state.awaitDrain) state.awaitDrain--;
	    if (state.awaitDrain === 0 && EElistenerCount$1(src, 'data')) {
	      state.flowing = true;
	      flow$2(src);
	    }
	  };
	}

	Readable$3.prototype.unpipe = function (dest) {
	  var state = this._readableState;
	  var unpipeInfo = { hasUnpiped: false };

	  // if we're not piping anywhere, then do nothing.
	  if (state.pipesCount === 0) return this;

	  // just one destination.  most common case.
	  if (state.pipesCount === 1) {
	    // passed in one, but it's not the right one.
	    if (dest && dest !== state.pipes) return this;

	    if (!dest) dest = state.pipes;

	    // got a match.
	    state.pipes = null;
	    state.pipesCount = 0;
	    state.flowing = false;
	    if (dest) dest.emit('unpipe', this, unpipeInfo);
	    return this;
	  }

	  // slow case. multiple pipe destinations.

	  if (!dest) {
	    // remove all.
	    var dests = state.pipes;
	    var len = state.pipesCount;
	    state.pipes = null;
	    state.pipesCount = 0;
	    state.flowing = false;

	    for (var i = 0; i < len; i++) {
	      dests[i].emit('unpipe', this, unpipeInfo);
	    }return this;
	  }

	  // try to find the right one.
	  var index = indexOf$2(state.pipes, dest);
	  if (index === -1) return this;

	  state.pipes.splice(index, 1);
	  state.pipesCount -= 1;
	  if (state.pipesCount === 1) state.pipes = state.pipes[0];

	  dest.emit('unpipe', this, unpipeInfo);

	  return this;
	};

	// set up data events if they are asked for
	// Ensure readable listeners eventually get something
	Readable$3.prototype.on = function (ev, fn) {
	  var res = stream$1.prototype.on.call(this, ev, fn);

	  if (ev === 'data') {
	    // Start flowing on next tick if stream isn't explicitly paused
	    if (this._readableState.flowing !== false) this.resume();
	  } else if (ev === 'readable') {
	    var state = this._readableState;
	    if (!state.endEmitted && !state.readableListening) {
	      state.readableListening = state.needReadable = true;
	      state.emittedReadable = false;
	      if (!state.reading) {
	        processNextickArgs.nextTick(nReadingNextTick$1, this);
	      } else if (state.length) {
	        emitReadable$2(this);
	      }
	    }
	  }

	  return res;
	};
	Readable$3.prototype.addListener = Readable$3.prototype.on;

	function nReadingNextTick$1(self) {
	  debug$2('readable nexttick read 0');
	  self.read(0);
	}

	// pause() and resume() are remnants of the legacy readable stream API
	// If the user uses them, then switch into old mode.
	Readable$3.prototype.resume = function () {
	  var state = this._readableState;
	  if (!state.flowing) {
	    debug$2('resume');
	    state.flowing = true;
	    resume$1(this, state);
	  }
	  return this;
	};

	function resume$1(stream, state) {
	  if (!state.resumeScheduled) {
	    state.resumeScheduled = true;
	    processNextickArgs.nextTick(resume_$1, stream, state);
	  }
	}

	function resume_$1(stream, state) {
	  if (!state.reading) {
	    debug$2('resume read 0');
	    stream.read(0);
	  }

	  state.resumeScheduled = false;
	  state.awaitDrain = 0;
	  stream.emit('resume');
	  flow$2(stream);
	  if (state.flowing && !state.reading) stream.read(0);
	}

	Readable$3.prototype.pause = function () {
	  debug$2('call pause flowing=%j', this._readableState.flowing);
	  if (false !== this._readableState.flowing) {
	    debug$2('pause');
	    this._readableState.flowing = false;
	    this.emit('pause');
	  }
	  return this;
	};

	function flow$2(stream) {
	  var state = stream._readableState;
	  debug$2('flow', state.flowing);
	  while (state.flowing && stream.read() !== null) {}
	}

	// wrap an old-style stream as the async data source.
	// This is *not* part of the readable stream interface.
	// It is an ugly unfortunate mess of history.
	Readable$3.prototype.wrap = function (stream) {
	  var _this = this;

	  var state = this._readableState;
	  var paused = false;

	  stream.on('end', function () {
	    debug$2('wrapped end');
	    if (state.decoder && !state.ended) {
	      var chunk = state.decoder.end();
	      if (chunk && chunk.length) _this.push(chunk);
	    }

	    _this.push(null);
	  });

	  stream.on('data', function (chunk) {
	    debug$2('wrapped data');
	    if (state.decoder) chunk = state.decoder.write(chunk);

	    // don't skip over falsy values in objectMode
	    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

	    var ret = _this.push(chunk);
	    if (!ret) {
	      paused = true;
	      stream.pause();
	    }
	  });

	  // proxy all the other methods.
	  // important when wrapping filters and duplexes.
	  for (var i in stream) {
	    if (this[i] === undefined && typeof stream[i] === 'function') {
	      this[i] = function (method) {
	        return function () {
	          return stream[method].apply(stream, arguments);
	        };
	      }(i);
	    }
	  }

	  // proxy certain important events.
	  for (var n = 0; n < kProxyEvents$1.length; n++) {
	    stream.on(kProxyEvents$1[n], this.emit.bind(this, kProxyEvents$1[n]));
	  }

	  // when we try to consume some more bytes, simply unpause the
	  // underlying stream.
	  this._read = function (n) {
	    debug$2('wrapped _read', n);
	    if (paused) {
	      paused = false;
	      stream.resume();
	    }
	  };

	  return this;
	};

	// exposed for testing purposes only.
	Readable$3._fromList = fromList$2;

	// Pluck off n bytes from an array of buffers.
	// Length is the combined lengths of all the buffers in the list.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function fromList$2(n, state) {
	  // nothing buffered
	  if (state.length === 0) return null;

	  var ret;
	  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
	    // read it all, truncate the list
	    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
	    state.buffer.clear();
	  } else {
	    // read part of list
	    ret = fromListPartial$1(n, state.buffer, state.decoder);
	  }

	  return ret;
	}

	// Extracts only enough buffered data to satisfy the amount requested.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function fromListPartial$1(n, list, hasStrings) {
	  var ret;
	  if (n < list.head.data.length) {
	    // slice is the same for buffers and strings
	    ret = list.head.data.slice(0, n);
	    list.head.data = list.head.data.slice(n);
	  } else if (n === list.head.data.length) {
	    // first chunk is a perfect match
	    ret = list.shift();
	  } else {
	    // result spans more than one buffer
	    ret = hasStrings ? copyFromBufferString$1(n, list) : copyFromBuffer$1(n, list);
	  }
	  return ret;
	}

	// Copies a specified amount of characters from the list of buffered data
	// chunks.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function copyFromBufferString$1(n, list) {
	  var p = list.head;
	  var c = 1;
	  var ret = p.data;
	  n -= ret.length;
	  while (p = p.next) {
	    var str = p.data;
	    var nb = n > str.length ? str.length : n;
	    if (nb === str.length) ret += str;else ret += str.slice(0, n);
	    n -= nb;
	    if (n === 0) {
	      if (nb === str.length) {
	        ++c;
	        if (p.next) list.head = p.next;else list.head = list.tail = null;
	      } else {
	        list.head = p;
	        p.data = str.slice(nb);
	      }
	      break;
	    }
	    ++c;
	  }
	  list.length -= c;
	  return ret;
	}

	// Copies a specified amount of bytes from the list of buffered data chunks.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function copyFromBuffer$1(n, list) {
	  var ret = Buffer$8.allocUnsafe(n);
	  var p = list.head;
	  var c = 1;
	  p.data.copy(ret);
	  n -= p.data.length;
	  while (p = p.next) {
	    var buf = p.data;
	    var nb = n > buf.length ? buf.length : n;
	    buf.copy(ret, ret.length - n, 0, nb);
	    n -= nb;
	    if (n === 0) {
	      if (nb === buf.length) {
	        ++c;
	        if (p.next) list.head = p.next;else list.head = list.tail = null;
	      } else {
	        list.head = p;
	        p.data = buf.slice(nb);
	      }
	      break;
	    }
	    ++c;
	  }
	  list.length -= c;
	  return ret;
	}

	function endReadable$2(stream) {
	  var state = stream._readableState;

	  // If we get here before consuming all the bytes, then that is a
	  // bug in node.  Should never happen.
	  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

	  if (!state.endEmitted) {
	    state.ended = true;
	    processNextickArgs.nextTick(endReadableNT$1, state, stream);
	  }
	}

	function endReadableNT$1(state, stream) {
	  // Check that we didn't get one last unshift.
	  if (!state.endEmitted && state.length === 0) {
	    state.endEmitted = true;
	    stream.readable = false;
	    stream.emit('end');
	  }
	}

	function indexOf$2(xs, x) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    if (xs[i] === x) return i;
	  }
	  return -1;
	}

	var _stream_transform$2 = Transform$2;



	/*<replacement>*/

	util$1.inherits = inherits;
	/*</replacement>*/

	util$1.inherits(Transform$2, _stream_duplex$2);

	function afterTransform$2(er, data) {
	  var ts = this._transformState;
	  ts.transforming = false;

	  var cb = ts.writecb;

	  if (!cb) {
	    return this.emit('error', new Error('write callback called multiple times'));
	  }

	  ts.writechunk = null;
	  ts.writecb = null;

	  if (data != null) // single equals check for both `null` and `undefined`
	    this.push(data);

	  cb(er);

	  var rs = this._readableState;
	  rs.reading = false;
	  if (rs.needReadable || rs.length < rs.highWaterMark) {
	    this._read(rs.highWaterMark);
	  }
	}

	function Transform$2(options) {
	  if (!(this instanceof Transform$2)) return new Transform$2(options);

	  _stream_duplex$2.call(this, options);

	  this._transformState = {
	    afterTransform: afterTransform$2.bind(this),
	    needTransform: false,
	    transforming: false,
	    writecb: null,
	    writechunk: null,
	    writeencoding: null
	  };

	  // start out asking for a readable event once data is transformed.
	  this._readableState.needReadable = true;

	  // we have implemented the _read method, and done the other things
	  // that Readable wants before the first _read call, so unset the
	  // sync guard flag.
	  this._readableState.sync = false;

	  if (options) {
	    if (typeof options.transform === 'function') this._transform = options.transform;

	    if (typeof options.flush === 'function') this._flush = options.flush;
	  }

	  // When the writable side finishes, then flush out anything remaining.
	  this.on('prefinish', prefinish$3);
	}

	function prefinish$3() {
	  var _this = this;

	  if (typeof this._flush === 'function') {
	    this._flush(function (er, data) {
	      done$2(_this, er, data);
	    });
	  } else {
	    done$2(this, null, null);
	  }
	}

	Transform$2.prototype.push = function (chunk, encoding) {
	  this._transformState.needTransform = false;
	  return _stream_duplex$2.prototype.push.call(this, chunk, encoding);
	};

	// This is the part where you do stuff!
	// override this function in implementation classes.
	// 'chunk' is an input chunk.
	//
	// Call `push(newChunk)` to pass along transformed output
	// to the readable side.  You may call 'push' zero or more times.
	//
	// Call `cb(err)` when you are done with this chunk.  If you pass
	// an error, then that'll put the hurt on the whole operation.  If you
	// never call cb(), then you'll never get another chunk.
	Transform$2.prototype._transform = function (chunk, encoding, cb) {
	  throw new Error('_transform() is not implemented');
	};

	Transform$2.prototype._write = function (chunk, encoding, cb) {
	  var ts = this._transformState;
	  ts.writecb = cb;
	  ts.writechunk = chunk;
	  ts.writeencoding = encoding;
	  if (!ts.transforming) {
	    var rs = this._readableState;
	    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
	  }
	};

	// Doesn't matter what the args are here.
	// _transform does all the work.
	// That we got here means that the readable side wants more data.
	Transform$2.prototype._read = function (n) {
	  var ts = this._transformState;

	  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
	    ts.transforming = true;
	    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
	  } else {
	    // mark that we need a transform, so that any data that comes in
	    // will get processed, now that we've asked for it.
	    ts.needTransform = true;
	  }
	};

	Transform$2.prototype._destroy = function (err, cb) {
	  var _this2 = this;

	  _stream_duplex$2.prototype._destroy.call(this, err, function (err2) {
	    cb(err2);
	    _this2.emit('close');
	  });
	};

	function done$2(stream, er, data) {
	  if (er) return stream.emit('error', er);

	  if (data != null) // single equals check for both `null` and `undefined`
	    stream.push(data);

	  // if there's nothing in the write buffer, then that means
	  // that nothing more will ever be provided
	  if (stream._writableState.length) throw new Error('Calling transform done when ws.length != 0');

	  if (stream._transformState.transforming) throw new Error('Calling transform done when still transforming');

	  return stream.push(null);
	}

	var _stream_passthrough$2 = PassThrough$2;



	/*<replacement>*/

	util$1.inherits = inherits;
	/*</replacement>*/

	util$1.inherits(PassThrough$2, _stream_transform$2);

	function PassThrough$2(options) {
	  if (!(this instanceof PassThrough$2)) return new PassThrough$2(options);

	  _stream_transform$2.call(this, options);
	}

	PassThrough$2.prototype._transform = function (chunk, encoding, cb) {
	  cb(null, chunk);
	};

	var readable$2 = createCommonjsModule(function (module, exports) {
	if (process.env.READABLE_STREAM === 'disable' && Stream) {
	  module.exports = Stream;
	  exports = module.exports = Stream.Readable;
	  exports.Readable = Stream.Readable;
	  exports.Writable = Stream.Writable;
	  exports.Duplex = Stream.Duplex;
	  exports.Transform = Stream.Transform;
	  exports.PassThrough = Stream.PassThrough;
	  exports.Stream = Stream;
	} else {
	  exports = module.exports = _stream_readable$2;
	  exports.Stream = Stream || exports;
	  exports.Readable = exports;
	  exports.Writable = _stream_writable$2;
	  exports.Duplex = _stream_duplex$2;
	  exports.Transform = _stream_transform$2;
	  exports.PassThrough = _stream_passthrough$2;
	}
	});
	var readable_1$2 = readable$2.Readable;
	var readable_2$2 = readable$2.Writable;
	var readable_3$2 = readable$2.Duplex;
	var readable_4$2 = readable$2.Transform;
	var readable_5$2 = readable$2.PassThrough;
	var readable_6$2 = readable$2.Stream;

	var transform = readable$2.Transform;

	var inherits$2  = util.inherits;

	function DestroyableTransform(opts) {
	  transform.call(this, opts);
	  this._destroyed = false;
	}

	inherits$2(DestroyableTransform, transform);

	DestroyableTransform.prototype.destroy = function(err) {
	  if (this._destroyed) return
	  this._destroyed = true;
	  
	  var self = this;
	  process.nextTick(function() {
	    if (err)
	      self.emit('error', err);
	    self.emit('close');
	  });
	};

	// a noop _transform function
	function noop (chunk, enc, callback) {
	  callback(null, chunk);
	}


	// create a new export function, used by both the main export and
	// the .ctor export, contains common logic for dealing with arguments
	function through2 (construct) {
	  return function (options, transform$$1, flush) {
	    if (typeof options == 'function') {
	      flush     = transform$$1;
	      transform$$1 = options;
	      options   = {};
	    }

	    if (typeof transform$$1 != 'function')
	      transform$$1 = noop;

	    if (typeof flush != 'function')
	      flush = null;

	    return construct(options, transform$$1, flush)
	  }
	}


	var obj = through2(function (options, transform$$1, flush) {
	  var t2 = new DestroyableTransform(immutable({ objectMode: true, highWaterMark: 16 }, options));

	  t2._transform = transform$$1;

	  if (flush)
	    t2._flush = flush;

	  return t2
	});

	/**
	 * Copyright (c) 2013 Petka Antonov
	 * 
	 * Permission is hereby granted, free of charge, to any person obtaining a copy
	 * of this software and associated documentation files (the "Software"), to deal
	 * in the Software without restriction, including without limitation the rights
	 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the Software is
	 * furnished to do so, subject to the following conditions:</p>
	 * 
	 * The above copyright notice and this permission notice shall be included in
	 * all copies or substantial portions of the Software.
	 * 
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
	 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 * THE SOFTWARE.
	 */
	function Deque(capacity) {
	    this._capacity = getCapacity(capacity);
	    this._length = 0;
	    this._front = 0;
	    if (isArray$1(capacity)) {
	        var len = capacity.length;
	        for (var i = 0; i < len; ++i) {
	            this[i] = capacity[i];
	        }
	        this._length = len;
	    }
	}

	Deque.prototype.toArray = function Deque$toArray() {
	    var len = this._length;
	    var ret = new Array(len);
	    var front = this._front;
	    var capacity = this._capacity;
	    for (var j = 0; j < len; ++j) {
	        ret[j] = this[(front + j) & (capacity - 1)];
	    }
	    return ret;
	};

	Deque.prototype.push = function Deque$push(item) {
	    var argsLength = arguments.length;
	    var length = this._length;
	    if (argsLength > 1) {
	        var capacity = this._capacity;
	        if (length + argsLength > capacity) {
	            for (var i = 0; i < argsLength; ++i) {
	                this._checkCapacity(length + 1);
	                var j = (this._front + length) & (this._capacity - 1);
	                this[j] = arguments[i];
	                length++;
	                this._length = length;
	            }
	            return length;
	        }
	        else {
	            var j = this._front;
	            for (var i = 0; i < argsLength; ++i) {
	                this[(j + length) & (capacity - 1)] = arguments[i];
	                j++;
	            }
	            this._length = length + argsLength;
	            return length + argsLength;
	        }

	    }

	    if (argsLength === 0) return length;

	    this._checkCapacity(length + 1);
	    var i = (this._front + length) & (this._capacity - 1);
	    this[i] = item;
	    this._length = length + 1;
	    return length + 1;
	};

	Deque.prototype.pop = function Deque$pop() {
	    var length = this._length;
	    if (length === 0) {
	        return void 0;
	    }
	    var i = (this._front + length - 1) & (this._capacity - 1);
	    var ret = this[i];
	    this[i] = void 0;
	    this._length = length - 1;
	    return ret;
	};

	Deque.prototype.shift = function Deque$shift() {
	    var length = this._length;
	    if (length === 0) {
	        return void 0;
	    }
	    var front = this._front;
	    var ret = this[front];
	    this[front] = void 0;
	    this._front = (front + 1) & (this._capacity - 1);
	    this._length = length - 1;
	    return ret;
	};

	Deque.prototype.unshift = function Deque$unshift(item) {
	    var length = this._length;
	    var argsLength = arguments.length;


	    if (argsLength > 1) {
	        var capacity = this._capacity;
	        if (length + argsLength > capacity) {
	            for (var i = argsLength - 1; i >= 0; i--) {
	                this._checkCapacity(length + 1);
	                var capacity = this._capacity;
	                var j = (((( this._front - 1 ) &
	                    ( capacity - 1) ) ^ capacity ) - capacity );
	                this[j] = arguments[i];
	                length++;
	                this._length = length;
	                this._front = j;
	            }
	            return length;
	        }
	        else {
	            var front = this._front;
	            for (var i = argsLength - 1; i >= 0; i--) {
	                var j = (((( front - 1 ) &
	                    ( capacity - 1) ) ^ capacity ) - capacity );
	                this[j] = arguments[i];
	                front = j;
	            }
	            this._front = front;
	            this._length = length + argsLength;
	            return length + argsLength;
	        }
	    }

	    if (argsLength === 0) return length;

	    this._checkCapacity(length + 1);
	    var capacity = this._capacity;
	    var i = (((( this._front - 1 ) &
	        ( capacity - 1) ) ^ capacity ) - capacity );
	    this[i] = item;
	    this._length = length + 1;
	    this._front = i;
	    return length + 1;
	};

	Deque.prototype.peekBack = function Deque$peekBack() {
	    var length = this._length;
	    if (length === 0) {
	        return void 0;
	    }
	    var index = (this._front + length - 1) & (this._capacity - 1);
	    return this[index];
	};

	Deque.prototype.peekFront = function Deque$peekFront() {
	    if (this._length === 0) {
	        return void 0;
	    }
	    return this[this._front];
	};

	Deque.prototype.get = function Deque$get(index) {
	    var i = index;
	    if ((i !== (i | 0))) {
	        return void 0;
	    }
	    var len = this._length;
	    if (i < 0) {
	        i = i + len;
	    }
	    if (i < 0 || i >= len) {
	        return void 0;
	    }
	    return this[(this._front + i) & (this._capacity - 1)];
	};

	Deque.prototype.isEmpty = function Deque$isEmpty() {
	    return this._length === 0;
	};

	Deque.prototype.clear = function Deque$clear() {
	    var len = this._length;
	    var front = this._front;
	    var capacity = this._capacity;
	    for (var j = 0; j < len; ++j) {
	        this[(front + j) & (capacity - 1)] = void 0;
	    }
	    this._length = 0;
	    this._front = 0;
	};

	Deque.prototype.toString = function Deque$toString() {
	    return this.toArray().toString();
	};

	Deque.prototype.valueOf = Deque.prototype.toString;
	Deque.prototype.removeFront = Deque.prototype.shift;
	Deque.prototype.removeBack = Deque.prototype.pop;
	Deque.prototype.insertFront = Deque.prototype.unshift;
	Deque.prototype.insertBack = Deque.prototype.push;
	Deque.prototype.enqueue = Deque.prototype.push;
	Deque.prototype.dequeue = Deque.prototype.shift;
	Deque.prototype.toJSON = Deque.prototype.toArray;

	Object.defineProperty(Deque.prototype, "length", {
	    get: function() {
	        return this._length;
	    },
	    set: function() {
	        throw new RangeError("");
	    }
	});

	Deque.prototype._checkCapacity = function Deque$_checkCapacity(size) {
	    if (this._capacity < size) {
	        this._resizeTo(getCapacity(this._capacity * 1.5 + 16));
	    }
	};

	Deque.prototype._resizeTo = function Deque$_resizeTo(capacity) {
	    var oldCapacity = this._capacity;
	    this._capacity = capacity;
	    var front = this._front;
	    var length = this._length;
	    if (front + length > oldCapacity) {
	        var moveItemsCount = (front + length) & (oldCapacity - 1);
	        arrayMove(this, 0, this, oldCapacity, moveItemsCount);
	    }
	};


	var isArray$1 = Array.isArray;

	function arrayMove(src, srcIndex, dst, dstIndex, len) {
	    for (var j = 0; j < len; ++j) {
	        dst[j + dstIndex] = src[j + srcIndex];
	        src[j + srcIndex] = void 0;
	    }
	}

	function pow2AtLeast(n) {
	    n = n >>> 0;
	    n = n - 1;
	    n = n | (n >> 1);
	    n = n | (n >> 2);
	    n = n | (n >> 4);
	    n = n | (n >> 8);
	    n = n | (n >> 16);
	    return n + 1;
	}

	function getCapacity(capacity) {
	    if (typeof capacity !== "number") {
	        if (isArray$1(capacity)) {
	            capacity = capacity.length;
	        }
	        else {
	            return 16;
	        }
	    }
	    return pow2AtLeast(
	        Math.min(
	            Math.max(16, capacity), 1073741824)
	    );
	}

	var deque = Deque;

	/* Copyright (c) 2017 Rod Vagg, MIT License */

	function AbstractIterator$3 (db) {
	  this.db = db;
	  this._ended = false;
	  this._nexting = false;
	}

	AbstractIterator$3.prototype.next = function (callback) {
	  var self = this;

	  if (typeof callback !== 'function') {
	    throw new Error('next() requires a callback argument')
	  }

	  if (self._ended) {
	    process.nextTick(callback, new Error('cannot call next() after end()'));
	    return self
	  }

	  if (self._nexting) {
	    process.nextTick(callback, new Error('cannot call next() before previous next() has completed'));
	    return self
	  }

	  self._nexting = true;
	  self._next(function () {
	    self._nexting = false;
	    callback.apply(null, arguments);
	  });

	  return self
	};

	AbstractIterator$3.prototype._next = function (callback) {
	  process.nextTick(callback);
	};

	AbstractIterator$3.prototype.end = function (callback) {
	  if (typeof callback !== 'function') {
	    throw new Error('end() requires a callback argument')
	  }

	  if (this._ended) {
	    return process.nextTick(callback, new Error('end() already called on iterator'))
	  }

	  this._ended = true;
	  this._end(callback);
	};

	AbstractIterator$3.prototype._end = function (callback) {
	  process.nextTick(callback);
	};

	var abstractIterator$1 = AbstractIterator$3;

	/* Copyright (c) 2017 Rod Vagg, MIT License */

	function AbstractChainedBatch$2 (db) {
	  this._db = db;
	  this._operations = [];
	  this._written = false;
	}

	AbstractChainedBatch$2.prototype._serializeKey = function (key) {
	  return this._db._serializeKey(key)
	};

	AbstractChainedBatch$2.prototype._serializeValue = function (value) {
	  return this._db._serializeValue(value)
	};

	AbstractChainedBatch$2.prototype._checkWritten = function () {
	  if (this._written) {
	    throw new Error('write() already called on this batch')
	  }
	};

	AbstractChainedBatch$2.prototype.put = function (key, value) {
	  this._checkWritten();

	  var err = this._db._checkKey(key, 'key');
	  if (err) { throw err }

	  key = this._serializeKey(key);
	  value = this._serializeValue(value);

	  this._put(key, value);

	  return this
	};

	AbstractChainedBatch$2.prototype._put = function (key, value) {
	  this._operations.push({ type: 'put', key: key, value: value });
	};

	AbstractChainedBatch$2.prototype.del = function (key) {
	  this._checkWritten();

	  var err = this._db._checkKey(key, 'key');
	  if (err) { throw err }

	  key = this._serializeKey(key);
	  this._del(key);

	  return this
	};

	AbstractChainedBatch$2.prototype._del = function (key) {
	  this._operations.push({ type: 'del', key: key });
	};

	AbstractChainedBatch$2.prototype.clear = function () {
	  this._checkWritten();
	  this._operations = [];
	  this._clear();

	  return this
	};

	AbstractChainedBatch$2.prototype._clear = function noop () {};

	AbstractChainedBatch$2.prototype.write = function (options, callback) {
	  this._checkWritten();

	  if (typeof options === 'function') { callback = options; }
	  if (typeof callback !== 'function') {
	    throw new Error('write() requires a callback argument')
	  }
	  if (typeof options !== 'object') { options = {}; }

	  this._written = true;

	  // @ts-ignore
	  if (typeof this._write === 'function') { return this._write(callback) }

	  if (typeof this._db._batch === 'function') {
	    return this._db._batch(this._operations, options, callback)
	  }

	  process.nextTick(callback);
	};

	var abstractChainedBatch$1 = AbstractChainedBatch$2;

	/* Copyright (c) 2017 Rod Vagg, MIT License */




	const hasOwnProperty$1 = Object.prototype.hasOwnProperty;
	const rangeOptions = 'start end gt gte lt lte'.split(' ');

	function AbstractLevelDOWN$3 (location) {
	  if (!arguments.length || location === undefined) {
	    throw new Error('constructor requires at least a location argument')
	  }

	  if (typeof location !== 'string') {
	    throw new Error('constructor requires a location string argument')
	  }

	  this.location = location;
	  this.status = 'new';
	}

	AbstractLevelDOWN$3.prototype.open = function (options, callback) {
	  var self = this;
	  var oldStatus = this.status;

	  if (typeof options === 'function') { callback = options; }

	  if (typeof callback !== 'function') {
	    throw new Error('open() requires a callback argument')
	  }

	  if (typeof options !== 'object') { options = {}; }

	  options.createIfMissing = options.createIfMissing !== false;
	  options.errorIfExists = !!options.errorIfExists;

	  this.status = 'opening';
	  this._open(options, function (err) {
	    if (err) {
	      self.status = oldStatus;
	      return callback(err)
	    }
	    self.status = 'open';
	    callback();
	  });
	};

	AbstractLevelDOWN$3.prototype._open = function (options, callback) {
	  process.nextTick(callback);
	};

	AbstractLevelDOWN$3.prototype.close = function (callback) {
	  var self = this;
	  var oldStatus = this.status;

	  if (typeof callback !== 'function') {
	    throw new Error('close() requires a callback argument')
	  }

	  this.status = 'closing';
	  this._close(function (err) {
	    if (err) {
	      self.status = oldStatus;
	      return callback(err)
	    }
	    self.status = 'closed';
	    callback();
	  });
	};

	AbstractLevelDOWN$3.prototype._close = function (callback) {
	  process.nextTick(callback);
	};

	AbstractLevelDOWN$3.prototype.get = function (key, options, callback) {
	  if (typeof options === 'function') { callback = options; }

	  if (typeof callback !== 'function') {
	    throw new Error('get() requires a callback argument')
	  }

	  var err = this._checkKey(key, 'key');
	  if (err) return process.nextTick(callback, err)

	  key = this._serializeKey(key);

	  if (typeof options !== 'object') { options = {}; }

	  options.asBuffer = options.asBuffer !== false;

	  this._get(key, options, callback);
	};

	AbstractLevelDOWN$3.prototype._get = function (key, options, callback) {
	  process.nextTick(function () { callback(new Error('NotFound')); });
	};

	AbstractLevelDOWN$3.prototype.put = function (key, value, options, callback) {
	  if (typeof options === 'function') { callback = options; }

	  if (typeof callback !== 'function') {
	    throw new Error('put() requires a callback argument')
	  }

	  var err = this._checkKey(key, 'key');
	  if (err) return process.nextTick(callback, err)

	  key = this._serializeKey(key);
	  value = this._serializeValue(value);

	  if (typeof options !== 'object') { options = {}; }

	  this._put(key, value, options, callback);
	};

	AbstractLevelDOWN$3.prototype._put = function (key, value, options, callback) {
	  process.nextTick(callback);
	};

	AbstractLevelDOWN$3.prototype.del = function (key, options, callback) {
	  if (typeof options === 'function') { callback = options; }

	  if (typeof callback !== 'function') {
	    throw new Error('del() requires a callback argument')
	  }

	  var err = this._checkKey(key, 'key');
	  if (err) return process.nextTick(callback, err)

	  key = this._serializeKey(key);

	  if (typeof options !== 'object') { options = {}; }

	  this._del(key, options, callback);
	};

	AbstractLevelDOWN$3.prototype._del = function (key, options, callback) {
	  process.nextTick(callback);
	};

	AbstractLevelDOWN$3.prototype.batch = function (array, options, callback) {
	  if (!arguments.length) { return this._chainedBatch() }

	  if (typeof options === 'function') { callback = options; }

	  if (typeof array === 'function') { callback = array; }

	  if (typeof callback !== 'function') {
	    throw new Error('batch(array) requires a callback argument')
	  }

	  if (!Array.isArray(array)) {
	    return process.nextTick(callback, new Error('batch(array) requires an array argument'))
	  }

	  if (!options || typeof options !== 'object') { options = {}; }

	  var serialized = new Array(array.length);

	  for (var i = 0; i < array.length; i++) {
	    if (typeof array[i] !== 'object' || array[i] === null) {
	      return process.nextTick(callback, new Error('batch(array) element must be an object and not `null`'))
	    }

	    var e = immutable(array[i]);

	    if (e.type !== 'put' && e.type !== 'del') {
	      return process.nextTick(callback, new Error("`type` must be 'put' or 'del'"))
	    }

	    var err = this._checkKey(e.key, 'key');
	    if (err) return process.nextTick(callback, err)

	    e.key = this._serializeKey(e.key);

	    if (e.type === 'put') { e.value = this._serializeValue(e.value); }

	    serialized[i] = e;
	  }

	  this._batch(serialized, options, callback);
	};

	AbstractLevelDOWN$3.prototype._batch = function (array, options, callback) {
	  process.nextTick(callback);
	};

	AbstractLevelDOWN$3.prototype._setupIteratorOptions = function (options) {
	  options = cleanRangeOptions(options);

	  options.reverse = !!options.reverse;
	  options.keys = options.keys !== false;
	  options.values = options.values !== false;
	  options.limit = 'limit' in options ? options.limit : -1;
	  options.keyAsBuffer = options.keyAsBuffer !== false;
	  options.valueAsBuffer = options.valueAsBuffer !== false;

	  return options
	};

	function cleanRangeOptions (options) {
	  var result = {};

	  for (var k in options) {
	    if (!hasOwnProperty$1.call(options, k)) continue
	    if (isRangeOption(k) && isEmptyRangeOption(options[k])) continue

	    result[k] = options[k];
	  }

	  return result
	}

	function isRangeOption (k) {
	  return rangeOptions.indexOf(k) !== -1
	}

	function isEmptyRangeOption (v) {
	  return v === '' || v == null || isEmptyBuffer(v)
	}

	function isEmptyBuffer (v) {
	  return Buffer.isBuffer(v) && v.length === 0
	}

	AbstractLevelDOWN$3.prototype.iterator = function (options) {
	  if (typeof options !== 'object') { options = {}; }
	  options = this._setupIteratorOptions(options);
	  return this._iterator(options)
	};

	AbstractLevelDOWN$3.prototype._iterator = function (options) {
	  return new abstractIterator$1(this)
	};

	AbstractLevelDOWN$3.prototype._chainedBatch = function () {
	  return new abstractChainedBatch$1(this)
	};

	AbstractLevelDOWN$3.prototype._serializeKey = function (key) {
	  return Buffer.isBuffer(key) ? key : String(key)
	};

	AbstractLevelDOWN$3.prototype._serializeValue = function (value) {
	  if (value == null) return ''
	  return Buffer.isBuffer(value) || process.browser ? value : String(value)
	};

	AbstractLevelDOWN$3.prototype._checkKey = function (obj, type) {
	  if (obj === null || obj === undefined) {
	    return new Error(type + ' cannot be `null` or `undefined`')
	  }

	  if (Buffer.isBuffer(obj) && obj.length === 0) {
	    return new Error(type + ' cannot be an empty Buffer')
	  }

	  if (String(obj) === '') {
	    return new Error(type + ' cannot be an empty String')
	  }
	};

	var abstractLeveldown$2 = AbstractLevelDOWN$3;

	var AbstractLevelDOWN$4 = abstractLeveldown$2;
	var AbstractIterator$4 = abstractIterator$1;
	var AbstractChainedBatch$3 = abstractChainedBatch$1;

	var abstractLeveldown$3 = {
		AbstractLevelDOWN: AbstractLevelDOWN$4,
		AbstractIterator: AbstractIterator$4,
		AbstractChainedBatch: AbstractChainedBatch$3
	};

	var encodings$1 = createCommonjsModule(function (module, exports) {
	exports.utf8 = exports['utf-8'] = {
	  encode: function(data){
	    return isBinary(data)
	      ? data
	      : String(data);
	  },
	  decode: identity,
	  buffer: false,
	  type: 'utf8'
	};

	exports.json = {
	  encode: JSON.stringify,
	  decode: JSON.parse,
	  buffer: false,
	  type: 'json'
	};

	exports.binary = {
	  encode: function(data){
	    return isBinary(data)
	      ? data
	      : new Buffer(data);      
	  },
	  decode: identity,
	  buffer: true,
	  type: 'binary'
	};

	exports.none = {
	  encode: identity,
	  decode: identity,
	  buffer: false,
	  type: 'id'
	};

	exports.id = exports.none;

	var bufferEncodings = [
	  'hex',
	  'ascii',
	  'base64',
	  'ucs2',
	  'ucs-2',
	  'utf16le',
	  'utf-16le'
	];

	bufferEncodings.forEach(function(type){
	  exports[type] = {
	    encode: function(data){
	      return isBinary(data)
	        ? data
	        : new Buffer(data, type);
	    },
	    decode: function(buffer$$1){
	      return buffer$$1.toString(type);
	    },
	    buffer: true,
	    type: type
	  };
	});

	function identity(value){
	  return value;
	}

	function isBinary(data){
	  return data === undefined
	    || data === null
	    || Buffer.isBuffer(data);
	}
	});
	var encodings_1$1 = encodings$1.utf8;
	var encodings_2$1 = encodings$1.json;
	var encodings_3$1 = encodings$1.binary;
	var encodings_4$1 = encodings$1.none;
	var encodings_5$1 = encodings$1.id;

	var levelCodec$1 = Codec$1;

	function Codec$1(opts){
	  this.opts = opts || {};
	  this.encodings = encodings$1;
	}

	Codec$1.prototype._encoding = function(encoding){
	  if (typeof encoding == 'string') encoding = encodings$1[encoding];
	  if (!encoding) encoding = encodings$1.id;
	  return encoding;
	};

	Codec$1.prototype._keyEncoding = function(opts, batchOpts){
	  return this._encoding(batchOpts && batchOpts.keyEncoding
	    || opts && opts.keyEncoding
	    || this.opts.keyEncoding);
	};

	Codec$1.prototype._valueEncoding = function(opts, batchOpts){
	  return this._encoding(
	    batchOpts && (batchOpts.valueEncoding || batchOpts.encoding)
	    || opts && (opts.valueEncoding || opts.encoding)
	    || (this.opts.valueEncoding || this.opts.encoding));
	};

	Codec$1.prototype.encodeKey = function(key, opts, batchOpts){
	  return this._keyEncoding(opts, batchOpts).encode(key);
	};

	Codec$1.prototype.encodeValue = function(value, opts, batchOpts){
	  return this._valueEncoding(opts, batchOpts).encode(value);
	};

	Codec$1.prototype.decodeKey = function(key, opts){
	  return this._keyEncoding(opts).decode(key);
	};

	Codec$1.prototype.decodeValue = function(value, opts){
	  return this._valueEncoding(opts).decode(value);
	};

	Codec$1.prototype.encodeBatch = function(ops, opts){
	  var self = this;

	  return ops.map(function(_op){
	    var op = {
	      type: _op.type,
	      key: self.encodeKey(_op.key, opts, _op)
	    };
	    if (self.keyAsBuffer(opts, _op)) op.keyEncoding = 'binary';
	    if (_op.prefix) op.prefix = _op.prefix;
	    if ('value' in _op) {
	      op.value = self.encodeValue(_op.value, opts, _op);
	      if (self.valueAsBuffer(opts, _op)) op.valueEncoding = 'binary';
	    }
	    return op;
	  });
	};

	var ltgtKeys$1 = ['lt', 'gt', 'lte', 'gte', 'start', 'end'];

	Codec$1.prototype.encodeLtgt = function(ltgt){
	  var self = this;
	  var ret = {};
	  Object.keys(ltgt).forEach(function(key){
	    ret[key] = ltgtKeys$1.indexOf(key) > -1
	      ? self.encodeKey(ltgt[key], ltgt)
	      : ltgt[key];
	  });
	  return ret;
	};

	Codec$1.prototype.createStreamDecoder = function(opts){
	  var self = this;

	  if (opts.keys && opts.values) {
	    return function(key, value){
	      return {
	        key: self.decodeKey(key, opts),
	        value: self.decodeValue(value, opts)
	      };
	    };
	  } else if (opts.keys) {
	    return function(key) {
	      return self.decodeKey(key, opts);
	    }; 
	  } else if (opts.values) {
	    return function(_, value){
	      return self.decodeValue(value, opts);
	    }
	  } else {
	    return function(){};
	  }
	};

	Codec$1.prototype.keyAsBuffer = function(opts){
	  return this._keyEncoding(opts).buffer;
	};

	Codec$1.prototype.valueAsBuffer = function(opts){
	  return this._valueEncoding(opts).buffer;
	};

	var AbstractLevelDOWN$5 = abstractLeveldown$3.AbstractLevelDOWN;
	var AbstractChainedBatch$4 = abstractLeveldown$3.AbstractChainedBatch;
	var AbstractIterator$5 = abstractLeveldown$3.AbstractIterator;
	var inherits$3 = util.inherits;

	var EncodingError = errors.EncodingError;

	var encodingDown = DB.default = DB;

	function DB (db, opts) {
	  if (!(this instanceof DB)) return new DB(db, opts)
	  AbstractLevelDOWN$5.call(this, '');

	  opts = opts || {};
	  if (typeof opts.keyEncoding === 'undefined') opts.keyEncoding = 'utf8';
	  if (typeof opts.valueEncoding === 'undefined') opts.valueEncoding = 'utf8';

	  this.db = db;
	  this.codec = new levelCodec$1(opts);
	}

	inherits$3(DB, AbstractLevelDOWN$5);

	DB.prototype._serializeKey =
	DB.prototype._serializeValue = function (datum) {
	  return datum
	};

	DB.prototype._open = function (opts, cb) {
	  this.db.open(opts, cb);
	};

	DB.prototype._close = function (cb) {
	  this.db.close(cb);
	};

	DB.prototype._put = function (key, value, opts, cb) {
	  key = this.codec.encodeKey(key, opts);
	  value = this.codec.encodeValue(value, opts);
	  this.db.put(key, value, opts, cb);
	};

	DB.prototype._get = function (key, opts, cb) {
	  var self = this;
	  key = this.codec.encodeKey(key, opts);
	  opts.asBuffer = this.codec.valueAsBuffer(opts);
	  this.db.get(key, opts, function (err, value) {
	    if (err) return cb(err)
	    try {
	      value = self.codec.decodeValue(value, opts);
	    } catch (err) {
	      return cb(new EncodingError(err))
	    }
	    cb(null, value);
	  });
	};

	DB.prototype._del = function (key, opts, cb) {
	  key = this.codec.encodeKey(key, opts);
	  this.db.del(key, opts, cb);
	};

	DB.prototype._chainedBatch = function () {
	  return new Batch$1(this)
	};

	DB.prototype._batch = function (ops, opts, cb) {
	  ops = this.codec.encodeBatch(ops, opts);
	  this.db.batch(ops, opts, cb);
	};

	DB.prototype._iterator = function (opts) {
	  opts.keyAsBuffer = this.codec.keyAsBuffer(opts);
	  opts.valueAsBuffer = this.codec.valueAsBuffer(opts);
	  return new Iterator(this, opts)
	};

	DB.prototype.approximateSize = function (start, end, opts, cb) {
	  return this.db.approximateSize(start, end, opts, cb)
	};

	function Iterator (db, opts) {
	  AbstractIterator$5.call(this, db);
	  this.codec = db.codec;
	  this.keys = opts.keys;
	  this.values = opts.values;
	  this.opts = this.codec.encodeLtgt(opts);
	  this.it = db.db.iterator(this.opts);
	}

	inherits$3(Iterator, AbstractIterator$5);

	Iterator.prototype._next = function (cb) {
	  var self = this;
	  this.it.next(function (err, key, value) {
	    if (err) return cb(err)
	    try {
	      if (self.keys && typeof key !== 'undefined') {
	        key = self.codec.decodeKey(key, self.opts);
	      } else {
	        key = undefined;
	      }

	      if (self.values && typeof value !== 'undefined') {
	        value = self.codec.decodeValue(value, self.opts);
	      } else {
	        value = undefined;
	      }
	    } catch (err) {
	      return cb(new EncodingError(err))
	    }
	    cb(null, key, value);
	  });
	};

	Iterator.prototype._end = function (cb) {
	  this.it.end(cb);
	};

	function Batch$1 (db, codec) {
	  AbstractChainedBatch$4.call(this, db);
	  this.codec = db.codec;
	  this.batch = db.db.batch();
	}

	inherits$3(Batch$1, AbstractChainedBatch$4);

	Batch$1.prototype._put = function (key, value) {
	  key = this.codec.encodeKey(key);
	  value = this.codec.encodeValue(value);
	  this.batch.put(key, value);
	};

	Batch$1.prototype._del = function (key) {
	  key = this.codec.encodeKey(key);
	  this.batch.del(key);
	};

	Batch$1.prototype._clear = function () {
	  this.batch.clear();
	};

	Batch$1.prototype._write = function (opts, cb) {
	  this.batch.write(opts, cb);
	};

	function packager (leveldown) {
	  function Level (location, options, callback) {
	    if (typeof options === 'function') {
	      callback = options;
	    }
	    if (typeof options !== 'object' || options === null) {
	      options = {};
	    }

	    return levelup(encodingDown(leveldown(location), options), options, callback)
	  }

	  [ 'destroy', 'repair' ].forEach(function (m) {
	    if (typeof leveldown[m] === 'function') {
	      Level[m] = function (location, callback) {
	        leveldown[m](location, callback || function () {});
	      };
	    }
	  });

	  Level.errors = levelup.errors;

	  return Level
	}

	var levelPackager = packager;

	/* Copyright (c) 2017 Rod Vagg, MIT License */

	function AbstractIterator$6 (db) {
	  this.db = db;
	  this._ended = false;
	  this._nexting = false;
	}

	AbstractIterator$6.prototype.next = function (callback) {
	  var self = this;

	  if (typeof callback != 'function')
	    throw new Error('next() requires a callback argument')

	  if (self._ended)
	    return callback(new Error('cannot call next() after end()'))
	  if (self._nexting)
	    return callback(new Error('cannot call next() before previous next() has completed'))

	  self._nexting = true;
	  if (typeof self._next == 'function') {
	    return self._next(function () {
	      self._nexting = false;
	      callback.apply(null, arguments);
	    })
	  }

	  process.nextTick(function () {
	    self._nexting = false;
	    callback();
	  });
	};

	AbstractIterator$6.prototype.end = function (callback) {
	  if (typeof callback != 'function')
	    throw new Error('end() requires a callback argument')

	  if (this._ended)
	    return callback(new Error('end() already called on iterator'))

	  this._ended = true;

	  if (typeof this._end == 'function')
	    return this._end(callback)

	  process.nextTick(callback);
	};

	var abstractIterator$2 = AbstractIterator$6;

	/* Copyright (c) 2017 Rod Vagg, MIT License */

	function AbstractChainedBatch$5 (db) {
	  this._db         = db;
	  this._operations = [];
	  this._written    = false;
	}

	AbstractChainedBatch$5.prototype._serializeKey = function (key) {
	  return this._db._serializeKey(key)
	};

	AbstractChainedBatch$5.prototype._serializeValue = function (value) {
	  return this._db._serializeValue(value)
	};

	AbstractChainedBatch$5.prototype._checkWritten = function () {
	  if (this._written)
	    throw new Error('write() already called on this batch')
	};

	AbstractChainedBatch$5.prototype.put = function (key, value) {
	  this._checkWritten();

	  var err = this._db._checkKey(key, 'key', this._db._isBuffer);
	  if (err)
	    throw err

	  key = this._serializeKey(key);
	  value = this._serializeValue(value);

	  if (typeof this._put == 'function' )
	    this._put(key, value);
	  else
	    this._operations.push({ type: 'put', key: key, value: value });

	  return this
	};

	AbstractChainedBatch$5.prototype.del = function (key) {
	  this._checkWritten();

	  var err = this._db._checkKey(key, 'key', this._db._isBuffer);
	  if (err) throw err

	  key = this._serializeKey(key);

	  if (typeof this._del == 'function' )
	    this._del(key);
	  else
	    this._operations.push({ type: 'del', key: key });

	  return this
	};

	AbstractChainedBatch$5.prototype.clear = function () {
	  this._checkWritten();

	  this._operations = [];

	  if (typeof this._clear == 'function' )
	    this._clear();

	  return this
	};

	AbstractChainedBatch$5.prototype.write = function (options, callback) {
	  this._checkWritten();

	  if (typeof options == 'function')
	    callback = options;
	  if (typeof callback != 'function')
	    throw new Error('write() requires a callback argument')
	  if (typeof options != 'object')
	    options = {};

	  this._written = true;

	  if (typeof this._write == 'function' )
	    return this._write(callback)

	  if (typeof this._db._batch == 'function')
	    return this._db._batch(this._operations, options, callback)

	  process.nextTick(callback);
	};

	var abstractChainedBatch$2 = AbstractChainedBatch$5;

	/* Copyright (c) 2017 Rod Vagg, MIT License */



	function AbstractLevelDOWN$6 (location) {
	  if (!arguments.length || location === undefined)
	    throw new Error('constructor requires at least a location argument')

	  if (typeof location != 'string')
	    throw new Error('constructor requires a location string argument')

	  this.location = location;
	  this.status = 'new';
	}

	AbstractLevelDOWN$6.prototype.open = function (options, callback) {
	  var self      = this
	    , oldStatus = this.status;

	  if (typeof options == 'function')
	    callback = options;

	  if (typeof callback != 'function')
	    throw new Error('open() requires a callback argument')

	  if (typeof options != 'object')
	    options = {};

	  options.createIfMissing = options.createIfMissing != false;
	  options.errorIfExists = !!options.errorIfExists;

	  if (typeof this._open == 'function') {
	    this.status = 'opening';
	    this._open(options, function (err) {
	      if (err) {
	        self.status = oldStatus;
	        return callback(err)
	      }
	      self.status = 'open';
	      callback();
	    });
	  } else {
	    this.status = 'open';
	    process.nextTick(callback);
	  }
	};

	AbstractLevelDOWN$6.prototype.close = function (callback) {
	  var self      = this
	    , oldStatus = this.status;

	  if (typeof callback != 'function')
	    throw new Error('close() requires a callback argument')

	  if (typeof this._close == 'function') {
	    this.status = 'closing';
	    this._close(function (err) {
	      if (err) {
	        self.status = oldStatus;
	        return callback(err)
	      }
	      self.status = 'closed';
	      callback();
	    });
	  } else {
	    this.status = 'closed';
	    process.nextTick(callback);
	  }
	};

	AbstractLevelDOWN$6.prototype.get = function (key, options, callback) {
	  var err;

	  if (typeof options == 'function')
	    callback = options;

	  if (typeof callback != 'function')
	    throw new Error('get() requires a callback argument')

	  if (err = this._checkKey(key, 'key'))
	    return callback(err)

	  key = this._serializeKey(key);

	  if (typeof options != 'object')
	    options = {};

	  options.asBuffer = options.asBuffer != false;

	  if (typeof this._get == 'function')
	    return this._get(key, options, callback)

	  process.nextTick(function () { callback(new Error('NotFound')); });
	};

	AbstractLevelDOWN$6.prototype.put = function (key, value, options, callback) {
	  var err;

	  if (typeof options == 'function')
	    callback = options;

	  if (typeof callback != 'function')
	    throw new Error('put() requires a callback argument')

	  if (err = this._checkKey(key, 'key'))
	    return callback(err)

	  key = this._serializeKey(key);
	  value = this._serializeValue(value);

	  if (typeof options != 'object')
	    options = {};

	  if (typeof this._put == 'function')
	    return this._put(key, value, options, callback)

	  process.nextTick(callback);
	};

	AbstractLevelDOWN$6.prototype.del = function (key, options, callback) {
	  var err;

	  if (typeof options == 'function')
	    callback = options;

	  if (typeof callback != 'function')
	    throw new Error('del() requires a callback argument')

	  if (err = this._checkKey(key, 'key'))
	    return callback(err)

	  key = this._serializeKey(key);

	  if (typeof options != 'object')
	    options = {};

	  if (typeof this._del == 'function')
	    return this._del(key, options, callback)

	  process.nextTick(callback);
	};

	AbstractLevelDOWN$6.prototype.batch = function (array, options, callback) {
	  if (!arguments.length)
	    return this._chainedBatch()

	  if (typeof options == 'function')
	    callback = options;

	  if (typeof array == 'function')
	    callback = array;

	  if (typeof callback != 'function')
	    throw new Error('batch(array) requires a callback argument')

	  if (!Array.isArray(array))
	    return callback(new Error('batch(array) requires an array argument'))

	  if (!options || typeof options != 'object')
	    options = {};

	  var i = 0
	    , l = array.length
	    , e
	    , err;

	  for (; i < l; i++) {
	    e = array[i];
	    if (typeof e != 'object')
	      continue

	    if (err = this._checkKey(e.type, 'type'))
	      return callback(err)

	    if (err = this._checkKey(e.key, 'key'))
	      return callback(err)
	  }

	  if (typeof this._batch == 'function')
	    return this._batch(array, options, callback)

	  process.nextTick(callback);
	};

	//TODO: remove from here, not a necessary primitive
	AbstractLevelDOWN$6.prototype.approximateSize = function (start, end, callback) {
	  if (   start == null
	      || end == null
	      || typeof start == 'function'
	      || typeof end == 'function') {
	    throw new Error('approximateSize() requires valid `start`, `end` and `callback` arguments')
	  }

	  if (typeof callback != 'function')
	    throw new Error('approximateSize() requires a callback argument')

	  start = this._serializeKey(start);
	  end = this._serializeKey(end);

	  if (typeof this._approximateSize == 'function')
	    return this._approximateSize(start, end, callback)

	  process.nextTick(function () {
	    callback(null, 0);
	  });
	};

	AbstractLevelDOWN$6.prototype._setupIteratorOptions = function (options) {
	  var self = this;

	  options = immutable(options)

	  ;[ 'start', 'end', 'gt', 'gte', 'lt', 'lte' ].forEach(function (o) {
	    if (options[o] && self._isBuffer(options[o]) && options[o].length === 0)
	      delete options[o];
	  });

	  options.reverse = !!options.reverse;
	  options.keys = options.keys != false;
	  options.values = options.values != false;
	  options.limit = 'limit' in options ? options.limit : -1;
	  options.keyAsBuffer = options.keyAsBuffer != false;
	  options.valueAsBuffer = options.valueAsBuffer != false;

	  return options
	};

	AbstractLevelDOWN$6.prototype.iterator = function (options) {
	  if (typeof options != 'object')
	    options = {};

	  options = this._setupIteratorOptions(options);

	  if (typeof this._iterator == 'function')
	    return this._iterator(options)

	  return new abstractIterator$2(this)
	};

	AbstractLevelDOWN$6.prototype._chainedBatch = function () {
	  return new abstractChainedBatch$2(this)
	};

	AbstractLevelDOWN$6.prototype._isBuffer = function (obj) {
	  return Buffer.isBuffer(obj)
	};

	AbstractLevelDOWN$6.prototype._serializeKey = function (key) {
	  return this._isBuffer(key)
	    ? key
	    : String(key)
	};

	AbstractLevelDOWN$6.prototype._serializeValue = function (value) {
	  if (value == null) return ''
	  return this._isBuffer(value) || process.browser ? value : String(value)
	};

	AbstractLevelDOWN$6.prototype._checkKey = function (obj, type) {
	  if (obj === null || obj === undefined)
	    return new Error(type + ' cannot be `null` or `undefined`')

	  if (this._isBuffer(obj) && obj.length === 0)
	    return new Error(type + ' cannot be an empty Buffer')
	  else if (String(obj) === '')
	    return new Error(type + ' cannot be an empty String')
	};

	var abstractLeveldown$4 = AbstractLevelDOWN$6;

	function isLevelDOWN$2 (db) {
	  if (!db || typeof db !== 'object')
	    return false
	  return Object.keys(abstractLeveldown$4.prototype).filter(function (name) {
	    // TODO remove approximateSize check when method is gone
	    return name[0] != '_' && name != 'approximateSize'
	  }).every(function (name) {
	    return typeof db[name] == 'function'
	  })
	}

	var isLeveldown$1 = isLevelDOWN$2;

	var AbstractLevelDOWN$7    = abstractLeveldown$4;
	var AbstractIterator$7     = abstractIterator$2;
	var AbstractChainedBatch$6 = abstractChainedBatch$2;
	var isLevelDOWN$3          = isLeveldown$1;

	var abstractLeveldown$5 = {
		AbstractLevelDOWN: AbstractLevelDOWN$7,
		AbstractIterator: AbstractIterator$7,
		AbstractChainedBatch: AbstractChainedBatch$6,
		isLevelDOWN: isLevelDOWN$3
	};

	var bindings_1 = createCommonjsModule(function (module, exports) {
	/**
	 * Module dependencies.
	 */

	var join = path.join
	  , dirname = path.dirname
	  , exists = ((fs.accessSync && function (path$$1) { try { fs.accessSync(path$$1); } catch (e) { return false; } return true; })
	      || fs.existsSync || path.existsSync)
	  , defaults = {
	        arrow: process.env.NODE_BINDINGS_ARROW || ' → '
	      , compiled: process.env.NODE_BINDINGS_COMPILED_DIR || 'compiled'
	      , platform: process.platform
	      , arch: process.arch
	      , version: process.versions.node
	      , bindings: 'bindings.node'
	      , try: [
	          // node-gyp's linked version in the "build" dir
	          [ 'module_root', 'build', 'bindings' ]
	          // node-waf and gyp_addon (a.k.a node-gyp)
	        , [ 'module_root', 'build', 'Debug', 'bindings' ]
	        , [ 'module_root', 'build', 'Release', 'bindings' ]
	          // Debug files, for development (legacy behavior, remove for node v0.9)
	        , [ 'module_root', 'out', 'Debug', 'bindings' ]
	        , [ 'module_root', 'Debug', 'bindings' ]
	          // Release files, but manually compiled (legacy behavior, remove for node v0.9)
	        , [ 'module_root', 'out', 'Release', 'bindings' ]
	        , [ 'module_root', 'Release', 'bindings' ]
	          // Legacy from node-waf, node <= 0.4.x
	        , [ 'module_root', 'build', 'default', 'bindings' ]
	          // Production "Release" buildtype binary (meh...)
	        , [ 'module_root', 'compiled', 'version', 'platform', 'arch', 'bindings' ]
	        ]
	    };

	/**
	 * The main `bindings()` function loads the compiled bindings for a given module.
	 * It uses V8's Error API to determine the parent filename that this function is
	 * being invoked from, which is then used to find the root directory.
	 */

	function bindings (opts) {

	  // Argument surgery
	  if (typeof opts == 'string') {
	    opts = { bindings: opts };
	  } else if (!opts) {
	    opts = {};
	  }

	  // maps `defaults` onto `opts` object
	  Object.keys(defaults).map(function(i) {
	    if (!(i in opts)) opts[i] = defaults[i];
	  });

	  // Get the module root
	  if (!opts.module_root) {
	    opts.module_root = exports.getRoot(exports.getFileName());
	  }

	  // Ensure the given bindings name ends with .node
	  if (path.extname(opts.bindings) != '.node') {
	    opts.bindings += '.node';
	  }

	  var tries = []
	    , i = 0
	    , l = opts.try.length
	    , n
	    , b
	    , err;

	  for (; i<l; i++) {
	    n = join.apply(null, opts.try[i].map(function (p) {
	      return opts[p] || p
	    }));
	    tries.push(n);
	    try {
	      b = opts.path ? commonjsRequire.resolve(n) : commonjsRequire(n);
	      if (!opts.path) {
	        b.path = n;
	      }
	      return b
	    } catch (e) {
	      if (!/not find/i.test(e.message)) {
	        throw e
	      }
	    }
	  }

	  err = new Error('Could not locate the bindings file. Tried:\n'
	    + tries.map(function (a) { return opts.arrow + a }).join('\n'));
	  err.tries = tries;
	  throw err
	}
	module.exports = exports = bindings;


	/**
	 * Gets the filename of the JavaScript file that invokes this function.
	 * Used to help find the root directory of a module.
	 * Optionally accepts an filename argument to skip when searching for the invoking filename
	 */

	exports.getFileName = function getFileName (calling_file) {
	  var origPST = Error.prepareStackTrace
	    , origSTL = Error.stackTraceLimit
	    , dummy = {}
	    , fileName;

	  Error.stackTraceLimit = 10;

	  Error.prepareStackTrace = function (e, st) {
	    for (var i=0, l=st.length; i<l; i++) {
	      fileName = st[i].getFileName();
	      if (fileName !== __filename) {
	        if (calling_file) {
	            if (fileName !== calling_file) {
	              return
	            }
	        } else {
	          return
	        }
	      }
	    }
	  };

	  // run the 'prepareStackTrace' function above
	  Error.captureStackTrace(dummy);

	  // cleanup
	  Error.prepareStackTrace = origPST;
	  Error.stackTraceLimit = origSTL;

	  return fileName
	};

	/**
	 * Gets the root directory of a module, given an arbitrary filename
	 * somewhere in the module tree. The "root directory" is the directory
	 * containing the `package.json` file.
	 *
	 *   In:  /home/nate/node-native-module/lib/index.js
	 *   Out: /home/nate/node-native-module
	 */

	exports.getRoot = function getRoot (file) {
	  var dir = dirname(file)
	    , prev;
	  while (true) {
	    if (dir === '.') {
	      // Avoids an infinite loop in rare cases, like the REPL
	      dir = process.cwd();
	    }
	    if (exists(join(dir, 'package.json')) || exists(join(dir, 'node_modules'))) {
	      // Found the 'package.json' file or 'node_modules' dir; we're done
	      return dir
	    }
	    if (prev === dir) {
	      // Got to the top
	      throw new Error('Could not find module root given file: "' + file
	                    + '". Do you have a `package.json` file? ')
	    }
	    // Try the parent dir next
	    prev = dir;
	    dir = join(dir, '..');
	  }
	};
	});
	var bindings_2 = bindings_1.getFileName;
	var bindings_3 = bindings_1.getRoot;

	const AbstractChainedBatch$7 = abstractLeveldown$5.AbstractChainedBatch;


	function ChainedBatch (db) {
	  AbstractChainedBatch$7.call(this, db);
	  this.binding = db.binding.batch();
	}


	ChainedBatch.prototype._put = function (key, value) {
	  this.binding.put(key, value);
	};


	ChainedBatch.prototype._del = function (key) {
	  this.binding.del(key);
	};


	ChainedBatch.prototype._clear = function (key) {
	  this.binding.clear(key);
	};


	ChainedBatch.prototype._write = function (options, callback) {
	  this.binding.write(options, callback);
	};

	util.inherits(ChainedBatch, AbstractChainedBatch$7);


	var chainedBatch = ChainedBatch;

	var LIMIT = process.maxTickDepth / 2 || 1000
	  , factory = function () {
	      var count = 0;
	      return function (callback) {
	        if (count >= LIMIT){
	          commonjsGlobal.setImmediate(callback);
	          count = 0;
	        } else
	          process.nextTick(callback);
	        count++;
	      }
	    };

	var fastFuture = commonjsGlobal.setImmediate ? factory : function () { return process.nextTick };

	const AbstractIterator$8 = abstractLeveldown$5.AbstractIterator;


	function Iterator$1 (db, options) {
	  AbstractIterator$8.call(this, db);

	  this.binding    = db.binding.iterator(options);
	  this.cache      = null;
	  this.finished   = false;
	  this.fastFuture = fastFuture();
	}

	util.inherits(Iterator$1, AbstractIterator$8);

	Iterator$1.prototype.seek = function (target) {
	  if (this._ended)
	    throw new Error('cannot call seek() after end()')
	  if (this._nexting)
	    throw new Error('cannot call seek() before next() has completed')

	  if (typeof target !== 'string' && !Buffer.isBuffer(target))
	    throw new Error('seek() requires a string or buffer key')
	  if (target.length == 0)
	    throw new Error('cannot seek() to an empty key')

	  this.cache = null;
	  this.binding.seek(target);
	  this.finished = false;
	};

	Iterator$1.prototype._next = function (callback) {
	  var that = this
	    , key
	    , value;

	  if (this.cache && this.cache.length) {
	    key   = this.cache.pop();
	    value = this.cache.pop();

	    this.fastFuture(function () {
	      callback(null, key, value);
	    });

	  } else if (this.finished) {
	    this.fastFuture(function () {
	      callback();
	    });
	  } else {
	    this.binding.next(function (err, array, finished) {
	      if (err) return callback(err)

	      that.cache    = array;
	      that.finished = finished;
	      that._next(callback);
	    });
	  }

	  return this
	};


	Iterator$1.prototype._end = function (callback) {
	  delete this.cache;
	  this.binding.end(callback);
	};


	var iterator = Iterator$1;

	const AbstractLevelDOWN$8 = abstractLeveldown$5.AbstractLevelDOWN

	    , binding           = bindings_1('leveldown').leveldown;


	function LevelDOWN (location) {
	  if (!(this instanceof LevelDOWN))
	    return new LevelDOWN(location)

	  AbstractLevelDOWN$8.call(this, location);
	  this.binding = binding(location);
	}

	util.inherits(LevelDOWN, AbstractLevelDOWN$8);


	LevelDOWN.prototype._open = function (options, callback) {
	  this.binding.open(options, callback);
	};


	LevelDOWN.prototype._close = function (callback) {
	  this.binding.close(callback);
	};


	LevelDOWN.prototype._put = function (key, value, options, callback) {
	  this.binding.put(key, value, options, callback);
	};


	LevelDOWN.prototype._get = function (key, options, callback) {
	  this.binding.get(key, options, callback);
	};


	LevelDOWN.prototype._del = function (key, options, callback) {
	  this.binding.del(key, options, callback);
	};


	LevelDOWN.prototype._chainedBatch = function () {
	  return new chainedBatch(this)
	};


	LevelDOWN.prototype._batch = function (operations, options, callback) {
	  return this.binding.batch(operations, options, callback)
	};


	LevelDOWN.prototype._approximateSize = function (start, end, callback) {
	  this.binding.approximateSize(start, end, callback);
	};


	LevelDOWN.prototype.compactRange = function (start, end, callback) {
	  this.binding.compactRange(start, end, callback);
	};


	LevelDOWN.prototype.getProperty = function (property) {
	  if (typeof property != 'string')
	    throw new Error('getProperty() requires a valid `property` argument')

	  return this.binding.getProperty(property)
	};


	LevelDOWN.prototype._iterator = function (options) {
	  return new iterator(this, options)
	};


	LevelDOWN.destroy = function (location, callback) {
	  if (arguments.length < 2)
	    throw new Error('destroy() requires `location` and `callback` arguments')

	  if (typeof location != 'string')
	    throw new Error('destroy() requires a location string argument')

	  if (typeof callback != 'function')
	    throw new Error('destroy() requires a callback function argument')

	  binding.destroy(location, callback);
	};


	LevelDOWN.repair = function (location, callback) {
	  if (arguments.length < 2)
	    throw new Error('repair() requires `location` and `callback` arguments')

	  if (typeof location != 'string')
	    throw new Error('repair() requires a location string argument')

	  if (typeof callback != 'function')
	    throw new Error('repair() requires a callback function argument')

	  binding.repair(location, callback);
	};


	var leveldown = LevelDOWN.default = LevelDOWN;

	var level = levelPackager(leveldown);

	var array = toArray;

	function toArray(array, end) {
	    if (typeof array === "function") {
	        end = array;
	        array = [];
	    }

	    return writeStream(writeArray, endArray)

	    function writeArray(chunk) {
	        array.push(chunk);
	    }

	    function endArray() {
	        end(array);
	        this.emit("end");
	    }
	}

	var writeStream = WriteStream;

	WriteStream.toArray = array;

	function WriteStream(write, end) {
	    var stream = new Stream()
	        , ended = false;

	    end = end || defaultEnd;

	    stream.write = handleWrite;
	    stream.end = handleEnd;

	    // Support 0.8 pipe [LEGACY]
	    stream.writable = true;

	    return stream

	    function handleWrite(chunk) {
	        var result = write.call(stream, chunk);
	        return result === false ? false : true
	    }

	    function handleEnd(chunk) {
	        if (ended) {
	            return
	        }

	        ended = true;
	        if (arguments.length) {
	            stream.write(chunk);
	        }
	        end.call(stream);
	    }
	}

	function defaultEnd() {
	    this.emit("finish");
	}

	var endStream = EndStream;

	function EndStream(write, end) {
	    var counter = 0
	        , ended = false;

	    end = end || noop$1;

	    var stream = writeStream(function (chunk) {
	        counter++;
	        write(chunk, function (err) {
	            if (err) {
	                return stream.emit("error", err)
	            }

	            counter--;

	            if (counter === 0 && ended) {
	                stream.emit("finish");
	            }
	        });
	    }, function () {
	        ended = true;
	        if (counter === 0) {
	            this.emit("finish");
	        }
	    });

	    return stream
	}

	function noop$1() {}

	var levelWriteStream = LevelWriteStream;

	function LevelWriteStream(db) {
	    return writeStream

	    function writeStream(options) {
	        options = options || {};

	        var queue = []
	            , stream = endStream(write);

	        return stream

	        function write(chunk, callback) {
	            if (queue.length === 0) {
	                process.nextTick(drain);
	            }

	            queue.push(chunk);
	            stream.once("_drain", callback);
	        }

	        function drain() {
	            if (queue.length === 1) {
	                var chunk = queue[0];
	                db.put(chunk.key, chunk.value, options, emit);
	            } else {
	                var arr = queue.map(function (chunk) {
	                    chunk.type = "put";
	                    return chunk
	                });

	                db.batch(arr, options, emit);
	            }

	            queue.length = 0;
	        }

	        function emit(err) {
	            stream.emit("_drain", err);
	        }
	    }
	}

	/* istanbul ignore next */
	var PouchPromise = typeof Promise === 'function' ? Promise : lib$1;

	function isBinaryObject(object) {
	  return object instanceof Buffer;
	}

	// most of this is borrowed from lodash.isPlainObject:
	// https://github.com/fis-components/lodash.isplainobject/
	// blob/29c358140a74f252aeb08c9eb28bef86f2217d4a/index.js

	var funcToString = Function.prototype.toString;
	var objectCtorString = funcToString.call(Object);

	function isPlainObject(value) {
	  var proto = Object.getPrototypeOf(value);
	  /* istanbul ignore if */
	  if (proto === null) { // not sure when this happens, but I guess it can
	    return true;
	  }
	  var Ctor = proto.constructor;
	  return (typeof Ctor == 'function' &&
	    Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString);
	}

	function clone(object) {
	  var newObject;
	  var i;
	  var len;

	  if (!object || typeof object !== 'object') {
	    return object;
	  }

	  if (Array.isArray(object)) {
	    newObject = [];
	    for (i = 0, len = object.length; i < len; i++) {
	      newObject[i] = clone(object[i]);
	    }
	    return newObject;
	  }

	  // special case: to avoid inconsistencies between IndexedDB
	  // and other backends, we automatically stringify Dates
	  if (object instanceof Date) {
	    return object.toISOString();
	  }

	  if (isBinaryObject(object)) {
	    return cloneBuffer_1(object);
	  }

	  if (!isPlainObject(object)) {
	    return object; // don't clone objects like Workers
	  }

	  newObject = {};
	  for (i in object) {
	    /* istanbul ignore else */
	    if (Object.prototype.hasOwnProperty.call(object, i)) {
	      var value = clone(object[i]);
	      if (typeof value !== 'undefined') {
	        newObject[i] = value;
	      }
	    }
	  }
	  return newObject;
	}

	function once(fun) {
	  var called = false;
	  return argsarray(function (args) {
	    /* istanbul ignore if */
	    if (called) {
	      // this is a smoke test and should never actually happen
	      throw new Error('once called more than once');
	    } else {
	      called = true;
	      fun.apply(this, args);
	    }
	  });
	}

	function toPromise(func) {
	  //create the function we will be returning
	  return argsarray(function (args) {
	    // Clone arguments
	    args = clone(args);
	    var self = this;
	    // if the last argument is a function, assume its a callback
	    var usedCB = (typeof args[args.length - 1] === 'function') ? args.pop() : false;
	    var promise = new PouchPromise(function (fulfill, reject) {
	      var resp;
	      try {
	        var callback = once(function (err, mesg) {
	          if (err) {
	            reject(err);
	          } else {
	            fulfill(mesg);
	          }
	        });
	        // create a callback for this invocation
	        // apply the function in the orig context
	        args.push(callback);
	        resp = func.apply(self, args);
	        if (resp && typeof resp.then === 'function') {
	          fulfill(resp);
	        }
	      } catch (e) {
	        reject(e);
	      }
	    });
	    // if there is a callback, call it back
	    if (usedCB) {
	      promise.then(function (result) {
	        usedCB(null, result);
	      }, usedCB);
	    }
	    return promise;
	  });
	}

	function logApiCall(self, name, args) {
	  /* istanbul ignore if */
	  if (self.constructor.listeners('debug').length) {
	    var logArgs = ['api', self.name, name];
	    for (var i = 0; i < args.length - 1; i++) {
	      logArgs.push(args[i]);
	    }
	    self.constructor.emit('debug', logArgs);

	    // override the callback itself to log the response
	    var origCallback = args[args.length - 1];
	    args[args.length - 1] = function (err, res) {
	      var responseArgs = ['api', self.name, name];
	      responseArgs = responseArgs.concat(
	        err ? ['error', err] : ['success', res]
	      );
	      self.constructor.emit('debug', responseArgs);
	      origCallback(err, res);
	    };
	  }
	}

	function adapterFun(name, callback) {
	  return toPromise(argsarray(function (args) {
	    if (this._closed) {
	      return PouchPromise.reject(new Error('database is closed'));
	    }
	    if (this._destroyed) {
	      return PouchPromise.reject(new Error('database is destroyed'));
	    }
	    var self = this;
	    logApiCall(self, name, args);
	    if (!this.taskqueue.isReady) {
	      return new PouchPromise(function (fulfill, reject) {
	        self.taskqueue.addTask(function (failed) {
	          if (failed) {
	            reject(failed);
	          } else {
	            fulfill(self[name].apply(self, args));
	          }
	        });
	      });
	    }
	    return callback.apply(this, args);
	  }));
	}

	function mangle(key) {
	  return '$' + key;
	}
	function unmangle(key) {
	  return key.substring(1);
	}
	function Map$1() {
	  this._store = {};
	}
	Map$1.prototype.get = function (key) {
	  var mangled = mangle(key);
	  return this._store[mangled];
	};
	Map$1.prototype.set = function (key, value) {
	  var mangled = mangle(key);
	  this._store[mangled] = value;
	  return true;
	};
	Map$1.prototype.has = function (key) {
	  var mangled = mangle(key);
	  return mangled in this._store;
	};
	Map$1.prototype.delete = function (key) {
	  var mangled = mangle(key);
	  var res = mangled in this._store;
	  delete this._store[mangled];
	  return res;
	};
	Map$1.prototype.forEach = function (cb) {
	  var keys = Object.keys(this._store);
	  for (var i = 0, len = keys.length; i < len; i++) {
	    var key = keys[i];
	    var value = this._store[key];
	    key = unmangle(key);
	    cb(value, key);
	  }
	};
	Object.defineProperty(Map$1.prototype, 'size', {
	  get: function () {
	    return Object.keys(this._store).length;
	  }
	});

	function Set$1(array) {
	  this._store = new Map$1();

	  // init with an array
	  if (array && Array.isArray(array)) {
	    for (var i = 0, len = array.length; i < len; i++) {
	      this.add(array[i]);
	    }
	  }
	}
	Set$1.prototype.add = function (key) {
	  return this._store.set(key, true);
	};
	Set$1.prototype.has = function (key) {
	  return this._store.has(key);
	};
	Set$1.prototype.forEach = function (cb) {
	  this._store.forEach(function (value, key) {
	    cb(key);
	  });
	};
	Object.defineProperty(Set$1.prototype, 'size', {
	  get: function () {
	    return this._store.size;
	  }
	});

	/* global Map,Set,Symbol */
	// Based on https://kangax.github.io/compat-table/es6/ we can sniff out
	// incomplete Map/Set implementations which would otherwise cause our tests to fail.
	// Notably they fail in IE11 and iOS 8.4, which this prevents.
	function supportsMapAndSet() {
	  if (typeof Symbol === 'undefined' || typeof Map === 'undefined' || typeof Set === 'undefined') {
	    return false;
	  }
	  var prop = Object.getOwnPropertyDescriptor(Map, Symbol.species);
	  return prop && 'get' in prop && Map[Symbol.species] === Map;
	}

	// based on https://github.com/montagejs/collections
	/* global Map,Set */

	var ExportedSet;
	var ExportedMap;

	{
	  if (supportsMapAndSet()) { // prefer built-in Map/Set
	    ExportedSet = Set;
	    ExportedMap = Map;
	  } else { // fall back to our polyfill
	    ExportedSet = Set$1;
	    ExportedMap = Map$1;
	  }
	}

	// like underscore/lodash _.pick()
	function pick(obj$$1, arr) {
	  var res = {};
	  for (var i = 0, len = arr.length; i < len; i++) {
	    var prop = arr[i];
	    if (prop in obj$$1) {
	      res[prop] = obj$$1[prop];
	    }
	  }
	  return res;
	}

	// Most browsers throttle concurrent requests at 6, so it's silly
	// to shim _bulk_get by trying to launch potentially hundreds of requests
	// and then letting the majority time out. We can handle this ourselves.
	var MAX_NUM_CONCURRENT_REQUESTS = 6;

	function identityFunction(x) {
	  return x;
	}

	function formatResultForOpenRevsGet(result) {
	  return [{
	    ok: result
	  }];
	}

	// shim for P/CouchDB adapters that don't directly implement _bulk_get
	function bulkGet(db, opts, callback) {
	  var requests = opts.docs;

	  // consolidate into one request per doc if possible
	  var requestsById = new ExportedMap();
	  requests.forEach(function (request) {
	    if (requestsById.has(request.id)) {
	      requestsById.get(request.id).push(request);
	    } else {
	      requestsById.set(request.id, [request]);
	    }
	  });

	  var numDocs = requestsById.size;
	  var numDone = 0;
	  var perDocResults = new Array(numDocs);

	  function collapseResultsAndFinish() {
	    var results = [];
	    perDocResults.forEach(function (res) {
	      res.docs.forEach(function (info) {
	        results.push({
	          id: res.id,
	          docs: [info]
	        });
	      });
	    });
	    callback(null, {results: results});
	  }

	  function checkDone() {
	    if (++numDone === numDocs) {
	      collapseResultsAndFinish();
	    }
	  }

	  function gotResult(docIndex, id, docs) {
	    perDocResults[docIndex] = {id: id, docs: docs};
	    checkDone();
	  }

	  var allRequests = [];
	  requestsById.forEach(function (value, key) {
	    allRequests.push(key);
	  });

	  var i = 0;

	  function nextBatch() {

	    if (i >= allRequests.length) {
	      return;
	    }

	    var upTo = Math.min(i + MAX_NUM_CONCURRENT_REQUESTS, allRequests.length);
	    var batch = allRequests.slice(i, upTo);
	    processBatch(batch, i);
	    i += batch.length;
	  }

	  function processBatch(batch, offset) {
	    batch.forEach(function (docId, j) {
	      var docIdx = offset + j;
	      var docRequests = requestsById.get(docId);

	      // just use the first request as the "template"
	      // TODO: The _bulk_get API allows for more subtle use cases than this,
	      // but for now it is unlikely that there will be a mix of different
	      // "atts_since" or "attachments" in the same request, since it's just
	      // replicate.js that is using this for the moment.
	      // Also, atts_since is aspirational, since we don't support it yet.
	      var docOpts = pick(docRequests[0], ['atts_since', 'attachments']);
	      docOpts.open_revs = docRequests.map(function (request) {
	        // rev is optional, open_revs disallowed
	        return request.rev;
	      });

	      // remove falsey / undefined revisions
	      docOpts.open_revs = docOpts.open_revs.filter(identityFunction);

	      var formatResult = identityFunction;

	      if (docOpts.open_revs.length === 0) {
	        delete docOpts.open_revs;

	        // when fetching only the "winning" leaf,
	        // transform the result so it looks like an open_revs
	        // request
	        formatResult = formatResultForOpenRevsGet;
	      }

	      // globally-supplied options
	      ['revs', 'attachments', 'binary', 'ajax', 'latest'].forEach(function (param) {
	        if (param in opts) {
	          docOpts[param] = opts[param];
	        }
	      });
	      db.get(docId, docOpts, function (err, res) {
	        var result;
	        /* istanbul ignore if */
	        if (err) {
	          result = [{error: err}];
	        } else {
	          result = formatResult(res);
	        }
	        gotResult(docIdx, docId, result);
	        nextBatch();
	      });
	    });
	  }

	  nextBatch();

	}

	// in Node of course this is false
	function isChromeApp() {
	  return false;
	}

	// in Node of course this is false
	function hasLocalStorage() {
	  return false;
	}

	function nextTick$1(fn) {
	  process.nextTick(fn);
	}

	inherits(Changes, events.EventEmitter);

	/* istanbul ignore next */
	function attachBrowserEvents(self) {
	  if (isChromeApp()) {
	    chrome.storage.onChanged.addListener(function (e) {
	      // make sure it's event addressed to us
	      if (e.db_name != null) {
	        //object only has oldValue, newValue members
	        self.emit(e.dbName.newValue);
	      }
	    });
	  } else if (hasLocalStorage()) {
	    if (typeof addEventListener !== 'undefined') {
	      addEventListener("storage", function (e) {
	        self.emit(e.key);
	      });
	    } else { // old IE
	      window.attachEvent("storage", function (e) {
	        self.emit(e.key);
	      });
	    }
	  }
	}

	function Changes() {
	  events.EventEmitter.call(this);
	  this._listeners = {};

	  attachBrowserEvents(this);
	}
	Changes.prototype.addListener = function (dbName, id, db, opts) {
	  /* istanbul ignore if */
	  if (this._listeners[id]) {
	    return;
	  }
	  var self = this;
	  var inprogress = false;
	  function eventFunction() {
	    /* istanbul ignore if */
	    if (!self._listeners[id]) {
	      return;
	    }
	    if (inprogress) {
	      inprogress = 'waiting';
	      return;
	    }
	    inprogress = true;
	    var changesOpts = pick(opts, [
	      'style', 'include_docs', 'attachments', 'conflicts', 'filter',
	      'doc_ids', 'view', 'since', 'query_params', 'binary'
	    ]);

	    /* istanbul ignore next */
	    function onError() {
	      inprogress = false;
	    }

	    db.changes(changesOpts).on('change', function (c) {
	      if (c.seq > opts.since && !opts.cancelled) {
	        opts.since = c.seq;
	        opts.onChange(c);
	      }
	    }).on('complete', function () {
	      if (inprogress === 'waiting') {
	        nextTick$1(eventFunction);
	      }
	      inprogress = false;
	    }).on('error', onError);
	  }
	  this._listeners[id] = eventFunction;
	  this.on(dbName, eventFunction);
	};

	Changes.prototype.removeListener = function (dbName, id) {
	  /* istanbul ignore if */
	  if (!(id in this._listeners)) {
	    return;
	  }
	  events.EventEmitter.prototype.removeListener.call(this, dbName,
	    this._listeners[id]);
	  delete this._listeners[id];
	};


	/* istanbul ignore next */
	Changes.prototype.notifyLocalWindows = function (dbName) {
	  //do a useless change on a storage thing
	  //in order to get other windows's listeners to activate
	  if (isChromeApp()) {
	    chrome.storage.local.set({dbName: dbName});
	  } else if (hasLocalStorage()) {
	    localStorage[dbName] = (localStorage[dbName] === "a") ? "b" : "a";
	  }
	};

	Changes.prototype.notify = function (dbName) {
	  this.emit(dbName);
	  this.notifyLocalWindows(dbName);
	};

	function guardedConsole(method) {
	  /* istanbul ignore else */
	  if (typeof console !== 'undefined' && typeof console[method] === 'function') {
	    var args = Array.prototype.slice.call(arguments, 1);
	    console[method].apply(console, args);
	  }
	}

	function randomNumber(min, max) {
	  var maxTimeout = 600000; // Hard-coded default of 10 minutes
	  min = parseInt(min, 10) || 0;
	  max = parseInt(max, 10);
	  if (max !== max || max <= min) {
	    max = (min || 1) << 1; //doubling
	  } else {
	    max = max + 1;
	  }
	  // In order to not exceed maxTimeout, pick a random value between half of maxTimeout and maxTimeout
	  if (max > maxTimeout) {
	    min = maxTimeout >> 1; // divide by two
	    max = maxTimeout;
	  }
	  var ratio = Math.random();
	  var range = max - min;

	  return ~~(range * ratio + min); // ~~ coerces to an int, but fast.
	}

	function defaultBackOff(min) {
	  var max = 0;
	  if (!min) {
	    max = 2000;
	  }
	  return randomNumber(min, max);
	}

	// We assume Node users don't need to see this warning
	var res$2 = function () {};

	var assign;
	{
	  if (typeof Object.assign === 'function') {
	    assign = Object.assign;
	  } else {
	    // lite Object.assign polyfill based on
	    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
	    assign = function (target) {
	      var to = Object(target);

	      for (var index = 1; index < arguments.length; index++) {
	        var nextSource = arguments[index];

	        if (nextSource != null) { // Skip over if undefined or null
	          for (var nextKey in nextSource) {
	            // Avoid bugs when hasOwnProperty is shadowed
	            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
	              to[nextKey] = nextSource[nextKey];
	            }
	          }
	        }
	      }
	      return to;
	    };
	  }
	}

	var $inject_Object_assign = assign;

	inherits(PouchError, Error);

	function PouchError(status, error, reason) {
	  Error.call(this, reason);
	  this.status = status;
	  this.name = error;
	  this.message = reason;
	  this.error = true;
	}

	PouchError.prototype.toString = function () {
	  return JSON.stringify({
	    status: this.status,
	    name: this.name,
	    message: this.message,
	    reason: this.reason
	  });
	};

	var UNAUTHORIZED = new PouchError(401, 'unauthorized', "Name or password is incorrect.");
	var MISSING_BULK_DOCS = new PouchError(400, 'bad_request', "Missing JSON list of 'docs'");
	var MISSING_DOC = new PouchError(404, 'not_found', 'missing');
	var REV_CONFLICT = new PouchError(409, 'conflict', 'Document update conflict');
	var INVALID_ID = new PouchError(400, 'bad_request', '_id field must contain a string');
	var MISSING_ID = new PouchError(412, 'missing_id', '_id is required for puts');
	var RESERVED_ID = new PouchError(400, 'bad_request', 'Only reserved document ids may start with underscore.');
	var NOT_OPEN = new PouchError(412, 'precondition_failed', 'Database not open');
	var UNKNOWN_ERROR = new PouchError(500, 'unknown_error', 'Database encountered an unknown error');
	var BAD_ARG = new PouchError(500, 'badarg', 'Some query argument is invalid');
	var INVALID_REQUEST = new PouchError(400, 'invalid_request', 'Request was invalid');
	var QUERY_PARSE_ERROR = new PouchError(400, 'query_parse_error', 'Some query parameter is invalid');
	var DOC_VALIDATION = new PouchError(500, 'doc_validation', 'Bad special document member');
	var BAD_REQUEST = new PouchError(400, 'bad_request', 'Something wrong with the request');
	var NOT_AN_OBJECT = new PouchError(400, 'bad_request', 'Document must be a JSON object');
	var DB_MISSING = new PouchError(404, 'not_found', 'Database not found');
	var IDB_ERROR = new PouchError(500, 'indexed_db_went_bad', 'unknown');
	var WSQ_ERROR = new PouchError(500, 'web_sql_went_bad', 'unknown');
	var LDB_ERROR = new PouchError(500, 'levelDB_went_went_bad', 'unknown');
	var FORBIDDEN = new PouchError(403, 'forbidden', 'Forbidden by design doc validate_doc_update function');
	var INVALID_REV = new PouchError(400, 'bad_request', 'Invalid rev format');
	var FILE_EXISTS = new PouchError(412, 'file_exists', 'The database could not be created, the file already exists.');
	var MISSING_STUB = new PouchError(412, 'missing_stub', 'A pre-existing attachment stub wasn\'t found');
	var INVALID_URL = new PouchError(413, 'invalid_url', 'Provided URL is invalid');

	function createError$2(error, reason) {
	  function CustomPouchError(reason) {
	    // inherit error properties from our parent error manually
	    // so as to allow proper JSON parsing.
	    /* jshint ignore:start */
	    for (var p in error) {
	      if (typeof error[p] !== 'function') {
	        this[p] = error[p];
	      }
	    }
	    /* jshint ignore:end */
	    if (reason !== undefined) {
	      this.reason = reason;
	    }
	  }
	  CustomPouchError.prototype = PouchError.prototype;
	  return new CustomPouchError(reason);
	}

	function generateErrorFromResponse(err) {

	  if (typeof err !== 'object') {
	    var data = err;
	    err = UNKNOWN_ERROR;
	    err.data = data;
	  }

	  if ('error' in err && err.error === 'conflict') {
	    err.name = 'conflict';
	    err.status = 409;
	  }

	  if (!('name' in err)) {
	    err.name = err.error || 'unknown';
	  }

	  if (!('status' in err)) {
	    err.status = 500;
	  }

	  if (!('message' in err)) {
	    err.message = err.message || err.reason;
	  }

	  return err;
	}

	function tryFilter(filter, doc, req) {
	  try {
	    return !filter(doc, req);
	  } catch (err) {
	    var msg = 'Filter function threw: ' + err.toString();
	    return createError$2(BAD_REQUEST, msg);
	  }
	}

	function filterChange(opts) {
	  var req = {};
	  var hasFilter = opts.filter && typeof opts.filter === 'function';
	  req.query = opts.query_params;

	  return function filter(change) {
	    if (!change.doc) {
	      // CSG sends events on the changes feed that don't have documents,
	      // this hack makes a whole lot of existing code robust.
	      change.doc = {};
	    }

	    var filterReturn = hasFilter && tryFilter(opts.filter, change.doc, req);

	    if (typeof filterReturn === 'object') {
	      return filterReturn;
	    }

	    if (filterReturn) {
	      return false;
	    }

	    if (!opts.include_docs) {
	      delete change.doc;
	    } else if (!opts.attachments) {
	      for (var att in change.doc._attachments) {
	        /* istanbul ignore else */
	        if (change.doc._attachments.hasOwnProperty(att)) {
	          change.doc._attachments[att].stub = true;
	        }
	      }
	    }
	    return true;
	  };
	}

	function flatten(arrs) {
	  var res = [];
	  for (var i = 0, len = arrs.length; i < len; i++) {
	    res = res.concat(arrs[i]);
	  }
	  return res;
	}

	// shim for Function.prototype.name,
	// for browsers that don't support it like IE

	/* istanbul ignore next */
	function f() {}

	var hasName = f.name;
	var res$1$1;

	// We dont run coverage in IE
	/* istanbul ignore else */
	if (hasName) {
	  res$1$1 = function (fun) {
	    return fun.name;
	  };
	} else {
	  res$1$1 = function (fun) {
	    return fun.toString().match(/^\s*function\s*(\S*)\s*\(/)[1];
	  };
	}

	var functionName = res$1$1;

	// Determine id an ID is valid
	//   - invalid IDs begin with an underescore that does not begin '_design' or
	//     '_local'
	//   - any other string value is a valid id
	// Returns the specific error object for each case
	function invalidIdError(id) {
	  var err;
	  if (!id) {
	    err = createError$2(MISSING_ID);
	  } else if (typeof id !== 'string') {
	    err = createError$2(INVALID_ID);
	  } else if (/^_/.test(id) && !(/^_(design|local)/).test(id)) {
	    err = createError$2(RESERVED_ID);
	  }
	  if (err) {
	    throw err;
	  }
	}

	// Checks if a PouchDB object is "remote" or not. This is
	// designed to opt-in to certain optimizations, such as
	// avoiding checks for "dependentDbs" and other things that
	// we know only apply to local databases. In general, "remote"
	// should be true for the http adapter, and for third-party
	// adapters with similar expensive boundaries to cross for
	// every API call, such as socket-pouch and worker-pouch.
	// Previously, this was handled via db.type() === 'http'
	// which is now deprecated.

	function isRemote(db) {
	  if (typeof db._remote === 'boolean') {
	    return db._remote;
	  }
	  /* istanbul ignore next */
	  if (typeof db.type === 'function') {
	    guardedConsole('warn',
	      'db.type() is deprecated and will be removed in ' +
	      'a future version of PouchDB');
	    return db.type() === 'http';
	  }
	  /* istanbul ignore next */
	  return false;
	}

	function listenerCount(ee, type) {
	  return 'listenerCount' in ee ? ee.listenerCount(type) :
	                                 events.EventEmitter.listenerCount(ee, type);
	}

	function parseDesignDocFunctionName(s) {
	  if (!s) {
	    return null;
	  }
	  var parts = s.split('/');
	  if (parts.length === 2) {
	    return parts;
	  }
	  if (parts.length === 1) {
	    return [s, s];
	  }
	  return null;
	}

	function normalizeDesignDocFunctionName(s) {
	  var normalized = parseDesignDocFunctionName(s);
	  return normalized ? normalized.join('/') : null;
	}

	// originally parseUri 1.2.2, now patched by us
	// (c) Steven Levithan <stevenlevithan.com>
	// MIT License
	var keys$2 = ["source", "protocol", "authority", "userInfo", "user", "password",
	    "host", "port", "relative", "path", "directory", "file", "query", "anchor"];
	var qName ="queryKey";
	var qParser = /(?:^|&)([^&=]*)=?([^&]*)/g;

	// use the "loose" parser
	/* eslint maxlen: 0, no-useless-escape: 0 */
	var parser = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

	function parseUri(str) {
	  var m = parser.exec(str);
	  var uri = {};
	  var i = 14;

	  while (i--) {
	    var key = keys$2[i];
	    var value = m[i] || "";
	    var encoded = ['user', 'password'].indexOf(key) !== -1;
	    uri[key] = encoded ? decodeURIComponent(value) : value;
	  }

	  uri[qName] = {};
	  uri[keys$2[12]].replace(qParser, function ($0, $1, $2) {
	    if ($1) {
	      uri[qName][$1] = $2;
	    }
	  });

	  return uri;
	}

	// Based on https://github.com/alexdavid/scope-eval v0.0.3
	// (source: https://unpkg.com/scope-eval@0.0.3/scope_eval.js)
	// This is basically just a wrapper around new Function()

	// this is essentially the "update sugar" function from daleharvey/pouchdb#1388
	// the diffFun tells us what delta to apply to the doc.  it either returns
	// the doc, or false if it doesn't need to do an update after all
	function upsert(db, docId, diffFun) {
	  return new PouchPromise(function (fulfill, reject) {
	    db.get(docId, function (err, doc) {
	      if (err) {
	        /* istanbul ignore next */
	        if (err.status !== 404) {
	          return reject(err);
	        }
	        doc = {};
	      }

	      // the user might change the _rev, so save it for posterity
	      var docRev = doc._rev;
	      var newDoc = diffFun(doc);

	      if (!newDoc) {
	        // if the diffFun returns falsy, we short-circuit as
	        // an optimization
	        return fulfill({updated: false, rev: docRev});
	      }

	      // users aren't allowed to modify these values,
	      // so reset them here
	      newDoc._id = docId;
	      newDoc._rev = docRev;
	      fulfill(tryAndPut(db, newDoc, diffFun));
	    });
	  });
	}

	function tryAndPut(db, doc, diffFun) {
	  return db.put(doc).then(function (res) {
	    return {
	      updated: true,
	      rev: res.rev
	    };
	  }, function (err) {
	    /* istanbul ignore next */
	    if (err.status !== 409) {
	      throw err;
	    }
	    return upsert(db, doc._id, diffFun);
	  });
	}

	function rev() {
	  return uuid_1.v4().replace(/-/g, '').toLowerCase();
	}

	var uuid$1 = uuid_1.v4;

	// We fetch all leafs of the revision tree, and sort them based on tree length
	// and whether they were deleted, undeleted documents with the longest revision
	// tree (most edits) win
	// The final sort algorithm is slightly documented in a sidebar here:
	// http://guide.couchdb.org/draft/conflicts.html
	function winningRev(metadata) {
	  var winningId;
	  var winningPos;
	  var winningDeleted;
	  var toVisit = metadata.rev_tree.slice();
	  var node;
	  while ((node = toVisit.pop())) {
	    var tree = node.ids;
	    var branches = tree[2];
	    var pos = node.pos;
	    if (branches.length) { // non-leaf
	      for (var i = 0, len = branches.length; i < len; i++) {
	        toVisit.push({pos: pos + 1, ids: branches[i]});
	      }
	      continue;
	    }
	    var deleted = !!tree[1].deleted;
	    var id = tree[0];
	    // sort by deleted, then pos, then id
	    if (!winningId || (winningDeleted !== deleted ? winningDeleted :
	        winningPos !== pos ? winningPos < pos : winningId < id)) {
	      winningId = id;
	      winningPos = pos;
	      winningDeleted = deleted;
	    }
	  }

	  return winningPos + '-' + winningId;
	}

	// Pretty much all below can be combined into a higher order function to
	// traverse revisions
	// The return value from the callback will be passed as context to all
	// children of that node
	function traverseRevTree(revs, callback) {
	  var toVisit = revs.slice();

	  var node;
	  while ((node = toVisit.pop())) {
	    var pos = node.pos;
	    var tree = node.ids;
	    var branches = tree[2];
	    var newCtx =
	      callback(branches.length === 0, pos, tree[0], node.ctx, tree[1]);
	    for (var i = 0, len = branches.length; i < len; i++) {
	      toVisit.push({pos: pos + 1, ids: branches[i], ctx: newCtx});
	    }
	  }
	}

	function sortByPos(a, b) {
	  return a.pos - b.pos;
	}

	function collectLeaves(revs) {
	  var leaves = [];
	  traverseRevTree(revs, function (isLeaf, pos, id, acc, opts) {
	    if (isLeaf) {
	      leaves.push({rev: pos + "-" + id, pos: pos, opts: opts});
	    }
	  });
	  leaves.sort(sortByPos).reverse();
	  for (var i = 0, len = leaves.length; i < len; i++) {
	    delete leaves[i].pos;
	  }
	  return leaves;
	}

	// returns revs of all conflicts that is leaves such that
	// 1. are not deleted and
	// 2. are different than winning revision
	function collectConflicts(metadata) {
	  var win = winningRev(metadata);
	  var leaves = collectLeaves(metadata.rev_tree);
	  var conflicts = [];
	  for (var i = 0, len = leaves.length; i < len; i++) {
	    var leaf = leaves[i];
	    if (leaf.rev !== win && !leaf.opts.deleted) {
	      conflicts.push(leaf.rev);
	    }
	  }
	  return conflicts;
	}

	// compact a tree by marking its non-leafs as missing,
	// and return a list of revs to delete
	function compactTree(metadata) {
	  var revs = [];
	  traverseRevTree(metadata.rev_tree, function (isLeaf, pos,
	                                               revHash, ctx, opts) {
	    if (opts.status === 'available' && !isLeaf) {
	      revs.push(pos + '-' + revHash);
	      opts.status = 'missing';
	    }
	  });
	  return revs;
	}

	// build up a list of all the paths to the leafs in this revision tree
	function rootToLeaf(revs) {
	  var paths = [];
	  var toVisit = revs.slice();
	  var node;
	  while ((node = toVisit.pop())) {
	    var pos = node.pos;
	    var tree = node.ids;
	    var id = tree[0];
	    var opts = tree[1];
	    var branches = tree[2];
	    var isLeaf = branches.length === 0;

	    var history = node.history ? node.history.slice() : [];
	    history.push({id: id, opts: opts});
	    if (isLeaf) {
	      paths.push({pos: (pos + 1 - history.length), ids: history});
	    }
	    for (var i = 0, len = branches.length; i < len; i++) {
	      toVisit.push({pos: pos + 1, ids: branches[i], history: history});
	    }
	  }
	  return paths.reverse();
	}

	// for a better overview of what this is doing, read:
	// https://github.com/apache/couchdb-couch/blob/master/src/couch_key_tree.erl
	//
	// But for a quick intro, CouchDB uses a revision tree to store a documents
	// history, A -> B -> C, when a document has conflicts, that is a branch in the
	// tree, A -> (B1 | B2 -> C), We store these as a nested array in the format
	//
	// KeyTree = [Path ... ]
	// Path = {pos: position_from_root, ids: Tree}
	// Tree = [Key, Opts, [Tree, ...]], in particular single node: [Key, []]

	function sortByPos$1(a, b) {
	  return a.pos - b.pos;
	}

	// classic binary search
	function binarySearch(arr, item, comparator) {
	  var low = 0;
	  var high = arr.length;
	  var mid;
	  while (low < high) {
	    mid = (low + high) >>> 1;
	    if (comparator(arr[mid], item) < 0) {
	      low = mid + 1;
	    } else {
	      high = mid;
	    }
	  }
	  return low;
	}

	// assuming the arr is sorted, insert the item in the proper place
	function insertSorted(arr, item, comparator) {
	  var idx = binarySearch(arr, item, comparator);
	  arr.splice(idx, 0, item);
	}

	// Turn a path as a flat array into a tree with a single branch.
	// If any should be stemmed from the beginning of the array, that's passed
	// in as the second argument
	function pathToTree(path$$1, numStemmed) {
	  var root;
	  var leaf;
	  for (var i = numStemmed, len = path$$1.length; i < len; i++) {
	    var node = path$$1[i];
	    var currentLeaf = [node.id, node.opts, []];
	    if (leaf) {
	      leaf[2].push(currentLeaf);
	      leaf = currentLeaf;
	    } else {
	      root = leaf = currentLeaf;
	    }
	  }
	  return root;
	}

	// compare the IDs of two trees
	function compareTree(a, b) {
	  return a[0] < b[0] ? -1 : 1;
	}

	// Merge two trees together
	// The roots of tree1 and tree2 must be the same revision
	function mergeTree(in_tree1, in_tree2) {
	  var queue = [{tree1: in_tree1, tree2: in_tree2}];
	  var conflicts = false;
	  while (queue.length > 0) {
	    var item = queue.pop();
	    var tree1 = item.tree1;
	    var tree2 = item.tree2;

	    if (tree1[1].status || tree2[1].status) {
	      tree1[1].status =
	        (tree1[1].status ===  'available' ||
	        tree2[1].status === 'available') ? 'available' : 'missing';
	    }

	    for (var i = 0; i < tree2[2].length; i++) {
	      if (!tree1[2][0]) {
	        conflicts = 'new_leaf';
	        tree1[2][0] = tree2[2][i];
	        continue;
	      }

	      var merged = false;
	      for (var j = 0; j < tree1[2].length; j++) {
	        if (tree1[2][j][0] === tree2[2][i][0]) {
	          queue.push({tree1: tree1[2][j], tree2: tree2[2][i]});
	          merged = true;
	        }
	      }
	      if (!merged) {
	        conflicts = 'new_branch';
	        insertSorted(tree1[2], tree2[2][i], compareTree);
	      }
	    }
	  }
	  return {conflicts: conflicts, tree: in_tree1};
	}

	function doMerge(tree, path$$1, dontExpand) {
	  var restree = [];
	  var conflicts = false;
	  var merged = false;
	  var res;

	  if (!tree.length) {
	    return {tree: [path$$1], conflicts: 'new_leaf'};
	  }

	  for (var i = 0, len = tree.length; i < len; i++) {
	    var branch = tree[i];
	    if (branch.pos === path$$1.pos && branch.ids[0] === path$$1.ids[0]) {
	      // Paths start at the same position and have the same root, so they need
	      // merged
	      res = mergeTree(branch.ids, path$$1.ids);
	      restree.push({pos: branch.pos, ids: res.tree});
	      conflicts = conflicts || res.conflicts;
	      merged = true;
	    } else if (dontExpand !== true) {
	      // The paths start at a different position, take the earliest path and
	      // traverse up until it as at the same point from root as the path we
	      // want to merge.  If the keys match we return the longer path with the
	      // other merged After stemming we dont want to expand the trees

	      var t1 = branch.pos < path$$1.pos ? branch : path$$1;
	      var t2 = branch.pos < path$$1.pos ? path$$1 : branch;
	      var diff = t2.pos - t1.pos;

	      var candidateParents = [];

	      var trees = [];
	      trees.push({ids: t1.ids, diff: diff, parent: null, parentIdx: null});
	      while (trees.length > 0) {
	        var item = trees.pop();
	        if (item.diff === 0) {
	          if (item.ids[0] === t2.ids[0]) {
	            candidateParents.push(item);
	          }
	          continue;
	        }
	        var elements = item.ids[2];
	        for (var j = 0, elementsLen = elements.length; j < elementsLen; j++) {
	          trees.push({
	            ids: elements[j],
	            diff: item.diff - 1,
	            parent: item.ids,
	            parentIdx: j
	          });
	        }
	      }

	      var el = candidateParents[0];

	      if (!el) {
	        restree.push(branch);
	      } else {
	        res = mergeTree(el.ids, t2.ids);
	        el.parent[2][el.parentIdx] = res.tree;
	        restree.push({pos: t1.pos, ids: t1.ids});
	        conflicts = conflicts || res.conflicts;
	        merged = true;
	      }
	    } else {
	      restree.push(branch);
	    }
	  }

	  // We didnt find
	  if (!merged) {
	    restree.push(path$$1);
	  }

	  restree.sort(sortByPos$1);

	  return {
	    tree: restree,
	    conflicts: conflicts || 'internal_node'
	  };
	}

	// To ensure we dont grow the revision tree infinitely, we stem old revisions
	function stem(tree, depth) {
	  // First we break out the tree into a complete list of root to leaf paths
	  var paths = rootToLeaf(tree);
	  var stemmedRevs;

	  var result;
	  for (var i = 0, len = paths.length; i < len; i++) {
	    // Then for each path, we cut off the start of the path based on the
	    // `depth` to stem to, and generate a new set of flat trees
	    var path$$1 = paths[i];
	    var stemmed = path$$1.ids;
	    var node;
	    if (stemmed.length > depth) {
	      // only do the stemming work if we actually need to stem
	      if (!stemmedRevs) {
	        stemmedRevs = {}; // avoid allocating this object unnecessarily
	      }
	      var numStemmed = stemmed.length - depth;
	      node = {
	        pos: path$$1.pos + numStemmed,
	        ids: pathToTree(stemmed, numStemmed)
	      };

	      for (var s = 0; s < numStemmed; s++) {
	        var rev = (path$$1.pos + s) + '-' + stemmed[s].id;
	        stemmedRevs[rev] = true;
	      }
	    } else { // no need to actually stem
	      node = {
	        pos: path$$1.pos,
	        ids: pathToTree(stemmed, 0)
	      };
	    }

	    // Then we remerge all those flat trees together, ensuring that we dont
	    // connect trees that would go beyond the depth limit
	    if (result) {
	      result = doMerge(result, node, true).tree;
	    } else {
	      result = [node];
	    }
	  }

	  // this is memory-heavy per Chrome profiler, avoid unless we actually stemmed
	  if (stemmedRevs) {
	    traverseRevTree(result, function (isLeaf, pos, revHash) {
	      // some revisions may have been removed in a branch but not in another
	      delete stemmedRevs[pos + '-' + revHash];
	    });
	  }

	  return {
	    tree: result,
	    revs: stemmedRevs ? Object.keys(stemmedRevs) : []
	  };
	}

	function merge(tree, path$$1, depth) {
	  var newTree = doMerge(tree, path$$1);
	  var stemmed = stem(newTree.tree, depth);
	  return {
	    tree: stemmed.tree,
	    stemmedRevs: stemmed.revs,
	    conflicts: newTree.conflicts
	  };
	}

	// return true if a rev exists in the rev tree, false otherwise
	function revExists(revs, rev) {
	  var toVisit = revs.slice();
	  var splitRev = rev.split('-');
	  var targetPos = parseInt(splitRev[0], 10);
	  var targetId = splitRev[1];

	  var node;
	  while ((node = toVisit.pop())) {
	    if (node.pos === targetPos && node.ids[0] === targetId) {
	      return true;
	    }
	    var branches = node.ids[2];
	    for (var i = 0, len = branches.length; i < len; i++) {
	      toVisit.push({pos: node.pos + 1, ids: branches[i]});
	    }
	  }
	  return false;
	}

	function getTrees(node) {
	  return node.ids;
	}

	// check if a specific revision of a doc has been deleted
	//  - metadata: the metadata object from the doc store
	//  - rev: (optional) the revision to check. defaults to winning revision
	function isDeleted(metadata, rev) {
	  if (!rev) {
	    rev = winningRev(metadata);
	  }
	  var id = rev.substring(rev.indexOf('-') + 1);
	  var toVisit = metadata.rev_tree.map(getTrees);

	  var tree;
	  while ((tree = toVisit.pop())) {
	    if (tree[0] === id) {
	      return !!tree[1].deleted;
	    }
	    toVisit = toVisit.concat(tree[2]);
	  }
	}

	function isLocalId(id) {
	  return (/^_local/).test(id);
	}

	// returns the current leaf node for a given revision
	function latest(rev, metadata) {
	  var toVisit = metadata.rev_tree.slice();
	  var node;
	  while ((node = toVisit.pop())) {
	    var pos = node.pos;
	    var tree = node.ids;
	    var id = tree[0];
	    var opts = tree[1];
	    var branches = tree[2];
	    var isLeaf = branches.length === 0;

	    var history = node.history ? node.history.slice() : [];
	    history.push({id: id, pos: pos, opts: opts});

	    if (isLeaf) {
	      for (var i = 0, len = history.length; i < len; i++) {
	        var historyNode = history[i];
	        var historyRev = historyNode.pos + '-' + historyNode.id;

	        if (historyRev === rev) {
	          // return the rev of this leaf
	          return pos + '-' + id;
	        }
	      }
	    }

	    for (var j = 0, l = branches.length; j < l; j++) {
	      toVisit.push({pos: pos + 1, ids: branches[j], history: history});
	    }
	  }

	  /* istanbul ignore next */
	  throw new Error('Unable to resolve latest revision for id ' + metadata.id + ', rev ' + rev);
	}

	inherits(Changes$2, events.EventEmitter);

	function tryCatchInChangeListener(self, change, pending, lastSeq) {
	  // isolate try/catches to avoid V8 deoptimizations
	  try {
	    self.emit('change', change, pending, lastSeq);
	  } catch (e) {
	    guardedConsole('error', 'Error in .on("change", function):', e);
	  }
	}

	function Changes$2(db, opts, callback) {
	  events.EventEmitter.call(this);
	  var self = this;
	  this.db = db;
	  opts = opts ? clone(opts) : {};
	  var complete = opts.complete = once(function (err, resp) {
	    if (err) {
	      if (listenerCount(self, 'error') > 0) {
	        self.emit('error', err);
	      }
	    } else {
	      self.emit('complete', resp);
	    }
	    self.removeAllListeners();
	    db.removeListener('destroyed', onDestroy);
	  });
	  if (callback) {
	    self.on('complete', function (resp) {
	      callback(null, resp);
	    });
	    self.on('error', callback);
	  }
	  function onDestroy() {
	    self.cancel();
	  }
	  db.once('destroyed', onDestroy);

	  opts.onChange = function (change, pending, lastSeq) {
	    /* istanbul ignore if */
	    if (self.isCancelled) {
	      return;
	    }
	    tryCatchInChangeListener(self, change, pending, lastSeq);
	  };

	  var promise = new PouchPromise(function (fulfill, reject) {
	    opts.complete = function (err, res$$1) {
	      if (err) {
	        reject(err);
	      } else {
	        fulfill(res$$1);
	      }
	    };
	  });
	  self.once('cancel', function () {
	    db.removeListener('destroyed', onDestroy);
	    opts.complete(null, {status: 'cancelled'});
	  });
	  this.then = promise.then.bind(promise);
	  this['catch'] = promise['catch'].bind(promise);
	  this.then(function (result) {
	    complete(null, result);
	  }, complete);



	  if (!db.taskqueue.isReady) {
	    db.taskqueue.addTask(function (failed) {
	      if (failed) {
	        opts.complete(failed);
	      } else if (self.isCancelled) {
	        self.emit('cancel');
	      } else {
	        self.validateChanges(opts);
	      }
	    });
	  } else {
	    self.validateChanges(opts);
	  }
	}
	Changes$2.prototype.cancel = function () {
	  this.isCancelled = true;
	  if (this.db.taskqueue.isReady) {
	    this.emit('cancel');
	  }
	};
	function processChange(doc, metadata, opts) {
	  var changeList = [{rev: doc._rev}];
	  if (opts.style === 'all_docs') {
	    changeList = collectLeaves(metadata.rev_tree)
	    .map(function (x) { return {rev: x.rev}; });
	  }
	  var change = {
	    id: metadata.id,
	    changes: changeList,
	    doc: doc
	  };

	  if (isDeleted(metadata, doc._rev)) {
	    change.deleted = true;
	  }
	  if (opts.conflicts) {
	    change.doc._conflicts = collectConflicts(metadata);
	    if (!change.doc._conflicts.length) {
	      delete change.doc._conflicts;
	    }
	  }
	  return change;
	}

	Changes$2.prototype.validateChanges = function (opts) {
	  var callback = opts.complete;
	  var self = this;

	  /* istanbul ignore else */
	  if (PouchDB._changesFilterPlugin) {
	    PouchDB._changesFilterPlugin.validate(opts, function (err) {
	      if (err) {
	        return callback(err);
	      }
	      self.doChanges(opts);
	    });
	  } else {
	    self.doChanges(opts);
	  }
	};

	Changes$2.prototype.doChanges = function (opts) {
	  var self = this;
	  var callback = opts.complete;

	  opts = clone(opts);
	  if ('live' in opts && !('continuous' in opts)) {
	    opts.continuous = opts.live;
	  }
	  opts.processChange = processChange;

	  if (opts.since === 'latest') {
	    opts.since = 'now';
	  }
	  if (!opts.since) {
	    opts.since = 0;
	  }
	  if (opts.since === 'now') {
	    this.db.info().then(function (info) {
	      /* istanbul ignore if */
	      if (self.isCancelled) {
	        callback(null, {status: 'cancelled'});
	        return;
	      }
	      opts.since = info.update_seq;
	      self.doChanges(opts);
	    }, callback);
	    return;
	  }

	  /* istanbul ignore else */
	  if (PouchDB._changesFilterPlugin) {
	    PouchDB._changesFilterPlugin.normalize(opts);
	    if (PouchDB._changesFilterPlugin.shouldFilter(this, opts)) {
	      return PouchDB._changesFilterPlugin.filter(this, opts);
	    }
	  } else {
	    ['doc_ids', 'filter', 'selector', 'view'].forEach(function (key) {
	      if (key in opts) {
	        guardedConsole('warn',
	          'The "' + key + '" option was passed in to changes/replicate, ' +
	          'but pouchdb-changes-filter plugin is not installed, so it ' +
	          'was ignored. Please install the plugin to enable filtering.'
	        );
	      }
	    });
	  }

	  if (!('descending' in opts)) {
	    opts.descending = false;
	  }

	  // 0 and 1 should return 1 document
	  opts.limit = opts.limit === 0 ? 1 : opts.limit;
	  opts.complete = callback;
	  var newPromise = this.db._changes(opts);
	  /* istanbul ignore else */
	  if (newPromise && typeof newPromise.cancel === 'function') {
	    var cancel = self.cancel;
	    self.cancel = argsarray(function (args) {
	      newPromise.cancel();
	      cancel.apply(this, args);
	    });
	  }
	};

	/*
	 * A generic pouch adapter
	 */

	function compare(left, right) {
	  return left < right ? -1 : left > right ? 1 : 0;
	}

	// Wrapper for functions that call the bulkdocs api with a single doc,
	// if the first result is an error, return an error
	function yankError(callback, docId) {
	  return function (err, results) {
	    if (err || (results[0] && results[0].error)) {
	      err = err || results[0];
	      err.docId = docId;
	      callback(err);
	    } else {
	      callback(null, results.length ? results[0]  : results);
	    }
	  };
	}

	// clean docs given to us by the user
	function cleanDocs(docs) {
	  for (var i = 0; i < docs.length; i++) {
	    var doc = docs[i];
	    if (doc._deleted) {
	      delete doc._attachments; // ignore atts for deleted docs
	    } else if (doc._attachments) {
	      // filter out extraneous keys from _attachments
	      var atts = Object.keys(doc._attachments);
	      for (var j = 0; j < atts.length; j++) {
	        var att = atts[j];
	        doc._attachments[att] = pick(doc._attachments[att],
	          ['data', 'digest', 'content_type', 'length', 'revpos', 'stub']);
	      }
	    }
	  }
	}

	// compare two docs, first by _id then by _rev
	function compareByIdThenRev(a, b) {
	  var idCompare = compare(a._id, b._id);
	  if (idCompare !== 0) {
	    return idCompare;
	  }
	  var aStart = a._revisions ? a._revisions.start : 0;
	  var bStart = b._revisions ? b._revisions.start : 0;
	  return compare(aStart, bStart);
	}

	// for every node in a revision tree computes its distance from the closest
	// leaf
	function computeHeight(revs) {
	  var height = {};
	  var edges = [];
	  traverseRevTree(revs, function (isLeaf, pos, id, prnt) {
	    var rev$$1 = pos + "-" + id;
	    if (isLeaf) {
	      height[rev$$1] = 0;
	    }
	    if (prnt !== undefined) {
	      edges.push({from: prnt, to: rev$$1});
	    }
	    return rev$$1;
	  });

	  edges.reverse();
	  edges.forEach(function (edge) {
	    if (height[edge.from] === undefined) {
	      height[edge.from] = 1 + height[edge.to];
	    } else {
	      height[edge.from] = Math.min(height[edge.from], 1 + height[edge.to]);
	    }
	  });
	  return height;
	}

	function allDocsKeysParse(opts) {
	  var keys =  ('limit' in opts) ?
	    opts.keys.slice(opts.skip, opts.limit + opts.skip) :
	    (opts.skip > 0) ? opts.keys.slice(opts.skip) : opts.keys;
	  opts.keys = keys;
	  opts.skip = 0;
	  delete opts.limit;
	  if (opts.descending) {
	    keys.reverse();
	    opts.descending = false;
	  }
	}

	// all compaction is done in a queue, to avoid attaching
	// too many listeners at once
	function doNextCompaction(self) {
	  var task = self._compactionQueue[0];
	  var opts = task.opts;
	  var callback = task.callback;
	  self.get('_local/compaction').catch(function () {
	    return false;
	  }).then(function (doc) {
	    if (doc && doc.last_seq) {
	      opts.last_seq = doc.last_seq;
	    }
	    self._compact(opts, function (err, res$$1) {
	      /* istanbul ignore if */
	      if (err) {
	        callback(err);
	      } else {
	        callback(null, res$$1);
	      }
	      nextTick$1(function () {
	        self._compactionQueue.shift();
	        if (self._compactionQueue.length) {
	          doNextCompaction(self);
	        }
	      });
	    });
	  });
	}

	function attachmentNameError(name) {
	  if (name.charAt(0) === '_') {
	    return name + ' is not a valid attachment name, attachment ' +
	      'names cannot start with \'_\'';
	  }
	  return false;
	}

	inherits(AbstractPouchDB, events.EventEmitter);

	function AbstractPouchDB() {
	  events.EventEmitter.call(this);
	}

	AbstractPouchDB.prototype.post =
	  adapterFun('post', function (doc, opts, callback) {
	  if (typeof opts === 'function') {
	    callback = opts;
	    opts = {};
	  }
	  if (typeof doc !== 'object' || Array.isArray(doc)) {
	    return callback(createError$2(NOT_AN_OBJECT));
	  }
	  this.bulkDocs({docs: [doc]}, opts, yankError(callback, doc._id));
	});

	AbstractPouchDB.prototype.put = adapterFun('put', function (doc, opts, cb) {
	  if (typeof opts === 'function') {
	    cb = opts;
	    opts = {};
	  }
	  if (typeof doc !== 'object' || Array.isArray(doc)) {
	    return cb(createError$2(NOT_AN_OBJECT));
	  }
	  invalidIdError(doc._id);
	  if (isLocalId(doc._id) && typeof this._putLocal === 'function') {
	    if (doc._deleted) {
	      return this._removeLocal(doc, cb);
	    } else {
	      return this._putLocal(doc, cb);
	    }
	  }
	  var self = this;
	  if (opts.force && doc._rev) {
	    transformForceOptionToNewEditsOption();
	    putDoc(function (err) {
	      var result = err ? null : {ok: true, id: doc._id, rev: doc._rev};
	      cb(err, result);
	    });
	  } else {
	    putDoc(cb);
	  }

	  function transformForceOptionToNewEditsOption() {
	    var parts = doc._rev.split('-');
	    var oldRevId = parts[1];
	    var oldRevNum = parseInt(parts[0], 10);

	    var newRevNum = oldRevNum + 1;
	    var newRevId = rev();

	    doc._revisions = {
	      start: newRevNum,
	      ids: [newRevId, oldRevId]
	    };
	    doc._rev = newRevNum + '-' + newRevId;
	    opts.new_edits = false;
	  }
	  function putDoc(next) {
	    if (typeof self._put === 'function' && opts.new_edits !== false) {
	      self._put(doc, opts, next);
	    } else {
	      self.bulkDocs({docs: [doc]}, opts, yankError(next, doc._id));
	    }
	  }
	});

	AbstractPouchDB.prototype.putAttachment =
	  adapterFun('putAttachment', function (docId, attachmentId, rev$$1,
	                                              blob, type) {
	  var api = this;
	  if (typeof type === 'function') {
	    type = blob;
	    blob = rev$$1;
	    rev$$1 = null;
	  }
	  // Lets fix in https://github.com/pouchdb/pouchdb/issues/3267
	  /* istanbul ignore if */
	  if (typeof type === 'undefined') {
	    type = blob;
	    blob = rev$$1;
	    rev$$1 = null;
	  }
	  if (!type) {
	    guardedConsole('warn', 'Attachment', attachmentId, 'on document', docId, 'is missing content_type');
	  }

	  function createAttachment(doc) {
	    var prevrevpos = '_rev' in doc ? parseInt(doc._rev, 10) : 0;
	    doc._attachments = doc._attachments || {};
	    doc._attachments[attachmentId] = {
	      content_type: type,
	      data: blob,
	      revpos: ++prevrevpos
	    };
	    return api.put(doc);
	  }

	  return api.get(docId).then(function (doc) {
	    if (doc._rev !== rev$$1) {
	      throw createError$2(REV_CONFLICT);
	    }

	    return createAttachment(doc);
	  }, function (err) {
	     // create new doc
	    /* istanbul ignore else */
	    if (err.reason === MISSING_DOC.message) {
	      return createAttachment({_id: docId});
	    } else {
	      throw err;
	    }
	  });
	});

	AbstractPouchDB.prototype.removeAttachment =
	  adapterFun('removeAttachment', function (docId, attachmentId, rev$$1,
	                                                 callback) {
	  var self = this;
	  self.get(docId, function (err, obj$$1) {
	    /* istanbul ignore if */
	    if (err) {
	      callback(err);
	      return;
	    }
	    if (obj$$1._rev !== rev$$1) {
	      callback(createError$2(REV_CONFLICT));
	      return;
	    }
	    /* istanbul ignore if */
	    if (!obj$$1._attachments) {
	      return callback();
	    }
	    delete obj$$1._attachments[attachmentId];
	    if (Object.keys(obj$$1._attachments).length === 0) {
	      delete obj$$1._attachments;
	    }
	    self.put(obj$$1, callback);
	  });
	});

	AbstractPouchDB.prototype.remove =
	  adapterFun('remove', function (docOrId, optsOrRev, opts, callback) {
	  var doc;
	  if (typeof optsOrRev === 'string') {
	    // id, rev, opts, callback style
	    doc = {
	      _id: docOrId,
	      _rev: optsOrRev
	    };
	    if (typeof opts === 'function') {
	      callback = opts;
	      opts = {};
	    }
	  } else {
	    // doc, opts, callback style
	    doc = docOrId;
	    if (typeof optsOrRev === 'function') {
	      callback = optsOrRev;
	      opts = {};
	    } else {
	      callback = opts;
	      opts = optsOrRev;
	    }
	  }
	  opts = opts || {};
	  opts.was_delete = true;
	  var newDoc = {_id: doc._id, _rev: (doc._rev || opts.rev)};
	  newDoc._deleted = true;
	  if (isLocalId(newDoc._id) && typeof this._removeLocal === 'function') {
	    return this._removeLocal(doc, callback);
	  }
	  this.bulkDocs({docs: [newDoc]}, opts, yankError(callback, newDoc._id));
	});

	AbstractPouchDB.prototype.revsDiff =
	  adapterFun('revsDiff', function (req, opts, callback) {
	  if (typeof opts === 'function') {
	    callback = opts;
	    opts = {};
	  }
	  var ids = Object.keys(req);

	  if (!ids.length) {
	    return callback(null, {});
	  }

	  var count = 0;
	  var missing = new ExportedMap();

	  function addToMissing(id, revId) {
	    if (!missing.has(id)) {
	      missing.set(id, {missing: []});
	    }
	    missing.get(id).missing.push(revId);
	  }

	  function processDoc(id, rev_tree) {
	    // Is this fast enough? Maybe we should switch to a set simulated by a map
	    var missingForId = req[id].slice(0);
	    traverseRevTree(rev_tree, function (isLeaf, pos, revHash, ctx,
	      opts) {
	        var rev$$1 = pos + '-' + revHash;
	        var idx = missingForId.indexOf(rev$$1);
	        if (idx === -1) {
	          return;
	        }

	        missingForId.splice(idx, 1);
	        /* istanbul ignore if */
	        if (opts.status !== 'available') {
	          addToMissing(id, rev$$1);
	        }
	      });

	    // Traversing the tree is synchronous, so now `missingForId` contains
	    // revisions that were not found in the tree
	    missingForId.forEach(function (rev$$1) {
	      addToMissing(id, rev$$1);
	    });
	  }

	  ids.map(function (id) {
	    this._getRevisionTree(id, function (err, rev_tree) {
	      if (err && err.status === 404 && err.message === 'missing') {
	        missing.set(id, {missing: req[id]});
	      } else if (err) {
	        /* istanbul ignore next */
	        return callback(err);
	      } else {
	        processDoc(id, rev_tree);
	      }

	      if (++count === ids.length) {
	        // convert LazyMap to object
	        var missingObj = {};
	        missing.forEach(function (value, key) {
	          missingObj[key] = value;
	        });
	        return callback(null, missingObj);
	      }
	    });
	  }, this);
	});

	// _bulk_get API for faster replication, as described in
	// https://github.com/apache/couchdb-chttpd/pull/33
	// At the "abstract" level, it will just run multiple get()s in
	// parallel, because this isn't much of a performance cost
	// for local databases (except the cost of multiple transactions, which is
	// small). The http adapter overrides this in order
	// to do a more efficient single HTTP request.
	AbstractPouchDB.prototype.bulkGet =
	  adapterFun('bulkGet', function (opts, callback) {
	  bulkGet(this, opts, callback);
	});

	// compact one document and fire callback
	// by compacting we mean removing all revisions which
	// are further from the leaf in revision tree than max_height
	AbstractPouchDB.prototype.compactDocument =
	  adapterFun('compactDocument', function (docId, maxHeight, callback) {
	  var self = this;
	  this._getRevisionTree(docId, function (err, revTree) {
	    /* istanbul ignore if */
	    if (err) {
	      return callback(err);
	    }
	    var height = computeHeight(revTree);
	    var candidates = [];
	    var revs = [];
	    Object.keys(height).forEach(function (rev$$1) {
	      if (height[rev$$1] > maxHeight) {
	        candidates.push(rev$$1);
	      }
	    });

	    traverseRevTree(revTree, function (isLeaf, pos, revHash, ctx, opts) {
	      var rev$$1 = pos + '-' + revHash;
	      if (opts.status === 'available' && candidates.indexOf(rev$$1) !== -1) {
	        revs.push(rev$$1);
	      }
	    });
	    self._doCompaction(docId, revs, callback);
	  });
	});

	// compact the whole database using single document
	// compaction
	AbstractPouchDB.prototype.compact =
	  adapterFun('compact', function (opts, callback) {
	  if (typeof opts === 'function') {
	    callback = opts;
	    opts = {};
	  }

	  var self = this;
	  opts = opts || {};

	  self._compactionQueue = self._compactionQueue || [];
	  self._compactionQueue.push({opts: opts, callback: callback});
	  if (self._compactionQueue.length === 1) {
	    doNextCompaction(self);
	  }
	});
	AbstractPouchDB.prototype._compact = function (opts, callback) {
	  var self = this;
	  var changesOpts = {
	    return_docs: false,
	    last_seq: opts.last_seq || 0
	  };
	  var promises = [];

	  function onChange(row) {
	    promises.push(self.compactDocument(row.id, 0));
	  }
	  function onComplete(resp) {
	    var lastSeq = resp.last_seq;
	    PouchPromise.all(promises).then(function () {
	      return upsert(self, '_local/compaction', function deltaFunc(doc) {
	        if (!doc.last_seq || doc.last_seq < lastSeq) {
	          doc.last_seq = lastSeq;
	          return doc;
	        }
	        return false; // somebody else got here first, don't update
	      });
	    }).then(function () {
	      callback(null, {ok: true});
	    }).catch(callback);
	  }
	  self.changes(changesOpts)
	    .on('change', onChange)
	    .on('complete', onComplete)
	    .on('error', callback);
	};

	/* Begin api wrappers. Specific functionality to storage belongs in the
	   _[method] */
	AbstractPouchDB.prototype.get = adapterFun('get', function (id, opts, cb) {
	  if (typeof opts === 'function') {
	    cb = opts;
	    opts = {};
	  }
	  if (typeof id !== 'string') {
	    return cb(createError$2(INVALID_ID));
	  }
	  if (isLocalId(id) && typeof this._getLocal === 'function') {
	    return this._getLocal(id, cb);
	  }
	  var leaves = [], self = this;

	  function finishOpenRevs() {
	    var result = [];
	    var count = leaves.length;
	    /* istanbul ignore if */
	    if (!count) {
	      return cb(null, result);
	    }

	    // order with open_revs is unspecified
	    leaves.forEach(function (leaf) {
	      self.get(id, {
	        rev: leaf,
	        revs: opts.revs,
	        latest: opts.latest,
	        attachments: opts.attachments,
	        binary: opts.binary
	      }, function (err, doc) {
	        if (!err) {
	          // using latest=true can produce duplicates
	          var existing;
	          for (var i = 0, l = result.length; i < l; i++) {
	            if (result[i].ok && result[i].ok._rev === doc._rev) {
	              existing = true;
	              break;
	            }
	          }
	          if (!existing) {
	            result.push({ok: doc});
	          }
	        } else {
	          result.push({missing: leaf});
	        }
	        count--;
	        if (!count) {
	          cb(null, result);
	        }
	      });
	    });
	  }

	  if (opts.open_revs) {
	    if (opts.open_revs === "all") {
	      this._getRevisionTree(id, function (err, rev_tree) {
	        if (err) {
	          return cb(err);
	        }
	        leaves = collectLeaves(rev_tree).map(function (leaf) {
	          return leaf.rev;
	        });
	        finishOpenRevs();
	      });
	    } else {
	      if (Array.isArray(opts.open_revs)) {
	        leaves = opts.open_revs;
	        for (var i = 0; i < leaves.length; i++) {
	          var l = leaves[i];
	          // looks like it's the only thing couchdb checks
	          if (!(typeof (l) === "string" && /^\d+-/.test(l))) {
	            return cb(createError$2(INVALID_REV));
	          }
	        }
	        finishOpenRevs();
	      } else {
	        return cb(createError$2(UNKNOWN_ERROR, 'function_clause'));
	      }
	    }
	    return; // open_revs does not like other options
	  }

	  return this._get(id, opts, function (err, result) {
	    if (err) {
	      err.docId = id;
	      return cb(err);
	    }

	    var doc = result.doc;
	    var metadata = result.metadata;
	    var ctx = result.ctx;

	    if (opts.conflicts) {
	      var conflicts = collectConflicts(metadata);
	      if (conflicts.length) {
	        doc._conflicts = conflicts;
	      }
	    }

	    if (isDeleted(metadata, doc._rev)) {
	      doc._deleted = true;
	    }

	    if (opts.revs || opts.revs_info) {
	      var splittedRev = doc._rev.split('-');
	      var revNo       = parseInt(splittedRev[0], 10);
	      var revHash     = splittedRev[1];

	      var paths = rootToLeaf(metadata.rev_tree);
	      var path$$1 = null;

	      for (var i = 0; i < paths.length; i++) {
	        var currentPath = paths[i];
	        var hashIndex = currentPath.ids.map(function (x) { return x.id; })
	          .indexOf(revHash);
	        var hashFoundAtRevPos = hashIndex === (revNo - 1);

	        if (hashFoundAtRevPos || (!path$$1 && hashIndex !== -1)) {
	          path$$1 = currentPath;
	        }
	      }

	      var indexOfRev = path$$1.ids.map(function (x) { return x.id; })
	        .indexOf(doc._rev.split('-')[1]) + 1;
	      var howMany = path$$1.ids.length - indexOfRev;
	      path$$1.ids.splice(indexOfRev, howMany);
	      path$$1.ids.reverse();

	      if (opts.revs) {
	        doc._revisions = {
	          start: (path$$1.pos + path$$1.ids.length) - 1,
	          ids: path$$1.ids.map(function (rev$$1) {
	            return rev$$1.id;
	          })
	        };
	      }
	      if (opts.revs_info) {
	        var pos =  path$$1.pos + path$$1.ids.length;
	        doc._revs_info = path$$1.ids.map(function (rev$$1) {
	          pos--;
	          return {
	            rev: pos + '-' + rev$$1.id,
	            status: rev$$1.opts.status
	          };
	        });
	      }
	    }

	    if (opts.attachments && doc._attachments) {
	      var attachments = doc._attachments;
	      var count = Object.keys(attachments).length;
	      if (count === 0) {
	        return cb(null, doc);
	      }
	      Object.keys(attachments).forEach(function (key) {
	        this._getAttachment(doc._id, key, attachments[key], {
	          // Previously the revision handling was done in adapter.js
	          // getAttachment, however since idb-next doesnt we need to
	          // pass the rev through
	          rev: doc._rev,
	          binary: opts.binary,
	          ctx: ctx
	        }, function (err, data) {
	          var att = doc._attachments[key];
	          att.data = data;
	          delete att.stub;
	          delete att.length;
	          if (!--count) {
	            cb(null, doc);
	          }
	        });
	      }, self);
	    } else {
	      if (doc._attachments) {
	        for (var key in doc._attachments) {
	          /* istanbul ignore else */
	          if (doc._attachments.hasOwnProperty(key)) {
	            doc._attachments[key].stub = true;
	          }
	        }
	      }
	      cb(null, doc);
	    }
	  });
	});

	// TODO: I dont like this, it forces an extra read for every
	// attachment read and enforces a confusing api between
	// adapter.js and the adapter implementation
	AbstractPouchDB.prototype.getAttachment =
	  adapterFun('getAttachment', function (docId, attachmentId, opts, callback) {
	  var self = this;
	  if (opts instanceof Function) {
	    callback = opts;
	    opts = {};
	  }
	  this._get(docId, opts, function (err, res$$1) {
	    if (err) {
	      return callback(err);
	    }
	    if (res$$1.doc._attachments && res$$1.doc._attachments[attachmentId]) {
	      opts.ctx = res$$1.ctx;
	      opts.binary = true;
	      self._getAttachment(docId, attachmentId,
	                          res$$1.doc._attachments[attachmentId], opts, callback);
	    } else {
	      return callback(createError$2(MISSING_DOC));
	    }
	  });
	});

	AbstractPouchDB.prototype.allDocs =
	  adapterFun('allDocs', function (opts, callback) {
	  if (typeof opts === 'function') {
	    callback = opts;
	    opts = {};
	  }
	  opts.skip = typeof opts.skip !== 'undefined' ? opts.skip : 0;
	  if (opts.start_key) {
	    opts.startkey = opts.start_key;
	  }
	  if (opts.end_key) {
	    opts.endkey = opts.end_key;
	  }
	  if ('keys' in opts) {
	    if (!Array.isArray(opts.keys)) {
	      return callback(new TypeError('options.keys must be an array'));
	    }
	    var incompatibleOpt =
	      ['startkey', 'endkey', 'key'].filter(function (incompatibleOpt) {
	      return incompatibleOpt in opts;
	    })[0];
	    if (incompatibleOpt) {
	      callback(createError$2(QUERY_PARSE_ERROR,
	        'Query parameter `' + incompatibleOpt +
	        '` is not compatible with multi-get'
	      ));
	      return;
	    }
	    if (!isRemote(this)) {
	      allDocsKeysParse(opts);
	      if (opts.keys.length === 0) {
	        return this._allDocs({limit: 0}, callback);
	      }
	    }
	  }

	  return this._allDocs(opts, callback);
	});

	AbstractPouchDB.prototype.changes = function (opts, callback) {
	  if (typeof opts === 'function') {
	    callback = opts;
	    opts = {};
	  }
	  return new Changes$2(this, opts, callback);
	};

	AbstractPouchDB.prototype.close = adapterFun('close', function (callback) {
	  this._closed = true;
	  this.emit('closed');
	  return this._close(callback);
	});

	AbstractPouchDB.prototype.info = adapterFun('info', function (callback) {
	  var self = this;
	  this._info(function (err, info) {
	    if (err) {
	      return callback(err);
	    }
	    // assume we know better than the adapter, unless it informs us
	    info.db_name = info.db_name || self.name;
	    info.auto_compaction = !!(self.auto_compaction && !isRemote(self));
	    info.adapter = self.adapter;
	    callback(null, info);
	  });
	});

	AbstractPouchDB.prototype.id = adapterFun('id', function (callback) {
	  return this._id(callback);
	});

	/* istanbul ignore next */
	AbstractPouchDB.prototype.type = function () {
	  return (typeof this._type === 'function') ? this._type() : this.adapter;
	};

	AbstractPouchDB.prototype.bulkDocs =
	  adapterFun('bulkDocs', function (req, opts, callback) {
	  if (typeof opts === 'function') {
	    callback = opts;
	    opts = {};
	  }

	  opts = opts || {};

	  if (Array.isArray(req)) {
	    req = {
	      docs: req
	    };
	  }

	  if (!req || !req.docs || !Array.isArray(req.docs)) {
	    return callback(createError$2(MISSING_BULK_DOCS));
	  }

	  for (var i = 0; i < req.docs.length; ++i) {
	    if (typeof req.docs[i] !== 'object' || Array.isArray(req.docs[i])) {
	      return callback(createError$2(NOT_AN_OBJECT));
	    }
	  }

	  var attachmentError;
	  req.docs.forEach(function (doc) {
	    if (doc._attachments) {
	      Object.keys(doc._attachments).forEach(function (name) {
	        attachmentError = attachmentError || attachmentNameError(name);
	        if (!doc._attachments[name].content_type) {
	          guardedConsole('warn', 'Attachment', name, 'on document', doc._id, 'is missing content_type');
	        }
	      });
	    }
	  });

	  if (attachmentError) {
	    return callback(createError$2(BAD_REQUEST, attachmentError));
	  }

	  if (!('new_edits' in opts)) {
	    if ('new_edits' in req) {
	      opts.new_edits = req.new_edits;
	    } else {
	      opts.new_edits = true;
	    }
	  }

	  var adapter = this;
	  if (!opts.new_edits && !isRemote(adapter)) {
	    // ensure revisions of the same doc are sorted, so that
	    // the local adapter processes them correctly (#2935)
	    req.docs.sort(compareByIdThenRev);
	  }

	  cleanDocs(req.docs);

	  // in the case of conflicts, we want to return the _ids to the user
	  // however, the underlying adapter may destroy the docs array, so
	  // create a copy here
	  var ids = req.docs.map(function (doc) {
	    return doc._id;
	  });

	  return this._bulkDocs(req, opts, function (err, res$$1) {
	    if (err) {
	      return callback(err);
	    }
	    if (!opts.new_edits) {
	      // this is what couch does when new_edits is false
	      res$$1 = res$$1.filter(function (x) {
	        return x.error;
	      });
	    }
	    // add ids for error/conflict responses (not required for CouchDB)
	    if (!isRemote(adapter)) {
	      for (var i = 0, l = res$$1.length; i < l; i++) {
	        res$$1[i].id = res$$1[i].id || ids[i];
	      }
	    }

	    callback(null, res$$1);
	  });
	});

	AbstractPouchDB.prototype.registerDependentDatabase =
	  adapterFun('registerDependentDatabase', function (dependentDb,
	                                                          callback) {
	  var depDB = new this.constructor(dependentDb, this.__opts);

	  function diffFun(doc) {
	    doc.dependentDbs = doc.dependentDbs || {};
	    if (doc.dependentDbs[dependentDb]) {
	      return false; // no update required
	    }
	    doc.dependentDbs[dependentDb] = true;
	    return doc;
	  }
	  upsert(this, '_local/_pouch_dependentDbs', diffFun)
	    .then(function () {
	      callback(null, {db: depDB});
	    }).catch(callback);
	});

	AbstractPouchDB.prototype.destroy =
	  adapterFun('destroy', function (opts, callback) {

	  if (typeof opts === 'function') {
	    callback = opts;
	    opts = {};
	  }

	  var self = this;
	  var usePrefix = 'use_prefix' in self ? self.use_prefix : true;

	  function destroyDb() {
	    // call destroy method of the particular adaptor
	    self._destroy(opts, function (err, resp) {
	      if (err) {
	        return callback(err);
	      }
	      self._destroyed = true;
	      self.emit('destroyed');
	      callback(null, resp || { 'ok': true });
	    });
	  }

	  if (isRemote(self)) {
	    // no need to check for dependent DBs if it's a remote DB
	    return destroyDb();
	  }

	  self.get('_local/_pouch_dependentDbs', function (err, localDoc) {
	    if (err) {
	      /* istanbul ignore if */
	      if (err.status !== 404) {
	        return callback(err);
	      } else { // no dependencies
	        return destroyDb();
	      }
	    }
	    var dependentDbs = localDoc.dependentDbs;
	    var PouchDB = self.constructor;
	    var deletedMap = Object.keys(dependentDbs).map(function (name) {
	      // use_prefix is only false in the browser
	      /* istanbul ignore next */
	      var trueName = usePrefix ?
	        name.replace(new RegExp('^' + PouchDB.prefix), '') : name;
	      return new PouchDB(trueName, self.__opts).destroy();
	    });
	    PouchPromise.all(deletedMap).then(destroyDb, callback);
	  });
	});

	function TaskQueue$1() {
	  this.isReady = false;
	  this.failed = false;
	  this.queue = [];
	}

	TaskQueue$1.prototype.execute = function () {
	  var fun;
	  if (this.failed) {
	    while ((fun = this.queue.shift())) {
	      fun(this.failed);
	    }
	  } else {
	    while ((fun = this.queue.shift())) {
	      fun();
	    }
	  }
	};

	TaskQueue$1.prototype.fail = function (err) {
	  this.failed = err;
	  this.execute();
	};

	TaskQueue$1.prototype.ready = function (db) {
	  this.isReady = true;
	  this.db = db;
	  this.execute();
	};

	TaskQueue$1.prototype.addTask = function (fun) {
	  this.queue.push(fun);
	  if (this.failed) {
	    this.execute();
	  }
	};

	function parseAdapter(name, opts) {
	  var match = name.match(/([a-z-]*):\/\/(.*)/);
	  if (match) {
	    // the http adapter expects the fully qualified name
	    return {
	      name: /https?/.test(match[1]) ? match[1] + '://' + match[2] : match[2],
	      adapter: match[1]
	    };
	  }

	  var adapters = PouchDB.adapters;
	  var preferredAdapters = PouchDB.preferredAdapters;
	  var prefix = PouchDB.prefix;
	  var adapterName = opts.adapter;

	  if (!adapterName) { // automatically determine adapter
	    for (var i = 0; i < preferredAdapters.length; ++i) {
	      adapterName = preferredAdapters[i];
	      // check for browsers that have been upgraded from websql-only to websql+idb
	      /* istanbul ignore if */
	      if (adapterName === 'idb' && 'websql' in adapters &&
	          hasLocalStorage() && localStorage['_pouch__websqldb_' + prefix + name]) {
	        // log it, because this can be confusing during development
	        guardedConsole('log', 'PouchDB is downgrading "' + name + '" to WebSQL to' +
	          ' avoid data loss, because it was already opened with WebSQL.');
	        continue; // keep using websql to avoid user data loss
	      }
	      break;
	    }
	  }

	  var adapter = adapters[adapterName];

	  // if adapter is invalid, then an error will be thrown later
	  var usePrefix = (adapter && 'use_prefix' in adapter) ?
	    adapter.use_prefix : true;

	  return {
	    name: usePrefix ? (prefix + name) : name,
	    adapter: adapterName
	  };
	}

	// OK, so here's the deal. Consider this code:
	//     var db1 = new PouchDB('foo');
	//     var db2 = new PouchDB('foo');
	//     db1.destroy();
	// ^ these two both need to emit 'destroyed' events,
	// as well as the PouchDB constructor itself.
	// So we have one db object (whichever one got destroy() called on it)
	// responsible for emitting the initial event, which then gets emitted
	// by the constructor, which then broadcasts it to any other dbs
	// that may have been created with the same name.
	function prepareForDestruction(self) {

	  function onDestroyed(from_constructor) {
	    self.removeListener('closed', onClosed);
	    if (!from_constructor) {
	      self.constructor.emit('destroyed', self.name);
	    }
	  }

	  function onClosed() {
	    self.removeListener('destroyed', onDestroyed);
	    self.constructor.emit('unref', self);
	  }

	  self.once('destroyed', onDestroyed);
	  self.once('closed', onClosed);
	  self.constructor.emit('ref', self);
	}

	inherits(PouchDB, AbstractPouchDB);
	function PouchDB(name, opts) {
	  // In Node our test suite only tests this for PouchAlt unfortunately
	  /* istanbul ignore if */
	  if (!(this instanceof PouchDB)) {
	    return new PouchDB(name, opts);
	  }

	  var self = this;
	  opts = opts || {};

	  if (name && typeof name === 'object') {
	    opts = name;
	    name = opts.name;
	    delete opts.name;
	  }

	  this.__opts = opts = clone(opts);

	  self.auto_compaction = opts.auto_compaction;
	  self.prefix = PouchDB.prefix;

	  if (typeof name !== 'string') {
	    throw new Error('Missing/invalid DB name');
	  }

	  var prefixedName = (opts.prefix || '') + name;
	  var backend = parseAdapter(prefixedName, opts);

	  opts.name = backend.name;
	  opts.adapter = opts.adapter || backend.adapter;

	  self.name = name;
	  self._adapter = opts.adapter;
	  PouchDB.emit('debug', ['adapter', 'Picked adapter: ', opts.adapter]);

	  if (!PouchDB.adapters[opts.adapter] ||
	      !PouchDB.adapters[opts.adapter].valid()) {
	    throw new Error('Invalid Adapter: ' + opts.adapter);
	  }

	  AbstractPouchDB.call(self);
	  self.taskqueue = new TaskQueue$1();

	  self.adapter = opts.adapter;

	  PouchDB.adapters[opts.adapter].call(self, opts, function (err) {
	    if (err) {
	      return self.taskqueue.fail(err);
	    }
	    prepareForDestruction(self);

	    self.emit('created', self);
	    PouchDB.emit('created', self.name);
	    self.taskqueue.ready(self);
	  });

	}

	PouchDB.adapters = {};
	PouchDB.preferredAdapters = [];

	PouchDB.prefix = '_pouch_';

	var eventEmitter = new events.EventEmitter();

	function setUpEventEmitter(Pouch) {
	  Object.keys(events.EventEmitter.prototype).forEach(function (key) {
	    if (typeof events.EventEmitter.prototype[key] === 'function') {
	      Pouch[key] = eventEmitter[key].bind(eventEmitter);
	    }
	  });

	  // these are created in constructor.js, and allow us to notify each DB with
	  // the same name that it was destroyed, via the constructor object
	  var destructListeners = Pouch._destructionListeners = new ExportedMap();

	  Pouch.on('ref', function onConstructorRef(db) {
	    if (!destructListeners.has(db.name)) {
	      destructListeners.set(db.name, []);
	    }
	    destructListeners.get(db.name).push(db);
	  });

	  Pouch.on('unref', function onConstructorUnref(db) {
	    if (!destructListeners.has(db.name)) {
	      return;
	    }
	    var dbList = destructListeners.get(db.name);
	    var pos = dbList.indexOf(db);
	    if (pos < 0) {
	      /* istanbul ignore next */
	      return;
	    }
	    dbList.splice(pos, 1);
	    if (dbList.length > 1) {
	      /* istanbul ignore next */
	      destructListeners.set(db.name, dbList);
	    } else {
	      destructListeners.delete(db.name);
	    }
	  });

	  Pouch.on('destroyed', function onConstructorDestroyed(name) {
	    if (!destructListeners.has(name)) {
	      return;
	    }
	    var dbList = destructListeners.get(name);
	    destructListeners.delete(name);
	    dbList.forEach(function (db) {
	      db.emit('destroyed',true);
	    });
	  });
	}

	setUpEventEmitter(PouchDB);

	PouchDB.adapter = function (id, obj$$1, addToPreferredAdapters) {
	  /* istanbul ignore else */
	  if (obj$$1.valid()) {
	    PouchDB.adapters[id] = obj$$1;
	    if (addToPreferredAdapters) {
	      PouchDB.preferredAdapters.push(id);
	    }
	  }
	};

	PouchDB.plugin = function (obj$$1) {
	  if (typeof obj$$1 === 'function') { // function style for plugins
	    obj$$1(PouchDB);
	  } else if (typeof obj$$1 !== 'object' || Object.keys(obj$$1).length === 0) {
	    throw new Error('Invalid plugin: got "' + obj$$1 + '", expected an object or a function');
	  } else {
	    Object.keys(obj$$1).forEach(function (id) { // object style for plugins
	      PouchDB.prototype[id] = obj$$1[id];
	    });
	  }
	  if (this.__defaults) {
	    PouchDB.__defaults = $inject_Object_assign({}, this.__defaults);
	  }
	  return PouchDB;
	};

	PouchDB.defaults = function (defaultOpts) {
	  function PouchAlt(name, opts) {
	    if (!(this instanceof PouchAlt)) {
	      return new PouchAlt(name, opts);
	    }

	    opts = opts || {};

	    if (name && typeof name === 'object') {
	      opts = name;
	      name = opts.name;
	      delete opts.name;
	    }

	    opts = $inject_Object_assign({}, PouchAlt.__defaults, opts);
	    PouchDB.call(this, name, opts);
	  }

	  inherits(PouchAlt, PouchDB);

	  PouchAlt.preferredAdapters = PouchDB.preferredAdapters.slice();
	  Object.keys(PouchDB).forEach(function (key) {
	    if (!(key in PouchAlt)) {
	      PouchAlt[key] = PouchDB[key];
	    }
	  });

	  // make default options transitive
	  // https://github.com/pouchdb/pouchdb/issues/5922
	  PouchAlt.__defaults = $inject_Object_assign({}, this.__defaults, defaultOpts);

	  return PouchAlt;
	};

	// managed automatically by set-version.js
	var version = "6.4.3";

	function debugPouch(PouchDB) {
	  PouchDB.debug = src;
	  var logs = {};
	  /* istanbul ignore next */
	  PouchDB.on('debug', function (args) {
	    // first argument is log identifier
	    var logId = args[0];
	    // rest should be passed verbatim to debug module
	    var logArgs = args.slice(1);
	    if (!logs[logId]) {
	      logs[logId] = src('pouchdb:' + logId);
	    }
	    logs[logId].apply(null, logArgs);
	  });
	}

	// this would just be "return doc[field]", but fields
	// can be "deep" due to dot notation
	function getFieldFromDoc(doc, parsedField) {
	  var value = doc;
	  for (var i = 0, len = parsedField.length; i < len; i++) {
	    var key = parsedField[i];
	    value = value[key];
	    if (!value) {
	      break;
	    }
	  }
	  return value;
	}

	function compare$1(left, right) {
	  return left < right ? -1 : left > right ? 1 : 0;
	}

	// Converts a string in dot notation to an array of its components, with backslash escaping
	function parseField(fieldName) {
	  // fields may be deep (e.g. "foo.bar.baz"), so parse
	  var fields = [];
	  var current = '';
	  for (var i = 0, len = fieldName.length; i < len; i++) {
	    var ch = fieldName[i];
	    if (ch === '.') {
	      if (i > 0 && fieldName[i - 1] === '\\') { // escaped delimiter
	        current = current.substring(0, current.length - 1) + '.';
	      } else { // not escaped, so delimiter
	        fields.push(current);
	        current = '';
	      }
	    } else { // normal character
	      current += ch;
	    }
	  }
	  fields.push(current);
	  return fields;
	}

	var combinationFields = ['$or', '$nor', '$not'];
	function isCombinationalField(field) {
	  return combinationFields.indexOf(field) > -1;
	}

	function getKey(obj$$1) {
	  return Object.keys(obj$$1)[0];
	}

	function getValue(obj$$1) {
	  return obj$$1[getKey(obj$$1)];
	}


	// flatten an array of selectors joined by an $and operator
	function mergeAndedSelectors(selectors) {

	  // sort to ensure that e.g. if the user specified
	  // $and: [{$gt: 'a'}, {$gt: 'b'}], then it's collapsed into
	  // just {$gt: 'b'}
	  var res$$1 = {};

	  selectors.forEach(function (selector) {
	    Object.keys(selector).forEach(function (field) {
	      var matcher = selector[field];
	      if (typeof matcher !== 'object') {
	        matcher = {$eq: matcher};
	      }

	      if (isCombinationalField(field)) {
	        if (matcher instanceof Array) {
	          res$$1[field] = matcher.map(function (m) {
	            return mergeAndedSelectors([m]);
	          });
	        } else {
	          res$$1[field] = mergeAndedSelectors([matcher]);
	        }
	      } else {
	        var fieldMatchers = res$$1[field] = res$$1[field] || {};
	        Object.keys(matcher).forEach(function (operator) {
	          var value = matcher[operator];

	          if (operator === '$gt' || operator === '$gte') {
	            return mergeGtGte(operator, value, fieldMatchers);
	          } else if (operator === '$lt' || operator === '$lte') {
	            return mergeLtLte(operator, value, fieldMatchers);
	          } else if (operator === '$ne') {
	            return mergeNe(value, fieldMatchers);
	          } else if (operator === '$eq') {
	            return mergeEq(value, fieldMatchers);
	          }
	          fieldMatchers[operator] = value;
	        });
	      }
	    });
	  });

	  return res$$1;
	}



	// collapse logically equivalent gt/gte values
	function mergeGtGte(operator, value, fieldMatchers) {
	  if (typeof fieldMatchers.$eq !== 'undefined') {
	    return; // do nothing
	  }
	  if (typeof fieldMatchers.$gte !== 'undefined') {
	    if (operator === '$gte') {
	      if (value > fieldMatchers.$gte) { // more specificity
	        fieldMatchers.$gte = value;
	      }
	    } else { // operator === '$gt'
	      if (value >= fieldMatchers.$gte) { // more specificity
	        delete fieldMatchers.$gte;
	        fieldMatchers.$gt = value;
	      }
	    }
	  } else if (typeof fieldMatchers.$gt !== 'undefined') {
	    if (operator === '$gte') {
	      if (value > fieldMatchers.$gt) { // more specificity
	        delete fieldMatchers.$gt;
	        fieldMatchers.$gte = value;
	      }
	    } else { // operator === '$gt'
	      if (value > fieldMatchers.$gt) { // more specificity
	        fieldMatchers.$gt = value;
	      }
	    }
	  } else {
	    fieldMatchers[operator] = value;
	  }
	}

	// collapse logically equivalent lt/lte values
	function mergeLtLte(operator, value, fieldMatchers) {
	  if (typeof fieldMatchers.$eq !== 'undefined') {
	    return; // do nothing
	  }
	  if (typeof fieldMatchers.$lte !== 'undefined') {
	    if (operator === '$lte') {
	      if (value < fieldMatchers.$lte) { // more specificity
	        fieldMatchers.$lte = value;
	      }
	    } else { // operator === '$gt'
	      if (value <= fieldMatchers.$lte) { // more specificity
	        delete fieldMatchers.$lte;
	        fieldMatchers.$lt = value;
	      }
	    }
	  } else if (typeof fieldMatchers.$lt !== 'undefined') {
	    if (operator === '$lte') {
	      if (value < fieldMatchers.$lt) { // more specificity
	        delete fieldMatchers.$lt;
	        fieldMatchers.$lte = value;
	      }
	    } else { // operator === '$gt'
	      if (value < fieldMatchers.$lt) { // more specificity
	        fieldMatchers.$lt = value;
	      }
	    }
	  } else {
	    fieldMatchers[operator] = value;
	  }
	}

	// combine $ne values into one array
	function mergeNe(value, fieldMatchers) {
	  if ('$ne' in fieldMatchers) {
	    // there are many things this could "not" be
	    fieldMatchers.$ne.push(value);
	  } else { // doesn't exist yet
	    fieldMatchers.$ne = [value];
	  }
	}

	// add $eq into the mix
	function mergeEq(value, fieldMatchers) {
	  // these all have less specificity than the $eq
	  // TODO: check for user errors here
	  delete fieldMatchers.$gt;
	  delete fieldMatchers.$gte;
	  delete fieldMatchers.$lt;
	  delete fieldMatchers.$lte;
	  delete fieldMatchers.$ne;
	  fieldMatchers.$eq = value;
	}


	//
	// normalize the selector
	//
	function massageSelector(input) {
	  var result = clone(input);
	  var wasAnded = false;
	  if ('$and' in result) {
	    result = mergeAndedSelectors(result['$and']);
	    wasAnded = true;
	  }

	  ['$or', '$nor'].forEach(function (orOrNor) {
	    if (orOrNor in result) {
	      // message each individual selector
	      // e.g. {foo: 'bar'} becomes {foo: {$eq: 'bar'}}
	      result[orOrNor].forEach(function (subSelector) {
	        var fields = Object.keys(subSelector);
	        for (var i = 0; i < fields.length; i++) {
	          var field = fields[i];
	          var matcher = subSelector[field];
	          if (typeof matcher !== 'object' || matcher === null) {
	            subSelector[field] = {$eq: matcher};
	          }
	        }
	      });
	    }
	  });

	  if ('$not' in result) {
	    //This feels a little like forcing, but it will work for now,
	    //I would like to come back to this and make the merging of selectors a little more generic
	    result['$not'] = mergeAndedSelectors([result['$not']]);
	  }

	  var fields = Object.keys(result);

	  for (var i = 0; i < fields.length; i++) {
	    var field = fields[i];
	    var matcher = result[field];

	    if (typeof matcher !== 'object' || matcher === null) {
	      matcher = {$eq: matcher};
	    } else if ('$ne' in matcher && !wasAnded) {
	      // I put these in an array, since there may be more than one
	      // but in the "mergeAnded" operation, I already take care of that
	      matcher.$ne = [matcher.$ne];
	    }
	    result[field] = matcher;
	  }

	  return result;
	}

	function pad(str, padWith, upToLength) {
	  var padding = '';
	  var targetLength = upToLength - str.length;
	  /* istanbul ignore next */
	  while (padding.length < targetLength) {
	    padding += padWith;
	  }
	  return padding;
	}

	function padLeft(str, padWith, upToLength) {
	  var padding = pad(str, padWith, upToLength);
	  return padding + str;
	}

	var MIN_MAGNITUDE = -324; // verified by -Number.MIN_VALUE
	var MAGNITUDE_DIGITS = 3; // ditto
	var SEP = ''; // set to '_' for easier debugging 

	function collate(a, b) {

	  if (a === b) {
	    return 0;
	  }

	  a = normalizeKey(a);
	  b = normalizeKey(b);

	  var ai = collationIndex(a);
	  var bi = collationIndex(b);
	  if ((ai - bi) !== 0) {
	    return ai - bi;
	  }
	  switch (typeof a) {
	    case 'number':
	      return a - b;
	    case 'boolean':
	      return a < b ? -1 : 1;
	    case 'string':
	      return stringCollate(a, b);
	  }
	  return Array.isArray(a) ? arrayCollate(a, b) : objectCollate(a, b);
	}

	// couch considers null/NaN/Infinity/-Infinity === undefined,
	// for the purposes of mapreduce indexes. also, dates get stringified.
	function normalizeKey(key) {
	  switch (typeof key) {
	    case 'undefined':
	      return null;
	    case 'number':
	      if (key === Infinity || key === -Infinity || isNaN(key)) {
	        return null;
	      }
	      return key;
	    case 'object':
	      var origKey = key;
	      if (Array.isArray(key)) {
	        var len = key.length;
	        key = new Array(len);
	        for (var i = 0; i < len; i++) {
	          key[i] = normalizeKey(origKey[i]);
	        }
	      /* istanbul ignore next */
	      } else if (key instanceof Date) {
	        return key.toJSON();
	      } else if (key !== null) { // generic object
	        key = {};
	        for (var k in origKey) {
	          if (origKey.hasOwnProperty(k)) {
	            var val = origKey[k];
	            if (typeof val !== 'undefined') {
	              key[k] = normalizeKey(val);
	            }
	          }
	        }
	      }
	  }
	  return key;
	}

	function indexify(key) {
	  if (key !== null) {
	    switch (typeof key) {
	      case 'boolean':
	        return key ? 1 : 0;
	      case 'number':
	        return numToIndexableString(key);
	      case 'string':
	        // We've to be sure that key does not contain \u0000
	        // Do order-preserving replacements:
	        // 0 -> 1, 1
	        // 1 -> 1, 2
	        // 2 -> 2, 2
	        return key
	          .replace(/\u0002/g, '\u0002\u0002')
	          .replace(/\u0001/g, '\u0001\u0002')
	          .replace(/\u0000/g, '\u0001\u0001');
	      case 'object':
	        var isArray = Array.isArray(key);
	        var arr = isArray ? key : Object.keys(key);
	        var i = -1;
	        var len = arr.length;
	        var result = '';
	        if (isArray) {
	          while (++i < len) {
	            result += toIndexableString(arr[i]);
	          }
	        } else {
	          while (++i < len) {
	            var objKey = arr[i];
	            result += toIndexableString(objKey) +
	                toIndexableString(key[objKey]);
	          }
	        }
	        return result;
	    }
	  }
	  return '';
	}

	// convert the given key to a string that would be appropriate
	// for lexical sorting, e.g. within a database, where the
	// sorting is the same given by the collate() function.
	function toIndexableString(key) {
	  var zero = '\u0000';
	  key = normalizeKey(key);
	  return collationIndex(key) + SEP + indexify(key) + zero;
	}

	function parseNumber(str, i) {
	  var originalIdx = i;
	  var num;
	  var zero = str[i] === '1';
	  if (zero) {
	    num = 0;
	    i++;
	  } else {
	    var neg = str[i] === '0';
	    i++;
	    var numAsString = '';
	    var magAsString = str.substring(i, i + MAGNITUDE_DIGITS);
	    var magnitude = parseInt(magAsString, 10) + MIN_MAGNITUDE;
	    /* istanbul ignore next */
	    if (neg) {
	      magnitude = -magnitude;
	    }
	    i += MAGNITUDE_DIGITS;
	    while (true) {
	      var ch = str[i];
	      if (ch === '\u0000') {
	        break;
	      } else {
	        numAsString += ch;
	      }
	      i++;
	    }
	    numAsString = numAsString.split('.');
	    if (numAsString.length === 1) {
	      num = parseInt(numAsString, 10);
	    } else {
	      /* istanbul ignore next */
	      num = parseFloat(numAsString[0] + '.' + numAsString[1]);
	    }
	    /* istanbul ignore next */
	    if (neg) {
	      num = num - 10;
	    }
	    /* istanbul ignore next */
	    if (magnitude !== 0) {
	      // parseFloat is more reliable than pow due to rounding errors
	      // e.g. Number.MAX_VALUE would return Infinity if we did
	      // num * Math.pow(10, magnitude);
	      num = parseFloat(num + 'e' + magnitude);
	    }
	  }
	  return {num: num, length : i - originalIdx};
	}

	// move up the stack while parsing
	// this function moved outside of parseIndexableString for performance
	function pop$1(stack, metaStack) {
	  var obj$$1 = stack.pop();

	  if (metaStack.length) {
	    var lastMetaElement = metaStack[metaStack.length - 1];
	    if (obj$$1 === lastMetaElement.element) {
	      // popping a meta-element, e.g. an object whose value is another object
	      metaStack.pop();
	      lastMetaElement = metaStack[metaStack.length - 1];
	    }
	    var element = lastMetaElement.element;
	    var lastElementIndex = lastMetaElement.index;
	    if (Array.isArray(element)) {
	      element.push(obj$$1);
	    } else if (lastElementIndex === stack.length - 2) { // obj with key+value
	      var key = stack.pop();
	      element[key] = obj$$1;
	    } else {
	      stack.push(obj$$1); // obj with key only
	    }
	  }
	}

	function parseIndexableString(str) {
	  var stack = [];
	  var metaStack = []; // stack for arrays and objects
	  var i = 0;

	  /*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
	  while (true) {
	    var collationIndex = str[i++];
	    if (collationIndex === '\u0000') {
	      if (stack.length === 1) {
	        return stack.pop();
	      } else {
	        pop$1(stack, metaStack);
	        continue;
	      }
	    }
	    switch (collationIndex) {
	      case '1':
	        stack.push(null);
	        break;
	      case '2':
	        stack.push(str[i] === '1');
	        i++;
	        break;
	      case '3':
	        var parsedNum = parseNumber(str, i);
	        stack.push(parsedNum.num);
	        i += parsedNum.length;
	        break;
	      case '4':
	        var parsedStr = '';
	        /*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
	        while (true) {
	          var ch = str[i];
	          if (ch === '\u0000') {
	            break;
	          }
	          parsedStr += ch;
	          i++;
	        }
	        // perform the reverse of the order-preserving replacement
	        // algorithm (see above)
	        parsedStr = parsedStr.replace(/\u0001\u0001/g, '\u0000')
	          .replace(/\u0001\u0002/g, '\u0001')
	          .replace(/\u0002\u0002/g, '\u0002');
	        stack.push(parsedStr);
	        break;
	      case '5':
	        var arrayElement = { element: [], index: stack.length };
	        stack.push(arrayElement.element);
	        metaStack.push(arrayElement);
	        break;
	      case '6':
	        var objElement = { element: {}, index: stack.length };
	        stack.push(objElement.element);
	        metaStack.push(objElement);
	        break;
	      /* istanbul ignore next */
	      default:
	        throw new Error(
	          'bad collationIndex or unexpectedly reached end of input: ' +
	            collationIndex);
	    }
	  }
	}

	function arrayCollate(a, b) {
	  var len = Math.min(a.length, b.length);
	  for (var i = 0; i < len; i++) {
	    var sort = collate(a[i], b[i]);
	    if (sort !== 0) {
	      return sort;
	    }
	  }
	  return (a.length === b.length) ? 0 :
	    (a.length > b.length) ? 1 : -1;
	}
	function stringCollate(a, b) {
	  // See: https://github.com/daleharvey/pouchdb/issues/40
	  // This is incompatible with the CouchDB implementation, but its the
	  // best we can do for now
	  return (a === b) ? 0 : ((a > b) ? 1 : -1);
	}
	function objectCollate(a, b) {
	  var ak = Object.keys(a), bk = Object.keys(b);
	  var len = Math.min(ak.length, bk.length);
	  for (var i = 0; i < len; i++) {
	    // First sort the keys
	    var sort = collate(ak[i], bk[i]);
	    if (sort !== 0) {
	      return sort;
	    }
	    // if the keys are equal sort the values
	    sort = collate(a[ak[i]], b[bk[i]]);
	    if (sort !== 0) {
	      return sort;
	    }

	  }
	  return (ak.length === bk.length) ? 0 :
	    (ak.length > bk.length) ? 1 : -1;
	}
	// The collation is defined by erlangs ordered terms
	// the atoms null, true, false come first, then numbers, strings,
	// arrays, then objects
	// null/undefined/NaN/Infinity/-Infinity are all considered null
	function collationIndex(x) {
	  var id = ['boolean', 'number', 'string', 'object'];
	  var idx = id.indexOf(typeof x);
	  //false if -1 otherwise true, but fast!!!!1
	  if (~idx) {
	    if (x === null) {
	      return 1;
	    }
	    if (Array.isArray(x)) {
	      return 5;
	    }
	    return idx < 3 ? (idx + 2) : (idx + 3);
	  }
	  /* istanbul ignore next */
	  if (Array.isArray(x)) {
	    return 5;
	  }
	}

	// conversion:
	// x yyy zz...zz
	// x = 0 for negative, 1 for 0, 2 for positive
	// y = exponent (for negative numbers negated) moved so that it's >= 0
	// z = mantisse
	function numToIndexableString(num) {

	  if (num === 0) {
	    return '1';
	  }

	  // convert number to exponential format for easier and
	  // more succinct string sorting
	  var expFormat = num.toExponential().split(/e\+?/);
	  var magnitude = parseInt(expFormat[1], 10);

	  var neg = num < 0;

	  var result = neg ? '0' : '2';

	  // first sort by magnitude
	  // it's easier if all magnitudes are positive
	  var magForComparison = ((neg ? -magnitude : magnitude) - MIN_MAGNITUDE);
	  var magString = padLeft((magForComparison).toString(), '0', MAGNITUDE_DIGITS);

	  result += SEP + magString;

	  // then sort by the factor
	  var factor = Math.abs(parseFloat(expFormat[0])); // [1..10)
	  /* istanbul ignore next */
	  if (neg) { // for negative reverse ordering
	    factor = 10 - factor;
	  }

	  var factorStr = factor.toFixed(20);

	  // strip zeros from the end
	  factorStr = factorStr.replace(/\.?0+$/, '');

	  result += SEP + factorStr;

	  return result;
	}

	// create a comparator based on the sort object
	function createFieldSorter(sort) {

	  function getFieldValuesAsArray(doc) {
	    return sort.map(function (sorting) {
	      var fieldName = getKey(sorting);
	      var parsedField = parseField(fieldName);
	      var docFieldValue = getFieldFromDoc(doc, parsedField);
	      return docFieldValue;
	    });
	  }

	  return function (aRow, bRow) {
	    var aFieldValues = getFieldValuesAsArray(aRow.doc);
	    var bFieldValues = getFieldValuesAsArray(bRow.doc);
	    var collation = collate(aFieldValues, bFieldValues);
	    if (collation !== 0) {
	      return collation;
	    }
	    // this is what mango seems to do
	    return compare$1(aRow.doc._id, bRow.doc._id);
	  };
	}

	function filterInMemoryFields(rows, requestDef, inMemoryFields) {
	  rows = rows.filter(function (row) {
	    return rowFilter(row.doc, requestDef.selector, inMemoryFields);
	  });

	  if (requestDef.sort) {
	    // in-memory sort
	    var fieldSorter = createFieldSorter(requestDef.sort);
	    rows = rows.sort(fieldSorter);
	    if (typeof requestDef.sort[0] !== 'string' &&
	        getValue(requestDef.sort[0]) === 'desc') {
	      rows = rows.reverse();
	    }
	  }

	  if ('limit' in requestDef || 'skip' in requestDef) {
	    // have to do the limit in-memory
	    var skip = requestDef.skip || 0;
	    var limit = ('limit' in requestDef ? requestDef.limit : rows.length) + skip;
	    rows = rows.slice(skip, limit);
	  }
	  return rows;
	}

	function rowFilter(doc, selector, inMemoryFields) {
	  return inMemoryFields.every(function (field) {
	    var matcher = selector[field];
	    var parsedField = parseField(field);
	    var docFieldValue = getFieldFromDoc(doc, parsedField);
	    if (isCombinationalField(field)) {
	      return matchCominationalSelector(field, matcher, doc);
	    }

	    return matchSelector(matcher, doc, parsedField, docFieldValue);
	  });
	}

	function matchSelector(matcher, doc, parsedField, docFieldValue) {
	  if (!matcher) {
	    // no filtering necessary; this field is just needed for sorting
	    return true;
	  }

	  return Object.keys(matcher).every(function (userOperator) {
	    var userValue = matcher[userOperator];
	    return match(userOperator, doc, userValue, parsedField, docFieldValue);
	  });
	}

	function matchCominationalSelector(field, matcher, doc) {

	  if (field === '$or') {
	    return matcher.some(function (orMatchers) {
	      return rowFilter(doc, orMatchers, Object.keys(orMatchers));
	    });
	  }

	  if (field === '$not') {
	    return !rowFilter(doc, matcher, Object.keys(matcher));
	  }

	  //`$nor`
	  return !matcher.find(function (orMatchers) {
	    return rowFilter(doc, orMatchers, Object.keys(orMatchers));
	  });

	}

	function match(userOperator, doc, userValue, parsedField, docFieldValue) {
	  if (!matchers[userOperator]) {
	    throw new Error('unknown operator "' + userOperator +
	      '" - should be one of $eq, $lte, $lt, $gt, $gte, $exists, $ne, $in, ' +
	      '$nin, $size, $mod, $regex, $elemMatch, $type, $allMatch or $all');
	  }
	  return matchers[userOperator](doc, userValue, parsedField, docFieldValue);
	}

	function fieldExists(docFieldValue) {
	  return typeof docFieldValue !== 'undefined' && docFieldValue !== null;
	}

	function fieldIsNotUndefined(docFieldValue) {
	  return typeof docFieldValue !== 'undefined';
	}

	function modField(docFieldValue, userValue) {
	  var divisor = userValue[0];
	  var mod = userValue[1];
	  if (divisor === 0) {
	    throw new Error('Bad divisor, cannot divide by zero');
	  }

	  if (parseInt(divisor, 10) !== divisor ) {
	    throw new Error('Divisor is not an integer');
	  }

	  if (parseInt(mod, 10) !== mod ) {
	    throw new Error('Modulus is not an integer');
	  }

	  if (parseInt(docFieldValue, 10) !== docFieldValue) {
	    return false;
	  }

	  return docFieldValue % divisor === mod;
	}

	function arrayContainsValue(docFieldValue, userValue) {
	  return userValue.some(function (val) {
	    if (docFieldValue instanceof Array) {
	      return docFieldValue.indexOf(val) > -1;
	    }

	    return docFieldValue === val;
	  });
	}

	function arrayContainsAllValues(docFieldValue, userValue) {
	  return userValue.every(function (val) {
	    return docFieldValue.indexOf(val) > -1;
	  });
	}

	function arraySize(docFieldValue, userValue) {
	  return docFieldValue.length === userValue;
	}

	function regexMatch(docFieldValue, userValue) {
	  var re = new RegExp(userValue);

	  return re.test(docFieldValue);
	}

	function typeMatch(docFieldValue, userValue) {

	  switch (userValue) {
	    case 'null':
	      return docFieldValue === null;
	    case 'boolean':
	      return typeof (docFieldValue) === 'boolean';
	    case 'number':
	      return typeof (docFieldValue) === 'number';
	    case 'string':
	      return typeof (docFieldValue) === 'string';
	    case 'array':
	      return docFieldValue instanceof Array;
	    case 'object':
	      return ({}).toString.call(docFieldValue) === '[object Object]';
	  }

	  throw new Error(userValue + ' not supported as a type.' +
	                  'Please use one of object, string, array, number, boolean or null.');

	}

	var matchers = {

	  '$elemMatch': function (doc, userValue, parsedField, docFieldValue) {
	    if (!Array.isArray(docFieldValue)) {
	      return false;
	    }

	    if (docFieldValue.length === 0) {
	      return false;
	    }

	    if (typeof docFieldValue[0] === 'object') {
	      return docFieldValue.some(function (val) {
	        return rowFilter(val, userValue, Object.keys(userValue));
	      });
	    }

	    return docFieldValue.some(function (val) {
	      return matchSelector(userValue, doc, parsedField, val);
	    });
	  },

	  '$allMatch': function (doc, userValue, parsedField, docFieldValue) {
	    if (!Array.isArray(docFieldValue)) {
	      return false;
	    }

	    /* istanbul ignore next */
	    if (docFieldValue.length === 0) {
	      return false;
	    }

	    if (typeof docFieldValue[0] === 'object') {
	      return docFieldValue.every(function (val) {
	        return rowFilter(val, userValue, Object.keys(userValue));
	      });
	    }

	    return docFieldValue.every(function (val) {
	      return matchSelector(userValue, doc, parsedField, val);
	    });
	  },

	  '$eq': function (doc, userValue, parsedField, docFieldValue) {
	    return fieldIsNotUndefined(docFieldValue) && collate(docFieldValue, userValue) === 0;
	  },

	  '$gte': function (doc, userValue, parsedField, docFieldValue) {
	    return fieldIsNotUndefined(docFieldValue) && collate(docFieldValue, userValue) >= 0;
	  },

	  '$gt': function (doc, userValue, parsedField, docFieldValue) {
	    return fieldIsNotUndefined(docFieldValue) && collate(docFieldValue, userValue) > 0;
	  },

	  '$lte': function (doc, userValue, parsedField, docFieldValue) {
	    return fieldIsNotUndefined(docFieldValue) && collate(docFieldValue, userValue) <= 0;
	  },

	  '$lt': function (doc, userValue, parsedField, docFieldValue) {
	    return fieldIsNotUndefined(docFieldValue) && collate(docFieldValue, userValue) < 0;
	  },

	  '$exists': function (doc, userValue, parsedField, docFieldValue) {
	    //a field that is null is still considered to exist
	    if (userValue) {
	      return fieldIsNotUndefined(docFieldValue);
	    }

	    return !fieldIsNotUndefined(docFieldValue);
	  },

	  '$mod': function (doc, userValue, parsedField, docFieldValue) {
	    return fieldExists(docFieldValue) && modField(docFieldValue, userValue);
	  },

	  '$ne': function (doc, userValue, parsedField, docFieldValue) {
	    return userValue.every(function (neValue) {
	      return collate(docFieldValue, neValue) !== 0;
	    });
	  },
	  '$in': function (doc, userValue, parsedField, docFieldValue) {
	    return fieldExists(docFieldValue) && arrayContainsValue(docFieldValue, userValue);
	  },

	  '$nin': function (doc, userValue, parsedField, docFieldValue) {
	    return fieldExists(docFieldValue) && !arrayContainsValue(docFieldValue, userValue);
	  },

	  '$size': function (doc, userValue, parsedField, docFieldValue) {
	    return fieldExists(docFieldValue) && arraySize(docFieldValue, userValue);
	  },

	  '$all': function (doc, userValue, parsedField, docFieldValue) {
	    return Array.isArray(docFieldValue) && arrayContainsAllValues(docFieldValue, userValue);
	  },

	  '$regex': function (doc, userValue, parsedField, docFieldValue) {
	    return fieldExists(docFieldValue) && regexMatch(docFieldValue, userValue);
	  },

	  '$type': function (doc, userValue, parsedField, docFieldValue) {
	    return typeMatch(docFieldValue, userValue);
	  }
	};

	// return true if the given doc matches the supplied selector
	function matchesSelector(doc, selector) {
	  /* istanbul ignore if */
	  if (typeof selector !== 'object') {
	    // match the CouchDB error message
	    throw new Error('Selector error: expected a JSON object');
	  }

	  selector = massageSelector(selector);
	  var row = {
	    'doc': doc
	  };

	  var rowsMatched = filterInMemoryFields([row], { 'selector': selector }, Object.keys(selector));
	  return rowsMatched && rowsMatched.length === 1;
	}

	function evalFilter(input) {
	  var code = '(function() {\n"use strict";\nreturn ' + input + '\n})()';

	  return vm.runInNewContext(code);
	}

	function evalView(input) {
	  var code = [
	    '"use strict";',
	    'var emitted = false;',
	    'var emit = function (a, b) {',
	    '  emitted = true;',
	    '};',
	    'var view = ' + input + ';',
	    'view(doc);',
	    'if (emitted) {',
	    '  return true;',
	    '}'
	  ].join('\n');

	  return vm.runInNewContext('(function(doc) {\n' + code + '\n})');
	}

	function validate(opts, callback) {
	  if (opts.selector) {
	    if (opts.filter && opts.filter !== '_selector') {
	      var filterName = typeof opts.filter === 'string' ?
	        opts.filter : 'function';
	      return callback(new Error('selector invalid for filter "' + filterName + '"'));
	    }
	  }
	  callback();
	}

	function normalize(opts) {
	  if (opts.view && !opts.filter) {
	    opts.filter = '_view';
	  }

	  if (opts.selector && !opts.filter) {
	    opts.filter = '_selector';
	  }

	  if (opts.filter && typeof opts.filter === 'string') {
	    if (opts.filter === '_view') {
	      opts.view = normalizeDesignDocFunctionName(opts.view);
	    } else {
	      opts.filter = normalizeDesignDocFunctionName(opts.filter);
	    }
	  }
	}

	function shouldFilter(changesHandler, opts) {
	  return opts.filter && typeof opts.filter === 'string' &&
	    !opts.doc_ids && !isRemote(changesHandler.db);
	}

	function filter(changesHandler, opts) {
	  var callback = opts.complete;
	  if (opts.filter === '_view') {
	    if (!opts.view || typeof opts.view !== 'string') {
	      var err = createError$2(BAD_REQUEST,
	        '`view` filter parameter not found or invalid.');
	      return callback(err);
	    }
	    // fetch a view from a design doc, make it behave like a filter
	    var viewName = parseDesignDocFunctionName(opts.view);
	    changesHandler.db.get('_design/' + viewName[0], function (err, ddoc) {
	      /* istanbul ignore if */
	      if (changesHandler.isCancelled) {
	        return callback(null, {status: 'cancelled'});
	      }
	      /* istanbul ignore next */
	      if (err) {
	        return callback(generateErrorFromResponse(err));
	      }
	      var mapFun = ddoc && ddoc.views && ddoc.views[viewName[1]] &&
	        ddoc.views[viewName[1]].map;
	      if (!mapFun) {
	        return callback(createError$2(MISSING_DOC,
	          (ddoc.views ? 'missing json key: ' + viewName[1] :
	            'missing json key: views')));
	      }
	      opts.filter = evalView(mapFun);
	      changesHandler.doChanges(opts);
	    });
	  } else if (opts.selector) {
	    opts.filter = function (doc) {
	      return matchesSelector(doc, opts.selector);
	    };
	    changesHandler.doChanges(opts);
	  } else {
	    // fetch a filter from a design doc
	    var filterName = parseDesignDocFunctionName(opts.filter);
	    changesHandler.db.get('_design/' + filterName[0], function (err, ddoc) {
	      /* istanbul ignore if */
	      if (changesHandler.isCancelled) {
	        return callback(null, {status: 'cancelled'});
	      }
	      /* istanbul ignore next */
	      if (err) {
	        return callback(generateErrorFromResponse(err));
	      }
	      var filterFun = ddoc && ddoc.filters && ddoc.filters[filterName[1]];
	      if (!filterFun) {
	        return callback(createError$2(MISSING_DOC,
	          ((ddoc && ddoc.filters) ? 'missing json key: ' + filterName[1]
	            : 'missing json key: filters')));
	      }
	      opts.filter = evalFilter(filterFun);
	      changesHandler.doChanges(opts);
	    });
	  }
	}

	function applyChangesFilterPlugin(PouchDB) {
	  PouchDB._changesFilterPlugin = {
	    validate: validate,
	    normalize: normalize,
	    shouldFilter: shouldFilter,
	    filter: filter
	  };
	}

	// TODO: remove from pouchdb-core (breaking)
	PouchDB.plugin(debugPouch);

	// TODO: remove from pouchdb-core (breaking)
	PouchDB.plugin(applyChangesFilterPlugin);

	PouchDB.version = version;

	function isFunction$1(f) {
	  return 'function' === typeof f;
	}

	function getPrefix(db) {
	  if (isFunction$1(db.prefix)) {
	    return db.prefix();
	  }
	  return db;
	}

	function clone$2(_obj) {
	  var obj$$1 = {};
	  for (var k in _obj) {
	    obj$$1[k] = _obj[k];
	  }
	  return obj$$1;
	}

	function nut(db, precodec, codec) {
	  function encodePrefix(prefix, key, opts1, opts2) {
	    return precodec.encode([ prefix, codec.encodeKey(key, opts1, opts2 ) ]);
	  }

	  function addEncodings(op, prefix) {
	    if (prefix && prefix.options) {
	      op.keyEncoding =
	        op.keyEncoding || prefix.options.keyEncoding;
	      op.valueEncoding =
	        op.valueEncoding || prefix.options.valueEncoding;
	    }
	    return op;
	  }

	  db.open(function () { /* no-op */});

	  return {
	    apply: function (ops, opts, cb) {
	      opts = opts || {};

	      var batch = [];
	      var i = -1;
	      var len = ops.length;

	      while (++i < len) {
	        var op = ops[i];
	        addEncodings(op, op.prefix);
	        op.prefix = getPrefix(op.prefix);
	        batch.push({
	          key: encodePrefix(op.prefix, op.key, opts, op),
	          value: op.type !== 'del' && codec.encodeValue(op.value, opts, op),
	          type: op.type
	        });
	      }
	      db.db.batch(batch, opts, cb);
	    },
	    get: function (key, prefix, opts, cb) {
	      opts.asBuffer = codec.valueAsBuffer(opts);
	      return db.db.get(
	        encodePrefix(prefix, key, opts),
	        opts,
	        function (err, value) {
	          if (err) {
	            cb(err);
	          } else {
	            cb(null, codec.decodeValue(value, opts));
	          }
	        }
	      );
	    },
	    createDecoder: function (opts) {
	      return function (key, value) {
	        return {
	          key: codec.decodeKey(precodec.decode(key)[1], opts),
	          value: codec.decodeValue(value, opts)
	        };
	      };
	    },
	    isClosed: function isClosed() {
	      return db.isClosed();
	    },
	    close: function close(cb) {
	      return db.close(cb);
	    },
	    iterator: function (_opts) {
	      var opts = clone$2(_opts || {});
	      var prefix = _opts.prefix || [];

	      function encodeKey(key) {
	        return encodePrefix(prefix, key, opts, {});
	      }

	      ltgt.toLtgt(_opts, opts, encodeKey, precodec.lowerBound, precodec.upperBound);

	      // if these legacy values are in the options, remove them

	      opts.prefix = null;

	      //************************************************
	      //hard coded defaults, for now...
	      //TODO: pull defaults and encoding out of levelup.
	      opts.keyAsBuffer = opts.valueAsBuffer = false;
	      //************************************************


	      //this is vital, otherwise limit: undefined will
	      //create an empty stream.
	      /* istanbul ignore next */
	      if ('number' !== typeof opts.limit) {
	        opts.limit = -1;
	      }

	      opts.keyAsBuffer = precodec.buffer;
	      opts.valueAsBuffer = codec.valueAsBuffer(opts);

	      function wrapIterator(iterator) {
	        return {
	          next: function (cb) {
	            return iterator.next(cb);
	          },
	          end: function (cb) {
	            iterator.end(cb);
	          }
	        };
	      }

	      return wrapIterator(db.db.iterator(opts));
	    }
	  };
	}

	function NotFoundError$2() {
	  Error.call(this);
	}

	inherits(NotFoundError$2, Error);

	NotFoundError$2.prototype.name = 'NotFoundError';

	var EventEmitter$1 = events__default.EventEmitter;
	var version$1 = "6.5.4";

	var NOT_FOUND_ERROR = new NotFoundError$2();

	var sublevel = function (nut, prefix, createStream, options) {
	  var emitter = new EventEmitter$1();
	  emitter.sublevels = {};
	  emitter.options = options;

	  emitter.version = version$1;

	  emitter.methods = {};
	  prefix = prefix || [];

	  function mergeOpts(opts) {
	    var o = {};
	    var k;
	    if (options) {
	      for (k in options) {
	        if (typeof options[k] !== 'undefined') {
	          o[k] = options[k];
	        }
	      }
	    }
	    if (opts) {
	      for (k in opts) {
	        if (typeof opts[k] !== 'undefined') {
	          o[k] = opts[k];
	        }
	      }
	    }
	    return o;
	  }

	  emitter.put = function (key, value, opts, cb) {
	    if ('function' === typeof opts) {
	      cb = opts;
	      opts = {};
	    }

	    nut.apply([{
	      key: key, value: value,
	      prefix: prefix.slice(), type: 'put'
	    }], mergeOpts(opts), function (err) {
	      /* istanbul ignore next */
	      if (err) {
	        return cb(err);
	      }
	      emitter.emit('put', key, value);
	      cb(null);
	    });
	  };

	  emitter.prefix = function () {
	    return prefix.slice();
	  };

	  emitter.batch = function (ops, opts, cb) {
	    if ('function' === typeof opts) {
	      cb = opts;
	      opts = {};
	    }

	    ops = ops.map(function (op) {
	      return {
	        key: op.key,
	        value: op.value,
	        prefix: op.prefix || prefix,
	        keyEncoding: op.keyEncoding,    // *
	        valueEncoding: op.valueEncoding,  // * (TODO: encodings on sublevel)
	        type: op.type
	      };
	    });

	    nut.apply(ops, mergeOpts(opts), function (err) {
	      /* istanbul ignore next */
	      if (err) {
	        return cb(err);
	      }
	      emitter.emit('batch', ops);
	      cb(null);
	    });
	  };

	  emitter.get = function (key, opts, cb) {
	    /* istanbul ignore else */
	    if ('function' === typeof opts) {
	      cb = opts;
	      opts = {};
	    }
	    nut.get(key, prefix, mergeOpts(opts), function (err, value) {
	      if (err) {
	        cb(NOT_FOUND_ERROR);
	      } else {
	        cb(null, value);
	      }
	    });
	  };

	  emitter.sublevel = function (name, opts) {
	    return emitter.sublevels[name] =
	      emitter.sublevels[name] || sublevel(nut, prefix.concat(name), createStream, mergeOpts(opts));
	  };

	  emitter.readStream = emitter.createReadStream = function (opts) {
	    opts = mergeOpts(opts);
	    opts.prefix = prefix;
	    var stream;
	    var it = nut.iterator(opts);

	    stream = createStream(opts, nut.createDecoder(opts));
	    stream.setIterator(it);

	    return stream;
	  };

	  emitter.close = function (cb) {
	    nut.close(cb);
	  };

	  emitter.isOpen = nut.isOpen;
	  emitter.isClosed = nut.isClosed;

	  return emitter;
	};

	/* Copyright (c) 2012-2014 LevelUP contributors
	 * See list at <https://github.com/rvagg/node-levelup#contributing>
	 * MIT License <https://github.com/rvagg/node-levelup/blob/master/LICENSE.md>
	 */

	// NOTE: we are fixed to readable-stream@1.0.x for now
	// for pure Streams2 across Node versions
	var Readable$4 = readable.Readable;

	function ReadStream$1(options, makeData) {
	  if (!(this instanceof ReadStream$1)) {
	    return new ReadStream$1(options, makeData);
	  }

	  Readable$4.call(this, { objectMode: true, highWaterMark: options.highWaterMark });

	  // purely to keep `db` around until we're done so it's not GCed if the user doesn't keep a ref

	  this._waiting = false;
	  this._options = options;
	  this._makeData = makeData;
	}

	inherits(ReadStream$1, Readable$4);

	ReadStream$1.prototype.setIterator = function (it) {
	  this._iterator = it;
	  /* istanbul ignore if */
	  if (this._destroyed) {
	    return it.end(function () {});
	  }
	  /* istanbul ignore if */
	  if (this._waiting) {
	    this._waiting = false;
	    return this._read();
	  }
	  return this;
	};

	ReadStream$1.prototype._read = function read() {
	  var self = this;
	  /* istanbul ignore if */
	  if (self._destroyed) {
	    return;
	  }
	  /* istanbul ignore if */
	  if (!self._iterator) {
	    return this._waiting = true;
	  }

	  self._iterator.next(function (err, key, value) {
	    if (err || (key === undefined && value === undefined)) {
	      if (!err && !self._destroyed) {
	        self.push(null);
	      }
	      return self._cleanup(err);
	    }


	    value = self._makeData(key, value);
	    if (!self._destroyed) {
	      self.push(value);
	    }
	  });
	};

	ReadStream$1.prototype._cleanup = function (err) {
	  if (this._destroyed) {
	    return;
	  }

	  this._destroyed = true;

	  var self = this;
	  /* istanbul ignore if */
	  if (err && err.message !== 'iterator has ended') {
	    self.emit('error', err);
	  }

	  /* istanbul ignore else */
	  if (self._iterator) {
	    self._iterator.end(function () {
	      self._iterator = null;
	      self.emit('close');
	    });
	  } else {
	    self.emit('close');
	  }
	};

	ReadStream$1.prototype.destroy = function () {
	  this._cleanup();
	};

	var precodec = {
	  encode: function (decodedKey) {
	    return '\xff' + decodedKey[0] + '\xff' + decodedKey[1];
	  },
	  decode: function (encodedKeyAsBuffer) {
	    var str = encodedKeyAsBuffer.toString();
	    var idx = str.indexOf('\xff', 1);
	    return [str.substring(1, idx), str.substring(idx + 1)];
	  },
	  lowerBound: '\x00',
	  upperBound: '\xff'
	};

	var codec = new levelCodec();

	function sublevelPouch(db) {
	  return sublevel(nut(db, precodec, codec), [], ReadStream$1, db.options);
	}

	function allDocsKeysQuery(api, opts) {
	  var keys = opts.keys;
	  var finalResults = {
	    offset: opts.skip
	  };
	  return PouchPromise.all(keys.map(function (key) {
	    var subOpts = $inject_Object_assign({key: key, deleted: 'ok'}, opts);
	    ['limit', 'skip', 'keys'].forEach(function (optKey) {
	      delete subOpts[optKey];
	    });
	    return new PouchPromise(function (resolve, reject) {
	      api._allDocs(subOpts, function (err, res$$1) {
	        /* istanbul ignore if */
	        if (err) {
	          return reject(err);
	        }
	        /* istanbul ignore if */
	        if (opts.update_seq && res$$1.update_seq !== undefined) {
	          finalResults.update_seq = res$$1.update_seq;
	        }
	        finalResults.total_rows = res$$1.total_rows;
	        resolve(res$$1.rows[0] || {key: key, error: 'not_found'});
	      });
	    });
	  })).then(function (results) {
	    finalResults.rows = results;
	    return finalResults;
	  });
	}

	function toObject(array) {
	  return array.reduce(function (obj$$1, item) {
	    obj$$1[item] = true;
	    return obj$$1;
	  }, {});
	}
	// List of top level reserved words for doc
	var reservedWords = toObject([
	  '_id',
	  '_rev',
	  '_attachments',
	  '_deleted',
	  '_revisions',
	  '_revs_info',
	  '_conflicts',
	  '_deleted_conflicts',
	  '_local_seq',
	  '_rev_tree',
	  //replication documents
	  '_replication_id',
	  '_replication_state',
	  '_replication_state_time',
	  '_replication_state_reason',
	  '_replication_stats',
	  // Specific to Couchbase Sync Gateway
	  '_removed'
	]);

	// List of reserved words that should end up the document
	var dataWords = toObject([
	  '_attachments',
	  //replication documents
	  '_replication_id',
	  '_replication_state',
	  '_replication_state_time',
	  '_replication_state_reason',
	  '_replication_stats'
	]);

	function parseRevisionInfo(rev$$1) {
	  if (!/^\d+-./.test(rev$$1)) {
	    return createError$2(INVALID_REV);
	  }
	  var idx = rev$$1.indexOf('-');
	  var left = rev$$1.substring(0, idx);
	  var right = rev$$1.substring(idx + 1);
	  return {
	    prefix: parseInt(left, 10),
	    id: right
	  };
	}

	function makeRevTreeFromRevisions(revisions, opts) {
	  var pos = revisions.start - revisions.ids.length + 1;

	  var revisionIds = revisions.ids;
	  var ids = [revisionIds[0], opts, []];

	  for (var i = 1, len = revisionIds.length; i < len; i++) {
	    ids = [revisionIds[i], {status: 'missing'}, [ids]];
	  }

	  return [{
	    pos: pos,
	    ids: ids
	  }];
	}

	// Preprocess documents, parse their revisions, assign an id and a
	// revision for new writes that are missing them, etc
	function parseDoc(doc, newEdits) {

	  var nRevNum;
	  var newRevId;
	  var revInfo;
	  var opts = {status: 'available'};
	  if (doc._deleted) {
	    opts.deleted = true;
	  }

	  if (newEdits) {
	    if (!doc._id) {
	      doc._id = uuid$1();
	    }
	    newRevId = rev();
	    if (doc._rev) {
	      revInfo = parseRevisionInfo(doc._rev);
	      if (revInfo.error) {
	        return revInfo;
	      }
	      doc._rev_tree = [{
	        pos: revInfo.prefix,
	        ids: [revInfo.id, {status: 'missing'}, [[newRevId, opts, []]]]
	      }];
	      nRevNum = revInfo.prefix + 1;
	    } else {
	      doc._rev_tree = [{
	        pos: 1,
	        ids : [newRevId, opts, []]
	      }];
	      nRevNum = 1;
	    }
	  } else {
	    if (doc._revisions) {
	      doc._rev_tree = makeRevTreeFromRevisions(doc._revisions, opts);
	      nRevNum = doc._revisions.start;
	      newRevId = doc._revisions.ids[0];
	    }
	    if (!doc._rev_tree) {
	      revInfo = parseRevisionInfo(doc._rev);
	      if (revInfo.error) {
	        return revInfo;
	      }
	      nRevNum = revInfo.prefix;
	      newRevId = revInfo.id;
	      doc._rev_tree = [{
	        pos: nRevNum,
	        ids: [newRevId, opts, []]
	      }];
	    }
	  }

	  invalidIdError(doc._id);

	  doc._rev = nRevNum + '-' + newRevId;

	  var result = {metadata : {}, data : {}};
	  for (var key in doc) {
	    /* istanbul ignore else */
	    if (Object.prototype.hasOwnProperty.call(doc, key)) {
	      var specialKey = key[0] === '_';
	      if (specialKey && !reservedWords[key]) {
	        var error = createError$2(DOC_VALIDATION, key);
	        error.message = DOC_VALIDATION.message + ': ' + key;
	        throw error;
	      } else if (specialKey && !dataWords[key]) {
	        result.metadata[key.slice(1)] = doc[key];
	      } else {
	        result.data[key] = doc[key];
	      }
	    }
	  }
	  return result;
	}

	function thisAtob(str) {
	  var base64 = new Buffer(str, 'base64');
	  // Node.js will just skip the characters it can't decode instead of
	  // throwing an exception
	  if (base64.toString('base64') !== str) {
	    throw new Error("attachment is not a valid base64 string");
	  }
	  return base64.toString('binary');
	}

	function thisBtoa(str) {
	  return bufferFrom_1(str, 'binary').toString('base64');
	}

	function typedBuffer(binString, buffType, type) {
	  // buffType is either 'binary' or 'base64'
	  var buff = bufferFrom_1(binString, buffType);
	  buff.type = type; // non-standard, but used for consistency with the browser
	  return buff;
	}

	function b64ToBluffer(b64, type) {
	  return typedBuffer(b64, 'base64', type);
	}

	// From http://stackoverflow.com/questions/14967647/ (continues on next line)
	// encode-decode-image-with-base64-breaks-image (2013-04-21)

	function binStringToBluffer(binString, type) {
	  return typedBuffer(binString, 'binary', type);
	}

	// This function is unused in Node
	/* istanbul ignore next */

	function blobToBase64(blobOrBuffer, callback) {
	  callback(blobOrBuffer.toString('base64'));
	}

	// not used in Node, but here for completeness

	// simplified API. universal browser support is assumed

	//Can't find original post, but this is close
	//http://stackoverflow.com/questions/6965107/ (continues on next line)
	//converting-between-strings-and-arraybuffers

	function binaryMd5(data, callback) {
	  var base64 = crypto.createHash('md5').update(data, 'binary').digest('base64');
	  callback(base64);
	}

	function stringMd5(string) {
	  return crypto.createHash('md5').update(string, 'binary').digest('hex');
	}

	function updateDoc(revLimit, prev, docInfo, results,
	                   i, cb, writeDoc, newEdits) {

	  if (revExists(prev.rev_tree, docInfo.metadata.rev)) {
	    results[i] = docInfo;
	    return cb();
	  }

	  // sometimes this is pre-calculated. historically not always
	  var previousWinningRev = prev.winningRev || winningRev(prev);
	  var previouslyDeleted = 'deleted' in prev ? prev.deleted :
	    isDeleted(prev, previousWinningRev);
	  var deleted = 'deleted' in docInfo.metadata ? docInfo.metadata.deleted :
	    isDeleted(docInfo.metadata);
	  var isRoot = /^1-/.test(docInfo.metadata.rev);

	  if (previouslyDeleted && !deleted && newEdits && isRoot) {
	    var newDoc = docInfo.data;
	    newDoc._rev = previousWinningRev;
	    newDoc._id = docInfo.metadata.id;
	    docInfo = parseDoc(newDoc, newEdits);
	  }

	  var merged = merge(prev.rev_tree, docInfo.metadata.rev_tree[0], revLimit);

	  var inConflict = newEdits && ((
	    (previouslyDeleted && deleted && merged.conflicts !== 'new_leaf') ||
	    (!previouslyDeleted && merged.conflicts !== 'new_leaf') ||
	    (previouslyDeleted && !deleted && merged.conflicts === 'new_branch')));

	  if (inConflict) {
	    var err = createError$2(REV_CONFLICT);
	    results[i] = err;
	    return cb();
	  }

	  var newRev = docInfo.metadata.rev;
	  docInfo.metadata.rev_tree = merged.tree;
	  docInfo.stemmedRevs = merged.stemmedRevs || [];
	  /* istanbul ignore else */
	  if (prev.rev_map) {
	    docInfo.metadata.rev_map = prev.rev_map; // used only by leveldb
	  }

	  // recalculate
	  var winningRev$$1 = winningRev(docInfo.metadata);
	  var winningRevIsDeleted = isDeleted(docInfo.metadata, winningRev$$1);

	  // calculate the total number of documents that were added/removed,
	  // from the perspective of total_rows/doc_count
	  var delta = (previouslyDeleted === winningRevIsDeleted) ? 0 :
	    previouslyDeleted < winningRevIsDeleted ? -1 : 1;

	  var newRevIsDeleted;
	  if (newRev === winningRev$$1) {
	    // if the new rev is the same as the winning rev, we can reuse that value
	    newRevIsDeleted = winningRevIsDeleted;
	  } else {
	    // if they're not the same, then we need to recalculate
	    newRevIsDeleted = isDeleted(docInfo.metadata, newRev);
	  }

	  writeDoc(docInfo, winningRev$$1, winningRevIsDeleted, newRevIsDeleted,
	    true, delta, i, cb);
	}

	function rootIsMissing(docInfo) {
	  return docInfo.metadata.rev_tree[0].ids[1].status === 'missing';
	}

	function processDocs(revLimit, docInfos, api, fetchedDocs, tx, results,
	                     writeDoc, opts, overallCallback) {

	  // Default to 1000 locally
	  revLimit = revLimit || 1000;

	  function insertDoc(docInfo, resultsIdx, callback) {
	    // Cant insert new deleted documents
	    var winningRev$$1 = winningRev(docInfo.metadata);
	    var deleted = isDeleted(docInfo.metadata, winningRev$$1);
	    if ('was_delete' in opts && deleted) {
	      results[resultsIdx] = createError$2(MISSING_DOC, 'deleted');
	      return callback();
	    }

	    // 4712 - detect whether a new document was inserted with a _rev
	    var inConflict = newEdits && rootIsMissing(docInfo);

	    if (inConflict) {
	      var err = createError$2(REV_CONFLICT);
	      results[resultsIdx] = err;
	      return callback();
	    }

	    var delta = deleted ? 0 : 1;

	    writeDoc(docInfo, winningRev$$1, deleted, deleted, false,
	      delta, resultsIdx, callback);
	  }

	  var newEdits = opts.new_edits;
	  var idsToDocs = new ExportedMap();

	  var docsDone = 0;
	  var docsToDo = docInfos.length;

	  function checkAllDocsDone() {
	    if (++docsDone === docsToDo && overallCallback) {
	      overallCallback();
	    }
	  }

	  docInfos.forEach(function (currentDoc, resultsIdx) {

	    if (currentDoc._id && isLocalId(currentDoc._id)) {
	      var fun = currentDoc._deleted ? '_removeLocal' : '_putLocal';
	      api[fun](currentDoc, {ctx: tx}, function (err, res) {
	        results[resultsIdx] = err || res;
	        checkAllDocsDone();
	      });
	      return;
	    }

	    var id = currentDoc.metadata.id;
	    if (idsToDocs.has(id)) {
	      docsToDo--; // duplicate
	      idsToDocs.get(id).push([currentDoc, resultsIdx]);
	    } else {
	      idsToDocs.set(id, [[currentDoc, resultsIdx]]);
	    }
	  });

	  // in the case of new_edits, the user can provide multiple docs
	  // with the same id. these need to be processed sequentially
	  idsToDocs.forEach(function (docs, id) {
	    var numDone = 0;

	    function docWritten() {
	      if (++numDone < docs.length) {
	        nextDoc();
	      } else {
	        checkAllDocsDone();
	      }
	    }
	    function nextDoc() {
	      var value = docs[numDone];
	      var currentDoc = value[0];
	      var resultsIdx = value[1];

	      if (fetchedDocs.has(id)) {
	        updateDoc(revLimit, fetchedDocs.get(id), currentDoc, results,
	          resultsIdx, docWritten, writeDoc, newEdits);
	      } else {
	        // Ensure stemming applies to new writes as well
	        var merged = merge([], currentDoc.metadata.rev_tree[0], revLimit);
	        currentDoc.metadata.rev_tree = merged.tree;
	        currentDoc.stemmedRevs = merged.stemmedRevs || [];
	        insertDoc(currentDoc, resultsIdx, docWritten);
	      }
	    }
	    nextDoc();
	  });
	}

	function safeJsonParse(str) {
	  // This try/catch guards against stack overflow errors.
	  // JSON.parse() is faster than vuvuzela.parse() but vuvuzela
	  // cannot overflow.
	  try {
	    return JSON.parse(str);
	  } catch (e) {
	    /* istanbul ignore next */
	    return vuvuzela.parse(str);
	  }
	}

	function safeJsonStringify(json) {
	  try {
	    return JSON.stringify(json);
	  } catch (e) {
	    /* istanbul ignore next */
	    return vuvuzela.stringify(json);
	  }
	}

	function readAsBlobOrBuffer(storedObject, type) {
	  // In Node, we've stored a buffer
	  storedObject.type = type; // non-standard, but used for consistency
	  return storedObject;
	}

	// in Node, we store the buffer directly
	function prepareAttachmentForStorage(attData, cb) {
	  cb(attData);
	}

	function createEmptyBlobOrBuffer(type) {
	  return typedBuffer('', 'binary', type);
	}

	// similar to an idb or websql transaction object
	// designed to be passed around. basically just caches
	// things in-memory and then does a big batch() operation
	// when you're done

	function getCacheFor(transaction, store) {
	  var prefix = store.prefix()[0];
	  var cache = transaction._cache;
	  var subCache = cache.get(prefix);
	  if (!subCache) {
	    subCache = new ExportedMap();
	    cache.set(prefix, subCache);
	  }
	  return subCache;
	}

	function LevelTransaction() {
	  this._batch = [];
	  this._cache = new ExportedMap();
	}

	LevelTransaction.prototype.get = function (store, key, callback) {
	  var cache = getCacheFor(this, store);
	  var exists = cache.get(key);
	  if (exists) {
	    return nextTick$1(function () {
	      callback(null, exists);
	    });
	  } else if (exists === null) { // deleted marker
	    /* istanbul ignore next */
	    return nextTick$1(function () {
	      callback({name: 'NotFoundError'});
	    });
	  }
	  store.get(key, function (err, res$$1) {
	    if (err) {
	      /* istanbul ignore else */
	      if (err.name === 'NotFoundError') {
	        cache.set(key, null);
	      }
	      return callback(err);
	    }
	    cache.set(key, res$$1);
	    callback(null, res$$1);
	  });
	};

	LevelTransaction.prototype.batch = function (batch) {
	  for (var i = 0, len = batch.length; i < len; i++) {
	    var operation = batch[i];

	    var cache = getCacheFor(this, operation.prefix);

	    if (operation.type === 'put') {
	      cache.set(operation.key, operation.value);
	    } else {
	      cache.set(operation.key, null);
	    }
	  }
	  this._batch = this._batch.concat(batch);
	};

	LevelTransaction.prototype.execute = function (db, callback) {

	  var keys = new ExportedSet();
	  var uniqBatches = [];

	  // remove duplicates; last one wins
	  for (var i = this._batch.length - 1; i >= 0; i--) {
	    var operation = this._batch[i];
	    var lookupKey = operation.prefix.prefix()[0] + '\xff' + operation.key;
	    if (keys.has(lookupKey)) {
	      continue;
	    }
	    keys.add(lookupKey);
	    uniqBatches.push(operation);
	  }

	  db.batch(uniqBatches, callback);
	};

	var DOC_STORE = 'document-store';
	var BY_SEQ_STORE = 'by-sequence';
	var ATTACHMENT_STORE = 'attach-store';
	var BINARY_STORE = 'attach-binary-store';
	var LOCAL_STORE = 'local-store';
	var META_STORE = 'meta-store';

	// leveldb barks if we try to open a db multiple times
	// so we cache opened connections here for initstore()
	var dbStores = new ExportedMap();

	// store the value of update_seq in the by-sequence store the key name will
	// never conflict, since the keys in the by-sequence store are integers
	var UPDATE_SEQ_KEY = '_local_last_update_seq';
	var DOC_COUNT_KEY = '_local_doc_count';
	var UUID_KEY = '_local_uuid';

	var MD5_PREFIX = 'md5-';

	var safeJsonEncoding = {
	  encode: safeJsonStringify,
	  decode: safeJsonParse,
	  buffer: false,
	  type: 'cheap-json'
	};

	var levelChanges = new Changes();

	// winningRev and deleted are performance-killers, but
	// in newer versions of PouchDB, they are cached on the metadata
	function getWinningRev(metadata) {
	  return 'winningRev' in metadata ?
	    metadata.winningRev : winningRev(metadata);
	}

	function getIsDeleted(metadata, winningRev$$1) {
	  return 'deleted' in metadata ?
	    metadata.deleted : isDeleted(metadata, winningRev$$1);
	}

	function fetchAttachment(att, stores, opts) {
	  var type = att.content_type;
	  return new PouchPromise(function (resolve, reject) {
	    stores.binaryStore.get(att.digest, function (err, buffer$$1) {
	      var data;
	      if (err) {
	        /* istanbul ignore if */
	        if (err.name !== 'NotFoundError') {
	          return reject(err);
	        } else {
	          // empty
	          if (!opts.binary) {
	            data = '';
	          } else {
	            data = binStringToBluffer('', type);
	          }
	        }
	      } else { // non-empty
	        if (opts.binary) {
	          data = readAsBlobOrBuffer(buffer$$1, type);
	        } else {
	          data = buffer$$1.toString('base64');
	        }
	      }
	      delete att.stub;
	      delete att.length;
	      att.data = data;
	      resolve();
	    });
	  });
	}

	function fetchAttachments(results, stores, opts) {
	  var atts = [];
	  results.forEach(function (row) {
	    if (!(row.doc && row.doc._attachments)) {
	      return;
	    }
	    var attNames = Object.keys(row.doc._attachments);
	    attNames.forEach(function (attName) {
	      var att = row.doc._attachments[attName];
	      if (!('data' in att)) {
	        atts.push(att);
	      }
	    });
	  });

	  return PouchPromise.all(atts.map(function (att) {
	    return fetchAttachment(att, stores, opts);
	  }));
	}

	function LevelPouch(opts, callback) {
	  opts = clone(opts);
	  var api = this;
	  var instanceId;
	  var stores = {};
	  var revLimit = opts.revs_limit;
	  var db;
	  var name = opts.name;
	  // TODO: this is undocumented and unused probably
	  /* istanbul ignore else */
	  if (typeof opts.createIfMissing === 'undefined') {
	    opts.createIfMissing = true;
	  }

	  var leveldown = opts.db;

	  var dbStore;
	  var leveldownName = functionName(leveldown);
	  if (dbStores.has(leveldownName)) {
	    dbStore = dbStores.get(leveldownName);
	  } else {
	    dbStore = new ExportedMap();
	    dbStores.set(leveldownName, dbStore);
	  }
	  if (dbStore.has(name)) {
	    db = dbStore.get(name);
	    afterDBCreated();
	  } else {
	    dbStore.set(name, sublevelPouch(levelup(leveldown(name), opts, function (err) {
	      /* istanbul ignore if */
	      if (err) {
	        dbStore.delete(name);
	        return callback(err);
	      }
	      db = dbStore.get(name);
	      db._docCount  = -1;
	      db._queue = new deque();
	      /* istanbul ignore else */
	      if (typeof opts.migrate === 'object') { // migration for leveldown
	        opts.migrate.doMigrationOne(name, db, afterDBCreated);
	      } else {
	        afterDBCreated();
	      }
	    })));
	  }

	  function afterDBCreated() {
	    stores.docStore = db.sublevel(DOC_STORE, {valueEncoding: safeJsonEncoding});
	    stores.bySeqStore = db.sublevel(BY_SEQ_STORE, {valueEncoding: 'json'});
	    stores.attachmentStore =
	      db.sublevel(ATTACHMENT_STORE, {valueEncoding: 'json'});
	    stores.binaryStore = db.sublevel(BINARY_STORE, {valueEncoding: 'binary'});
	    stores.localStore = db.sublevel(LOCAL_STORE, {valueEncoding: 'json'});
	    stores.metaStore = db.sublevel(META_STORE, {valueEncoding: 'json'});
	    /* istanbul ignore else */
	    if (typeof opts.migrate === 'object') { // migration for leveldown
	      opts.migrate.doMigrationTwo(db, stores, afterLastMigration);
	    } else {
	      afterLastMigration();
	    }
	  }

	  function afterLastMigration() {
	    stores.metaStore.get(UPDATE_SEQ_KEY, function (err, value) {
	      if (typeof db._updateSeq === 'undefined') {
	        db._updateSeq = value || 0;
	      }
	      stores.metaStore.get(DOC_COUNT_KEY, function (err, value) {
	        db._docCount = !err ? value : 0;
	        stores.metaStore.get(UUID_KEY, function (err, value) {
	          instanceId = !err ? value : uuid$1();
	          stores.metaStore.put(UUID_KEY, instanceId, function () {
	            nextTick$1(function () {
	              callback(null, api);
	            });
	          });
	        });
	      });
	    });
	  }

	  function countDocs(callback) {
	    /* istanbul ignore if */
	    if (db.isClosed()) {
	      return callback(new Error('database is closed'));
	    }
	    return callback(null, db._docCount); // use cached value
	  }

	  api._remote = false;
	  /* istanbul ignore next */
	  api.type = function () {
	    return 'leveldb';
	  };

	  api._id = function (callback) {
	    callback(null, instanceId);
	  };

	  api._info = function (callback) {
	    var res$$1 = {
	      doc_count: db._docCount,
	      update_seq: db._updateSeq,
	      backend_adapter: functionName(leveldown)
	    };
	    return nextTick$1(function () {
	      callback(null, res$$1);
	    });
	  };

	  function tryCode(fun, args) {
	    try {
	      fun.apply(null, args);
	    } catch (err) {
	      args[args.length - 1](err);
	    }
	  }

	  function executeNext() {
	    var firstTask = db._queue.peekFront();

	    if (firstTask.type === 'read') {
	      runReadOperation(firstTask);
	    } else { // write, only do one at a time
	      runWriteOperation(firstTask);
	    }
	  }

	  function runReadOperation(firstTask) {
	    // do multiple reads at once simultaneously, because it's safe

	    var readTasks = [firstTask];
	    var i = 1;
	    var nextTask = db._queue.get(i);
	    while (typeof nextTask !== 'undefined' && nextTask.type === 'read') {
	      readTasks.push(nextTask);
	      i++;
	      nextTask = db._queue.get(i);
	    }

	    var numDone = 0;

	    readTasks.forEach(function (readTask) {
	      var args = readTask.args;
	      var callback = args[args.length - 1];
	      args[args.length - 1] = argsarray(function (cbArgs) {
	        callback.apply(null, cbArgs);
	        if (++numDone === readTasks.length) {
	          nextTick$1(function () {
	            // all read tasks have finished
	            readTasks.forEach(function () {
	              db._queue.shift();
	            });
	            if (db._queue.length) {
	              executeNext();
	            }
	          });
	        }
	      });
	      tryCode(readTask.fun, args);
	    });
	  }

	  function runWriteOperation(firstTask) {
	    var args = firstTask.args;
	    var callback = args[args.length - 1];
	    args[args.length - 1] = argsarray(function (cbArgs) {
	      callback.apply(null, cbArgs);
	      nextTick$1(function () {
	        db._queue.shift();
	        if (db._queue.length) {
	          executeNext();
	        }
	      });
	    });
	    tryCode(firstTask.fun, args);
	  }

	  // all read/write operations to the database are done in a queue,
	  // similar to how websql/idb works. this avoids problems such
	  // as e.g. compaction needing to have a lock on the database while
	  // it updates stuff. in the future we can revisit this.
	  function writeLock(fun) {
	    return argsarray(function (args) {
	      db._queue.push({
	        fun: fun,
	        args: args,
	        type: 'write'
	      });

	      if (db._queue.length === 1) {
	        nextTick$1(executeNext);
	      }
	    });
	  }

	  // same as the writelock, but multiple can run at once
	  function readLock(fun) {
	    return argsarray(function (args) {
	      db._queue.push({
	        fun: fun,
	        args: args,
	        type: 'read'
	      });

	      if (db._queue.length === 1) {
	        nextTick$1(executeNext);
	      }
	    });
	  }

	  function formatSeq(n) {
	    return ('0000000000000000' + n).slice(-16);
	  }

	  function parseSeq(s) {
	    return parseInt(s, 10);
	  }

	  api._get = readLock(function (id, opts, callback) {
	    opts = clone(opts);

	    stores.docStore.get(id, function (err, metadata) {

	      if (err || !metadata) {
	        return callback(createError$2(MISSING_DOC, 'missing'));
	      }

	      var rev$$1;
	      if (!opts.rev) {
	        rev$$1 = getWinningRev(metadata);
	        var deleted = getIsDeleted(metadata, rev$$1);
	        if (deleted) {
	          return callback(createError$2(MISSING_DOC, "deleted"));
	        }
	      } else {
	        rev$$1 = opts.latest ? latest(opts.rev, metadata) : opts.rev;
	      }

	      var seq = metadata.rev_map[rev$$1];

	      stores.bySeqStore.get(formatSeq(seq), function (err, doc) {
	        if (!doc) {
	          return callback(createError$2(MISSING_DOC));
	        }
	        /* istanbul ignore if */
	        if ('_id' in doc && doc._id !== metadata.id) {
	          // this failing implies something very wrong
	          return callback(new Error('wrong doc returned'));
	        }
	        doc._id = metadata.id;
	        if ('_rev' in doc) {
	          /* istanbul ignore if */
	          if (doc._rev !== rev$$1) {
	            // this failing implies something very wrong
	            return callback(new Error('wrong doc returned'));
	          }
	        } else {
	          // we didn't always store this
	          doc._rev = rev$$1;
	        }
	        return callback(null, {doc: doc, metadata: metadata});
	      });
	    });
	  });

	  // not technically part of the spec, but if putAttachment has its own
	  // method...
	  api._getAttachment = function (docId, attachId, attachment, opts, callback) {
	    var digest = attachment.digest;
	    var type = attachment.content_type;

	    stores.binaryStore.get(digest, function (err, attach) {
	      if (err) {
	        /* istanbul ignore if */
	        if (err.name !== 'NotFoundError') {
	          return callback(err);
	        }
	        // Empty attachment
	        return callback(null, opts.binary ? createEmptyBlobOrBuffer(type) : '');
	      }

	      if (opts.binary) {
	        callback(null, readAsBlobOrBuffer(attach, type));
	      } else {
	        callback(null, attach.toString('base64'));
	      }
	    });
	  };

	  api._bulkDocs = writeLock(function (req, opts, callback) {
	    var newEdits = opts.new_edits;
	    var results = new Array(req.docs.length);
	    var fetchedDocs = new ExportedMap();
	    var stemmedRevs = new ExportedMap();

	    var txn = new LevelTransaction();
	    var docCountDelta = 0;
	    var newUpdateSeq = db._updateSeq;

	    // parse the docs and give each a sequence number
	    var userDocs = req.docs;
	    var docInfos = userDocs.map(function (doc) {
	      if (doc._id && isLocalId(doc._id)) {
	        return doc;
	      }
	      var newDoc = parseDoc(doc, newEdits);

	      if (newDoc.metadata && !newDoc.metadata.rev_map) {
	        newDoc.metadata.rev_map = {};
	      }

	      return newDoc;
	    });
	    var infoErrors = docInfos.filter(function (doc) {
	      return doc.error;
	    });

	    if (infoErrors.length) {
	      return callback(infoErrors[0]);
	    }

	    // verify any stub attachments as a precondition test

	    function verifyAttachment(digest, callback) {
	      txn.get(stores.attachmentStore, digest, function (levelErr) {
	        if (levelErr) {
	          var err = createError$2(MISSING_STUB,
	                                'unknown stub attachment with digest ' +
	                                digest);
	          callback(err);
	        } else {
	          callback();
	        }
	      });
	    }

	    function verifyAttachments(finish) {
	      var digests = [];
	      userDocs.forEach(function (doc) {
	        if (doc && doc._attachments) {
	          Object.keys(doc._attachments).forEach(function (filename) {
	            var att = doc._attachments[filename];
	            if (att.stub) {
	              digests.push(att.digest);
	            }
	          });
	        }
	      });
	      if (!digests.length) {
	        return finish();
	      }
	      var numDone = 0;
	      var err;

	      digests.forEach(function (digest) {
	        verifyAttachment(digest, function (attErr) {
	          if (attErr && !err) {
	            err = attErr;
	          }

	          if (++numDone === digests.length) {
	            finish(err);
	          }
	        });
	      });
	    }

	    function fetchExistingDocs(finish) {
	      var numDone = 0;
	      var overallErr;
	      function checkDone() {
	        if (++numDone === userDocs.length) {
	          return finish(overallErr);
	        }
	      }

	      userDocs.forEach(function (doc) {
	        if (doc._id && isLocalId(doc._id)) {
	          // skip local docs
	          return checkDone();
	        }
	        txn.get(stores.docStore, doc._id, function (err, info) {
	          if (err) {
	            /* istanbul ignore if */
	            if (err.name !== 'NotFoundError') {
	              overallErr = err;
	            }
	          } else {
	            fetchedDocs.set(doc._id, info);
	          }
	          checkDone();
	        });
	      });
	    }

	    function compact(revsMap, callback) {
	      var promise = PouchPromise.resolve();
	      revsMap.forEach(function (revs, docId) {
	        // TODO: parallelize, for now need to be sequential to
	        // pass orphaned attachment tests
	        promise = promise.then(function () {
	          return new PouchPromise(function (resolve, reject) {
	            api._doCompactionNoLock(docId, revs, {ctx: txn}, function (err) {
	              /* istanbul ignore if */
	              if (err) {
	                return reject(err);
	              }
	              resolve();
	            });
	          });
	        });
	      });

	      promise.then(function () {
	        callback();
	      }, callback);
	    }

	    function autoCompact(callback) {
	      var revsMap = new ExportedMap();
	      fetchedDocs.forEach(function (metadata, docId) {
	        revsMap.set(docId, compactTree(metadata));
	      });
	      compact(revsMap, callback);
	    }

	    function finish() {
	      compact(stemmedRevs, function (error) {
	        /* istanbul ignore if */
	        if (error) {
	          complete(error);
	        }
	        if (api.auto_compaction) {
	          return autoCompact(complete);
	        }
	        complete();
	      });
	    }

	    function writeDoc(docInfo, winningRev$$1, winningRevIsDeleted, newRevIsDeleted,
	                      isUpdate, delta, resultsIdx, callback2) {
	      docCountDelta += delta;

	      var err = null;
	      var recv = 0;

	      docInfo.metadata.winningRev = winningRev$$1;
	      docInfo.metadata.deleted = winningRevIsDeleted;

	      docInfo.data._id = docInfo.metadata.id;
	      docInfo.data._rev = docInfo.metadata.rev;

	      if (newRevIsDeleted) {
	        docInfo.data._deleted = true;
	      }

	      if (docInfo.stemmedRevs.length) {
	        stemmedRevs.set(docInfo.metadata.id, docInfo.stemmedRevs);
	      }

	      var attachments = docInfo.data._attachments ?
	        Object.keys(docInfo.data._attachments) :
	        [];

	      function attachmentSaved(attachmentErr) {
	        recv++;
	        if (!err) {
	          /* istanbul ignore if */
	          if (attachmentErr) {
	            err = attachmentErr;
	            callback2(err);
	          } else if (recv === attachments.length) {
	            finish();
	          }
	        }
	      }

	      function onMD5Load(doc, key, data, attachmentSaved) {
	        return function (result) {
	          saveAttachment(doc, MD5_PREFIX + result, key, data, attachmentSaved);
	        };
	      }

	      function doMD5(doc, key, attachmentSaved) {
	        return function (data) {
	          binaryMd5(data, onMD5Load(doc, key, data, attachmentSaved));
	        };
	      }

	      for (var i = 0; i < attachments.length; i++) {
	        var key = attachments[i];
	        var att = docInfo.data._attachments[key];

	        if (att.stub) {
	          // still need to update the refs mapping
	          var id = docInfo.data._id;
	          var rev$$1 = docInfo.data._rev;
	          saveAttachmentRefs(id, rev$$1, att.digest, attachmentSaved);
	          continue;
	        }
	        var data;
	        if (typeof att.data === 'string') {
	          // input is assumed to be a base64 string
	          try {
	            data = thisAtob(att.data);
	          } catch (e) {
	            callback(createError$2(BAD_ARG,
	                     'Attachment is not a valid base64 string'));
	            return;
	          }
	          doMD5(docInfo, key, attachmentSaved)(data);
	        } else {
	          prepareAttachmentForStorage(att.data,
	            doMD5(docInfo, key, attachmentSaved));
	        }
	      }

	      function finish() {
	        var seq = docInfo.metadata.rev_map[docInfo.metadata.rev];
	        /* istanbul ignore if */
	        if (seq) {
	          // check that there aren't any existing revisions with the same
	          // revision id, else we shouldn't do anything
	          return callback2();
	        }
	        seq = ++newUpdateSeq;
	        docInfo.metadata.rev_map[docInfo.metadata.rev] =
	          docInfo.metadata.seq = seq;
	        var seqKey = formatSeq(seq);
	        var batch = [{
	          key: seqKey,
	          value: docInfo.data,
	          prefix: stores.bySeqStore,
	          type: 'put'
	        }, {
	          key: docInfo.metadata.id,
	          value: docInfo.metadata,
	          prefix: stores.docStore,
	          type: 'put'
	        }];
	        txn.batch(batch);
	        results[resultsIdx] = {
	          ok: true,
	          id: docInfo.metadata.id,
	          rev: docInfo.metadata.rev
	        };
	        fetchedDocs.set(docInfo.metadata.id, docInfo.metadata);
	        callback2();
	      }

	      if (!attachments.length) {
	        finish();
	      }
	    }

	    // attachments are queued per-digest, otherwise the refs could be
	    // overwritten by concurrent writes in the same bulkDocs session
	    var attachmentQueues = {};

	    function saveAttachmentRefs(id, rev$$1, digest, callback) {

	      function fetchAtt() {
	        return new PouchPromise(function (resolve, reject) {
	          txn.get(stores.attachmentStore, digest, function (err, oldAtt) {
	            /* istanbul ignore if */
	            if (err && err.name !== 'NotFoundError') {
	              return reject(err);
	            }
	            resolve(oldAtt);
	          });
	        });
	      }

	      function saveAtt(oldAtt) {
	        var ref = [id, rev$$1].join('@');
	        var newAtt = {};

	        if (oldAtt) {
	          if (oldAtt.refs) {
	            // only update references if this attachment already has them
	            // since we cannot migrate old style attachments here without
	            // doing a full db scan for references
	            newAtt.refs = oldAtt.refs;
	            newAtt.refs[ref] = true;
	          }
	        } else {
	          newAtt.refs = {};
	          newAtt.refs[ref] = true;
	        }

	        return new PouchPromise(function (resolve) {
	          txn.batch([{
	            type: 'put',
	            prefix: stores.attachmentStore,
	            key: digest,
	            value: newAtt
	          }]);
	          resolve(!oldAtt);
	        });
	      }

	      // put attachments in a per-digest queue, to avoid two docs with the same
	      // attachment overwriting each other
	      var queue = attachmentQueues[digest] || PouchPromise.resolve();
	      attachmentQueues[digest] = queue.then(function () {
	        return fetchAtt().then(saveAtt).then(function (isNewAttachment) {
	          callback(null, isNewAttachment);
	        }, callback);
	      });
	    }

	    function saveAttachment(docInfo, digest, key, data, callback) {
	      var att = docInfo.data._attachments[key];
	      delete att.data;
	      att.digest = digest;
	      att.length = data.length;
	      var id = docInfo.metadata.id;
	      var rev$$1 = docInfo.metadata.rev;
	      att.revpos = parseInt(rev$$1, 10);

	      saveAttachmentRefs(id, rev$$1, digest, function (err, isNewAttachment) {
	        /* istanbul ignore if */
	        if (err) {
	          return callback(err);
	        }
	        // do not try to store empty attachments
	        if (data.length === 0) {
	          return callback(err);
	        }
	        if (!isNewAttachment) {
	          // small optimization - don't bother writing it again
	          return callback(err);
	        }
	        txn.batch([{
	          type: 'put',
	          prefix: stores.binaryStore,
	          key: digest,
	          value: bufferFrom_1(data, 'binary')
	        }]);
	        callback();
	      });
	    }

	    function complete(err) {
	      /* istanbul ignore if */
	      if (err) {
	        return nextTick$1(function () {
	          callback(err);
	        });
	      }
	      txn.batch([
	        {
	          prefix: stores.metaStore,
	          type: 'put',
	          key: UPDATE_SEQ_KEY,
	          value: newUpdateSeq
	        },
	        {
	          prefix: stores.metaStore,
	          type: 'put',
	          key: DOC_COUNT_KEY,
	          value: db._docCount + docCountDelta
	        }
	      ]);
	      txn.execute(db, function (err) {
	        /* istanbul ignore if */
	        if (err) {
	          return callback(err);
	        }
	        db._docCount += docCountDelta;
	        db._updateSeq = newUpdateSeq;
	        levelChanges.notify(name);
	        nextTick$1(function () {
	          callback(null, results);
	        });
	      });
	    }

	    if (!docInfos.length) {
	      return callback(null, []);
	    }

	    verifyAttachments(function (err) {
	      if (err) {
	        return callback(err);
	      }
	      fetchExistingDocs(function (err) {
	        /* istanbul ignore if */
	        if (err) {
	          return callback(err);
	        }
	        processDocs(revLimit, docInfos, api, fetchedDocs, txn, results,
	                    writeDoc, opts, finish);
	      });
	    });
	  });
	  api._allDocs = function (opts, callback) {
	    if ('keys' in opts) {
	      return allDocsKeysQuery(this, opts);
	    }
	    return readLock(function (opts, callback) {
	      opts = clone(opts);
	      countDocs(function (err, docCount) {
	        /* istanbul ignore if */
	        if (err) {
	          return callback(err);
	        }
	        var readstreamOpts = {};
	        var skip = opts.skip || 0;
	        if (opts.startkey) {
	          readstreamOpts.gte = opts.startkey;
	        }
	        if (opts.endkey) {
	          readstreamOpts.lte = opts.endkey;
	        }
	        if (opts.key) {
	          readstreamOpts.gte = readstreamOpts.lte = opts.key;
	        }
	        if (opts.descending) {
	          readstreamOpts.reverse = true;
	          // switch start and ends
	          var tmp = readstreamOpts.lte;
	          readstreamOpts.lte = readstreamOpts.gte;
	          readstreamOpts.gte = tmp;
	        }
	        var limit;
	        if (typeof opts.limit === 'number') {
	          limit = opts.limit;
	        }
	        if (limit === 0 ||
	            ('gte' in readstreamOpts && 'lte' in readstreamOpts &&
	            readstreamOpts.gte > readstreamOpts.lte)) {
	          // should return 0 results when start is greater than end.
	          // normally level would "fix" this for us by reversing the order,
	          // so short-circuit instead
	          var returnVal = {
	            total_rows: docCount,
	            offset: opts.skip,
	            rows: []
	          };
	          /* istanbul ignore if */
	          if (opts.update_seq) {
	            returnVal.update_seq = db._updateSeq;
	          }
	          return callback(null, returnVal);
	        }
	        var results = [];
	        var docstream = stores.docStore.readStream(readstreamOpts);

	        var throughStream = obj(function (entry, _, next) {
	          var metadata = entry.value;
	          // winningRev and deleted are performance-killers, but
	          // in newer versions of PouchDB, they are cached on the metadata
	          var winningRev$$1 = getWinningRev(metadata);
	          var deleted = getIsDeleted(metadata, winningRev$$1);
	          if (!deleted) {
	            if (skip-- > 0) {
	              next();
	              return;
	            } else if (typeof limit === 'number' && limit-- <= 0) {
	              docstream.unpipe();
	              docstream.destroy();
	              next();
	              return;
	            }
	          } else if (opts.deleted !== 'ok') {
	            next();
	            return;
	          }
	          function allDocsInner(data) {
	            var doc = {
	              id: metadata.id,
	              key: metadata.id,
	              value: {
	                rev: winningRev$$1
	              }
	            };
	            if (opts.include_docs) {
	              doc.doc = data;
	              doc.doc._rev = doc.value.rev;
	              if (opts.conflicts) {
	                var conflicts = collectConflicts(metadata);
	                if (conflicts.length) {
	                  doc.doc._conflicts = conflicts;
	                }
	              }
	              for (var att in doc.doc._attachments) {
	                if (doc.doc._attachments.hasOwnProperty(att)) {
	                  doc.doc._attachments[att].stub = true;
	                }
	              }
	            }
	            if (opts.inclusive_end === false && metadata.id === opts.endkey) {
	              return next();
	            } else if (deleted) {
	              if (opts.deleted === 'ok') {
	                doc.value.deleted = true;
	                doc.doc = null;
	              } else {
	                /* istanbul ignore next */
	                return next();
	              }
	            }
	            results.push(doc);
	            next();
	          }
	          if (opts.include_docs) {
	            var seq = metadata.rev_map[winningRev$$1];
	            stores.bySeqStore.get(formatSeq(seq), function (err, data) {
	              allDocsInner(data);
	            });
	          }
	          else {
	            allDocsInner();
	          }
	        }, function (next) {
	          PouchPromise.resolve().then(function () {
	            if (opts.include_docs && opts.attachments) {
	              return fetchAttachments(results, stores, opts);
	            }
	          }).then(function () {
	            var returnVal = {
	              total_rows: docCount,
	              offset: opts.skip,
	              rows: results
	            };

	            /* istanbul ignore if */
	            if (opts.update_seq) {
	              returnVal.update_seq = db._updateSeq;
	            }
	            callback(null, returnVal);
	          }, callback);
	          next();
	        }).on('unpipe', function () {
	          throughStream.end();
	        });

	        docstream.on('error', callback);

	        docstream.pipe(throughStream);
	      });
	    })(opts, callback);
	  };

	  api._changes = function (opts) {
	    opts = clone(opts);

	    if (opts.continuous) {
	      var id = name + ':' + uuid$1();
	      levelChanges.addListener(name, id, api, opts);
	      levelChanges.notify(name);
	      return {
	        cancel: function () {
	          levelChanges.removeListener(name, id);
	        }
	      };
	    }

	    var descending = opts.descending;
	    var results = [];
	    var lastSeq = opts.since || 0;
	    var called = 0;
	    var streamOpts = {
	      reverse: descending
	    };
	    var limit;
	    if ('limit' in opts && opts.limit > 0) {
	      limit = opts.limit;
	    }
	    if (!streamOpts.reverse) {
	      streamOpts.start = formatSeq(opts.since || 0);
	    }

	    var docIds = opts.doc_ids && new ExportedSet(opts.doc_ids);
	    var filter = filterChange(opts);
	    var docIdsToMetadata = new ExportedMap();

	    var returnDocs;
	    if ('return_docs' in opts) {
	      returnDocs = opts.return_docs;
	    } else if ('returnDocs' in opts) {
	      // TODO: Remove 'returnDocs' in favor of 'return_docs' in a future release
	      returnDocs = opts.returnDocs;
	    } else {
	      returnDocs = true;
	    }

	    function complete() {
	      opts.done = true;
	      if (returnDocs && opts.limit) {
	        /* istanbul ignore if */
	        if (opts.limit < results.length) {
	          results.length = opts.limit;
	        }
	      }
	      changeStream.unpipe(throughStream);
	      changeStream.destroy();
	      if (!opts.continuous && !opts.cancelled) {
	        if (opts.include_docs && opts.attachments) {
	          fetchAttachments(results, stores, opts).then(function () {
	            opts.complete(null, {results: results, last_seq: lastSeq});
	          });
	        } else {
	          opts.complete(null, {results: results, last_seq: lastSeq});
	        }
	      }
	    }
	    var changeStream = stores.bySeqStore.readStream(streamOpts);
	    var throughStream = obj(function (data, _, next) {
	      if (limit && called >= limit) {
	        complete();
	        return next();
	      }
	      if (opts.cancelled || opts.done) {
	        return next();
	      }

	      var seq = parseSeq(data.key);
	      var doc = data.value;

	      if (seq === opts.since && !descending) {
	        // couchdb ignores `since` if descending=true
	        return next();
	      }

	      if (docIds && !docIds.has(doc._id)) {
	        return next();
	      }

	      var metadata;

	      function onGetMetadata(metadata) {
	        var winningRev$$1 = getWinningRev(metadata);

	        function onGetWinningDoc(winningDoc) {

	          var change = opts.processChange(winningDoc, metadata, opts);
	          change.seq = metadata.seq;

	          var filtered = filter(change);
	          if (typeof filtered === 'object') {
	            return opts.complete(filtered);
	          }

	          if (filtered) {
	            called++;

	            if (opts.attachments && opts.include_docs) {
	              // fetch attachment immediately for the benefit
	              // of live listeners
	              fetchAttachments([change], stores, opts).then(function () {
	                opts.onChange(change);
	              });
	            } else {
	              opts.onChange(change);
	            }

	            if (returnDocs) {
	              results.push(change);
	            }
	          }
	          next();
	        }

	        if (metadata.seq !== seq) {
	          // some other seq is later
	          return next();
	        }

	        lastSeq = seq;

	        if (winningRev$$1 === doc._rev) {
	          return onGetWinningDoc(doc);
	        }

	        // fetch the winner

	        var winningSeq = metadata.rev_map[winningRev$$1];

	        stores.bySeqStore.get(formatSeq(winningSeq), function (err, doc) {
	          onGetWinningDoc(doc);
	        });
	      }

	      metadata = docIdsToMetadata.get(doc._id);
	      if (metadata) { // cached
	        return onGetMetadata(metadata);
	      }
	      // metadata not cached, have to go fetch it
	      stores.docStore.get(doc._id, function (err, metadata) {
	        /* istanbul ignore if */
	        if (opts.cancelled || opts.done || db.isClosed() ||
	          isLocalId(metadata.id)) {
	          return next();
	        }
	        docIdsToMetadata.set(doc._id, metadata);
	        onGetMetadata(metadata);
	      });
	    }, function (next) {
	      if (opts.cancelled) {
	        return next();
	      }
	      if (returnDocs && opts.limit) {
	        /* istanbul ignore if */
	        if (opts.limit < results.length) {
	          results.length = opts.limit;
	        }
	      }

	      next();
	    }).on('unpipe', function () {
	      throughStream.end();
	      complete();
	    });
	    changeStream.pipe(throughStream);
	    return {
	      cancel: function () {
	        opts.cancelled = true;
	        complete();
	      }
	    };
	  };

	  api._close = function (callback) {
	    /* istanbul ignore if */
	    if (db.isClosed()) {
	      return callback(createError$2(NOT_OPEN));
	    }
	    db.close(function (err) {
	      /* istanbul ignore if */
	      if (err) {
	        callback(err);
	      } else {
	        dbStore.delete(name);
	        callback();
	      }
	    });
	  };

	  api._getRevisionTree = function (docId, callback) {
	    stores.docStore.get(docId, function (err, metadata) {
	      if (err) {
	        callback(createError$2(MISSING_DOC));
	      } else {
	        callback(null, metadata.rev_tree);
	      }
	    });
	  };

	  api._doCompaction = writeLock(function (docId, revs, opts, callback) {
	    api._doCompactionNoLock(docId, revs, opts, callback);
	  });

	  // the NoLock version is for use by bulkDocs
	  api._doCompactionNoLock = function (docId, revs, opts, callback) {
	    if (typeof opts === 'function') {
	      callback = opts;
	      opts = {};
	    }

	    if (!revs.length) {
	      return callback();
	    }
	    var txn = opts.ctx || new LevelTransaction();

	    txn.get(stores.docStore, docId, function (err, metadata) {
	      /* istanbul ignore if */
	      if (err) {
	        return callback(err);
	      }
	      var seqs = revs.map(function (rev$$1) {
	        var seq = metadata.rev_map[rev$$1];
	        delete metadata.rev_map[rev$$1];
	        return seq;
	      });
	      traverseRevTree(metadata.rev_tree, function (isLeaf, pos,
	                                                         revHash, ctx, opts) {
	        var rev$$1 = pos + '-' + revHash;
	        if (revs.indexOf(rev$$1) !== -1) {
	          opts.status = 'missing';
	        }
	      });

	      var batch = [];
	      batch.push({
	        key: metadata.id,
	        value: metadata,
	        type: 'put',
	        prefix: stores.docStore
	      });

	      var digestMap = {};
	      var numDone = 0;
	      var overallErr;
	      function checkDone(err) {
	        /* istanbul ignore if */
	        if (err) {
	          overallErr = err;
	        }
	        if (++numDone === revs.length) { // done
	          /* istanbul ignore if */
	          if (overallErr) {
	            return callback(overallErr);
	          }
	          deleteOrphanedAttachments();
	        }
	      }

	      function finish(err) {
	        /* istanbul ignore if */
	        if (err) {
	          return callback(err);
	        }
	        txn.batch(batch);
	        if (opts.ctx) {
	          // don't execute immediately
	          return callback();
	        }
	        txn.execute(db, callback);
	      }

	      function deleteOrphanedAttachments() {
	        var possiblyOrphanedAttachments = Object.keys(digestMap);
	        if (!possiblyOrphanedAttachments.length) {
	          return finish();
	        }
	        var numDone = 0;
	        var overallErr;
	        function checkDone(err) {
	          /* istanbul ignore if */
	          if (err) {
	            overallErr = err;
	          }
	          if (++numDone === possiblyOrphanedAttachments.length) {
	            finish(overallErr);
	          }
	        }
	        var refsToDelete = new ExportedMap();
	        revs.forEach(function (rev$$1) {
	          refsToDelete.set(docId + '@' + rev$$1, true);
	        });
	        possiblyOrphanedAttachments.forEach(function (digest) {
	          txn.get(stores.attachmentStore, digest, function (err, attData) {
	            /* istanbul ignore if */
	            if (err) {
	              if (err.name === 'NotFoundError') {
	                return checkDone();
	              } else {
	                return checkDone(err);
	              }
	            }
	            var refs = Object.keys(attData.refs || {}).filter(function (ref) {
	              return !refsToDelete.has(ref);
	            });
	            var newRefs = {};
	            refs.forEach(function (ref) {
	              newRefs[ref] = true;
	            });
	            if (refs.length) { // not orphaned
	              batch.push({
	                key: digest,
	                type: 'put',
	                value: {refs: newRefs},
	                prefix: stores.attachmentStore
	              });
	            } else { // orphaned, can safely delete
	              batch = batch.concat([{
	                key: digest,
	                type: 'del',
	                prefix: stores.attachmentStore
	              }, {
	                key: digest,
	                type: 'del',
	                prefix: stores.binaryStore
	              }]);
	            }
	            checkDone();
	          });
	        });
	      }

	      seqs.forEach(function (seq) {
	        batch.push({
	          key: formatSeq(seq),
	          type: 'del',
	          prefix: stores.bySeqStore
	        });
	        txn.get(stores.bySeqStore, formatSeq(seq), function (err, doc) {
	          /* istanbul ignore if */
	          if (err) {
	            if (err.name === 'NotFoundError') {
	              return checkDone();
	            } else {
	              return checkDone(err);
	            }
	          }
	          var atts = Object.keys(doc._attachments || {});
	          atts.forEach(function (attName) {
	            var digest = doc._attachments[attName].digest;
	            digestMap[digest] = true;
	          });
	          checkDone();
	        });
	      });
	    });
	  };

	  api._getLocal = function (id, callback) {
	    stores.localStore.get(id, function (err, doc) {
	      if (err) {
	        callback(createError$2(MISSING_DOC));
	      } else {
	        callback(null, doc);
	      }
	    });
	  };

	  api._putLocal = function (doc, opts, callback) {
	    if (typeof opts === 'function') {
	      callback = opts;
	      opts = {};
	    }
	    if (opts.ctx) {
	      api._putLocalNoLock(doc, opts, callback);
	    } else {
	      api._putLocalWithLock(doc, opts, callback);
	    }
	  };

	  api._putLocalWithLock = writeLock(function (doc, opts, callback) {
	    api._putLocalNoLock(doc, opts, callback);
	  });

	  // the NoLock version is for use by bulkDocs
	  api._putLocalNoLock = function (doc, opts, callback) {
	    delete doc._revisions; // ignore this, trust the rev
	    var oldRev = doc._rev;
	    var id = doc._id;

	    var txn = opts.ctx || new LevelTransaction();

	    txn.get(stores.localStore, id, function (err, resp) {
	      if (err && oldRev) {
	        return callback(createError$2(REV_CONFLICT));
	      }
	      if (resp && resp._rev !== oldRev) {
	        return callback(createError$2(REV_CONFLICT));
	      }
	      doc._rev =
	          oldRev ? '0-' + (parseInt(oldRev.split('-')[1], 10) + 1) : '0-1';
	      var batch = [
	        {
	          type: 'put',
	          prefix: stores.localStore,
	          key: id,
	          value: doc
	        }
	      ];

	      txn.batch(batch);
	      var ret = {ok: true, id: doc._id, rev: doc._rev};

	      if (opts.ctx) {
	        // don't execute immediately
	        return callback(null, ret);
	      }
	      txn.execute(db, function (err) {
	        /* istanbul ignore if */
	        if (err) {
	          return callback(err);
	        }
	        callback(null, ret);
	      });
	    });
	  };

	  api._removeLocal = function (doc, opts, callback) {
	    if (typeof opts === 'function') {
	      callback = opts;
	      opts = {};
	    }
	    if (opts.ctx) {
	      api._removeLocalNoLock(doc, opts, callback);
	    } else {
	      api._removeLocalWithLock(doc, opts, callback);
	    }
	  };

	  api._removeLocalWithLock = writeLock(function (doc, opts, callback) {
	    api._removeLocalNoLock(doc, opts, callback);
	  });

	  // the NoLock version is for use by bulkDocs
	  api._removeLocalNoLock = function (doc, opts, callback) {
	    var txn = opts.ctx || new LevelTransaction();
	    txn.get(stores.localStore, doc._id, function (err, resp) {
	      if (err) {
	        /* istanbul ignore if */
	        if (err.name !== 'NotFoundError') {
	          return callback(err);
	        } else {
	          return callback(createError$2(MISSING_DOC));
	        }
	      }
	      if (resp._rev !== doc._rev) {
	        return callback(createError$2(REV_CONFLICT));
	      }
	      txn.batch([{
	        prefix: stores.localStore,
	        type: 'del',
	        key: doc._id
	      }]);
	      var ret = {ok: true, id: doc._id, rev: '0-0'};
	      if (opts.ctx) {
	        // don't execute immediately
	        return callback(null, ret);
	      }
	      txn.execute(db, function (err) {
	        /* istanbul ignore if */
	        if (err) {
	          return callback(err);
	        }
	        callback(null, ret);
	      });
	    });
	  };

	  // close and delete open leveldb stores
	  api._destroy = function (opts, callback) {
	    var dbStore;
	    var leveldownName = functionName(leveldown);
	    /* istanbul ignore else */
	    if (dbStores.has(leveldownName)) {
	      dbStore = dbStores.get(leveldownName);
	    } else {
	      return callDestroy(name, callback);
	    }

	    /* istanbul ignore else */
	    if (dbStore.has(name)) {
	      levelChanges.removeAllListeners(name);

	      dbStore.get(name).close(function () {
	        dbStore.delete(name);
	        callDestroy(name, callback);
	      });
	    } else {
	      callDestroy(name, callback);
	    }
	  };
	  function callDestroy(name, cb) {
	    leveldown.destroy(name, cb);
	  }
	}

	// require leveldown. provide verbose output on error as it is the default
	// nodejs adapter, which we do not provide for the user
	/* istanbul ignore next */
	var requireLeveldown = function () {
	  try {
	    return require('leveldown');
	  } catch (err) {
	    /* eslint no-ex-assign: 0*/
	    err = err || 'leveldown import error';
	    if (err.code === 'MODULE_NOT_FOUND') {
	      // handle leveldown not installed case
	      return new Error([
	        'the \'leveldown\' package is not available. install it, or,',
	        'specify another storage backend using the \'db\' option'
	      ].join(' '));
	    } else if (err.message && err.message.match('Module version mismatch')) {
	      // handle common user enviornment error
	      return new Error([
	        err.message,
	        'This generally implies that leveldown was built with a different',
	        'version of node than that which is running now.  You may try',
	        'fully removing and reinstalling PouchDB or leveldown to resolve.'
	      ].join(' '));
	    }
	    // handle general internal nodejs require error
	    return new Error(err.toString() + ': unable to import leveldown');
	  }
	};

	var stores = [
	  'document-store',
	  'by-sequence',
	  'attach-store',
	  'attach-binary-store'
	];
	function formatSeq(n) {
	  return ('0000000000000000' + n).slice(-16);
	}
	var UPDATE_SEQ_KEY$1 = '_local_last_update_seq';
	var DOC_COUNT_KEY$1 = '_local_doc_count';
	var UUID_KEY$1 = '_local_uuid';

	var doMigrationOne = function (name, db, callback) {
	  // local require to prevent crashing if leveldown isn't installed.
	  var leveldown = require("leveldown");

	  var base = path.resolve(name);
	  function move(store, index, cb) {
	    var storePath = path.join(base, store);
	    var opts;
	    if (index === 3) {
	      opts = {
	        valueEncoding: 'binary'
	      };
	    } else {
	      opts = {
	        valueEncoding: 'json'
	      };
	    }
	    var sub = db.sublevel(store, opts);
	    var orig = level(storePath, opts);
	    var from = orig.createReadStream();
	    var writeStream = new levelWriteStream(sub);
	    var to = writeStream();
	    from.on('end', function () {
	      orig.close(function (err) {
	        cb(err, storePath);
	      });
	    });
	    from.pipe(to);
	  }
	  fs.unlink(base + '.uuid', function (err) {
	    if (err) {
	      return callback();
	    }
	    var todo = 4;
	    var done = [];
	    stores.forEach(function (store, i) {
	      move(store, i, function (err, storePath) {
	        /* istanbul ignore if */
	        if (err) {
	          return callback(err);
	        }
	        done.push(storePath);
	        if (!(--todo)) {
	          done.forEach(function (item) {
	            leveldown.destroy(item, function () {
	              if (++todo === done.length) {
	                fs.rmdir(base, callback);
	              }
	            });
	          });
	        }
	      });
	    });
	  });
	};
	var doMigrationTwo = function (db, stores, callback) {
	  var batches = [];
	  stores.bySeqStore.get(UUID_KEY$1, function (err, value) {
	    if (err) {
	      // no uuid key, so don't need to migrate;
	      return callback();
	    }
	    batches.push({
	      key: UUID_KEY$1,
	      value: value,
	      prefix: stores.metaStore,
	      type: 'put',
	      valueEncoding: 'json'
	    });
	    batches.push({
	      key: UUID_KEY$1,
	      prefix: stores.bySeqStore,
	      type: 'del'
	    });
	    stores.bySeqStore.get(DOC_COUNT_KEY$1, function (err, value) {
	      if (value) {
	        // if no doc count key,
	        // just skip
	        // we can live with this
	        batches.push({
	          key: DOC_COUNT_KEY$1,
	          value: value,
	          prefix: stores.metaStore,
	          type: 'put',
	          valueEncoding: 'json'
	        });
	        batches.push({
	          key: DOC_COUNT_KEY$1,
	          prefix: stores.bySeqStore,
	          type: 'del'
	        });
	      }
	      stores.bySeqStore.get(UPDATE_SEQ_KEY$1, function (err, value) {
	        if (value) {
	          // if no UPDATE_SEQ_KEY
	          // just skip
	          // we've gone to far to stop.
	          batches.push({
	            key: UPDATE_SEQ_KEY$1,
	            value: value,
	            prefix: stores.metaStore,
	            type: 'put',
	            valueEncoding: 'json'
	          });
	          batches.push({
	            key: UPDATE_SEQ_KEY$1,
	            prefix: stores.bySeqStore,
	            type: 'del'
	          });
	        }
	        var deletedSeqs = {};
	        stores.docStore.createReadStream({
	          startKey: '_',
	          endKey: '_\xFF'
	        }).pipe(obj(function (ch, _, next) {
	          if (!isLocalId(ch.key)) {
	            return next();
	          }
	          batches.push({
	            key: ch.key,
	            prefix: stores.docStore,
	            type: 'del'
	          });
	          var winner = winningRev(ch.value);
	          Object.keys(ch.value.rev_map).forEach(function (key) {
	            if (key !== 'winner') {
	              this.push(formatSeq(ch.value.rev_map[key]));
	            }
	          }, this);
	          var winningSeq = ch.value.rev_map[winner];
	          stores.bySeqStore.get(formatSeq(winningSeq), function (err, value) {
	            if (!err) {
	              batches.push({
	                key: ch.key,
	                value: value,
	                prefix: stores.localStore,
	                type: 'put',
	                valueEncoding: 'json'
	              });
	            }
	            next();
	          });

	        })).pipe(obj(function (seq, _, next) {
	          /* istanbul ignore if */
	          if (deletedSeqs[seq]) {
	            return next();
	          }
	          deletedSeqs[seq] = true;
	          stores.bySeqStore.get(seq, function (err, resp) {
	            /* istanbul ignore if */
	            if (err || !isLocalId(resp._id)) {
	              return next();
	            }
	            batches.push({
	              key: seq,
	              prefix: stores.bySeqStore,
	              type: 'del'
	            });
	            next();
	          });
	        }, function () {
	          db.batch(batches, callback);
	        }));
	      });
	    });
	  });

	};

	var migrate = {
	  doMigrationOne: doMigrationOne,
	  doMigrationTwo: doMigrationTwo
	};

	function LevelDownPouch(opts, callback) {

	  // Users can pass in their own leveldown alternative here, in which case
	  // it overrides the default one. (This is in addition to the custom builds.)
	  var leveldown = opts.db;

	  /* istanbul ignore else */
	  if (!leveldown) {
	    leveldown = requireLeveldown();

	    /* istanbul ignore if */
	    if (leveldown instanceof Error) {
	      return callback(leveldown);
	    }
	  }

	  var _opts = $inject_Object_assign({
	    db: leveldown,
	    migrate: migrate
	  }, opts);

	  LevelPouch.call(this, _opts, callback);
	}

	// overrides for normal LevelDB behavior on Node
	LevelDownPouch.valid = function () {
	  return true;
	};
	LevelDownPouch.use_prefix = false;

	function LevelPouch$1 (PouchDB) {
	  PouchDB.adapter('leveldb', LevelDownPouch, true);
	}

	// May seem redundant, but this is to allow switching with
	// request-browser.js.
	var request = require('request').defaults({
	  jar: true
	});

	// non-standard, but we do this to mimic blobs in the browser
	function applyTypeToBuffer(buffer$$1, resp) {
	  buffer$$1.type = resp.headers['content-type'];
	}

	function defaultBody() {
	  return bufferFrom_1('', 'binary');
	}

	function ajaxCore(options, callback) {

	  options = clone(options);

	  var defaultOptions = {
	    method : "GET",
	    headers: {},
	    json: true,
	    processData: true,
	    timeout: 10000,
	    cache: false
	  };

	  options = $inject_Object_assign(defaultOptions, options);

	  function onSuccess(obj$$1, resp, cb) {
	    if (!options.binary && options.json && typeof obj$$1 === 'string') {
	      /* istanbul ignore next */
	      try {
	        obj$$1 = JSON.parse(obj$$1);
	      } catch (e) {
	        // Probably a malformed JSON from server
	        return cb(e);
	      }
	    }
	    if (Array.isArray(obj$$1)) {
	      obj$$1 = obj$$1.map(function (v) {
	        if (v.error || v.missing) {
	          return generateErrorFromResponse(v);
	        } else {
	          return v;
	        }
	      });
	    }
	    if (options.binary) {
	      applyTypeToBuffer(obj$$1, resp);
	    }
	    cb(null, obj$$1, resp);
	  }

	  if (options.json) {
	    if (!options.binary) {
	      options.headers.Accept = 'application/json';
	    }
	    options.headers['Content-Type'] = options.headers['Content-Type'] ||
	      'application/json';
	  }

	  if (options.binary) {
	    options.encoding = null;
	    options.json = false;
	  }

	  if (!options.processData) {
	    options.json = false;
	  }

	  return request(options, function (err, response, body) {

	    if (err) {
	      return callback(generateErrorFromResponse(err));
	    }

	    var error;
	    var content_type = response.headers && response.headers['content-type'];
	    var data = body || defaultBody();

	    // CouchDB doesn't always return the right content-type for JSON data, so
	    // we check for ^{ and }$ (ignoring leading/trailing whitespace)
	    if (!options.binary && (options.json || !options.processData) &&
	        typeof data !== 'object' &&
	        (/json/.test(content_type) ||
	         (/^[\s]*\{/.test(data) && /\}[\s]*$/.test(data)))) {
	      try {
	        data = JSON.parse(data.toString());
	      } catch (e) {}
	    }

	    if (response.statusCode >= 200 && response.statusCode < 300) {
	      onSuccess(data, response, callback);
	    } else {
	      error = generateErrorFromResponse(data);
	      error.status = response.statusCode;
	      callback(error);
	    }
	  });
	}

	function ajax(opts, callback) {
	  // do nothing; all the action is in prerequest-browser.js
	  return ajaxCore(opts, callback);
	}

	// dead simple promise pool, inspired by https://github.com/timdp/es6-promise-pool
	// but much smaller in code size. limits the number of concurrent promises that are executed


	function pool(promiseFactories, limit) {
	  return new PouchPromise(function (resolve, reject) {
	    var running = 0;
	    var current = 0;
	    var done = 0;
	    var len = promiseFactories.length;
	    var err;

	    function runNext() {
	      running++;
	      promiseFactories[current++]().then(onSuccess, onError);
	    }

	    function doNext() {
	      if (++done === len) {
	        /* istanbul ignore if */
	        if (err) {
	          reject(err);
	        } else {
	          resolve();
	        }
	      } else {
	        runNextBatch();
	      }
	    }

	    function onSuccess() {
	      running--;
	      doNext();
	    }

	    /* istanbul ignore next */
	    function onError(thisErr) {
	      running--;
	      err = err || thisErr;
	      doNext();
	    }

	    function runNextBatch() {
	      while (running < limit && current < len) {
	        runNext();
	      }
	    }

	    runNextBatch();
	  });
	}

	var CHANGES_BATCH_SIZE = 25;
	var MAX_SIMULTANEOUS_REVS = 50;
	var CHANGES_TIMEOUT_BUFFER = 5000;
	var DEFAULT_HEARTBEAT = 10000;

	var supportsBulkGetMap = {};

	function readAttachmentsAsBlobOrBuffer(row) {
	  var doc = row.doc || row.ok;
	  var atts = doc._attachments;
	  if (!atts) {
	    return;
	  }
	  Object.keys(atts).forEach(function (filename) {
	    var att = atts[filename];
	    att.data = b64ToBluffer(att.data, att.content_type);
	  });
	}

	function encodeDocId(id) {
	  if (/^_design/.test(id)) {
	    return '_design/' + encodeURIComponent(id.slice(8));
	  }
	  if (/^_local/.test(id)) {
	    return '_local/' + encodeURIComponent(id.slice(7));
	  }
	  return encodeURIComponent(id);
	}

	function preprocessAttachments$2(doc) {
	  if (!doc._attachments || !Object.keys(doc._attachments)) {
	    return PouchPromise.resolve();
	  }

	  return PouchPromise.all(Object.keys(doc._attachments).map(function (key) {
	    var attachment = doc._attachments[key];
	    if (attachment.data && typeof attachment.data !== 'string') {
	      return new PouchPromise(function (resolve) {
	        blobToBase64(attachment.data, resolve);
	      }).then(function (b64) {
	        attachment.data = b64;
	      });
	    }
	  }));
	}

	function hasUrlPrefix(opts) {
	  if (!opts.prefix) {
	    return false;
	  }

	  var protocol = parseUri(opts.prefix).protocol;

	  return protocol === 'http' || protocol === 'https';
	}

	// Get all the information you possibly can about the URI given by name and
	// return it as a suitable object.
	function getHost(name, opts) {

	  // encode db name if opts.prefix is a url (#5574)
	  if (hasUrlPrefix(opts)) {
	    var dbName = opts.name.substr(opts.prefix.length);
	    name = opts.prefix + encodeURIComponent(dbName);
	  }

	  // Prase the URI into all its little bits
	  var uri = parseUri(name);

	  // Store the user and password as a separate auth object
	  if (uri.user || uri.password) {
	    uri.auth = {username: uri.user, password: uri.password};
	  }

	  // Split the path part of the URI into parts using '/' as the delimiter
	  // after removing any leading '/' and any trailing '/'
	  var parts = uri.path.replace(/(^\/|\/$)/g, '').split('/');

	  // Store the first part as the database name and remove it from the parts
	  // array
	  uri.db = parts.pop();
	  // Prevent double encoding of URI component
	  if (uri.db.indexOf('%') === -1) {
	    uri.db = encodeURIComponent(uri.db);
	  }

	  // Restore the path by joining all the remaining parts (all the parts
	  // except for the database name) with '/'s
	  uri.path = parts.join('/');

	  return uri;
	}

	// Generate a URL with the host data given by opts and the given path
	function genDBUrl(opts, path$$1) {
	  return genUrl(opts, opts.db + '/' + path$$1);
	}

	// Generate a URL with the host data given by opts and the given path
	function genUrl(opts, path$$1) {
	  // If the host already has a path, then we need to have a path delimiter
	  // Otherwise, the path delimiter is the empty string
	  var pathDel = !opts.path ? '' : '/';

	  // If the host already has a path, then we need to have a path delimiter
	  // Otherwise, the path delimiter is the empty string
	  return opts.protocol + '://' + opts.host +
	         (opts.port ? (':' + opts.port) : '') +
	         '/' + opts.path + pathDel + path$$1;
	}

	function paramsToStr(params) {
	  return '?' + Object.keys(params).map(function (k) {
	    return k + '=' + encodeURIComponent(params[k]);
	  }).join('&');
	}

	// Implements the PouchDB API for dealing with CouchDB instances over HTTP
	function HttpPouch(opts, callback) {

	  // The functions that will be publicly available for HttpPouch
	  var api = this;

	  var host = getHost(opts.name, opts);
	  var dbUrl = genDBUrl(host, '');

	  opts = clone(opts);
	  var ajaxOpts = opts.ajax || {};

	  if (opts.auth || host.auth) {
	    var nAuth = opts.auth || host.auth;
	    var str = nAuth.username + ':' + nAuth.password;
	    var token = thisBtoa(unescape(encodeURIComponent(str)));
	    ajaxOpts.headers = ajaxOpts.headers || {};
	    ajaxOpts.headers.Authorization = 'Basic ' + token;
	  }

	  // Not strictly necessary, but we do this because numerous tests
	  // rely on swapping ajax in and out.
	  api._ajax = ajax;

	  function ajax$$1(userOpts, options, callback) {
	    var reqAjax = (userOpts || {}).ajax || {};
	    var reqOpts = $inject_Object_assign(clone(ajaxOpts), reqAjax, options);
	    var defaultHeaders = clone(ajaxOpts.headers || {});
	    reqOpts.headers = $inject_Object_assign(defaultHeaders, reqAjax.headers,
	      options.headers || {});
	    /* istanbul ignore if */
	    if (api.constructor.listeners('debug').length) {
	      api.constructor.emit('debug', ['http', reqOpts.method, reqOpts.url]);
	    }
	    return api._ajax(reqOpts, callback);
	  }

	  function ajaxPromise(userOpts, opts) {
	    return new PouchPromise(function (resolve, reject) {
	      ajax$$1(userOpts, opts, function (err, res$$1) {
	        /* istanbul ignore if */
	        if (err) {
	          return reject(err);
	        }
	        resolve(res$$1);
	      });
	    });
	  }

	  function adapterFun$$1(name, fun) {
	    return adapterFun(name, argsarray(function (args) {
	      setup().then(function () {
	        return fun.apply(this, args);
	      }).catch(function (e) {
	        var callback = args.pop();
	        callback(e);
	      });
	    }));
	  }

	  var setupPromise;

	  function setup() {
	    // TODO: Remove `skipSetup` in favor of `skip_setup` in a future release
	    if (opts.skipSetup || opts.skip_setup) {
	      return PouchPromise.resolve();
	    }

	    // If there is a setup in process or previous successful setup
	    // done then we will use that
	    // If previous setups have been rejected we will try again
	    if (setupPromise) {
	      return setupPromise;
	    }

	    var checkExists = {method: 'GET', url: dbUrl};
	    setupPromise = ajaxPromise({}, checkExists).catch(function (err) {
	      if (err && err.status && err.status === 404) {
	        // Doesnt exist, create it
	        return ajaxPromise({}, {method: 'PUT', url: dbUrl});
	      } else {
	        return PouchPromise.reject(err);
	      }
	    }).catch(function (err) {
	      // If we try to create a database that already exists, skipped in
	      // istanbul since its catching a race condition.
	      /* istanbul ignore if */
	      if (err && err.status && err.status === 412) {
	        return true;
	      }
	      return PouchPromise.reject(err);
	    });

	    setupPromise.catch(function () {
	      setupPromise = null;
	    });

	    return setupPromise;
	  }

	  nextTick$1(function () {
	    callback(null, api);
	  });

	  api._remote = true;
	  /* istanbul ignore next */
	  api.type = function () {
	    return 'http';
	  };

	  api.id = adapterFun$$1('id', function (callback) {
	    ajax$$1({}, {method: 'GET', url: genUrl(host, '')}, function (err, result) {
	      var uuid$$1 = (result && result.uuid) ?
	        (result.uuid + host.db) : genDBUrl(host, '');
	      callback(null, uuid$$1);
	    });
	  });

	  api.request = adapterFun$$1('request', function (options, callback) {
	    options.url = genDBUrl(host, options.url);
	    ajax$$1({}, options, callback);
	  });

	  // Sends a POST request to the host calling the couchdb _compact function
	  //    version: The version of CouchDB it is running
	  api.compact = adapterFun$$1('compact', function (opts, callback) {
	    if (typeof opts === 'function') {
	      callback = opts;
	      opts = {};
	    }
	    opts = clone(opts);
	    ajax$$1(opts, {
	      url: genDBUrl(host, '_compact'),
	      method: 'POST'
	    }, function () {
	      function ping() {
	        api.info(function (err, res$$1) {
	          // CouchDB may send a "compact_running:true" if it's
	          // already compacting. PouchDB Server doesn't.
	          /* istanbul ignore else */
	          if (res$$1 && !res$$1.compact_running) {
	            callback(null, {ok: true});
	          } else {
	            setTimeout(ping, opts.interval || 200);
	          }
	        });
	      }
	      // Ping the http if it's finished compaction
	      ping();
	    });
	  });

	  api.bulkGet = adapterFun('bulkGet', function (opts, callback) {
	    var self = this;

	    function doBulkGet(cb) {
	      var params = {};
	      if (opts.revs) {
	        params.revs = true;
	      }
	      if (opts.attachments) {
	        /* istanbul ignore next */
	        params.attachments = true;
	      }
	      if (opts.latest) {
	        params.latest = true;
	      }
	      ajax$$1(opts, {
	        url: genDBUrl(host, '_bulk_get' + paramsToStr(params)),
	        method: 'POST',
	        body: { docs: opts.docs}
	      }, function (err, result) {
	        if (!err && opts.attachments && opts.binary) {
	          result.results.forEach(function (res$$1) {
	            res$$1.docs.forEach(readAttachmentsAsBlobOrBuffer);
	          });
	        }
	        cb(err, result);
	      });
	    }

	    /* istanbul ignore next */
	    function doBulkGetShim() {
	      // avoid "url too long error" by splitting up into multiple requests
	      var batchSize = MAX_SIMULTANEOUS_REVS;
	      var numBatches = Math.ceil(opts.docs.length / batchSize);
	      var numDone = 0;
	      var results = new Array(numBatches);

	      function onResult(batchNum) {
	        return function (err, res$$1) {
	          // err is impossible because shim returns a list of errs in that case
	          results[batchNum] = res$$1.results;
	          if (++numDone === numBatches) {
	            callback(null, {results: flatten(results)});
	          }
	        };
	      }

	      for (var i = 0; i < numBatches; i++) {
	        var subOpts = pick(opts, ['revs', 'attachments', 'binary', 'latest']);
	        subOpts.ajax = ajaxOpts;
	        subOpts.docs = opts.docs.slice(i * batchSize,
	          Math.min(opts.docs.length, (i + 1) * batchSize));
	        bulkGet(self, subOpts, onResult(i));
	      }
	    }

	    // mark the whole database as either supporting or not supporting _bulk_get
	    var dbUrl = genUrl(host, '');
	    var supportsBulkGet = supportsBulkGetMap[dbUrl];

	    /* istanbul ignore next */
	    if (typeof supportsBulkGet !== 'boolean') {
	      // check if this database supports _bulk_get
	      doBulkGet(function (err, res$$1) {
	        if (err) {
	          supportsBulkGetMap[dbUrl] = false;
	          res$2(
	            err.status,
	            'PouchDB is just detecting if the remote ' +
	            'supports the _bulk_get API.'
	          );
	          doBulkGetShim();
	        } else {
	          supportsBulkGetMap[dbUrl] = true;
	          callback(null, res$$1);
	        }
	      });
	    } else if (supportsBulkGet) {
	      doBulkGet(callback);
	    } else {
	      doBulkGetShim();
	    }
	  });

	  // Calls GET on the host, which gets back a JSON string containing
	  //    couchdb: A welcome string
	  //    version: The version of CouchDB it is running
	  api._info = function (callback) {
	    setup().then(function () {
	      ajax$$1({}, {
	        method: 'GET',
	        url: genDBUrl(host, '')
	      }, function (err, res$$1) {
	        /* istanbul ignore next */
	        if (err) {
	        return callback(err);
	        }
	        res$$1.host = genDBUrl(host, '');
	        callback(null, res$$1);
	      });
	    }).catch(callback);
	  };

	  // Get the document with the given id from the database given by host.
	  // The id could be solely the _id in the database, or it may be a
	  // _design/ID or _local/ID path
	  api.get = adapterFun$$1('get', function (id, opts, callback) {
	    // If no options were given, set the callback to the second parameter
	    if (typeof opts === 'function') {
	      callback = opts;
	      opts = {};
	    }
	    opts = clone(opts);

	    // List of parameters to add to the GET request
	    var params = {};

	    if (opts.revs) {
	      params.revs = true;
	    }

	    if (opts.revs_info) {
	      params.revs_info = true;
	    }

	    if (opts.latest) {
	      params.latest = true;
	    }

	    if (opts.open_revs) {
	      if (opts.open_revs !== "all") {
	        opts.open_revs = JSON.stringify(opts.open_revs);
	      }
	      params.open_revs = opts.open_revs;
	    }

	    if (opts.rev) {
	      params.rev = opts.rev;
	    }

	    if (opts.conflicts) {
	      params.conflicts = opts.conflicts;
	    }

	    /* istanbul ignore if */
	    if (opts.update_seq) {
	      params.update_seq = opts.update_seq;
	    }

	    id = encodeDocId(id);

	    // Set the options for the ajax call
	    var options = {
	      method: 'GET',
	      url: genDBUrl(host, id + paramsToStr(params))
	    };

	    function fetchAttachments(doc) {
	      var atts = doc._attachments;
	      var filenames = atts && Object.keys(atts);
	      if (!atts || !filenames.length) {
	        return;
	      }
	      // we fetch these manually in separate XHRs, because
	      // Sync Gateway would normally send it back as multipart/mixed,
	      // which we cannot parse. Also, this is more efficient than
	      // receiving attachments as base64-encoded strings.
	      function fetch(filename) {
	        var att = atts[filename];
	        var path$$1 = encodeDocId(doc._id) + '/' + encodeAttachmentId(filename) +
	          '?rev=' + doc._rev;
	        return ajaxPromise(opts, {
	          method: 'GET',
	          url: genDBUrl(host, path$$1),
	          binary: true
	        }).then(function (blob) {
	          if (opts.binary) {
	            return blob;
	          }
	          return new PouchPromise(function (resolve) {
	            blobToBase64(blob, resolve);
	          });
	        }).then(function (data) {
	          delete att.stub;
	          delete att.length;
	          att.data = data;
	        });
	      }

	      var promiseFactories = filenames.map(function (filename) {
	        return function () {
	          return fetch(filename);
	        };
	      });

	      // This limits the number of parallel xhr requests to 5 any time
	      // to avoid issues with maximum browser request limits
	      return pool(promiseFactories, 5);
	    }

	    function fetchAllAttachments(docOrDocs) {
	      if (Array.isArray(docOrDocs)) {
	        return PouchPromise.all(docOrDocs.map(function (doc) {
	          if (doc.ok) {
	            return fetchAttachments(doc.ok);
	          }
	        }));
	      }
	      return fetchAttachments(docOrDocs);
	    }

	    ajaxPromise(opts, options).then(function (res$$1) {
	      return PouchPromise.resolve().then(function () {
	        if (opts.attachments) {
	          return fetchAllAttachments(res$$1);
	        }
	      }).then(function () {
	        callback(null, res$$1);
	      });
	    }).catch(function (e) {
	      e.docId = id;
	      callback(e);
	    });
	  });

	  // Delete the document given by doc from the database given by host.
	  api.remove = adapterFun$$1('remove',
	      function (docOrId, optsOrRev, opts, callback) {
	    var doc;
	    if (typeof optsOrRev === 'string') {
	      // id, rev, opts, callback style
	      doc = {
	        _id: docOrId,
	        _rev: optsOrRev
	      };
	      if (typeof opts === 'function') {
	        callback = opts;
	        opts = {};
	      }
	    } else {
	      // doc, opts, callback style
	      doc = docOrId;
	      if (typeof optsOrRev === 'function') {
	        callback = optsOrRev;
	        opts = {};
	      } else {
	        callback = opts;
	        opts = optsOrRev;
	      }
	    }

	    var rev$$1 = (doc._rev || opts.rev);

	    // Delete the document
	    ajax$$1(opts, {
	      method: 'DELETE',
	      url: genDBUrl(host, encodeDocId(doc._id)) + '?rev=' + rev$$1
	    }, callback);
	  });

	  function encodeAttachmentId(attachmentId) {
	    return attachmentId.split("/").map(encodeURIComponent).join("/");
	  }

	  // Get the attachment
	  api.getAttachment =
	    adapterFun$$1('getAttachment', function (docId, attachmentId, opts,
	                                                callback) {
	    if (typeof opts === 'function') {
	      callback = opts;
	      opts = {};
	    }
	    var params = opts.rev ? ('?rev=' + opts.rev) : '';
	    var url = genDBUrl(host, encodeDocId(docId)) + '/' +
	      encodeAttachmentId(attachmentId) + params;
	    ajax$$1(opts, {
	      method: 'GET',
	      url: url,
	      binary: true
	    }, callback);
	  });

	  // Remove the attachment given by the id and rev
	  api.removeAttachment =
	    adapterFun$$1('removeAttachment', function (docId, attachmentId, rev$$1,
	                                                   callback) {

	    var url = genDBUrl(host, encodeDocId(docId) + '/' +
	      encodeAttachmentId(attachmentId)) + '?rev=' + rev$$1;

	    ajax$$1({}, {
	      method: 'DELETE',
	      url: url
	    }, callback);
	  });

	  // Add the attachment given by blob and its contentType property
	  // to the document with the given id, the revision given by rev, and
	  // add it to the database given by host.
	  api.putAttachment =
	    adapterFun$$1('putAttachment', function (docId, attachmentId, rev$$1, blob,
	                                                type, callback) {
	    if (typeof type === 'function') {
	      callback = type;
	      type = blob;
	      blob = rev$$1;
	      rev$$1 = null;
	    }
	    var id = encodeDocId(docId) + '/' + encodeAttachmentId(attachmentId);
	    var url = genDBUrl(host, id);
	    if (rev$$1) {
	      url += '?rev=' + rev$$1;
	    }

	    if (typeof blob === 'string') {
	      // input is assumed to be a base64 string
	      var binary;
	      try {
	        binary = thisAtob(blob);
	      } catch (err) {
	        return callback(createError$2(BAD_ARG,
	                        'Attachment is not a valid base64 string'));
	      }
	      blob = binary ? binStringToBluffer(binary, type) : '';
	    }

	    var opts = {
	      headers: {'Content-Type': type},
	      method: 'PUT',
	      url: url,
	      processData: false,
	      body: blob,
	      timeout: ajaxOpts.timeout || 60000
	    };
	    // Add the attachment
	    ajax$$1({}, opts, callback);
	  });

	  // Update/create multiple documents given by req in the database
	  // given by host.
	  api._bulkDocs = function (req, opts, callback) {
	    // If new_edits=false then it prevents the database from creating
	    // new revision numbers for the documents. Instead it just uses
	    // the old ones. This is used in database replication.
	    req.new_edits = opts.new_edits;

	    setup().then(function () {
	      return PouchPromise.all(req.docs.map(preprocessAttachments$2));
	    }).then(function () {
	      // Update/create the documents
	      ajax$$1(opts, {
	        method: 'POST',
	        url: genDBUrl(host, '_bulk_docs'),
	        timeout: opts.timeout,
	        body: req
	      }, function (err, results) {
	        if (err) {
	          return callback(err);
	        }
	        results.forEach(function (result) {
	          result.ok = true; // smooths out cloudant not adding this
	        });
	        callback(null, results);
	      });
	    }).catch(callback);
	  };


	  // Update/create document
	  api._put = function (doc, opts, callback) {
	    setup().then(function () {
	      return preprocessAttachments$2(doc);
	    }).then(function () {
	      // Update/create the document
	      ajax$$1(opts, {
	        method: 'PUT',
	        url: genDBUrl(host, encodeDocId(doc._id)),
	        body: doc
	      }, function (err, result) {
	        if (err) {
	          err.docId = doc && doc._id;
	          return callback(err);
	        }
	        callback(null, result);
	      });
	    }).catch(callback);
	  };


	  // Get a listing of the documents in the database given
	  // by host and ordered by increasing id.
	  api.allDocs = adapterFun$$1('allDocs', function (opts, callback) {
	    if (typeof opts === 'function') {
	      callback = opts;
	      opts = {};
	    }
	    opts = clone(opts);

	    // List of parameters to add to the GET request
	    var params = {};
	    var body;
	    var method = 'GET';

	    if (opts.conflicts) {
	      params.conflicts = true;
	    }

	    /* istanbul ignore if */
	    if (opts.update_seq) {
	      params.update_seq = true;
	    }

	    if (opts.descending) {
	      params.descending = true;
	    }

	    if (opts.include_docs) {
	      params.include_docs = true;
	    }

	    // added in CouchDB 1.6.0
	    if (opts.attachments) {
	      params.attachments = true;
	    }

	    if (opts.key) {
	      params.key = JSON.stringify(opts.key);
	    }

	    if (opts.start_key) {
	      opts.startkey = opts.start_key;
	    }

	    if (opts.startkey) {
	      params.startkey = JSON.stringify(opts.startkey);
	    }

	    if (opts.end_key) {
	      opts.endkey = opts.end_key;
	    }

	    if (opts.endkey) {
	      params.endkey = JSON.stringify(opts.endkey);
	    }

	    if (typeof opts.inclusive_end !== 'undefined') {
	      params.inclusive_end = !!opts.inclusive_end;
	    }

	    if (typeof opts.limit !== 'undefined') {
	      params.limit = opts.limit;
	    }

	    if (typeof opts.skip !== 'undefined') {
	      params.skip = opts.skip;
	    }

	    var paramStr = paramsToStr(params);

	    if (typeof opts.keys !== 'undefined') {
	      method = 'POST';
	      body = {keys: opts.keys};
	    }

	    // Get the document listing
	    ajaxPromise(opts, {
	      method: method,
	      url: genDBUrl(host, '_all_docs' + paramStr),
	      body: body
	    }).then(function (res$$1) {
	      if (opts.include_docs && opts.attachments && opts.binary) {
	        res$$1.rows.forEach(readAttachmentsAsBlobOrBuffer);
	      }
	      callback(null, res$$1);
	    }).catch(callback);
	  });

	  // Get a list of changes made to documents in the database given by host.
	  // TODO According to the README, there should be two other methods here,
	  // api.changes.addListener and api.changes.removeListener.
	  api._changes = function (opts) {

	    // We internally page the results of a changes request, this means
	    // if there is a large set of changes to be returned we can start
	    // processing them quicker instead of waiting on the entire
	    // set of changes to return and attempting to process them at once
	    var batchSize = 'batch_size' in opts ? opts.batch_size : CHANGES_BATCH_SIZE;

	    opts = clone(opts);

	    if (opts.continuous && !('heartbeat' in opts)) {
	      opts.heartbeat = DEFAULT_HEARTBEAT;
	    }

	    var requestTimeout = ('timeout' in opts) ? opts.timeout :
	      ('timeout' in ajaxOpts) ? ajaxOpts.timeout :
	      30 * 1000;

	    // ensure CHANGES_TIMEOUT_BUFFER applies
	    if ('timeout' in opts && opts.timeout &&
	      (requestTimeout - opts.timeout) < CHANGES_TIMEOUT_BUFFER) {
	        requestTimeout = opts.timeout + CHANGES_TIMEOUT_BUFFER;
	    }

	    if ('heartbeat' in opts && opts.heartbeat &&
	       (requestTimeout - opts.heartbeat) < CHANGES_TIMEOUT_BUFFER) {
	        requestTimeout = opts.heartbeat + CHANGES_TIMEOUT_BUFFER;
	    }

	    var params = {};
	    if ('timeout' in opts && opts.timeout) {
	      params.timeout = opts.timeout;
	    }

	    var limit = (typeof opts.limit !== 'undefined') ? opts.limit : false;
	    var returnDocs;
	    if ('return_docs' in opts) {
	      returnDocs = opts.return_docs;
	    } else if ('returnDocs' in opts) {
	      // TODO: Remove 'returnDocs' in favor of 'return_docs' in a future release
	      returnDocs = opts.returnDocs;
	    } else {
	      returnDocs = true;
	    }
	    //
	    var leftToFetch = limit;

	    if (opts.style) {
	      params.style = opts.style;
	    }

	    if (opts.include_docs || opts.filter && typeof opts.filter === 'function') {
	      params.include_docs = true;
	    }

	    if (opts.attachments) {
	      params.attachments = true;
	    }

	    if (opts.continuous) {
	      params.feed = 'longpoll';
	    }

	    if (opts.seq_interval) {
	      params.seq_interval = opts.seq_interval;
	    }

	    if (opts.conflicts) {
	      params.conflicts = true;
	    }

	    if (opts.descending) {
	      params.descending = true;
	    }
	    
	    /* istanbul ignore if */
	    if (opts.update_seq) {
	      params.update_seq = true;
	    }

	    if ('heartbeat' in opts) {
	      // If the heartbeat value is false, it disables the default heartbeat
	      if (opts.heartbeat) {
	        params.heartbeat = opts.heartbeat;
	      }
	    }

	    if (opts.filter && typeof opts.filter === 'string') {
	      params.filter = opts.filter;
	    }

	    if (opts.view && typeof opts.view === 'string') {
	      params.filter = '_view';
	      params.view = opts.view;
	    }

	    // If opts.query_params exists, pass it through to the changes request.
	    // These parameters may be used by the filter on the source database.
	    if (opts.query_params && typeof opts.query_params === 'object') {
	      for (var param_name in opts.query_params) {
	        /* istanbul ignore else */
	        if (opts.query_params.hasOwnProperty(param_name)) {
	          params[param_name] = opts.query_params[param_name];
	        }
	      }
	    }

	    var method = 'GET';
	    var body;

	    if (opts.doc_ids) {
	      // set this automagically for the user; it's annoying that couchdb
	      // requires both a "filter" and a "doc_ids" param.
	      params.filter = '_doc_ids';
	      method = 'POST';
	      body = {doc_ids: opts.doc_ids };
	    }
	    /* istanbul ignore next */
	    else if (opts.selector) {
	      // set this automagically for the user, similar to above
	      params.filter = '_selector';
	      method = 'POST';
	      body = {selector: opts.selector };
	    }

	    var xhr;
	    var lastFetchedSeq;

	    // Get all the changes starting wtih the one immediately after the
	    // sequence number given by since.
	    var fetch = function (since, callback) {
	      if (opts.aborted) {
	        return;
	      }
	      params.since = since;
	      // "since" can be any kind of json object in Coudant/CouchDB 2.x
	      /* istanbul ignore next */
	      if (typeof params.since === "object") {
	        params.since = JSON.stringify(params.since);
	      }

	      if (opts.descending) {
	        if (limit) {
	          params.limit = leftToFetch;
	        }
	      } else {
	        params.limit = (!limit || leftToFetch > batchSize) ?
	          batchSize : leftToFetch;
	      }

	      // Set the options for the ajax call
	      var xhrOpts = {
	        method: method,
	        url: genDBUrl(host, '_changes' + paramsToStr(params)),
	        timeout: requestTimeout,
	        body: body
	      };
	      lastFetchedSeq = since;

	      /* istanbul ignore if */
	      if (opts.aborted) {
	        return;
	      }

	      // Get the changes
	      setup().then(function () {
	        xhr = ajax$$1(opts, xhrOpts, callback);
	      }).catch(callback);
	    };

	    // If opts.since exists, get all the changes from the sequence
	    // number given by opts.since. Otherwise, get all the changes
	    // from the sequence number 0.
	    var results = {results: []};

	    var fetched = function (err, res$$1) {
	      if (opts.aborted) {
	        return;
	      }
	      var raw_results_length = 0;
	      // If the result of the ajax call (res) contains changes (res.results)
	      if (res$$1 && res$$1.results) {
	        raw_results_length = res$$1.results.length;
	        results.last_seq = res$$1.last_seq;
	        var pending = null;
	        var lastSeq = null;
	        // Attach 'pending' property if server supports it (CouchDB 2.0+)
	        /* istanbul ignore if */
	        if (typeof res$$1.pending === 'number') {
	          pending = res$$1.pending;
	        }
	        if (typeof results.last_seq === 'string' || typeof results.last_seq === 'number') {
	          lastSeq = results.last_seq;
	        }
	        // For each change
	        var req = {};
	        req.query = opts.query_params;
	        res$$1.results = res$$1.results.filter(function (c) {
	          leftToFetch--;
	          var ret = filterChange(opts)(c);
	          if (ret) {
	            if (opts.include_docs && opts.attachments && opts.binary) {
	              readAttachmentsAsBlobOrBuffer(c);
	            }
	            if (returnDocs) {
	              results.results.push(c);
	            }
	            opts.onChange(c, pending, lastSeq);
	          }
	          return ret;
	        });
	      } else if (err) {
	        // In case of an error, stop listening for changes and call
	        // opts.complete
	        opts.aborted = true;
	        opts.complete(err);
	        return;
	      }

	      // The changes feed may have timed out with no results
	      // if so reuse last update sequence
	      if (res$$1 && res$$1.last_seq) {
	        lastFetchedSeq = res$$1.last_seq;
	      }

	      var finished = (limit && leftToFetch <= 0) ||
	        (res$$1 && raw_results_length < batchSize) ||
	        (opts.descending);

	      if ((opts.continuous && !(limit && leftToFetch <= 0)) || !finished) {
	        // Queue a call to fetch again with the newest sequence number
	        nextTick$1(function () { fetch(lastFetchedSeq, fetched); });
	      } else {
	        // We're done, call the callback
	        opts.complete(null, results);
	      }
	    };

	    fetch(opts.since || 0, fetched);

	    // Return a method to cancel this method from processing any more
	    return {
	      cancel: function () {
	        opts.aborted = true;
	        if (xhr) {
	          xhr.abort();
	        }
	      }
	    };
	  };

	  // Given a set of document/revision IDs (given by req), tets the subset of
	  // those that do NOT correspond to revisions stored in the database.
	  // See http://wiki.apache.org/couchdb/HttpPostRevsDiff
	  api.revsDiff = adapterFun$$1('revsDiff', function (req, opts, callback) {
	    // If no options were given, set the callback to be the second parameter
	    if (typeof opts === 'function') {
	      callback = opts;
	      opts = {};
	    }

	    // Get the missing document/revision IDs
	    ajax$$1(opts, {
	      method: 'POST',
	      url: genDBUrl(host, '_revs_diff'),
	      body: req
	    }, callback);
	  });

	  api._close = function (callback) {
	    callback();
	  };

	  api._destroy = function (options, callback) {
	    ajax$$1(options, {
	      url: genDBUrl(host, ''),
	      method: 'DELETE'
	    }, function (err, resp) {
	      if (err && err.status && err.status !== 404) {
	        return callback(err);
	      }
	      callback(null, resp);
	    });
	  };
	}

	// HttpPouch is a valid adapter.
	HttpPouch.valid = function () {
	  return true;
	};

	function HttpPouch$1 (PouchDB) {
	  PouchDB.adapter('http', HttpPouch, false);
	  PouchDB.adapter('https', HttpPouch, false);
	}

	function QueryParseError(message) {
	  this.status = 400;
	  this.name = 'query_parse_error';
	  this.message = message;
	  this.error = true;
	  try {
	    Error.captureStackTrace(this, QueryParseError);
	  } catch (e) {}
	}

	inherits(QueryParseError, Error);

	function NotFoundError$2$1(message) {
	  this.status = 404;
	  this.name = 'not_found';
	  this.message = message;
	  this.error = true;
	  try {
	    Error.captureStackTrace(this, NotFoundError$2$1);
	  } catch (e) {}
	}

	inherits(NotFoundError$2$1, Error);

	function BuiltInError(message) {
	  this.status = 500;
	  this.name = 'invalid_value';
	  this.message = message;
	  this.error = true;
	  try {
	    Error.captureStackTrace(this, BuiltInError);
	  } catch (e) {}
	}

	inherits(BuiltInError, Error);

	function promisedCallback(promise, callback) {
	  if (callback) {
	    promise.then(function (res$$1) {
	      nextTick$1(function () {
	        callback(null, res$$1);
	      });
	    }, function (reason) {
	      nextTick$1(function () {
	        callback(reason);
	      });
	    });
	  }
	  return promise;
	}

	function callbackify(fun) {
	  return argsarray(function (args) {
	    var cb = args.pop();
	    var promise = fun.apply(this, args);
	    if (typeof cb === 'function') {
	      promisedCallback(promise, cb);
	    }
	    return promise;
	  });
	}

	// Promise finally util similar to Q.finally
	function fin(promise, finalPromiseFactory) {
	  return promise.then(function (res$$1) {
	    return finalPromiseFactory().then(function () {
	      return res$$1;
	    });
	  }, function (reason) {
	    return finalPromiseFactory().then(function () {
	      throw reason;
	    });
	  });
	}

	function sequentialize(queue, promiseFactory) {
	  return function () {
	    var args = arguments;
	    var that = this;
	    return queue.add(function () {
	      return promiseFactory.apply(that, args);
	    });
	  };
	}

	// uniq an array of strings, order not guaranteed
	// similar to underscore/lodash _.uniq
	function uniq(arr) {
	  var theSet = new ExportedSet(arr);
	  var result = new Array(theSet.size);
	  var index = -1;
	  theSet.forEach(function (value) {
	    result[++index] = value;
	  });
	  return result;
	}

	function mapToKeysArray(map) {
	  var result = new Array(map.size);
	  var index = -1;
	  map.forEach(function (value, key) {
	    result[++index] = key;
	  });
	  return result;
	}

	function createBuiltInError(name) {
	  var message = 'builtin ' + name +
	    ' function requires map values to be numbers' +
	    ' or number arrays';
	  return new BuiltInError(message);
	}

	function sum(values) {
	  var result = 0;
	  for (var i = 0, len = values.length; i < len; i++) {
	    var num = values[i];
	    if (typeof num !== 'number') {
	      if (Array.isArray(num)) {
	        // lists of numbers are also allowed, sum them separately
	        result = typeof result === 'number' ? [result] : result;
	        for (var j = 0, jLen = num.length; j < jLen; j++) {
	          var jNum = num[j];
	          if (typeof jNum !== 'number') {
	            throw createBuiltInError('_sum');
	          } else if (typeof result[j] === 'undefined') {
	            result.push(jNum);
	          } else {
	            result[j] += jNum;
	          }
	        }
	      } else { // not array/number
	        throw createBuiltInError('_sum');
	      }
	    } else if (typeof result === 'number') {
	      result += num;
	    } else { // add number to array
	      result[0] += num;
	    }
	  }
	  return result;
	}

	// Inside of 'vm' for Node, we need a way to translate a pseudo-error
	// back into a real error once it's out of the VM.
	function createBuiltInErrorInVm(name) {
	  return {
	    builtInError: true,
	    name: name
	  };
	}

	function convertToTrueError(err) {
	  return createBuiltInError(err.name);
	}

	function isBuiltInError(obj$$1) {
	  return obj$$1 && obj$$1.builtInError;
	}

	// All of this vm hullaballoo is to be able to run arbitrary code in a sandbox
	// for security reasons.
	function evalFunctionInVm(func, emit) {
	  return function (arg1, arg2, arg3) {
	    var code = '(function() {"use strict";' +
	      'var createBuiltInError = ' + createBuiltInErrorInVm.toString() + ';' +
	      'var sum = ' + sum.toString() + ';' +
	      'var log = function () {};' +
	      'var isArray = Array.isArray;' +
	      'var toJSON = JSON.parse;' +
	      'var __emitteds__ = [];' +
	      'var emit = function (key, value) {__emitteds__.push([key, value]);};' +
	      'var __result__ = (' +
	      func.replace(/;\s*$/, '') + ')' + '(' +
	      JSON.stringify(arg1) + ',' +
	      JSON.stringify(arg2) + ',' +
	      JSON.stringify(arg3) + ');' +
	      'return {result: __result__, emitteds: __emitteds__};' +
	      '})()';

	    var output = vm.runInNewContext(code);

	    output.emitteds.forEach(function (emitted) {
	      emit(emitted[0], emitted[1]);
	    });
	    if (isBuiltInError(output.result)) {
	      output.result = convertToTrueError(output.result);
	    }
	    return output.result;
	  };
	}

	var log = guardedConsole.bind(null, 'log');
	var toJSON = JSON.parse;

	// The "stringify, then execute in a VM" strategy totally breaks Istanbul due
	// to missing __coverage global objects. As a solution, export different
	// code during coverage testing and during regular execution.
	// Note that this doesn't get shipped to consumers because Rollup replaces it
	// with rollup-plugin-replace, so false is replaced with `false`
	var evalFunc;
	/* istanbul ignore else */
	{
	  evalFunc = evalFunctionInVm;
	}

	var evalFunction = evalFunc;

	/*
	 * Simple task queue to sequentialize actions. Assumes
	 * callbacks will eventually fire (once).
	 */


	function TaskQueue$2() {
	  this.promise = new PouchPromise(function (fulfill) {fulfill(); });
	}
	TaskQueue$2.prototype.add = function (promiseFactory) {
	  this.promise = this.promise.catch(function () {
	    // just recover
	  }).then(function () {
	    return promiseFactory();
	  });
	  return this.promise;
	};
	TaskQueue$2.prototype.finish = function () {
	  return this.promise;
	};

	function stringify$1(input) {
	  if (!input) {
	    return 'undefined'; // backwards compat for empty reduce
	  }
	  // for backwards compat with mapreduce, functions/strings are stringified
	  // as-is. everything else is JSON-stringified.
	  switch (typeof input) {
	    case 'function':
	      // e.g. a mapreduce map
	      return input.toString();
	    case 'string':
	      // e.g. a mapreduce built-in _reduce function
	      return input.toString();
	    default:
	      // e.g. a JSON object in the case of mango queries
	      return JSON.stringify(input);
	  }
	}

	/* create a string signature for a view so we can cache it and uniq it */
	function createViewSignature(mapFun, reduceFun) {
	  // the "undefined" part is for backwards compatibility
	  return stringify$1(mapFun) + stringify$1(reduceFun) + 'undefined';
	}

	function createView(sourceDB, viewName, mapFun, reduceFun, temporary, localDocName) {
	  var viewSignature = createViewSignature(mapFun, reduceFun);

	  var cachedViews;
	  if (!temporary) {
	    // cache this to ensure we don't try to update the same view twice
	    cachedViews = sourceDB._cachedViews = sourceDB._cachedViews || {};
	    if (cachedViews[viewSignature]) {
	      return cachedViews[viewSignature];
	    }
	  }

	  var promiseForView = sourceDB.info().then(function (info) {

	    var depDbName = info.db_name + '-mrview-' +
	      (temporary ? 'temp' : stringMd5(viewSignature));

	    // save the view name in the source db so it can be cleaned up if necessary
	    // (e.g. when the _design doc is deleted, remove all associated view data)
	    function diffFunction(doc) {
	      doc.views = doc.views || {};
	      var fullViewName = viewName;
	      if (fullViewName.indexOf('/') === -1) {
	        fullViewName = viewName + '/' + viewName;
	      }
	      var depDbs = doc.views[fullViewName] = doc.views[fullViewName] || {};
	      /* istanbul ignore if */
	      if (depDbs[depDbName]) {
	        return; // no update necessary
	      }
	      depDbs[depDbName] = true;
	      return doc;
	    }
	    return upsert(sourceDB, '_local/' + localDocName, diffFunction).then(function () {
	      return sourceDB.registerDependentDatabase(depDbName).then(function (res$$1) {
	        var db = res$$1.db;
	        db.auto_compaction = true;
	        var view = {
	          name: depDbName,
	          db: db,
	          sourceDB: sourceDB,
	          adapter: sourceDB.adapter,
	          mapFun: mapFun,
	          reduceFun: reduceFun
	        };
	        return view.db.get('_local/lastSeq').catch(function (err) {
	          /* istanbul ignore if */
	          if (err.status !== 404) {
	            throw err;
	          }
	        }).then(function (lastSeqDoc) {
	          view.seq = lastSeqDoc ? lastSeqDoc.seq : 0;
	          if (cachedViews) {
	            view.db.once('destroyed', function () {
	              delete cachedViews[viewSignature];
	            });
	          }
	          return view;
	        });
	      });
	    });
	  });

	  if (cachedViews) {
	    cachedViews[viewSignature] = promiseForView;
	  }
	  return promiseForView;
	}

	var persistentQueues = {};
	var tempViewQueue = new TaskQueue$2();
	var CHANGES_BATCH_SIZE$1 = 50;

	function parseViewName(name) {
	  // can be either 'ddocname/viewname' or just 'viewname'
	  // (where the ddoc name is the same)
	  return name.indexOf('/') === -1 ? [name, name] : name.split('/');
	}

	function isGenOne(changes) {
	  // only return true if the current change is 1-
	  // and there are no other leafs
	  return changes.length === 1 && /^1-/.test(changes[0].rev);
	}

	function emitError(db, e) {
	  try {
	    db.emit('error', e);
	  } catch (err) {
	    guardedConsole('error',
	      'The user\'s map/reduce function threw an uncaught error.\n' +
	      'You can debug this error by doing:\n' +
	      'myDatabase.on(\'error\', function (err) { debugger; });\n' +
	      'Please double-check your map/reduce function.');
	    guardedConsole('error', e);
	  }
	}

	/**
	 * Returns an "abstract" mapreduce object of the form:
	 *
	 *   {
	 *     query: queryFun,
	 *     viewCleanup: viewCleanupFun
	 *   }
	 *
	 * Arguments are:
	 *
	 * localDoc: string
	 *   This is for the local doc that gets saved in order to track the
	 *   "dependent" DBs and clean them up for viewCleanup. It should be
	 *   unique, so that indexer plugins don't collide with each other.
	 * mapper: function (mapFunDef, emit)
	 *   Returns a map function based on the mapFunDef, which in the case of
	 *   normal map/reduce is just the de-stringified function, but may be
	 *   something else, such as an object in the case of pouchdb-find.
	 * reducer: function (reduceFunDef)
	 *   Ditto, but for reducing. Modules don't have to support reducing
	 *   (e.g. pouchdb-find).
	 * ddocValidator: function (ddoc, viewName)
	 *   Throws an error if the ddoc or viewName is not valid.
	 *   This could be a way to communicate to the user that the configuration for the
	 *   indexer is invalid.
	 */
	function createAbstractMapReduce(localDocName, mapper, reducer, ddocValidator) {

	  function tryMap(db, fun, doc) {
	    // emit an event if there was an error thrown by a map function.
	    // putting try/catches in a single function also avoids deoptimizations.
	    try {
	      fun(doc);
	    } catch (e) {
	      emitError(db, e);
	    }
	  }

	  function tryReduce(db, fun, keys, values, rereduce) {
	    // same as above, but returning the result or an error. there are two separate
	    // functions to avoid extra memory allocations since the tryCode() case is used
	    // for custom map functions (common) vs this function, which is only used for
	    // custom reduce functions (rare)
	    try {
	      return {output : fun(keys, values, rereduce)};
	    } catch (e) {
	      emitError(db, e);
	      return {error: e};
	    }
	  }

	  function sortByKeyThenValue(x, y) {
	    var keyCompare = collate(x.key, y.key);
	    return keyCompare !== 0 ? keyCompare : collate(x.value, y.value);
	  }

	  function sliceResults(results, limit, skip) {
	    skip = skip || 0;
	    if (typeof limit === 'number') {
	      return results.slice(skip, limit + skip);
	    } else if (skip > 0) {
	      return results.slice(skip);
	    }
	    return results;
	  }

	  function rowToDocId(row) {
	    var val = row.value;
	    // Users can explicitly specify a joined doc _id, or it
	    // defaults to the doc _id that emitted the key/value.
	    var docId = (val && typeof val === 'object' && val._id) || row.id;
	    return docId;
	  }

	  function readAttachmentsAsBlobOrBuffer(res$$1) {
	    res$$1.rows.forEach(function (row) {
	      var atts = row.doc && row.doc._attachments;
	      if (!atts) {
	        return;
	      }
	      Object.keys(atts).forEach(function (filename) {
	        var att = atts[filename];
	        atts[filename].data = b64ToBluffer(att.data, att.content_type);
	      });
	    });
	  }

	  function postprocessAttachments(opts) {
	    return function (res$$1) {
	      if (opts.include_docs && opts.attachments && opts.binary) {
	        readAttachmentsAsBlobOrBuffer(res$$1);
	      }
	      return res$$1;
	    };
	  }

	  function addHttpParam(paramName, opts, params, asJson) {
	    // add an http param from opts to params, optionally json-encoded
	    var val = opts[paramName];
	    if (typeof val !== 'undefined') {
	      if (asJson) {
	        val = encodeURIComponent(JSON.stringify(val));
	      }
	      params.push(paramName + '=' + val);
	    }
	  }

	  function coerceInteger(integerCandidate) {
	    if (typeof integerCandidate !== 'undefined') {
	      var asNumber = Number(integerCandidate);
	      // prevents e.g. '1foo' or '1.1' being coerced to 1
	      if (!isNaN(asNumber) && asNumber === parseInt(integerCandidate, 10)) {
	        return asNumber;
	      } else {
	        return integerCandidate;
	      }
	    }
	  }

	  function coerceOptions(opts) {
	    opts.group_level = coerceInteger(opts.group_level);
	    opts.limit = coerceInteger(opts.limit);
	    opts.skip = coerceInteger(opts.skip);
	    return opts;
	  }

	  function checkPositiveInteger(number) {
	    if (number) {
	      if (typeof number !== 'number') {
	        return  new QueryParseError('Invalid value for integer: "' +
	          number + '"');
	      }
	      if (number < 0) {
	        return new QueryParseError('Invalid value for positive integer: ' +
	          '"' + number + '"');
	      }
	    }
	  }

	  function checkQueryParseError(options, fun) {
	    var startkeyName = options.descending ? 'endkey' : 'startkey';
	    var endkeyName = options.descending ? 'startkey' : 'endkey';

	    if (typeof options[startkeyName] !== 'undefined' &&
	      typeof options[endkeyName] !== 'undefined' &&
	      collate(options[startkeyName], options[endkeyName]) > 0) {
	      throw new QueryParseError('No rows can match your key range, ' +
	        'reverse your start_key and end_key or set {descending : true}');
	    } else if (fun.reduce && options.reduce !== false) {
	      if (options.include_docs) {
	        throw new QueryParseError('{include_docs:true} is invalid for reduce');
	      } else if (options.keys && options.keys.length > 1 &&
	        !options.group && !options.group_level) {
	        throw new QueryParseError('Multi-key fetches for reduce views must use ' +
	          '{group: true}');
	      }
	    }
	    ['group_level', 'limit', 'skip'].forEach(function (optionName) {
	      var error = checkPositiveInteger(options[optionName]);
	      if (error) {
	        throw error;
	      }
	    });
	  }

	  function httpQuery(db, fun, opts) {
	    // List of parameters to add to the PUT request
	    var params = [];
	    var body;
	    var method = 'GET';

	    // If opts.reduce exists and is defined, then add it to the list
	    // of parameters.
	    // If reduce=false then the results are that of only the map function
	    // not the final result of map and reduce.
	    addHttpParam('reduce', opts, params);
	    addHttpParam('include_docs', opts, params);
	    addHttpParam('attachments', opts, params);
	    addHttpParam('limit', opts, params);
	    addHttpParam('descending', opts, params);
	    addHttpParam('group', opts, params);
	    addHttpParam('group_level', opts, params);
	    addHttpParam('skip', opts, params);
	    addHttpParam('stale', opts, params);
	    addHttpParam('conflicts', opts, params);
	    addHttpParam('startkey', opts, params, true);
	    addHttpParam('start_key', opts, params, true);
	    addHttpParam('endkey', opts, params, true);
	    addHttpParam('end_key', opts, params, true);
	    addHttpParam('inclusive_end', opts, params);
	    addHttpParam('key', opts, params, true);
	    addHttpParam('update_seq', opts, params);

	    // Format the list of parameters into a valid URI query string
	    params = params.join('&');
	    params = params === '' ? '' : '?' + params;

	    // If keys are supplied, issue a POST to circumvent GET query string limits
	    // see http://wiki.apache.org/couchdb/HTTP_view_API#Querying_Options
	    if (typeof opts.keys !== 'undefined') {
	      var MAX_URL_LENGTH = 2000;
	      // according to http://stackoverflow.com/a/417184/680742,
	      // the de facto URL length limit is 2000 characters

	      var keysAsString =
	        'keys=' + encodeURIComponent(JSON.stringify(opts.keys));
	      if (keysAsString.length + params.length + 1 <= MAX_URL_LENGTH) {
	        // If the keys are short enough, do a GET. we do this to work around
	        // Safari not understanding 304s on POSTs (see pouchdb/pouchdb#1239)
	        params += (params[0] === '?' ? '&' : '?') + keysAsString;
	      } else {
	        method = 'POST';
	        if (typeof fun === 'string') {
	          body = {keys: opts.keys};
	        } else { // fun is {map : mapfun}, so append to this
	          fun.keys = opts.keys;
	        }
	      }
	    }

	    // We are referencing a query defined in the design doc
	    if (typeof fun === 'string') {
	      var parts = parseViewName(fun);
	      return db.request({
	        method: method,
	        url: '_design/' + parts[0] + '/_view/' + parts[1] + params,
	        body: body
	      }).then(
	        /* istanbul ignore next */
	        function (result) {
	          // fail the entire request if the result contains an error
	          result.rows.forEach(function (row) {
	            if (row.value && row.value.error && row.value.error === "builtin_reduce_error") {
	              throw new Error(row.reason);
	            }
	          });

	          return result;
	      })
	      .then(postprocessAttachments(opts));
	    }

	    // We are using a temporary view, terrible for performance, good for testing
	    body = body || {};
	    Object.keys(fun).forEach(function (key) {
	      if (Array.isArray(fun[key])) {
	        body[key] = fun[key];
	      } else {
	        body[key] = fun[key].toString();
	      }
	    });
	    return db.request({
	      method: 'POST',
	      url: '_temp_view' + params,
	      body: body
	    }).then(postprocessAttachments(opts));
	  }

	  // custom adapters can define their own api._query
	  // and override the default behavior
	  /* istanbul ignore next */
	  function customQuery(db, fun, opts) {
	    return new PouchPromise(function (resolve, reject) {
	      db._query(fun, opts, function (err, res$$1) {
	        if (err) {
	          return reject(err);
	        }
	        resolve(res$$1);
	      });
	    });
	  }

	  // custom adapters can define their own api._viewCleanup
	  // and override the default behavior
	  /* istanbul ignore next */
	  function customViewCleanup(db) {
	    return new PouchPromise(function (resolve, reject) {
	      db._viewCleanup(function (err, res$$1) {
	        if (err) {
	          return reject(err);
	        }
	        resolve(res$$1);
	      });
	    });
	  }

	  function defaultsTo(value) {
	    return function (reason) {
	      /* istanbul ignore else */
	      if (reason.status === 404) {
	        return value;
	      } else {
	        throw reason;
	      }
	    };
	  }

	  // returns a promise for a list of docs to update, based on the input docId.
	  // the order doesn't matter, because post-3.2.0, bulkDocs
	  // is an atomic operation in all three adapters.
	  function getDocsToPersist(docId, view, docIdsToChangesAndEmits) {
	    var metaDocId = '_local/doc_' + docId;
	    var defaultMetaDoc = {_id: metaDocId, keys: []};
	    var docData = docIdsToChangesAndEmits.get(docId);
	    var indexableKeysToKeyValues = docData[0];
	    var changes = docData[1];

	    function getMetaDoc() {
	      if (isGenOne(changes)) {
	        // generation 1, so we can safely assume initial state
	        // for performance reasons (avoids unnecessary GETs)
	        return PouchPromise.resolve(defaultMetaDoc);
	      }
	      return view.db.get(metaDocId).catch(defaultsTo(defaultMetaDoc));
	    }

	    function getKeyValueDocs(metaDoc) {
	      if (!metaDoc.keys.length) {
	        // no keys, no need for a lookup
	        return PouchPromise.resolve({rows: []});
	      }
	      return view.db.allDocs({
	        keys: metaDoc.keys,
	        include_docs: true
	      });
	    }

	    function processKeyValueDocs(metaDoc, kvDocsRes) {
	      var kvDocs = [];
	      var oldKeys = new ExportedSet();

	      for (var i = 0, len = kvDocsRes.rows.length; i < len; i++) {
	        var row = kvDocsRes.rows[i];
	        var doc = row.doc;
	        if (!doc) { // deleted
	          continue;
	        }
	        kvDocs.push(doc);
	        oldKeys.add(doc._id);
	        doc._deleted = !indexableKeysToKeyValues.has(doc._id);
	        if (!doc._deleted) {
	          var keyValue = indexableKeysToKeyValues.get(doc._id);
	          if ('value' in keyValue) {
	            doc.value = keyValue.value;
	          }
	        }
	      }
	      var newKeys = mapToKeysArray(indexableKeysToKeyValues);
	      newKeys.forEach(function (key) {
	        if (!oldKeys.has(key)) {
	          // new doc
	          var kvDoc = {
	            _id: key
	          };
	          var keyValue = indexableKeysToKeyValues.get(key);
	          if ('value' in keyValue) {
	            kvDoc.value = keyValue.value;
	          }
	          kvDocs.push(kvDoc);
	        }
	      });
	      metaDoc.keys = uniq(newKeys.concat(metaDoc.keys));
	      kvDocs.push(metaDoc);

	      return kvDocs;
	    }

	    return getMetaDoc().then(function (metaDoc) {
	      return getKeyValueDocs(metaDoc).then(function (kvDocsRes) {
	        return processKeyValueDocs(metaDoc, kvDocsRes);
	      });
	    });
	  }

	  // updates all emitted key/value docs and metaDocs in the mrview database
	  // for the given batch of documents from the source database
	  function saveKeyValues(view, docIdsToChangesAndEmits, seq) {
	    var seqDocId = '_local/lastSeq';
	    return view.db.get(seqDocId)
	      .catch(defaultsTo({_id: seqDocId, seq: 0}))
	      .then(function (lastSeqDoc) {
	        var docIds = mapToKeysArray(docIdsToChangesAndEmits);
	        return PouchPromise.all(docIds.map(function (docId) {
	          return getDocsToPersist(docId, view, docIdsToChangesAndEmits);
	        })).then(function (listOfDocsToPersist) {
	          var docsToPersist = flatten(listOfDocsToPersist);
	          lastSeqDoc.seq = seq;
	          docsToPersist.push(lastSeqDoc);
	          // write all docs in a single operation, update the seq once
	          return view.db.bulkDocs({docs : docsToPersist});
	        });
	      });
	  }

	  function getQueue(view) {
	    var viewName = typeof view === 'string' ? view : view.name;
	    var queue = persistentQueues[viewName];
	    if (!queue) {
	      queue = persistentQueues[viewName] = new TaskQueue$2();
	    }
	    return queue;
	  }

	  function updateView(view) {
	    return sequentialize(getQueue(view), function () {
	      return updateViewInQueue(view);
	    })();
	  }

	  function updateViewInQueue(view) {
	    // bind the emit function once
	    var mapResults;
	    var doc;

	    function emit(key, value) {
	      var output = {id: doc._id, key: normalizeKey(key)};
	      // Don't explicitly store the value unless it's defined and non-null.
	      // This saves on storage space, because often people don't use it.
	      if (typeof value !== 'undefined' && value !== null) {
	        output.value = normalizeKey(value);
	      }
	      mapResults.push(output);
	    }

	    var mapFun = mapper(view.mapFun, emit);

	    var currentSeq = view.seq || 0;

	    function processChange(docIdsToChangesAndEmits, seq) {
	      return function () {
	        return saveKeyValues(view, docIdsToChangesAndEmits, seq);
	      };
	    }

	    var queue = new TaskQueue$2();

	    function processNextBatch() {
	      return view.sourceDB.changes({
	        conflicts: true,
	        include_docs: true,
	        style: 'all_docs',
	        since: currentSeq,
	        limit: CHANGES_BATCH_SIZE$1
	      }).then(processBatch);
	    }

	    function processBatch(response) {
	      var results = response.results;
	      if (!results.length) {
	        return;
	      }
	      var docIdsToChangesAndEmits = createDocIdsToChangesAndEmits(results);
	      queue.add(processChange(docIdsToChangesAndEmits, currentSeq));
	      if (results.length < CHANGES_BATCH_SIZE$1) {
	        return;
	      }
	      return processNextBatch();
	    }

	    function createDocIdsToChangesAndEmits(results) {
	      var docIdsToChangesAndEmits = new ExportedMap();
	      for (var i = 0, len = results.length; i < len; i++) {
	        var change = results[i];
	        if (change.doc._id[0] !== '_') {
	          mapResults = [];
	          doc = change.doc;

	          if (!doc._deleted) {
	            tryMap(view.sourceDB, mapFun, doc);
	          }
	          mapResults.sort(sortByKeyThenValue);

	          var indexableKeysToKeyValues = createIndexableKeysToKeyValues(mapResults);
	          docIdsToChangesAndEmits.set(change.doc._id, [
	            indexableKeysToKeyValues,
	            change.changes
	          ]);
	        }
	        currentSeq = change.seq;
	      }
	      return docIdsToChangesAndEmits;
	    }

	    function createIndexableKeysToKeyValues(mapResults) {
	      var indexableKeysToKeyValues = new ExportedMap();
	      var lastKey;
	      for (var i = 0, len = mapResults.length; i < len; i++) {
	        var emittedKeyValue = mapResults[i];
	        var complexKey = [emittedKeyValue.key, emittedKeyValue.id];
	        if (i > 0 && collate(emittedKeyValue.key, lastKey) === 0) {
	          complexKey.push(i); // dup key+id, so make it unique
	        }
	        indexableKeysToKeyValues.set(toIndexableString(complexKey), emittedKeyValue);
	        lastKey = emittedKeyValue.key;
	      }
	      return indexableKeysToKeyValues;
	    }

	    return processNextBatch().then(function () {
	      return queue.finish();
	    }).then(function () {
	      view.seq = currentSeq;
	    });
	  }

	  function reduceView(view, results, options) {
	    if (options.group_level === 0) {
	      delete options.group_level;
	    }

	    var shouldGroup = options.group || options.group_level;

	    var reduceFun = reducer(view.reduceFun);

	    var groups = [];
	    var lvl = isNaN(options.group_level) ? Number.POSITIVE_INFINITY :
	      options.group_level;
	    results.forEach(function (e) {
	      var last = groups[groups.length - 1];
	      var groupKey = shouldGroup ? e.key : null;

	      // only set group_level for array keys
	      if (shouldGroup && Array.isArray(groupKey)) {
	        groupKey = groupKey.slice(0, lvl);
	      }

	      if (last && collate(last.groupKey, groupKey) === 0) {
	        last.keys.push([e.key, e.id]);
	        last.values.push(e.value);
	        return;
	      }
	      groups.push({
	        keys: [[e.key, e.id]],
	        values: [e.value],
	        groupKey: groupKey
	      });
	    });
	    results = [];
	    for (var i = 0, len = groups.length; i < len; i++) {
	      var e = groups[i];
	      var reduceTry = tryReduce(view.sourceDB, reduceFun, e.keys, e.values, false);
	      if (reduceTry.error && reduceTry.error instanceof BuiltInError) {
	        // CouchDB returns an error if a built-in errors out
	        throw reduceTry.error;
	      }
	      results.push({
	        // CouchDB just sets the value to null if a non-built-in errors out
	        value: reduceTry.error ? null : reduceTry.output,
	        key: e.groupKey
	      });
	    }
	    // no total_rows/offset when reducing
	    return {rows: sliceResults(results, options.limit, options.skip)};
	  }

	  function queryView(view, opts) {
	    return sequentialize(getQueue(view), function () {
	      return queryViewInQueue(view, opts);
	    })();
	  }

	  function queryViewInQueue(view, opts) {
	    var totalRows;
	    var shouldReduce = view.reduceFun && opts.reduce !== false;
	    var skip = opts.skip || 0;
	    if (typeof opts.keys !== 'undefined' && !opts.keys.length) {
	      // equivalent query
	      opts.limit = 0;
	      delete opts.keys;
	    }

	    function fetchFromView(viewOpts) {
	      viewOpts.include_docs = true;
	      return view.db.allDocs(viewOpts).then(function (res$$1) {
	        totalRows = res$$1.total_rows;
	        return res$$1.rows.map(function (result) {

	          // implicit migration - in older versions of PouchDB,
	          // we explicitly stored the doc as {id: ..., key: ..., value: ...}
	          // this is tested in a migration test
	          /* istanbul ignore next */
	          if ('value' in result.doc && typeof result.doc.value === 'object' &&
	            result.doc.value !== null) {
	            var keys = Object.keys(result.doc.value).sort();
	            // this detection method is not perfect, but it's unlikely the user
	            // emitted a value which was an object with these 3 exact keys
	            var expectedKeys = ['id', 'key', 'value'];
	            if (!(keys < expectedKeys || keys > expectedKeys)) {
	              return result.doc.value;
	            }
	          }

	          var parsedKeyAndDocId = parseIndexableString(result.doc._id);
	          return {
	            key: parsedKeyAndDocId[0],
	            id: parsedKeyAndDocId[1],
	            value: ('value' in result.doc ? result.doc.value : null)
	          };
	        });
	      });
	    }

	    function onMapResultsReady(rows) {
	      var finalResults;
	      if (shouldReduce) {
	        finalResults = reduceView(view, rows, opts);
	      } else {
	        finalResults = {
	          total_rows: totalRows,
	          offset: skip,
	          rows: rows
	        };
	      }
	      /* istanbul ignore if */
	      if (opts.update_seq) {
	        finalResults.update_seq = view.seq;
	      }
	      if (opts.include_docs) {
	        var docIds = uniq(rows.map(rowToDocId));

	        return view.sourceDB.allDocs({
	          keys: docIds,
	          include_docs: true,
	          conflicts: opts.conflicts,
	          attachments: opts.attachments,
	          binary: opts.binary
	        }).then(function (allDocsRes) {
	          var docIdsToDocs = new ExportedMap();
	          allDocsRes.rows.forEach(function (row) {
	            docIdsToDocs.set(row.id, row.doc);
	          });
	          rows.forEach(function (row) {
	            var docId = rowToDocId(row);
	            var doc = docIdsToDocs.get(docId);
	            if (doc) {
	              row.doc = doc;
	            }
	          });
	          return finalResults;
	        });
	      } else {
	        return finalResults;
	      }
	    }

	    if (typeof opts.keys !== 'undefined') {
	      var keys = opts.keys;
	      var fetchPromises = keys.map(function (key) {
	        var viewOpts = {
	          startkey : toIndexableString([key]),
	          endkey   : toIndexableString([key, {}])
	        };
	        /* istanbul ignore if */
	        if (opts.update_seq) {
	          viewOpts.update_seq = true;
	        }
	        return fetchFromView(viewOpts);
	      });
	      return PouchPromise.all(fetchPromises).then(flatten).then(onMapResultsReady);
	    } else { // normal query, no 'keys'
	      var viewOpts = {
	        descending : opts.descending
	      };
	      /* istanbul ignore if */
	      if (opts.update_seq) {
	        viewOpts.update_seq = true;
	      }
	      var startkey;
	      var endkey;
	      if ('start_key' in opts) {
	        startkey = opts.start_key;
	      }
	      if ('startkey' in opts) {
	        startkey = opts.startkey;
	      }
	      if ('end_key' in opts) {
	        endkey = opts.end_key;
	      }
	      if ('endkey' in opts) {
	        endkey = opts.endkey;
	      }
	      if (typeof startkey !== 'undefined') {
	        viewOpts.startkey = opts.descending ?
	          toIndexableString([startkey, {}]) :
	          toIndexableString([startkey]);
	      }
	      if (typeof endkey !== 'undefined') {
	        var inclusiveEnd = opts.inclusive_end !== false;
	        if (opts.descending) {
	          inclusiveEnd = !inclusiveEnd;
	        }

	        viewOpts.endkey = toIndexableString(
	          inclusiveEnd ? [endkey, {}] : [endkey]);
	      }
	      if (typeof opts.key !== 'undefined') {
	        var keyStart = toIndexableString([opts.key]);
	        var keyEnd = toIndexableString([opts.key, {}]);
	        if (viewOpts.descending) {
	          viewOpts.endkey = keyStart;
	          viewOpts.startkey = keyEnd;
	        } else {
	          viewOpts.startkey = keyStart;
	          viewOpts.endkey = keyEnd;
	        }
	      }
	      if (!shouldReduce) {
	        if (typeof opts.limit === 'number') {
	          viewOpts.limit = opts.limit;
	        }
	        viewOpts.skip = skip;
	      }
	      return fetchFromView(viewOpts).then(onMapResultsReady);
	    }
	  }

	  function httpViewCleanup(db) {
	    return db.request({
	      method: 'POST',
	      url: '_view_cleanup'
	    });
	  }

	  function localViewCleanup(db) {
	    return db.get('_local/' + localDocName).then(function (metaDoc) {
	      var docsToViews = new ExportedMap();
	      Object.keys(metaDoc.views).forEach(function (fullViewName) {
	        var parts = parseViewName(fullViewName);
	        var designDocName = '_design/' + parts[0];
	        var viewName = parts[1];
	        var views = docsToViews.get(designDocName);
	        if (!views) {
	          views = new ExportedSet();
	          docsToViews.set(designDocName, views);
	        }
	        views.add(viewName);
	      });
	      var opts = {
	        keys : mapToKeysArray(docsToViews),
	        include_docs : true
	      };
	      return db.allDocs(opts).then(function (res$$1) {
	        var viewsToStatus = {};
	        res$$1.rows.forEach(function (row) {
	          var ddocName = row.key.substring(8); // cuts off '_design/'
	          docsToViews.get(row.key).forEach(function (viewName) {
	            var fullViewName = ddocName + '/' + viewName;
	            /* istanbul ignore if */
	            if (!metaDoc.views[fullViewName]) {
	              // new format, without slashes, to support PouchDB 2.2.0
	              // migration test in pouchdb's browser.migration.js verifies this
	              fullViewName = viewName;
	            }
	            var viewDBNames = Object.keys(metaDoc.views[fullViewName]);
	            // design doc deleted, or view function nonexistent
	            var statusIsGood = row.doc && row.doc.views &&
	              row.doc.views[viewName];
	            viewDBNames.forEach(function (viewDBName) {
	              viewsToStatus[viewDBName] =
	                viewsToStatus[viewDBName] || statusIsGood;
	            });
	          });
	        });
	        var dbsToDelete = Object.keys(viewsToStatus).filter(
	          function (viewDBName) { return !viewsToStatus[viewDBName]; });
	        var destroyPromises = dbsToDelete.map(function (viewDBName) {
	          return sequentialize(getQueue(viewDBName), function () {
	            return new db.constructor(viewDBName, db.__opts).destroy();
	          })();
	        });
	        return PouchPromise.all(destroyPromises).then(function () {
	          return {ok: true};
	        });
	      });
	    }, defaultsTo({ok: true}));
	  }

	  function queryPromised(db, fun, opts) {
	    /* istanbul ignore next */
	    if (typeof db._query === 'function') {
	      return customQuery(db, fun, opts);
	    }
	    if (isRemote(db)) {
	      return httpQuery(db, fun, opts);
	    }
	    
	    if (typeof fun !== 'string') {
	      // temp_view
	      checkQueryParseError(opts, fun);

	      tempViewQueue.add(function () {
	        var createViewPromise = createView(
	          /* sourceDB */ db,
	          /* viewName */ 'temp_view/temp_view',
	          /* mapFun */ fun.map,
	          /* reduceFun */ fun.reduce,
	          /* temporary */ true,
	          /* localDocName */ localDocName);
	        return createViewPromise.then(function (view) {
	          return fin(updateView(view).then(function () {
	            return queryView(view, opts);
	          }), function () {
	            return view.db.destroy();
	          });
	        });
	      });
	      return tempViewQueue.finish();
	    } else {
	      // persistent view
	      var fullViewName = fun;
	      var parts = parseViewName(fullViewName);
	      var designDocName = parts[0];
	      var viewName = parts[1];
	      return db.get('_design/' + designDocName).then(function (doc) {
	        var fun = doc.views && doc.views[viewName];

	        if (!fun) {
	          // basic validator; it's assumed that every subclass would want this
	          throw new NotFoundError$2$1('ddoc ' + doc._id + ' has no view named ' +
	            viewName);
	        }

	        ddocValidator(doc, viewName);
	        checkQueryParseError(opts, fun);

	        var createViewPromise = createView(
	          /* sourceDB */ db,
	          /* viewName */ fullViewName,
	          /* mapFun */ fun.map,
	          /* reduceFun */ fun.reduce,
	          /* temporary */ false,
	          /* localDocName */ localDocName);
	        return createViewPromise.then(function (view) {
	          if (opts.stale === 'ok' || opts.stale === 'update_after') {
	            if (opts.stale === 'update_after') {
	              nextTick$1(function () {
	                updateView(view);
	              });
	            }
	            return queryView(view, opts);
	          } else { // stale not ok
	            return updateView(view).then(function () {
	              return queryView(view, opts);
	            });
	          }
	        });
	      });
	    }
	  }

	  function abstractQuery(fun, opts, callback) {
	    var db = this;
	    if (typeof opts === 'function') {
	      callback = opts;
	      opts = {};
	    }
	    opts = opts ? coerceOptions(opts) : {};

	    if (typeof fun === 'function') {
	      fun = {map : fun};
	    }

	    var promise = PouchPromise.resolve().then(function () {
	      return queryPromised(db, fun, opts);
	    });
	    promisedCallback(promise, callback);
	    return promise;
	  }

	  var abstractViewCleanup = callbackify(function () {
	    var db = this;
	    /* istanbul ignore next */
	    if (typeof db._viewCleanup === 'function') {
	      return customViewCleanup(db);
	    }
	    if (isRemote(db)) {
	      return httpViewCleanup(db);
	    }
	    return localViewCleanup(db);
	  });

	  return {
	    query: abstractQuery,
	    viewCleanup: abstractViewCleanup
	  };
	}

	var builtInReduce = {
	  _sum: function (keys, values) {
	    return sum(values);
	  },

	  _count: function (keys, values) {
	    return values.length;
	  },

	  _stats: function (keys, values) {
	    // no need to implement rereduce=true, because Pouch
	    // will never call it
	    function sumsqr(values) {
	      var _sumsqr = 0;
	      for (var i = 0, len = values.length; i < len; i++) {
	        var num = values[i];
	        _sumsqr += (num * num);
	      }
	      return _sumsqr;
	    }
	    return {
	      sum     : sum(values),
	      min     : Math.min.apply(null, values),
	      max     : Math.max.apply(null, values),
	      count   : values.length,
	      sumsqr : sumsqr(values)
	    };
	  }
	};

	function getBuiltIn(reduceFunString) {
	  if (/^_sum/.test(reduceFunString)) {
	    return builtInReduce._sum;
	  } else if (/^_count/.test(reduceFunString)) {
	    return builtInReduce._count;
	  } else if (/^_stats/.test(reduceFunString)) {
	    return builtInReduce._stats;
	  } else if (/^_/.test(reduceFunString)) {
	    throw new Error(reduceFunString + ' is not a supported reduce function.');
	  }
	}

	function mapper(mapFun, emit) {
	  // for temp_views one can use emit(doc, emit), see #38
	  if (typeof mapFun === "function" && mapFun.length === 2) {
	    var origMap = mapFun;
	    return function (doc) {
	      return origMap(doc, emit);
	    };
	  } else {
	    return evalFunction(mapFun.toString(), emit);
	  }
	}

	function reducer(reduceFun) {
	  var reduceFunString = reduceFun.toString();
	  var builtIn = getBuiltIn(reduceFunString);
	  if (builtIn) {
	    return builtIn;
	  } else {
	    return evalFunction(reduceFunString);
	  }
	}

	function ddocValidator(ddoc, viewName) {
	  var fun = ddoc.views && ddoc.views[viewName];
	  if (typeof fun.map !== 'string') {
	    throw new NotFoundError$2$1('ddoc ' + ddoc._id + ' has no string view named ' +
	      viewName + ', instead found object of type: ' + typeof fun.map);
	  }
	}

	var localDocName = 'mrviews';
	var abstract = createAbstractMapReduce(localDocName, mapper, reducer, ddocValidator);

	function query(fun, opts, callback) {
	  return abstract.query.call(this, fun, opts, callback);
	}

	function viewCleanup(callback) {
	  return abstract.viewCleanup.call(this, callback);
	}

	var mapreduce = {
	  query: query,
	  viewCleanup: viewCleanup
	};

	function isGenOne$1(rev$$1) {
	  return /^1-/.test(rev$$1);
	}

	function fileHasChanged(localDoc, remoteDoc, filename) {
	  return !localDoc._attachments ||
	         !localDoc._attachments[filename] ||
	         localDoc._attachments[filename].digest !== remoteDoc._attachments[filename].digest;
	}

	function getDocAttachments(db, doc) {
	  var filenames = Object.keys(doc._attachments);
	  return PouchPromise.all(filenames.map(function (filename) {
	    return db.getAttachment(doc._id, filename, {rev: doc._rev});
	  }));
	}

	function getDocAttachmentsFromTargetOrSource(target, src$$1, doc) {
	  var doCheckForLocalAttachments = isRemote(src$$1) && !isRemote(target);
	  var filenames = Object.keys(doc._attachments);

	  if (!doCheckForLocalAttachments) {
	    return getDocAttachments(src$$1, doc);
	  }

	  return target.get(doc._id).then(function (localDoc) {
	    return PouchPromise.all(filenames.map(function (filename) {
	      if (fileHasChanged(localDoc, doc, filename)) {
	        return src$$1.getAttachment(doc._id, filename);
	      }

	      return target.getAttachment(localDoc._id, filename);
	    }));
	  }).catch(function (error) {
	    /* istanbul ignore if */
	    if (error.status !== 404) {
	      throw error;
	    }

	    return getDocAttachments(src$$1, doc);
	  });
	}

	function createBulkGetOpts(diffs) {
	  var requests = [];
	  Object.keys(diffs).forEach(function (id) {
	    var missingRevs = diffs[id].missing;
	    missingRevs.forEach(function (missingRev) {
	      requests.push({
	        id: id,
	        rev: missingRev
	      });
	    });
	  });

	  return {
	    docs: requests,
	    revs: true,
	    latest: true
	  };
	}

	//
	// Fetch all the documents from the src as described in the "diffs",
	// which is a mapping of docs IDs to revisions. If the state ever
	// changes to "cancelled", then the returned promise will be rejected.
	// Else it will be resolved with a list of fetched documents.
	//
	function getDocs(src$$1, target, diffs, state) {
	  diffs = clone(diffs); // we do not need to modify this

	  var resultDocs = [],
	      ok = true;

	  function getAllDocs() {

	    var bulkGetOpts = createBulkGetOpts(diffs);

	    if (!bulkGetOpts.docs.length) { // optimization: skip empty requests
	      return;
	    }

	    return src$$1.bulkGet(bulkGetOpts).then(function (bulkGetResponse) {
	      /* istanbul ignore if */
	      if (state.cancelled) {
	        throw new Error('cancelled');
	      }
	      return PouchPromise.all(bulkGetResponse.results.map(function (bulkGetInfo) {
	        return PouchPromise.all(bulkGetInfo.docs.map(function (doc) {
	          var remoteDoc = doc.ok;

	          if (doc.error) {
	            // when AUTO_COMPACTION is set, docs can be returned which look
	            // like this: {"missing":"1-7c3ac256b693c462af8442f992b83696"}
	            ok = false;
	          }

	          if (!remoteDoc || !remoteDoc._attachments) {
	            return remoteDoc;
	          }

	          return getDocAttachmentsFromTargetOrSource(target, src$$1, remoteDoc)
	                   .then(function (attachments) {
	                           var filenames = Object.keys(remoteDoc._attachments);
	                           attachments
	                             .forEach(function (attachment, i) {
	                                        var att = remoteDoc._attachments[filenames[i]];
	                                        delete att.stub;
	                                        delete att.length;
	                                        att.data = attachment;
	                                      });

	                                      return remoteDoc;
	                                    });
	        }));
	      }))

	      .then(function (results) {
	        resultDocs = resultDocs.concat(flatten(results).filter(Boolean));
	      });
	    });
	  }

	  function hasAttachments(doc) {
	    return doc._attachments && Object.keys(doc._attachments).length > 0;
	  }

	  function hasConflicts(doc) {
	    return doc._conflicts && doc._conflicts.length > 0;
	  }

	  function fetchRevisionOneDocs(ids) {
	    // Optimization: fetch gen-1 docs and attachments in
	    // a single request using _all_docs
	    return src$$1.allDocs({
	      keys: ids,
	      include_docs: true,
	      conflicts: true
	    }).then(function (res$$1) {
	      if (state.cancelled) {
	        throw new Error('cancelled');
	      }
	      res$$1.rows.forEach(function (row) {
	        if (row.deleted || !row.doc || !isGenOne$1(row.value.rev) ||
	            hasAttachments(row.doc) || hasConflicts(row.doc)) {
	          // if any of these conditions apply, we need to fetch using get()
	          return;
	        }

	        // strip _conflicts array to appease CSG (#5793)
	        /* istanbul ignore if */
	        if (row.doc._conflicts) {
	          delete row.doc._conflicts;
	        }

	        // the doc we got back from allDocs() is sufficient
	        resultDocs.push(row.doc);
	        delete diffs[row.id];
	      });
	    });
	  }

	  function getRevisionOneDocs() {
	    // filter out the generation 1 docs and get them
	    // leaving the non-generation one docs to be got otherwise
	    var ids = Object.keys(diffs).filter(function (id) {
	      var missing = diffs[id].missing;
	      return missing.length === 1 && isGenOne$1(missing[0]);
	    });
	    if (ids.length > 0) {
	      return fetchRevisionOneDocs(ids);
	    }
	  }

	  function returnResult() {
	    return { ok:ok, docs:resultDocs };
	  }

	  return PouchPromise.resolve()
	    .then(getRevisionOneDocs)
	    .then(getAllDocs)
	    .then(returnResult);
	}

	var CHECKPOINT_VERSION = 1;
	var REPLICATOR = "pouchdb";
	// This is an arbitrary number to limit the
	// amount of replication history we save in the checkpoint.
	// If we save too much, the checkpoing docs will become very big,
	// if we save fewer, we'll run a greater risk of having to
	// read all the changes from 0 when checkpoint PUTs fail
	// CouchDB 2.0 has a more involved history pruning,
	// but let's go for the simple version for now.
	var CHECKPOINT_HISTORY_SIZE = 5;
	var LOWEST_SEQ = 0;

	function updateCheckpoint(db, id, checkpoint, session, returnValue) {
	  return db.get(id).catch(function (err) {
	    if (err.status === 404) {
	      if (db.adapter === 'http' || db.adapter === 'https') {
	        
	      }
	      return {
	        session_id: session,
	        _id: id,
	        history: [],
	        replicator: REPLICATOR,
	        version: CHECKPOINT_VERSION
	      };
	    }
	    throw err;
	  }).then(function (doc) {
	    if (returnValue.cancelled) {
	      return;
	    }

	    // if the checkpoint has not changed, do not update
	    if (doc.last_seq === checkpoint) {
	      return;
	    }

	    // Filter out current entry for this replication
	    doc.history = (doc.history || []).filter(function (item) {
	      return item.session_id !== session;
	    });

	    // Add the latest checkpoint to history
	    doc.history.unshift({
	      last_seq: checkpoint,
	      session_id: session
	    });

	    // Just take the last pieces in history, to
	    // avoid really big checkpoint docs.
	    // see comment on history size above
	    doc.history = doc.history.slice(0, CHECKPOINT_HISTORY_SIZE);

	    doc.version = CHECKPOINT_VERSION;
	    doc.replicator = REPLICATOR;

	    doc.session_id = session;
	    doc.last_seq = checkpoint;

	    return db.put(doc).catch(function (err) {
	      if (err.status === 409) {
	        // retry; someone is trying to write a checkpoint simultaneously
	        return updateCheckpoint(db, id, checkpoint, session, returnValue);
	      }
	      throw err;
	    });
	  });
	}

	function Checkpointer(src$$1, target, id, returnValue, opts) {
	  this.src = src$$1;
	  this.target = target;
	  this.id = id;
	  this.returnValue = returnValue;
	  this.opts = opts || {};
	}

	Checkpointer.prototype.writeCheckpoint = function (checkpoint, session) {
	  var self = this;
	  return this.updateTarget(checkpoint, session).then(function () {
	    return self.updateSource(checkpoint, session);
	  });
	};

	Checkpointer.prototype.updateTarget = function (checkpoint, session) {
	  if (this.opts.writeTargetCheckpoint) {
	    return updateCheckpoint(this.target, this.id, checkpoint,
	      session, this.returnValue);
	  } else {
	    return PouchPromise.resolve(true);
	  }
	};

	Checkpointer.prototype.updateSource = function (checkpoint, session) {
	  if (this.opts.writeSourceCheckpoint) {
	    var self = this;
	    return updateCheckpoint(this.src, this.id, checkpoint,
	      session, this.returnValue)
	      .catch(function (err) {
	        if (isForbiddenError(err)) {
	          self.opts.writeSourceCheckpoint = false;
	          return true;
	        }
	        throw err;
	      });
	  } else {
	    return PouchPromise.resolve(true);
	  }
	};

	var comparisons = {
	  "undefined": function (targetDoc, sourceDoc) {
	    // This is the previous comparison function
	    if (collate(targetDoc.last_seq, sourceDoc.last_seq) === 0) {
	      return sourceDoc.last_seq;
	    }
	    /* istanbul ignore next */
	    return 0;
	  },
	  "1": function (targetDoc, sourceDoc) {
	    // This is the comparison function ported from CouchDB
	    return compareReplicationLogs(sourceDoc, targetDoc).last_seq;
	  }
	};

	Checkpointer.prototype.getCheckpoint = function () {
	  var self = this;

	  if (self.opts && self.opts.writeSourceCheckpoint && !self.opts.writeTargetCheckpoint) {
	    return self.src.get(self.id).then(function (sourceDoc) {
	      return sourceDoc.last_seq || LOWEST_SEQ;
	    }).catch(function (err) {
	      /* istanbul ignore if */
	      if (err.status !== 404) {
	        throw err;
	      }
	      return LOWEST_SEQ;
	    });
	  }

	  return self.target.get(self.id).then(function (targetDoc) {
	    if (self.opts && self.opts.writeTargetCheckpoint && !self.opts.writeSourceCheckpoint) {
	      return targetDoc.last_seq || LOWEST_SEQ;
	    }

	    return self.src.get(self.id).then(function (sourceDoc) {
	      // Since we can't migrate an old version doc to a new one
	      // (no session id), we just go with the lowest seq in this case
	      /* istanbul ignore if */
	      if (targetDoc.version !== sourceDoc.version) {
	        return LOWEST_SEQ;
	      }

	      var version;
	      if (targetDoc.version) {
	        version = targetDoc.version.toString();
	      } else {
	        version = "undefined";
	      }

	      if (version in comparisons) {
	        return comparisons[version](targetDoc, sourceDoc);
	      }
	      /* istanbul ignore next */
	      return LOWEST_SEQ;
	    }, function (err) {
	      if (err.status === 404 && targetDoc.last_seq) {
	        return self.src.put({
	          _id: self.id,
	          last_seq: LOWEST_SEQ
	        }).then(function () {
	          return LOWEST_SEQ;
	        }, function (err) {
	          if (isForbiddenError(err)) {
	            self.opts.writeSourceCheckpoint = false;
	            return targetDoc.last_seq;
	          }
	          /* istanbul ignore next */
	          return LOWEST_SEQ;
	        });
	      }
	      throw err;
	    });
	  }).catch(function (err) {
	    if (err.status !== 404) {
	      throw err;
	    }
	    return LOWEST_SEQ;
	  });
	};
	// This checkpoint comparison is ported from CouchDBs source
	// they come from here:
	// https://github.com/apache/couchdb-couch-replicator/blob/master/src/couch_replicator.erl#L863-L906

	function compareReplicationLogs(srcDoc, tgtDoc) {
	  if (srcDoc.session_id === tgtDoc.session_id) {
	    return {
	      last_seq: srcDoc.last_seq,
	      history: srcDoc.history
	    };
	  }

	  return compareReplicationHistory(srcDoc.history, tgtDoc.history);
	}

	function compareReplicationHistory(sourceHistory, targetHistory) {
	  // the erlang loop via function arguments is not so easy to repeat in JS
	  // therefore, doing this as recursion
	  var S = sourceHistory[0];
	  var sourceRest = sourceHistory.slice(1);
	  var T = targetHistory[0];
	  var targetRest = targetHistory.slice(1);

	  if (!S || targetHistory.length === 0) {
	    return {
	      last_seq: LOWEST_SEQ,
	      history: []
	    };
	  }

	  var sourceId = S.session_id;
	  /* istanbul ignore if */
	  if (hasSessionId(sourceId, targetHistory)) {
	    return {
	      last_seq: S.last_seq,
	      history: sourceHistory
	    };
	  }

	  var targetId = T.session_id;
	  if (hasSessionId(targetId, sourceRest)) {
	    return {
	      last_seq: T.last_seq,
	      history: targetRest
	    };
	  }

	  return compareReplicationHistory(sourceRest, targetRest);
	}

	function hasSessionId(sessionId, history) {
	  var props = history[0];
	  var rest = history.slice(1);

	  if (!sessionId || history.length === 0) {
	    return false;
	  }

	  if (sessionId === props.session_id) {
	    return true;
	  }

	  return hasSessionId(sessionId, rest);
	}

	function isForbiddenError(err) {
	  return typeof err.status === 'number' && Math.floor(err.status / 100) === 4;
	}

	var STARTING_BACK_OFF = 0;

	function backOff(opts, returnValue, error, callback) {
	  if (opts.retry === false) {
	    returnValue.emit('error', error);
	    returnValue.removeAllListeners();
	    return;
	  }
	  if (typeof opts.back_off_function !== 'function') {
	    opts.back_off_function = defaultBackOff;
	  }
	  returnValue.emit('requestError', error);
	  if (returnValue.state === 'active' || returnValue.state === 'pending') {
	    returnValue.emit('paused', error);
	    returnValue.state = 'stopped';
	    var backOffSet = function backoffTimeSet() {
	      opts.current_back_off = STARTING_BACK_OFF;
	    };
	    var removeBackOffSetter = function removeBackOffTimeSet() {
	      returnValue.removeListener('active', backOffSet);
	    };
	    returnValue.once('paused', removeBackOffSetter);
	    returnValue.once('active', backOffSet);
	  }

	  opts.current_back_off = opts.current_back_off || STARTING_BACK_OFF;
	  opts.current_back_off = opts.back_off_function(opts.current_back_off);
	  setTimeout(callback, opts.current_back_off);
	}

	function sortObjectPropertiesByKey(queryParams) {
	  return Object.keys(queryParams).sort(collate).reduce(function (result, key) {
	    result[key] = queryParams[key];
	    return result;
	  }, {});
	}

	// Generate a unique id particular to this replication.
	// Not guaranteed to align perfectly with CouchDB's rep ids.
	function generateReplicationId(src$$1, target, opts) {
	  var docIds = opts.doc_ids ? opts.doc_ids.sort(collate) : '';
	  var filterFun = opts.filter ? opts.filter.toString() : '';
	  var queryParams = '';
	  var filterViewName =  '';
	  var selector = '';

	  // possibility for checkpoints to be lost here as behaviour of
	  // JSON.stringify is not stable (see #6226)
	  /* istanbul ignore if */
	  if (opts.selector) {
	    selector = JSON.stringify(opts.selector);
	  }

	  if (opts.filter && opts.query_params) {
	    queryParams = JSON.stringify(sortObjectPropertiesByKey(opts.query_params));
	  }

	  if (opts.filter && opts.filter === '_view') {
	    filterViewName = opts.view.toString();
	  }

	  return PouchPromise.all([src$$1.id(), target.id()]).then(function (res) {
	    var queryData = res[0] + res[1] + filterFun + filterViewName +
	      queryParams + docIds + selector;
	    return new PouchPromise(function (resolve) {
	      binaryMd5(queryData, resolve);
	    });
	  }).then(function (md5sum) {
	    // can't use straight-up md5 alphabet, because
	    // the char '/' is interpreted as being for attachments,
	    // and + is also not url-safe
	    md5sum = md5sum.replace(/\//g, '.').replace(/\+/g, '_');
	    return '_local/' + md5sum;
	  });
	}

	function replicate(src$$1, target, opts, returnValue, result) {
	  var batches = [];               // list of batches to be processed
	  var currentBatch;               // the batch currently being processed
	  var pendingBatch = {
	    seq: 0,
	    changes: [],
	    docs: []
	  }; // next batch, not yet ready to be processed
	  var writingCheckpoint = false;  // true while checkpoint is being written
	  var changesCompleted = false;   // true when all changes received
	  var replicationCompleted = false; // true when replication has completed
	  var last_seq = 0;
	  var continuous = opts.continuous || opts.live || false;
	  var batch_size = opts.batch_size || 100;
	  var batches_limit = opts.batches_limit || 10;
	  var changesPending = false;     // true while src.changes is running
	  var doc_ids = opts.doc_ids;
	  var selector = opts.selector;
	  var repId;
	  var checkpointer;
	  var changedDocs = [];
	  // Like couchdb, every replication gets a unique session id
	  var session = uuid$1();
	  var seq_interval = opts.seq_interval;

	  result = result || {
	    ok: true,
	    start_time: new Date(),
	    docs_read: 0,
	    docs_written: 0,
	    doc_write_failures: 0,
	    errors: []
	  };

	  var changesOpts = {};
	  returnValue.ready(src$$1, target);

	  function initCheckpointer() {
	    if (checkpointer) {
	      return PouchPromise.resolve();
	    }
	    return generateReplicationId(src$$1, target, opts).then(function (res$$1) {
	      repId = res$$1;

	      var checkpointOpts = {};
	      if (opts.checkpoint === false) {
	        checkpointOpts = { writeSourceCheckpoint: false, writeTargetCheckpoint: false };
	      } else if (opts.checkpoint === 'source') {
	        checkpointOpts = { writeSourceCheckpoint: true, writeTargetCheckpoint: false };
	      } else if (opts.checkpoint === 'target') {
	        checkpointOpts = { writeSourceCheckpoint: false, writeTargetCheckpoint: true };
	      } else {
	        checkpointOpts = { writeSourceCheckpoint: true, writeTargetCheckpoint: true };
	      }

	      checkpointer = new Checkpointer(src$$1, target, repId, returnValue, checkpointOpts);
	    });
	  }

	  function writeDocs() {
	    changedDocs = [];

	    if (currentBatch.docs.length === 0) {
	      return;
	    }
	    var docs = currentBatch.docs;
	    var bulkOpts = {timeout: opts.timeout};
	    return target.bulkDocs({docs: docs, new_edits: false}, bulkOpts).then(function (res$$1) {
	      /* istanbul ignore if */
	      if (returnValue.cancelled) {
	        completeReplication();
	        throw new Error('cancelled');
	      }

	      // `res` doesn't include full documents (which live in `docs`), so we create a map of 
	      // (id -> error), and check for errors while iterating over `docs`
	      var errorsById = Object.create(null);
	      res$$1.forEach(function (res$$1) {
	        if (res$$1.error) {
	          errorsById[res$$1.id] = res$$1;
	        }
	      });

	      var errorsNo = Object.keys(errorsById).length;
	      result.doc_write_failures += errorsNo;
	      result.docs_written += docs.length - errorsNo;

	      docs.forEach(function (doc) {
	        var error = errorsById[doc._id];
	        if (error) {
	          result.errors.push(error);
	          // Normalize error name. i.e. 'Unauthorized' -> 'unauthorized' (eg Sync Gateway)
	          var errorName = (error.name || '').toLowerCase();
	          if (errorName === 'unauthorized' || errorName === 'forbidden') {
	            returnValue.emit('denied', clone(error));
	          } else {
	            throw error;
	          }
	        } else {
	          changedDocs.push(doc);
	        }
	      });

	    }, function (err) {
	      result.doc_write_failures += docs.length;
	      throw err;
	    });
	  }

	  function finishBatch() {
	    if (currentBatch.error) {
	      throw new Error('There was a problem getting docs.');
	    }
	    result.last_seq = last_seq = currentBatch.seq;
	    var outResult = clone(result);
	    if (changedDocs.length) {
	      outResult.docs = changedDocs;
	      // Attach 'pending' property if server supports it (CouchDB 2.0+)
	      /* istanbul ignore if */
	      if (typeof currentBatch.pending === 'number') {
	        outResult.pending = currentBatch.pending;
	        delete currentBatch.pending;
	      }
	      returnValue.emit('change', outResult);
	    }
	    writingCheckpoint = true;
	    return checkpointer.writeCheckpoint(currentBatch.seq,
	        session).then(function () {
	      writingCheckpoint = false;
	      /* istanbul ignore if */
	      if (returnValue.cancelled) {
	        completeReplication();
	        throw new Error('cancelled');
	      }
	      currentBatch = undefined;
	      getChanges();
	    }).catch(function (err) {
	      onCheckpointError(err);
	      throw err;
	    });
	  }

	  function getDiffs() {
	    var diff = {};
	    currentBatch.changes.forEach(function (change) {
	      // Couchbase Sync Gateway emits these, but we can ignore them
	      /* istanbul ignore if */
	      if (change.id === "_user/") {
	        return;
	      }
	      diff[change.id] = change.changes.map(function (x) {
	        return x.rev;
	      });
	    });
	    return target.revsDiff(diff).then(function (diffs) {
	      /* istanbul ignore if */
	      if (returnValue.cancelled) {
	        completeReplication();
	        throw new Error('cancelled');
	      }
	      // currentBatch.diffs elements are deleted as the documents are written
	      currentBatch.diffs = diffs;
	    });
	  }

	  function getBatchDocs() {
	    return getDocs(src$$1, target, currentBatch.diffs, returnValue).then(function (got) {
	      currentBatch.error = !got.ok;
	      got.docs.forEach(function (doc) {
	        delete currentBatch.diffs[doc._id];
	        result.docs_read++;
	        currentBatch.docs.push(doc);
	      });
	    });
	  }

	  function startNextBatch() {
	    if (returnValue.cancelled || currentBatch) {
	      return;
	    }
	    if (batches.length === 0) {
	      processPendingBatch(true);
	      return;
	    }
	    currentBatch = batches.shift();
	    getDiffs()
	      .then(getBatchDocs)
	      .then(writeDocs)
	      .then(finishBatch)
	      .then(startNextBatch)
	      .catch(function (err) {
	        abortReplication('batch processing terminated with error', err);
	      });
	  }


	  function processPendingBatch(immediate) {
	    if (pendingBatch.changes.length === 0) {
	      if (batches.length === 0 && !currentBatch) {
	        if ((continuous && changesOpts.live) || changesCompleted) {
	          returnValue.state = 'pending';
	          returnValue.emit('paused');
	        }
	        if (changesCompleted) {
	          completeReplication();
	        }
	      }
	      return;
	    }
	    if (
	      immediate ||
	      changesCompleted ||
	      pendingBatch.changes.length >= batch_size
	    ) {
	      batches.push(pendingBatch);
	      pendingBatch = {
	        seq: 0,
	        changes: [],
	        docs: []
	      };
	      if (returnValue.state === 'pending' || returnValue.state === 'stopped') {
	        returnValue.state = 'active';
	        returnValue.emit('active');
	      }
	      startNextBatch();
	    }
	  }


	  function abortReplication(reason, err) {
	    if (replicationCompleted) {
	      return;
	    }
	    if (!err.message) {
	      err.message = reason;
	    }
	    result.ok = false;
	    result.status = 'aborting';
	    batches = [];
	    pendingBatch = {
	      seq: 0,
	      changes: [],
	      docs: []
	    };
	    completeReplication(err);
	  }


	  function completeReplication(fatalError) {
	    if (replicationCompleted) {
	      return;
	    }
	    /* istanbul ignore if */
	    if (returnValue.cancelled) {
	      result.status = 'cancelled';
	      if (writingCheckpoint) {
	        return;
	      }
	    }
	    result.status = result.status || 'complete';
	    result.end_time = new Date();
	    result.last_seq = last_seq;
	    replicationCompleted = true;

	    if (fatalError) {
	      // need to extend the error because Firefox considers ".result" read-only
	      fatalError = createError$2(fatalError);
	      fatalError.result = result;

	      // Normalize error name. i.e. 'Unauthorized' -> 'unauthorized' (eg Sync Gateway)
	      var errorName = (fatalError.name || '').toLowerCase();
	      if (errorName === 'unauthorized' || errorName === 'forbidden') {
	        returnValue.emit('error', fatalError);
	        returnValue.removeAllListeners();
	      } else {
	        backOff(opts, returnValue, fatalError, function () {
	          replicate(src$$1, target, opts, returnValue);
	        });
	      }
	    } else {
	      returnValue.emit('complete', result);
	      returnValue.removeAllListeners();
	    }
	  }


	  function onChange(change, pending, lastSeq) {
	    /* istanbul ignore if */
	    if (returnValue.cancelled) {
	      return completeReplication();
	    }
	    // Attach 'pending' property if server supports it (CouchDB 2.0+)
	    /* istanbul ignore if */
	    if (typeof pending === 'number') {
	      pendingBatch.pending = pending;
	    }

	    var filter = filterChange(opts)(change);
	    if (!filter) {
	      return;
	    }
	    pendingBatch.seq = change.seq || lastSeq;
	    pendingBatch.changes.push(change);
	    processPendingBatch(batches.length === 0 && changesOpts.live);
	  }


	  function onChangesComplete(changes) {
	    changesPending = false;
	    /* istanbul ignore if */
	    if (returnValue.cancelled) {
	      return completeReplication();
	    }

	    // if no results were returned then we're done,
	    // else fetch more
	    if (changes.results.length > 0) {
	      changesOpts.since = changes.last_seq;
	      getChanges();
	      processPendingBatch(true);
	    } else {

	      var complete = function () {
	        if (continuous) {
	          changesOpts.live = true;
	          getChanges();
	        } else {
	          changesCompleted = true;
	        }
	        processPendingBatch(true);
	      };

	      // update the checkpoint so we start from the right seq next time
	      if (!currentBatch && changes.results.length === 0) {
	        writingCheckpoint = true;
	        checkpointer.writeCheckpoint(changes.last_seq,
	            session).then(function () {
	          writingCheckpoint = false;
	          result.last_seq = last_seq = changes.last_seq;
	          complete();
	        })
	        .catch(onCheckpointError);
	      } else {
	        complete();
	      }
	    }
	  }


	  function onChangesError(err) {
	    changesPending = false;
	    /* istanbul ignore if */
	    if (returnValue.cancelled) {
	      return completeReplication();
	    }
	    abortReplication('changes rejected', err);
	  }


	  function getChanges() {
	    if (!(
	      !changesPending &&
	      !changesCompleted &&
	      batches.length < batches_limit
	      )) {
	      return;
	    }
	    changesPending = true;
	    function abortChanges() {
	      changes.cancel();
	    }
	    function removeListener() {
	      returnValue.removeListener('cancel', abortChanges);
	    }

	    if (returnValue._changes) { // remove old changes() and listeners
	      returnValue.removeListener('cancel', returnValue._abortChanges);
	      returnValue._changes.cancel();
	    }
	    returnValue.once('cancel', abortChanges);

	    var changes = src$$1.changes(changesOpts)
	      .on('change', onChange);
	    changes.then(removeListener, removeListener);
	    changes.then(onChangesComplete)
	      .catch(onChangesError);

	    if (opts.retry) {
	      // save for later so we can cancel if necessary
	      returnValue._changes = changes;
	      returnValue._abortChanges = abortChanges;
	    }
	  }


	  function startChanges() {
	    initCheckpointer().then(function () {
	      /* istanbul ignore if */
	      if (returnValue.cancelled) {
	        completeReplication();
	        return;
	      }
	      return checkpointer.getCheckpoint().then(function (checkpoint) {
	        last_seq = checkpoint;
	        changesOpts = {
	          since: last_seq,
	          limit: batch_size,
	          batch_size: batch_size,
	          style: 'all_docs',
	          doc_ids: doc_ids,
	          selector: selector,
	          return_docs: true // required so we know when we're done
	        };
	        if (seq_interval !== false) {
	          changesOpts.seq_interval = seq_interval || batch_size;
	        }
	        if (opts.filter) {
	          if (typeof opts.filter !== 'string') {
	            // required for the client-side filter in onChange
	            changesOpts.include_docs = true;
	          } else { // ddoc filter
	            changesOpts.filter = opts.filter;
	          }
	        }
	        if ('heartbeat' in opts) {
	          changesOpts.heartbeat = opts.heartbeat;
	        }
	        if ('timeout' in opts) {
	          changesOpts.timeout = opts.timeout;
	        }
	        if (opts.query_params) {
	          changesOpts.query_params = opts.query_params;
	        }
	        if (opts.view) {
	          changesOpts.view = opts.view;
	        }
	        getChanges();
	      });
	    }).catch(function (err) {
	      abortReplication('getCheckpoint rejected with ', err);
	    });
	  }

	  /* istanbul ignore next */
	  function onCheckpointError(err) {
	    writingCheckpoint = false;
	    abortReplication('writeCheckpoint completed with error', err);
	  }

	  /* istanbul ignore if */
	  if (returnValue.cancelled) { // cancelled immediately
	    completeReplication();
	    return;
	  }

	  if (!returnValue._addedListeners) {
	    returnValue.once('cancel', completeReplication);

	    if (typeof opts.complete === 'function') {
	      returnValue.once('error', opts.complete);
	      returnValue.once('complete', function (result) {
	        opts.complete(null, result);
	      });
	    }
	    returnValue._addedListeners = true;
	  }

	  if (typeof opts.since === 'undefined') {
	    startChanges();
	  } else {
	    initCheckpointer().then(function () {
	      writingCheckpoint = true;
	      return checkpointer.writeCheckpoint(opts.since, session);
	    }).then(function () {
	      writingCheckpoint = false;
	      /* istanbul ignore if */
	      if (returnValue.cancelled) {
	        completeReplication();
	        return;
	      }
	      last_seq = opts.since;
	      startChanges();
	    }).catch(onCheckpointError);
	  }
	}

	// We create a basic promise so the caller can cancel the replication possibly
	// before we have actually started listening to changes etc
	inherits(Replication, events.EventEmitter);
	function Replication() {
	  events.EventEmitter.call(this);
	  this.cancelled = false;
	  this.state = 'pending';
	  var self = this;
	  var promise = new PouchPromise(function (fulfill, reject) {
	    self.once('complete', fulfill);
	    self.once('error', reject);
	  });
	  self.then = function (resolve, reject) {
	    return promise.then(resolve, reject);
	  };
	  self.catch = function (reject) {
	    return promise.catch(reject);
	  };
	  // As we allow error handling via "error" event as well,
	  // put a stub in here so that rejecting never throws UnhandledError.
	  self.catch(function () {});
	}

	Replication.prototype.cancel = function () {
	  this.cancelled = true;
	  this.state = 'cancelled';
	  this.emit('cancel');
	};

	Replication.prototype.ready = function (src$$1, target) {
	  var self = this;
	  if (self._readyCalled) {
	    return;
	  }
	  self._readyCalled = true;

	  function onDestroy() {
	    self.cancel();
	  }
	  src$$1.once('destroyed', onDestroy);
	  target.once('destroyed', onDestroy);
	  function cleanup() {
	    src$$1.removeListener('destroyed', onDestroy);
	    target.removeListener('destroyed', onDestroy);
	  }
	  self.once('complete', cleanup);
	};

	function toPouch(db, opts) {
	  var PouchConstructor = opts.PouchConstructor;
	  if (typeof db === 'string') {
	    return new PouchConstructor(db, opts);
	  } else {
	    return db;
	  }
	}

	function replicateWrapper(src$$1, target, opts, callback) {

	  if (typeof opts === 'function') {
	    callback = opts;
	    opts = {};
	  }
	  if (typeof opts === 'undefined') {
	    opts = {};
	  }

	  if (opts.doc_ids && !Array.isArray(opts.doc_ids)) {
	    throw createError$2(BAD_REQUEST,
	                       "`doc_ids` filter parameter is not a list.");
	  }

	  opts.complete = callback;
	  opts = clone(opts);
	  opts.continuous = opts.continuous || opts.live;
	  opts.retry = ('retry' in opts) ? opts.retry : false;
	  /*jshint validthis:true */
	  opts.PouchConstructor = opts.PouchConstructor || this;
	  var replicateRet = new Replication(opts);
	  var srcPouch = toPouch(src$$1, opts);
	  var targetPouch = toPouch(target, opts);
	  replicate(srcPouch, targetPouch, opts, replicateRet);
	  return replicateRet;
	}

	inherits(Sync, events.EventEmitter);
	function sync$1(src$$1, target, opts, callback) {
	  if (typeof opts === 'function') {
	    callback = opts;
	    opts = {};
	  }
	  if (typeof opts === 'undefined') {
	    opts = {};
	  }
	  opts = clone(opts);
	  /*jshint validthis:true */
	  opts.PouchConstructor = opts.PouchConstructor || this;
	  src$$1 = toPouch(src$$1, opts);
	  target = toPouch(target, opts);
	  return new Sync(src$$1, target, opts, callback);
	}

	function Sync(src$$1, target, opts, callback) {
	  var self = this;
	  this.canceled = false;

	  var optsPush = opts.push ? $inject_Object_assign({}, opts, opts.push) : opts;
	  var optsPull = opts.pull ? $inject_Object_assign({}, opts, opts.pull) : opts;

	  this.push = replicateWrapper(src$$1, target, optsPush);
	  this.pull = replicateWrapper(target, src$$1, optsPull);

	  this.pushPaused = true;
	  this.pullPaused = true;

	  function pullChange(change) {
	    self.emit('change', {
	      direction: 'pull',
	      change: change
	    });
	  }
	  function pushChange(change) {
	    self.emit('change', {
	      direction: 'push',
	      change: change
	    });
	  }
	  function pushDenied(doc) {
	    self.emit('denied', {
	      direction: 'push',
	      doc: doc
	    });
	  }
	  function pullDenied(doc) {
	    self.emit('denied', {
	      direction: 'pull',
	      doc: doc
	    });
	  }
	  function pushPaused() {
	    self.pushPaused = true;
	    /* istanbul ignore if */
	    if (self.pullPaused) {
	      self.emit('paused');
	    }
	  }
	  function pullPaused() {
	    self.pullPaused = true;
	    /* istanbul ignore if */
	    if (self.pushPaused) {
	      self.emit('paused');
	    }
	  }
	  function pushActive() {
	    self.pushPaused = false;
	    /* istanbul ignore if */
	    if (self.pullPaused) {
	      self.emit('active', {
	        direction: 'push'
	      });
	    }
	  }
	  function pullActive() {
	    self.pullPaused = false;
	    /* istanbul ignore if */
	    if (self.pushPaused) {
	      self.emit('active', {
	        direction: 'pull'
	      });
	    }
	  }

	  var removed = {};

	  function removeAll(type) { // type is 'push' or 'pull'
	    return function (event, func) {
	      var isChange = event === 'change' &&
	        (func === pullChange || func === pushChange);
	      var isDenied = event === 'denied' &&
	        (func === pullDenied || func === pushDenied);
	      var isPaused = event === 'paused' &&
	        (func === pullPaused || func === pushPaused);
	      var isActive = event === 'active' &&
	        (func === pullActive || func === pushActive);

	      if (isChange || isDenied || isPaused || isActive) {
	        if (!(event in removed)) {
	          removed[event] = {};
	        }
	        removed[event][type] = true;
	        if (Object.keys(removed[event]).length === 2) {
	          // both push and pull have asked to be removed
	          self.removeAllListeners(event);
	        }
	      }
	    };
	  }

	  if (opts.live) {
	    this.push.on('complete', self.pull.cancel.bind(self.pull));
	    this.pull.on('complete', self.push.cancel.bind(self.push));
	  }

	  function addOneListener(ee, event, listener) {
	    if (ee.listeners(event).indexOf(listener) == -1) {
	      ee.on(event, listener);
	    }
	  }

	  this.on('newListener', function (event) {
	    if (event === 'change') {
	      addOneListener(self.pull, 'change', pullChange);
	      addOneListener(self.push, 'change', pushChange);
	    } else if (event === 'denied') {
	      addOneListener(self.pull, 'denied', pullDenied);
	      addOneListener(self.push, 'denied', pushDenied);
	    } else if (event === 'active') {
	      addOneListener(self.pull, 'active', pullActive);
	      addOneListener(self.push, 'active', pushActive);
	    } else if (event === 'paused') {
	      addOneListener(self.pull, 'paused', pullPaused);
	      addOneListener(self.push, 'paused', pushPaused);
	    }
	  });

	  this.on('removeListener', function (event) {
	    if (event === 'change') {
	      self.pull.removeListener('change', pullChange);
	      self.push.removeListener('change', pushChange);
	    } else if (event === 'denied') {
	      self.pull.removeListener('denied', pullDenied);
	      self.push.removeListener('denied', pushDenied);
	    } else if (event === 'active') {
	      self.pull.removeListener('active', pullActive);
	      self.push.removeListener('active', pushActive);
	    } else if (event === 'paused') {
	      self.pull.removeListener('paused', pullPaused);
	      self.push.removeListener('paused', pushPaused);
	    }
	  });

	  this.pull.on('removeListener', removeAll('pull'));
	  this.push.on('removeListener', removeAll('push'));

	  var promise = PouchPromise.all([
	    this.push,
	    this.pull
	  ]).then(function (resp) {
	    var out = {
	      push: resp[0],
	      pull: resp[1]
	    };
	    self.emit('complete', out);
	    if (callback) {
	      callback(null, out);
	    }
	    self.removeAllListeners();
	    return out;
	  }, function (err) {
	    self.cancel();
	    if (callback) {
	      // if there's a callback, then the callback can receive
	      // the error event
	      callback(err);
	    } else {
	      // if there's no callback, then we're safe to emit an error
	      // event, which would otherwise throw an unhandled error
	      // due to 'error' being a special event in EventEmitters
	      self.emit('error', err);
	    }
	    self.removeAllListeners();
	    if (callback) {
	      // no sense throwing if we're already emitting an 'error' event
	      throw err;
	    }
	  });

	  this.then = function (success, err) {
	    return promise.then(success, err);
	  };

	  this.catch = function (err) {
	    return promise.catch(err);
	  };
	}

	Sync.prototype.cancel = function () {
	  if (!this.canceled) {
	    this.canceled = true;
	    this.push.cancel();
	    this.pull.cancel();
	  }
	};

	function replication(PouchDB) {
	  PouchDB.replicate = replicateWrapper;
	  PouchDB.sync = sync$1;

	  Object.defineProperty(PouchDB.prototype, 'replicate', {
	    get: function () {
	      var self = this;
	      if (typeof this.replicateMethods === 'undefined') {
	        this.replicateMethods = {
	          from: function (other, opts, callback) {
	            return self.constructor.replicate(other, self, opts, callback);
	          },
	          to: function (other, opts, callback) {
	            return self.constructor.replicate(self, other, opts, callback);
	          }
	        };
	      }
	      return this.replicateMethods;
	    }
	  });

	  PouchDB.prototype.sync = function (dbName, opts, callback) {
	    return this.constructor.sync(this, dbName, opts, callback);
	  };
	}

	PouchDB.plugin(LevelPouch$1)
	  .plugin(HttpPouch$1)
	  .plugin(mapreduce)
	  .plugin(replication);

	var index_es = /*#__PURE__*/Object.freeze({
		default: PouchDB
	});

	/* istanbul ignore next */
	var PouchPromise$1 = typeof Promise === 'function' ? Promise : lib$1;

	function mangle$1(key) {
	  return '$' + key;
	}
	function unmangle$1(key) {
	  return key.substring(1);
	}
	function Map$1$1() {
	  this._store = {};
	}
	Map$1$1.prototype.get = function (key) {
	  var mangled = mangle$1(key);
	  return this._store[mangled];
	};
	Map$1$1.prototype.set = function (key, value) {
	  var mangled = mangle$1(key);
	  this._store[mangled] = value;
	  return true;
	};
	Map$1$1.prototype.has = function (key) {
	  var mangled = mangle$1(key);
	  return mangled in this._store;
	};
	Map$1$1.prototype.delete = function (key) {
	  var mangled = mangle$1(key);
	  var res = mangled in this._store;
	  delete this._store[mangled];
	  return res;
	};
	Map$1$1.prototype.forEach = function (cb) {
	  var keys = Object.keys(this._store);
	  for (var i = 0, len = keys.length; i < len; i++) {
	    var key = keys[i];
	    var value = this._store[key];
	    key = unmangle$1(key);
	    cb(value, key);
	  }
	};
	Object.defineProperty(Map$1$1.prototype, 'size', {
	  get: function () {
	    return Object.keys(this._store).length;
	  }
	});

	function Set$1$1(array) {
	  this._store = new Map$1$1();

	  // init with an array
	  if (array && Array.isArray(array)) {
	    for (var i = 0, len = array.length; i < len; i++) {
	      this.add(array[i]);
	    }
	  }
	}
	Set$1$1.prototype.add = function (key) {
	  return this._store.set(key, true);
	};
	Set$1$1.prototype.has = function (key) {
	  return this._store.has(key);
	};
	Set$1$1.prototype.forEach = function (cb) {
	  this._store.forEach(function (value, key) {
	    cb(key);
	  });
	};
	Object.defineProperty(Set$1$1.prototype, 'size', {
	  get: function () {
	    return this._store.size;
	  }
	});

	/* global Map,Set,Symbol */
	// Based on https://kangax.github.io/compat-table/es6/ we can sniff out
	// incomplete Map/Set implementations which would otherwise cause our tests to fail.
	// Notably they fail in IE11 and iOS 8.4, which this prevents.
	function supportsMapAndSet$1() {
	  if (typeof Symbol === 'undefined' || typeof Map === 'undefined' || typeof Set === 'undefined') {
	    return false;
	  }
	  var prop = Object.getOwnPropertyDescriptor(Map, Symbol.species);
	  return prop && 'get' in prop && Map[Symbol.species] === Map;
	}

	// based on https://github.com/montagejs/collections
	/* global Map,Set */

	var ExportedSet$1;
	var ExportedMap$1;

	{
	  if (supportsMapAndSet$1()) { // prefer built-in Map/Set
	    ExportedSet$1 = Set;
	    ExportedMap$1 = Map;
	  } else { // fall back to our polyfill
	    ExportedSet$1 = Set$1$1;
	    ExportedMap$1 = Map$1$1;
	  }
	}

	inherits(PouchError$1, Error);

	function PouchError$1(status, error, reason) {
	  Error.call(this, reason);
	  this.status = status;
	  this.name = error;
	  this.message = reason;
	  this.error = true;
	}

	PouchError$1.prototype.toString = function () {
	  return JSON.stringify({
	    status: this.status,
	    name: this.name,
	    message: this.message,
	    reason: this.reason
	  });
	};

	var UNAUTHORIZED$1 = new PouchError$1(401, 'unauthorized', "Name or password is incorrect.");
	var MISSING_BULK_DOCS$1 = new PouchError$1(400, 'bad_request', "Missing JSON list of 'docs'");
	var MISSING_DOC$1 = new PouchError$1(404, 'not_found', 'missing');
	var REV_CONFLICT$1 = new PouchError$1(409, 'conflict', 'Document update conflict');
	var INVALID_ID$1 = new PouchError$1(400, 'bad_request', '_id field must contain a string');
	var MISSING_ID$1 = new PouchError$1(412, 'missing_id', '_id is required for puts');
	var RESERVED_ID$1 = new PouchError$1(400, 'bad_request', 'Only reserved document ids may start with underscore.');
	var NOT_OPEN$1 = new PouchError$1(412, 'precondition_failed', 'Database not open');
	var UNKNOWN_ERROR$1 = new PouchError$1(500, 'unknown_error', 'Database encountered an unknown error');
	var BAD_ARG$1 = new PouchError$1(500, 'badarg', 'Some query argument is invalid');
	var INVALID_REQUEST$1 = new PouchError$1(400, 'invalid_request', 'Request was invalid');
	var QUERY_PARSE_ERROR$1 = new PouchError$1(400, 'query_parse_error', 'Some query parameter is invalid');
	var DOC_VALIDATION$1 = new PouchError$1(500, 'doc_validation', 'Bad special document member');
	var BAD_REQUEST$1 = new PouchError$1(400, 'bad_request', 'Something wrong with the request');
	var NOT_AN_OBJECT$1 = new PouchError$1(400, 'bad_request', 'Document must be a JSON object');
	var DB_MISSING$1 = new PouchError$1(404, 'not_found', 'Database not found');
	var IDB_ERROR$1 = new PouchError$1(500, 'indexed_db_went_bad', 'unknown');
	var WSQ_ERROR$1 = new PouchError$1(500, 'web_sql_went_bad', 'unknown');
	var LDB_ERROR$1 = new PouchError$1(500, 'levelDB_went_went_bad', 'unknown');
	var FORBIDDEN$1 = new PouchError$1(403, 'forbidden', 'Forbidden by design doc validate_doc_update function');
	var INVALID_REV$1 = new PouchError$1(400, 'bad_request', 'Invalid rev format');
	var FILE_EXISTS$1 = new PouchError$1(412, 'file_exists', 'The database could not be created, the file already exists.');
	var MISSING_STUB$1 = new PouchError$1(412, 'missing_stub', 'A pre-existing attachment stub wasn\'t found');
	var INVALID_URL$1 = new PouchError$1(413, 'invalid_url', 'Provided URL is invalid');

	function isBinaryObject$1(object) {
	  return object instanceof Buffer;
	}

	// most of this is borrowed from lodash.isPlainObject:
	// https://github.com/fis-components/lodash.isplainobject/
	// blob/29c358140a74f252aeb08c9eb28bef86f2217d4a/index.js

	var funcToString$1 = Function.prototype.toString;
	var objectCtorString$1 = funcToString$1.call(Object);

	function isPlainObject$1(value) {
	  var proto = Object.getPrototypeOf(value);
	  /* istanbul ignore if */
	  if (proto === null) { // not sure when this happens, but I guess it can
	    return true;
	  }
	  var Ctor = proto.constructor;
	  return (typeof Ctor == 'function' &&
	    Ctor instanceof Ctor && funcToString$1.call(Ctor) == objectCtorString$1);
	}

	function clone$1(object) {
	  var newObject;
	  var i;
	  var len;

	  if (!object || typeof object !== 'object') {
	    return object;
	  }

	  if (Array.isArray(object)) {
	    newObject = [];
	    for (i = 0, len = object.length; i < len; i++) {
	      newObject[i] = clone$1(object[i]);
	    }
	    return newObject;
	  }

	  // special case: to avoid inconsistencies between IndexedDB
	  // and other backends, we automatically stringify Dates
	  if (object instanceof Date) {
	    return object.toISOString();
	  }

	  if (isBinaryObject$1(object)) {
	    return cloneBuffer_1(object);
	  }

	  if (!isPlainObject$1(object)) {
	    return object; // don't clone objects like Workers
	  }

	  newObject = {};
	  for (i in object) {
	    /* istanbul ignore else */
	    if (Object.prototype.hasOwnProperty.call(object, i)) {
	      var value = clone$1(object[i]);
	      if (typeof value !== 'undefined') {
	        newObject[i] = value;
	      }
	    }
	  }
	  return newObject;
	}

	function once$1(fun) {
	  var called = false;
	  return argsarray(function (args) {
	    /* istanbul ignore if */
	    if (called) {
	      // this is a smoke test and should never actually happen
	      throw new Error('once called more than once');
	    } else {
	      called = true;
	      fun.apply(this, args);
	    }
	  });
	}

	function toPromise$1(func) {
	  //create the function we will be returning
	  return argsarray(function (args) {
	    // Clone arguments
	    args = clone$1(args);
	    var self = this;
	    // if the last argument is a function, assume its a callback
	    var usedCB = (typeof args[args.length - 1] === 'function') ? args.pop() : false;
	    var promise = new PouchPromise$1(function (fulfill, reject) {
	      var resp;
	      try {
	        var callback = once$1(function (err, mesg) {
	          if (err) {
	            reject(err);
	          } else {
	            fulfill(mesg);
	          }
	        });
	        // create a callback for this invocation
	        // apply the function in the orig context
	        args.push(callback);
	        resp = func.apply(self, args);
	        if (resp && typeof resp.then === 'function') {
	          fulfill(resp);
	        }
	      } catch (e) {
	        reject(e);
	      }
	    });
	    // if there is a callback, call it back
	    if (usedCB) {
	      promise.then(function (result) {
	        usedCB(null, result);
	      }, usedCB);
	    }
	    return promise;
	  });
	}

	// like underscore/lodash _.pick()
	function pick$1(obj, arr) {
	  var res = {};
	  for (var i = 0, len = arr.length; i < len; i++) {
	    var prop = arr[i];
	    if (prop in obj) {
	      res[prop] = obj[prop];
	    }
	  }
	  return res;
	}

	// in Node of course this is false
	function isChromeApp$1() {
	  return false;
	}

	// in Node of course this is false
	function hasLocalStorage$1() {
	  return false;
	}

	function nextTick$2(fn) {
	  process.nextTick(fn);
	}

	inherits(Changes$1, events.EventEmitter);

	/* istanbul ignore next */
	function attachBrowserEvents$1(self) {
	  if (isChromeApp$1()) {
	    chrome.storage.onChanged.addListener(function (e) {
	      // make sure it's event addressed to us
	      if (e.db_name != null) {
	        //object only has oldValue, newValue members
	        self.emit(e.dbName.newValue);
	      }
	    });
	  } else if (hasLocalStorage$1()) {
	    if (typeof addEventListener !== 'undefined') {
	      addEventListener("storage", function (e) {
	        self.emit(e.key);
	      });
	    } else { // old IE
	      window.attachEvent("storage", function (e) {
	        self.emit(e.key);
	      });
	    }
	  }
	}

	function Changes$1() {
	  events.EventEmitter.call(this);
	  this._listeners = {};

	  attachBrowserEvents$1(this);
	}
	Changes$1.prototype.addListener = function (dbName, id, db, opts) {
	  /* istanbul ignore if */
	  if (this._listeners[id]) {
	    return;
	  }
	  var self = this;
	  var inprogress = false;
	  function eventFunction() {
	    /* istanbul ignore if */
	    if (!self._listeners[id]) {
	      return;
	    }
	    if (inprogress) {
	      inprogress = 'waiting';
	      return;
	    }
	    inprogress = true;
	    var changesOpts = pick$1(opts, [
	      'style', 'include_docs', 'attachments', 'conflicts', 'filter',
	      'doc_ids', 'view', 'since', 'query_params', 'binary'
	    ]);

	    /* istanbul ignore next */
	    function onError() {
	      inprogress = false;
	    }

	    db.changes(changesOpts).on('change', function (c) {
	      if (c.seq > opts.since && !opts.cancelled) {
	        opts.since = c.seq;
	        opts.onChange(c);
	      }
	    }).on('complete', function () {
	      if (inprogress === 'waiting') {
	        nextTick$2(eventFunction);
	      }
	      inprogress = false;
	    }).on('error', onError);
	  }
	  this._listeners[id] = eventFunction;
	  this.on(dbName, eventFunction);
	};

	Changes$1.prototype.removeListener = function (dbName, id) {
	  /* istanbul ignore if */
	  if (!(id in this._listeners)) {
	    return;
	  }
	  events.EventEmitter.prototype.removeListener.call(this, dbName,
	    this._listeners[id]);
	  delete this._listeners[id];
	};


	/* istanbul ignore next */
	Changes$1.prototype.notifyLocalWindows = function (dbName) {
	  //do a useless change on a storage thing
	  //in order to get other windows's listeners to activate
	  if (isChromeApp$1()) {
	    chrome.storage.local.set({dbName: dbName});
	  } else if (hasLocalStorage$1()) {
	    localStorage[dbName] = (localStorage[dbName] === "a") ? "b" : "a";
	  }
	};

	Changes$1.prototype.notify = function (dbName) {
	  this.emit(dbName);
	  this.notifyLocalWindows(dbName);
	};

	function guardedConsole$1(method) {
	  /* istanbul ignore else */
	  if (typeof console !== 'undefined' && typeof console[method] === 'function') {
	    var args = Array.prototype.slice.call(arguments, 1);
	    console[method].apply(console, args);
	  }
	}

	var assign$1;
	{
	  if (typeof Object.assign === 'function') {
	    assign$1 = Object.assign;
	  } else {
	    // lite Object.assign polyfill based on
	    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
	    assign$1 = function (target) {
	      var to = Object(target);

	      for (var index = 1; index < arguments.length; index++) {
	        var nextSource = arguments[index];

	        if (nextSource != null) { // Skip over if undefined or null
	          for (var nextKey in nextSource) {
	            // Avoid bugs when hasOwnProperty is shadowed
	            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
	              to[nextKey] = nextSource[nextKey];
	            }
	          }
	        }
	      }
	      return to;
	    };
	  }
	}

	var assign$1$1 = assign$1;

	function flatten$1(arrs) {
	  var res = [];
	  for (var i = 0, len = arrs.length; i < len; i++) {
	    res = res.concat(arrs[i]);
	  }
	  return res;
	}

	// Checks if a PouchDB object is "remote" or not. This is
	// designed to opt-in to certain optimizations, such as
	// avoiding checks for "dependentDbs" and other things that
	// we know only apply to local databases. In general, "remote"
	// should be true for the http adapter, and for third-party
	// adapters with similar expensive boundaries to cross for
	// every API call, such as socket-pouch and worker-pouch.
	// Previously, this was handled via db.type() === 'http'
	// which is now deprecated.

	function isRemote$1(db) {
	  if (typeof db._remote === 'boolean') {
	    return db._remote;
	  }
	  /* istanbul ignore next */
	  if (typeof db.type === 'function') {
	    guardedConsole$1('warn',
	      'db.type() is deprecated and will be removed in ' +
	      'a future version of PouchDB');
	    return db.type() === 'http';
	  }
	  /* istanbul ignore next */
	  return false;
	}

	// this is essentially the "update sugar" function from daleharvey/pouchdb#1388
	// the diffFun tells us what delta to apply to the doc.  it either returns
	// the doc, or false if it doesn't need to do an update after all
	function upsert$1(db, docId, diffFun) {
	  return new PouchPromise$1(function (fulfill, reject) {
	    db.get(docId, function (err, doc) {
	      if (err) {
	        /* istanbul ignore next */
	        if (err.status !== 404) {
	          return reject(err);
	        }
	        doc = {};
	      }

	      // the user might change the _rev, so save it for posterity
	      var docRev = doc._rev;
	      var newDoc = diffFun(doc);

	      if (!newDoc) {
	        // if the diffFun returns falsy, we short-circuit as
	        // an optimization
	        return fulfill({updated: false, rev: docRev});
	      }

	      // users aren't allowed to modify these values,
	      // so reset them here
	      newDoc._id = docId;
	      newDoc._rev = docRev;
	      fulfill(tryAndPut$1(db, newDoc, diffFun));
	    });
	  });
	}

	function tryAndPut$1(db, doc, diffFun) {
	  return db.put(doc).then(function (res) {
	    return {
	      updated: true,
	      rev: res.rev
	    };
	  }, function (err) {
	    /* istanbul ignore next */
	    if (err.status !== 409) {
	      throw err;
	    }
	    return upsert$1(db, doc._id, diffFun);
	  });
	}

	function pad$1(str, padWith, upToLength) {
	  var padding = '';
	  var targetLength = upToLength - str.length;
	  /* istanbul ignore next */
	  while (padding.length < targetLength) {
	    padding += padWith;
	  }
	  return padding;
	}

	function padLeft$1(str, padWith, upToLength) {
	  var padding = pad$1(str, padWith, upToLength);
	  return padding + str;
	}

	var MIN_MAGNITUDE$1 = -324; // verified by -Number.MIN_VALUE
	var MAGNITUDE_DIGITS$1 = 3; // ditto
	var SEP$1 = ''; // set to '_' for easier debugging 

	function collate$1(a, b) {

	  if (a === b) {
	    return 0;
	  }

	  a = normalizeKey$1(a);
	  b = normalizeKey$1(b);

	  var ai = collationIndex$1(a);
	  var bi = collationIndex$1(b);
	  if ((ai - bi) !== 0) {
	    return ai - bi;
	  }
	  switch (typeof a) {
	    case 'number':
	      return a - b;
	    case 'boolean':
	      return a < b ? -1 : 1;
	    case 'string':
	      return stringCollate$1(a, b);
	  }
	  return Array.isArray(a) ? arrayCollate$1(a, b) : objectCollate$1(a, b);
	}

	// couch considers null/NaN/Infinity/-Infinity === undefined,
	// for the purposes of mapreduce indexes. also, dates get stringified.
	function normalizeKey$1(key) {
	  switch (typeof key) {
	    case 'undefined':
	      return null;
	    case 'number':
	      if (key === Infinity || key === -Infinity || isNaN(key)) {
	        return null;
	      }
	      return key;
	    case 'object':
	      var origKey = key;
	      if (Array.isArray(key)) {
	        var len = key.length;
	        key = new Array(len);
	        for (var i = 0; i < len; i++) {
	          key[i] = normalizeKey$1(origKey[i]);
	        }
	      /* istanbul ignore next */
	      } else if (key instanceof Date) {
	        return key.toJSON();
	      } else if (key !== null) { // generic object
	        key = {};
	        for (var k in origKey) {
	          if (origKey.hasOwnProperty(k)) {
	            var val = origKey[k];
	            if (typeof val !== 'undefined') {
	              key[k] = normalizeKey$1(val);
	            }
	          }
	        }
	      }
	  }
	  return key;
	}

	function indexify$1(key) {
	  if (key !== null) {
	    switch (typeof key) {
	      case 'boolean':
	        return key ? 1 : 0;
	      case 'number':
	        return numToIndexableString$1(key);
	      case 'string':
	        // We've to be sure that key does not contain \u0000
	        // Do order-preserving replacements:
	        // 0 -> 1, 1
	        // 1 -> 1, 2
	        // 2 -> 2, 2
	        return key
	          .replace(/\u0002/g, '\u0002\u0002')
	          .replace(/\u0001/g, '\u0001\u0002')
	          .replace(/\u0000/g, '\u0001\u0001');
	      case 'object':
	        var isArray = Array.isArray(key);
	        var arr = isArray ? key : Object.keys(key);
	        var i = -1;
	        var len = arr.length;
	        var result = '';
	        if (isArray) {
	          while (++i < len) {
	            result += toIndexableString$1(arr[i]);
	          }
	        } else {
	          while (++i < len) {
	            var objKey = arr[i];
	            result += toIndexableString$1(objKey) +
	                toIndexableString$1(key[objKey]);
	          }
	        }
	        return result;
	    }
	  }
	  return '';
	}

	// convert the given key to a string that would be appropriate
	// for lexical sorting, e.g. within a database, where the
	// sorting is the same given by the collate() function.
	function toIndexableString$1(key) {
	  var zero = '\u0000';
	  key = normalizeKey$1(key);
	  return collationIndex$1(key) + SEP$1 + indexify$1(key) + zero;
	}

	function parseNumber$1(str, i) {
	  var originalIdx = i;
	  var num;
	  var zero = str[i] === '1';
	  if (zero) {
	    num = 0;
	    i++;
	  } else {
	    var neg = str[i] === '0';
	    i++;
	    var numAsString = '';
	    var magAsString = str.substring(i, i + MAGNITUDE_DIGITS$1);
	    var magnitude = parseInt(magAsString, 10) + MIN_MAGNITUDE$1;
	    /* istanbul ignore next */
	    if (neg) {
	      magnitude = -magnitude;
	    }
	    i += MAGNITUDE_DIGITS$1;
	    while (true) {
	      var ch = str[i];
	      if (ch === '\u0000') {
	        break;
	      } else {
	        numAsString += ch;
	      }
	      i++;
	    }
	    numAsString = numAsString.split('.');
	    if (numAsString.length === 1) {
	      num = parseInt(numAsString, 10);
	    } else {
	      /* istanbul ignore next */
	      num = parseFloat(numAsString[0] + '.' + numAsString[1]);
	    }
	    /* istanbul ignore next */
	    if (neg) {
	      num = num - 10;
	    }
	    /* istanbul ignore next */
	    if (magnitude !== 0) {
	      // parseFloat is more reliable than pow due to rounding errors
	      // e.g. Number.MAX_VALUE would return Infinity if we did
	      // num * Math.pow(10, magnitude);
	      num = parseFloat(num + 'e' + magnitude);
	    }
	  }
	  return {num: num, length : i - originalIdx};
	}

	// move up the stack while parsing
	// this function moved outside of parseIndexableString for performance
	function pop$2(stack, metaStack) {
	  var obj = stack.pop();

	  if (metaStack.length) {
	    var lastMetaElement = metaStack[metaStack.length - 1];
	    if (obj === lastMetaElement.element) {
	      // popping a meta-element, e.g. an object whose value is another object
	      metaStack.pop();
	      lastMetaElement = metaStack[metaStack.length - 1];
	    }
	    var element = lastMetaElement.element;
	    var lastElementIndex = lastMetaElement.index;
	    if (Array.isArray(element)) {
	      element.push(obj);
	    } else if (lastElementIndex === stack.length - 2) { // obj with key+value
	      var key = stack.pop();
	      element[key] = obj;
	    } else {
	      stack.push(obj); // obj with key only
	    }
	  }
	}

	function parseIndexableString$1(str) {
	  var stack = [];
	  var metaStack = []; // stack for arrays and objects
	  var i = 0;

	  /*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
	  while (true) {
	    var collationIndex = str[i++];
	    if (collationIndex === '\u0000') {
	      if (stack.length === 1) {
	        return stack.pop();
	      } else {
	        pop$2(stack, metaStack);
	        continue;
	      }
	    }
	    switch (collationIndex) {
	      case '1':
	        stack.push(null);
	        break;
	      case '2':
	        stack.push(str[i] === '1');
	        i++;
	        break;
	      case '3':
	        var parsedNum = parseNumber$1(str, i);
	        stack.push(parsedNum.num);
	        i += parsedNum.length;
	        break;
	      case '4':
	        var parsedStr = '';
	        /*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
	        while (true) {
	          var ch = str[i];
	          if (ch === '\u0000') {
	            break;
	          }
	          parsedStr += ch;
	          i++;
	        }
	        // perform the reverse of the order-preserving replacement
	        // algorithm (see above)
	        parsedStr = parsedStr.replace(/\u0001\u0001/g, '\u0000')
	          .replace(/\u0001\u0002/g, '\u0001')
	          .replace(/\u0002\u0002/g, '\u0002');
	        stack.push(parsedStr);
	        break;
	      case '5':
	        var arrayElement = { element: [], index: stack.length };
	        stack.push(arrayElement.element);
	        metaStack.push(arrayElement);
	        break;
	      case '6':
	        var objElement = { element: {}, index: stack.length };
	        stack.push(objElement.element);
	        metaStack.push(objElement);
	        break;
	      /* istanbul ignore next */
	      default:
	        throw new Error(
	          'bad collationIndex or unexpectedly reached end of input: ' +
	            collationIndex);
	    }
	  }
	}

	function arrayCollate$1(a, b) {
	  var len = Math.min(a.length, b.length);
	  for (var i = 0; i < len; i++) {
	    var sort = collate$1(a[i], b[i]);
	    if (sort !== 0) {
	      return sort;
	    }
	  }
	  return (a.length === b.length) ? 0 :
	    (a.length > b.length) ? 1 : -1;
	}
	function stringCollate$1(a, b) {
	  // See: https://github.com/daleharvey/pouchdb/issues/40
	  // This is incompatible with the CouchDB implementation, but its the
	  // best we can do for now
	  return (a === b) ? 0 : ((a > b) ? 1 : -1);
	}
	function objectCollate$1(a, b) {
	  var ak = Object.keys(a), bk = Object.keys(b);
	  var len = Math.min(ak.length, bk.length);
	  for (var i = 0; i < len; i++) {
	    // First sort the keys
	    var sort = collate$1(ak[i], bk[i]);
	    if (sort !== 0) {
	      return sort;
	    }
	    // if the keys are equal sort the values
	    sort = collate$1(a[ak[i]], b[bk[i]]);
	    if (sort !== 0) {
	      return sort;
	    }

	  }
	  return (ak.length === bk.length) ? 0 :
	    (ak.length > bk.length) ? 1 : -1;
	}
	// The collation is defined by erlangs ordered terms
	// the atoms null, true, false come first, then numbers, strings,
	// arrays, then objects
	// null/undefined/NaN/Infinity/-Infinity are all considered null
	function collationIndex$1(x) {
	  var id = ['boolean', 'number', 'string', 'object'];
	  var idx = id.indexOf(typeof x);
	  //false if -1 otherwise true, but fast!!!!1
	  if (~idx) {
	    if (x === null) {
	      return 1;
	    }
	    if (Array.isArray(x)) {
	      return 5;
	    }
	    return idx < 3 ? (idx + 2) : (idx + 3);
	  }
	  /* istanbul ignore next */
	  if (Array.isArray(x)) {
	    return 5;
	  }
	}

	// conversion:
	// x yyy zz...zz
	// x = 0 for negative, 1 for 0, 2 for positive
	// y = exponent (for negative numbers negated) moved so that it's >= 0
	// z = mantisse
	function numToIndexableString$1(num) {

	  if (num === 0) {
	    return '1';
	  }

	  // convert number to exponential format for easier and
	  // more succinct string sorting
	  var expFormat = num.toExponential().split(/e\+?/);
	  var magnitude = parseInt(expFormat[1], 10);

	  var neg = num < 0;

	  var result = neg ? '0' : '2';

	  // first sort by magnitude
	  // it's easier if all magnitudes are positive
	  var magForComparison = ((neg ? -magnitude : magnitude) - MIN_MAGNITUDE$1);
	  var magString = padLeft$1((magForComparison).toString(), '0', MAGNITUDE_DIGITS$1);

	  result += SEP$1 + magString;

	  // then sort by the factor
	  var factor = Math.abs(parseFloat(expFormat[0])); // [1..10)
	  /* istanbul ignore next */
	  if (neg) { // for negative reverse ordering
	    factor = 10 - factor;
	  }

	  var factorStr = factor.toFixed(20);

	  // strip zeros from the end
	  factorStr = factorStr.replace(/\.?0+$/, '');

	  result += SEP$1 + factorStr;

	  return result;
	}

	// this would just be "return doc[field]", but fields
	// can be "deep" due to dot notation
	function getFieldFromDoc$1(doc, parsedField) {
	  var value = doc;
	  for (var i = 0, len = parsedField.length; i < len; i++) {
	    var key = parsedField[i];
	    value = value[key];
	    if (!value) {
	      break;
	    }
	  }
	  return value;
	}

	function setFieldInDoc(doc, parsedField, value) {
	  for (var i = 0, len = parsedField.length; i < len-1; i++) {
	    var elem = parsedField[i];
	    doc = doc[elem] = {};
	  }
	  doc[parsedField[len-1]] = value;
	}

	function compare$2(left, right) {
	  return left < right ? -1 : left > right ? 1 : 0;
	}

	// Converts a string in dot notation to an array of its components, with backslash escaping
	function parseField$1(fieldName) {
	  // fields may be deep (e.g. "foo.bar.baz"), so parse
	  var fields = [];
	  var current = '';
	  for (var i = 0, len = fieldName.length; i < len; i++) {
	    var ch = fieldName[i];
	    if (ch === '.') {
	      if (i > 0 && fieldName[i - 1] === '\\') { // escaped delimiter
	        current = current.substring(0, current.length - 1) + '.';
	      } else { // not escaped, so delimiter
	        fields.push(current);
	        current = '';
	      }
	    } else { // normal character
	      current += ch;
	    }
	  }
	  fields.push(current);
	  return fields;
	}

	var combinationFields$1 = ['$or', '$nor', '$not'];
	function isCombinationalField$1(field) {
	  return combinationFields$1.indexOf(field) > -1;
	}

	function getKey$1(obj) {
	  return Object.keys(obj)[0];
	}

	function getValue$1(obj) {
	  return obj[getKey$1(obj)];
	}


	// flatten an array of selectors joined by an $and operator
	function mergeAndedSelectors$1(selectors) {

	  // sort to ensure that e.g. if the user specified
	  // $and: [{$gt: 'a'}, {$gt: 'b'}], then it's collapsed into
	  // just {$gt: 'b'}
	  var res = {};

	  selectors.forEach(function (selector) {
	    Object.keys(selector).forEach(function (field) {
	      var matcher = selector[field];
	      if (typeof matcher !== 'object') {
	        matcher = {$eq: matcher};
	      }

	      if (isCombinationalField$1(field)) {
	        if (matcher instanceof Array) {
	          res[field] = matcher.map(function (m) {
	            return mergeAndedSelectors$1([m]);
	          });
	        } else {
	          res[field] = mergeAndedSelectors$1([matcher]);
	        }
	      } else {
	        var fieldMatchers = res[field] = res[field] || {};
	        Object.keys(matcher).forEach(function (operator) {
	          var value = matcher[operator];

	          if (operator === '$gt' || operator === '$gte') {
	            return mergeGtGte$1(operator, value, fieldMatchers);
	          } else if (operator === '$lt' || operator === '$lte') {
	            return mergeLtLte$1(operator, value, fieldMatchers);
	          } else if (operator === '$ne') {
	            return mergeNe$1(value, fieldMatchers);
	          } else if (operator === '$eq') {
	            return mergeEq$1(value, fieldMatchers);
	          }
	          fieldMatchers[operator] = value;
	        });
	      }
	    });
	  });

	  return res;
	}



	// collapse logically equivalent gt/gte values
	function mergeGtGte$1(operator, value, fieldMatchers) {
	  if (typeof fieldMatchers.$eq !== 'undefined') {
	    return; // do nothing
	  }
	  if (typeof fieldMatchers.$gte !== 'undefined') {
	    if (operator === '$gte') {
	      if (value > fieldMatchers.$gte) { // more specificity
	        fieldMatchers.$gte = value;
	      }
	    } else { // operator === '$gt'
	      if (value >= fieldMatchers.$gte) { // more specificity
	        delete fieldMatchers.$gte;
	        fieldMatchers.$gt = value;
	      }
	    }
	  } else if (typeof fieldMatchers.$gt !== 'undefined') {
	    if (operator === '$gte') {
	      if (value > fieldMatchers.$gt) { // more specificity
	        delete fieldMatchers.$gt;
	        fieldMatchers.$gte = value;
	      }
	    } else { // operator === '$gt'
	      if (value > fieldMatchers.$gt) { // more specificity
	        fieldMatchers.$gt = value;
	      }
	    }
	  } else {
	    fieldMatchers[operator] = value;
	  }
	}

	// collapse logically equivalent lt/lte values
	function mergeLtLte$1(operator, value, fieldMatchers) {
	  if (typeof fieldMatchers.$eq !== 'undefined') {
	    return; // do nothing
	  }
	  if (typeof fieldMatchers.$lte !== 'undefined') {
	    if (operator === '$lte') {
	      if (value < fieldMatchers.$lte) { // more specificity
	        fieldMatchers.$lte = value;
	      }
	    } else { // operator === '$gt'
	      if (value <= fieldMatchers.$lte) { // more specificity
	        delete fieldMatchers.$lte;
	        fieldMatchers.$lt = value;
	      }
	    }
	  } else if (typeof fieldMatchers.$lt !== 'undefined') {
	    if (operator === '$lte') {
	      if (value < fieldMatchers.$lt) { // more specificity
	        delete fieldMatchers.$lt;
	        fieldMatchers.$lte = value;
	      }
	    } else { // operator === '$gt'
	      if (value < fieldMatchers.$lt) { // more specificity
	        fieldMatchers.$lt = value;
	      }
	    }
	  } else {
	    fieldMatchers[operator] = value;
	  }
	}

	// combine $ne values into one array
	function mergeNe$1(value, fieldMatchers) {
	  if ('$ne' in fieldMatchers) {
	    // there are many things this could "not" be
	    fieldMatchers.$ne.push(value);
	  } else { // doesn't exist yet
	    fieldMatchers.$ne = [value];
	  }
	}

	// add $eq into the mix
	function mergeEq$1(value, fieldMatchers) {
	  // these all have less specificity than the $eq
	  // TODO: check for user errors here
	  delete fieldMatchers.$gt;
	  delete fieldMatchers.$gte;
	  delete fieldMatchers.$lt;
	  delete fieldMatchers.$lte;
	  delete fieldMatchers.$ne;
	  fieldMatchers.$eq = value;
	}


	//
	// normalize the selector
	//
	function massageSelector$1(input) {
	  var result = clone$1(input);
	  var wasAnded = false;
	  if ('$and' in result) {
	    result = mergeAndedSelectors$1(result['$and']);
	    wasAnded = true;
	  }

	  ['$or', '$nor'].forEach(function (orOrNor) {
	    if (orOrNor in result) {
	      // message each individual selector
	      // e.g. {foo: 'bar'} becomes {foo: {$eq: 'bar'}}
	      result[orOrNor].forEach(function (subSelector) {
	        var fields = Object.keys(subSelector);
	        for (var i = 0; i < fields.length; i++) {
	          var field = fields[i];
	          var matcher = subSelector[field];
	          if (typeof matcher !== 'object' || matcher === null) {
	            subSelector[field] = {$eq: matcher};
	          }
	        }
	      });
	    }
	  });

	  if ('$not' in result) {
	    //This feels a little like forcing, but it will work for now,
	    //I would like to come back to this and make the merging of selectors a little more generic
	    result['$not'] = mergeAndedSelectors$1([result['$not']]);
	  }

	  var fields = Object.keys(result);

	  for (var i = 0; i < fields.length; i++) {
	    var field = fields[i];
	    var matcher = result[field];

	    if (typeof matcher !== 'object' || matcher === null) {
	      matcher = {$eq: matcher};
	    } else if ('$ne' in matcher && !wasAnded) {
	      // I put these in an array, since there may be more than one
	      // but in the "mergeAnded" operation, I already take care of that
	      matcher.$ne = [matcher.$ne];
	    }
	    result[field] = matcher;
	  }

	  return result;
	}

	// create a comparator based on the sort object
	function createFieldSorter$1(sort) {

	  function getFieldValuesAsArray(doc) {
	    return sort.map(function (sorting) {
	      var fieldName = getKey$1(sorting);
	      var parsedField = parseField$1(fieldName);
	      var docFieldValue = getFieldFromDoc$1(doc, parsedField);
	      return docFieldValue;
	    });
	  }

	  return function (aRow, bRow) {
	    var aFieldValues = getFieldValuesAsArray(aRow.doc);
	    var bFieldValues = getFieldValuesAsArray(bRow.doc);
	    var collation = collate$1(aFieldValues, bFieldValues);
	    if (collation !== 0) {
	      return collation;
	    }
	    // this is what mango seems to do
	    return compare$2(aRow.doc._id, bRow.doc._id);
	  };
	}

	function filterInMemoryFields$1(rows, requestDef, inMemoryFields) {
	  rows = rows.filter(function (row) {
	    return rowFilter$1(row.doc, requestDef.selector, inMemoryFields);
	  });

	  if (requestDef.sort) {
	    // in-memory sort
	    var fieldSorter = createFieldSorter$1(requestDef.sort);
	    rows = rows.sort(fieldSorter);
	    if (typeof requestDef.sort[0] !== 'string' &&
	        getValue$1(requestDef.sort[0]) === 'desc') {
	      rows = rows.reverse();
	    }
	  }

	  if ('limit' in requestDef || 'skip' in requestDef) {
	    // have to do the limit in-memory
	    var skip = requestDef.skip || 0;
	    var limit = ('limit' in requestDef ? requestDef.limit : rows.length) + skip;
	    rows = rows.slice(skip, limit);
	  }
	  return rows;
	}

	function rowFilter$1(doc, selector, inMemoryFields) {
	  return inMemoryFields.every(function (field) {
	    var matcher = selector[field];
	    var parsedField = parseField$1(field);
	    var docFieldValue = getFieldFromDoc$1(doc, parsedField);
	    if (isCombinationalField$1(field)) {
	      return matchCominationalSelector$1(field, matcher, doc);
	    }

	    return matchSelector$1(matcher, doc, parsedField, docFieldValue);
	  });
	}

	function matchSelector$1(matcher, doc, parsedField, docFieldValue) {
	  if (!matcher) {
	    // no filtering necessary; this field is just needed for sorting
	    return true;
	  }

	  return Object.keys(matcher).every(function (userOperator) {
	    var userValue = matcher[userOperator];
	    return match$1(userOperator, doc, userValue, parsedField, docFieldValue);
	  });
	}

	function matchCominationalSelector$1(field, matcher, doc) {

	  if (field === '$or') {
	    return matcher.some(function (orMatchers) {
	      return rowFilter$1(doc, orMatchers, Object.keys(orMatchers));
	    });
	  }

	  if (field === '$not') {
	    return !rowFilter$1(doc, matcher, Object.keys(matcher));
	  }

	  //`$nor`
	  return !matcher.find(function (orMatchers) {
	    return rowFilter$1(doc, orMatchers, Object.keys(orMatchers));
	  });

	}

	function match$1(userOperator, doc, userValue, parsedField, docFieldValue) {
	  if (!matchers$1[userOperator]) {
	    throw new Error('unknown operator "' + userOperator +
	      '" - should be one of $eq, $lte, $lt, $gt, $gte, $exists, $ne, $in, ' +
	      '$nin, $size, $mod, $regex, $elemMatch, $type, $allMatch or $all');
	  }
	  return matchers$1[userOperator](doc, userValue, parsedField, docFieldValue);
	}

	function fieldExists$1(docFieldValue) {
	  return typeof docFieldValue !== 'undefined' && docFieldValue !== null;
	}

	function fieldIsNotUndefined$1(docFieldValue) {
	  return typeof docFieldValue !== 'undefined';
	}

	function modField$1(docFieldValue, userValue) {
	  var divisor = userValue[0];
	  var mod = userValue[1];
	  if (divisor === 0) {
	    throw new Error('Bad divisor, cannot divide by zero');
	  }

	  if (parseInt(divisor, 10) !== divisor ) {
	    throw new Error('Divisor is not an integer');
	  }

	  if (parseInt(mod, 10) !== mod ) {
	    throw new Error('Modulus is not an integer');
	  }

	  if (parseInt(docFieldValue, 10) !== docFieldValue) {
	    return false;
	  }

	  return docFieldValue % divisor === mod;
	}

	function arrayContainsValue$1(docFieldValue, userValue) {
	  return userValue.some(function (val) {
	    if (docFieldValue instanceof Array) {
	      return docFieldValue.indexOf(val) > -1;
	    }

	    return docFieldValue === val;
	  });
	}

	function arrayContainsAllValues$1(docFieldValue, userValue) {
	  return userValue.every(function (val) {
	    return docFieldValue.indexOf(val) > -1;
	  });
	}

	function arraySize$1(docFieldValue, userValue) {
	  return docFieldValue.length === userValue;
	}

	function regexMatch$1(docFieldValue, userValue) {
	  var re = new RegExp(userValue);

	  return re.test(docFieldValue);
	}

	function typeMatch$1(docFieldValue, userValue) {

	  switch (userValue) {
	    case 'null':
	      return docFieldValue === null;
	    case 'boolean':
	      return typeof (docFieldValue) === 'boolean';
	    case 'number':
	      return typeof (docFieldValue) === 'number';
	    case 'string':
	      return typeof (docFieldValue) === 'string';
	    case 'array':
	      return docFieldValue instanceof Array;
	    case 'object':
	      return ({}).toString.call(docFieldValue) === '[object Object]';
	  }

	  throw new Error(userValue + ' not supported as a type.' +
	                  'Please use one of object, string, array, number, boolean or null.');

	}

	var matchers$1 = {

	  '$elemMatch': function (doc, userValue, parsedField, docFieldValue) {
	    if (!Array.isArray(docFieldValue)) {
	      return false;
	    }

	    if (docFieldValue.length === 0) {
	      return false;
	    }

	    if (typeof docFieldValue[0] === 'object') {
	      return docFieldValue.some(function (val) {
	        return rowFilter$1(val, userValue, Object.keys(userValue));
	      });
	    }

	    return docFieldValue.some(function (val) {
	      return matchSelector$1(userValue, doc, parsedField, val);
	    });
	  },

	  '$allMatch': function (doc, userValue, parsedField, docFieldValue) {
	    if (!Array.isArray(docFieldValue)) {
	      return false;
	    }

	    /* istanbul ignore next */
	    if (docFieldValue.length === 0) {
	      return false;
	    }

	    if (typeof docFieldValue[0] === 'object') {
	      return docFieldValue.every(function (val) {
	        return rowFilter$1(val, userValue, Object.keys(userValue));
	      });
	    }

	    return docFieldValue.every(function (val) {
	      return matchSelector$1(userValue, doc, parsedField, val);
	    });
	  },

	  '$eq': function (doc, userValue, parsedField, docFieldValue) {
	    return fieldIsNotUndefined$1(docFieldValue) && collate$1(docFieldValue, userValue) === 0;
	  },

	  '$gte': function (doc, userValue, parsedField, docFieldValue) {
	    return fieldIsNotUndefined$1(docFieldValue) && collate$1(docFieldValue, userValue) >= 0;
	  },

	  '$gt': function (doc, userValue, parsedField, docFieldValue) {
	    return fieldIsNotUndefined$1(docFieldValue) && collate$1(docFieldValue, userValue) > 0;
	  },

	  '$lte': function (doc, userValue, parsedField, docFieldValue) {
	    return fieldIsNotUndefined$1(docFieldValue) && collate$1(docFieldValue, userValue) <= 0;
	  },

	  '$lt': function (doc, userValue, parsedField, docFieldValue) {
	    return fieldIsNotUndefined$1(docFieldValue) && collate$1(docFieldValue, userValue) < 0;
	  },

	  '$exists': function (doc, userValue, parsedField, docFieldValue) {
	    //a field that is null is still considered to exist
	    if (userValue) {
	      return fieldIsNotUndefined$1(docFieldValue);
	    }

	    return !fieldIsNotUndefined$1(docFieldValue);
	  },

	  '$mod': function (doc, userValue, parsedField, docFieldValue) {
	    return fieldExists$1(docFieldValue) && modField$1(docFieldValue, userValue);
	  },

	  '$ne': function (doc, userValue, parsedField, docFieldValue) {
	    return userValue.every(function (neValue) {
	      return collate$1(docFieldValue, neValue) !== 0;
	    });
	  },
	  '$in': function (doc, userValue, parsedField, docFieldValue) {
	    return fieldExists$1(docFieldValue) && arrayContainsValue$1(docFieldValue, userValue);
	  },

	  '$nin': function (doc, userValue, parsedField, docFieldValue) {
	    return fieldExists$1(docFieldValue) && !arrayContainsValue$1(docFieldValue, userValue);
	  },

	  '$size': function (doc, userValue, parsedField, docFieldValue) {
	    return fieldExists$1(docFieldValue) && arraySize$1(docFieldValue, userValue);
	  },

	  '$all': function (doc, userValue, parsedField, docFieldValue) {
	    return Array.isArray(docFieldValue) && arrayContainsAllValues$1(docFieldValue, userValue);
	  },

	  '$regex': function (doc, userValue, parsedField, docFieldValue) {
	    return fieldExists$1(docFieldValue) && regexMatch$1(docFieldValue, userValue);
	  },

	  '$type': function (doc, userValue, parsedField, docFieldValue) {
	    return typeMatch$1(docFieldValue, userValue);
	  }
	};

	function stringMd5$1(string) {
	  return crypto.createHash('md5').update(string, 'binary').digest('hex');
	}

	function typedBuffer$1(binString, buffType, type) {
	  // buffType is either 'binary' or 'base64'
	  var buff = bufferFrom_1(binString, buffType);
	  buff.type = type; // non-standard, but used for consistency with the browser
	  return buff;
	}

	function b64ToBluffer$1(b64, type) {
	  return typedBuffer$1(b64, 'base64', type);
	}

	function QueryParseError$1(message) {
	  this.status = 400;
	  this.name = 'query_parse_error';
	  this.message = message;
	  this.error = true;
	  try {
	    Error.captureStackTrace(this, QueryParseError$1);
	  } catch (e) {}
	}

	inherits(QueryParseError$1, Error);

	function NotFoundError$3(message) {
	  this.status = 404;
	  this.name = 'not_found';
	  this.message = message;
	  this.error = true;
	  try {
	    Error.captureStackTrace(this, NotFoundError$3);
	  } catch (e) {}
	}

	inherits(NotFoundError$3, Error);

	function BuiltInError$1(message) {
	  this.status = 500;
	  this.name = 'invalid_value';
	  this.message = message;
	  this.error = true;
	  try {
	    Error.captureStackTrace(this, BuiltInError$1);
	  } catch (e) {}
	}

	inherits(BuiltInError$1, Error);

	function promisedCallback$1(promise, callback) {
	  if (callback) {
	    promise.then(function (res) {
	      nextTick$2(function () {
	        callback(null, res);
	      });
	    }, function (reason) {
	      nextTick$2(function () {
	        callback(reason);
	      });
	    });
	  }
	  return promise;
	}

	function callbackify$1(fun) {
	  return argsarray(function (args) {
	    var cb = args.pop();
	    var promise = fun.apply(this, args);
	    if (typeof cb === 'function') {
	      promisedCallback$1(promise, cb);
	    }
	    return promise;
	  });
	}

	// Promise finally util similar to Q.finally
	function fin$1(promise, finalPromiseFactory) {
	  return promise.then(function (res) {
	    return finalPromiseFactory().then(function () {
	      return res;
	    });
	  }, function (reason) {
	    return finalPromiseFactory().then(function () {
	      throw reason;
	    });
	  });
	}

	function sequentialize$1(queue, promiseFactory) {
	  return function () {
	    var args = arguments;
	    var that = this;
	    return queue.add(function () {
	      return promiseFactory.apply(that, args);
	    });
	  };
	}

	// uniq an array of strings, order not guaranteed
	// similar to underscore/lodash _.uniq
	function uniq$1(arr) {
	  var theSet = new ExportedSet$1(arr);
	  var result = new Array(theSet.size);
	  var index = -1;
	  theSet.forEach(function (value) {
	    result[++index] = value;
	  });
	  return result;
	}

	function mapToKeysArray$1(map) {
	  var result = new Array(map.size);
	  var index = -1;
	  map.forEach(function (value, key) {
	    result[++index] = key;
	  });
	  return result;
	}

	/*
	 * Simple task queue to sequentialize actions. Assumes
	 * callbacks will eventually fire (once).
	 */


	function TaskQueue() {
	  this.promise = new PouchPromise$1(function (fulfill) {fulfill(); });
	}
	TaskQueue.prototype.add = function (promiseFactory) {
	  this.promise = this.promise.catch(function () {
	    // just recover
	  }).then(function () {
	    return promiseFactory();
	  });
	  return this.promise;
	};
	TaskQueue.prototype.finish = function () {
	  return this.promise;
	};

	function stringify$2(input) {
	  if (!input) {
	    return 'undefined'; // backwards compat for empty reduce
	  }
	  // for backwards compat with mapreduce, functions/strings are stringified
	  // as-is. everything else is JSON-stringified.
	  switch (typeof input) {
	    case 'function':
	      // e.g. a mapreduce map
	      return input.toString();
	    case 'string':
	      // e.g. a mapreduce built-in _reduce function
	      return input.toString();
	    default:
	      // e.g. a JSON object in the case of mango queries
	      return JSON.stringify(input);
	  }
	}

	/* create a string signature for a view so we can cache it and uniq it */
	function createViewSignature$1(mapFun, reduceFun) {
	  // the "undefined" part is for backwards compatibility
	  return stringify$2(mapFun) + stringify$2(reduceFun) + 'undefined';
	}

	function createView$1(sourceDB, viewName, mapFun, reduceFun, temporary, localDocName) {
	  var viewSignature = createViewSignature$1(mapFun, reduceFun);

	  var cachedViews;
	  if (!temporary) {
	    // cache this to ensure we don't try to update the same view twice
	    cachedViews = sourceDB._cachedViews = sourceDB._cachedViews || {};
	    if (cachedViews[viewSignature]) {
	      return cachedViews[viewSignature];
	    }
	  }

	  var promiseForView = sourceDB.info().then(function (info) {

	    var depDbName = info.db_name + '-mrview-' +
	      (temporary ? 'temp' : stringMd5$1(viewSignature));

	    // save the view name in the source db so it can be cleaned up if necessary
	    // (e.g. when the _design doc is deleted, remove all associated view data)
	    function diffFunction(doc) {
	      doc.views = doc.views || {};
	      var fullViewName = viewName;
	      if (fullViewName.indexOf('/') === -1) {
	        fullViewName = viewName + '/' + viewName;
	      }
	      var depDbs = doc.views[fullViewName] = doc.views[fullViewName] || {};
	      /* istanbul ignore if */
	      if (depDbs[depDbName]) {
	        return; // no update necessary
	      }
	      depDbs[depDbName] = true;
	      return doc;
	    }
	    return upsert$1(sourceDB, '_local/' + localDocName, diffFunction).then(function () {
	      return sourceDB.registerDependentDatabase(depDbName).then(function (res) {
	        var db = res.db;
	        db.auto_compaction = true;
	        var view = {
	          name: depDbName,
	          db: db,
	          sourceDB: sourceDB,
	          adapter: sourceDB.adapter,
	          mapFun: mapFun,
	          reduceFun: reduceFun
	        };
	        return view.db.get('_local/lastSeq').catch(function (err) {
	          /* istanbul ignore if */
	          if (err.status !== 404) {
	            throw err;
	          }
	        }).then(function (lastSeqDoc) {
	          view.seq = lastSeqDoc ? lastSeqDoc.seq : 0;
	          if (cachedViews) {
	            view.db.once('destroyed', function () {
	              delete cachedViews[viewSignature];
	            });
	          }
	          return view;
	        });
	      });
	    });
	  });

	  if (cachedViews) {
	    cachedViews[viewSignature] = promiseForView;
	  }
	  return promiseForView;
	}

	var persistentQueues$1 = {};
	var tempViewQueue$1 = new TaskQueue();
	var CHANGES_BATCH_SIZE$2 = 50;

	function parseViewName$1(name) {
	  // can be either 'ddocname/viewname' or just 'viewname'
	  // (where the ddoc name is the same)
	  return name.indexOf('/') === -1 ? [name, name] : name.split('/');
	}

	function isGenOne$2(changes) {
	  // only return true if the current change is 1-
	  // and there are no other leafs
	  return changes.length === 1 && /^1-/.test(changes[0].rev);
	}

	function emitError$1(db, e) {
	  try {
	    db.emit('error', e);
	  } catch (err) {
	    guardedConsole$1('error',
	      'The user\'s map/reduce function threw an uncaught error.\n' +
	      'You can debug this error by doing:\n' +
	      'myDatabase.on(\'error\', function (err) { debugger; });\n' +
	      'Please double-check your map/reduce function.');
	    guardedConsole$1('error', e);
	  }
	}

	/**
	 * Returns an "abstract" mapreduce object of the form:
	 *
	 *   {
	 *     query: queryFun,
	 *     viewCleanup: viewCleanupFun
	 *   }
	 *
	 * Arguments are:
	 *
	 * localDoc: string
	 *   This is for the local doc that gets saved in order to track the
	 *   "dependent" DBs and clean them up for viewCleanup. It should be
	 *   unique, so that indexer plugins don't collide with each other.
	 * mapper: function (mapFunDef, emit)
	 *   Returns a map function based on the mapFunDef, which in the case of
	 *   normal map/reduce is just the de-stringified function, but may be
	 *   something else, such as an object in the case of pouchdb-find.
	 * reducer: function (reduceFunDef)
	 *   Ditto, but for reducing. Modules don't have to support reducing
	 *   (e.g. pouchdb-find).
	 * ddocValidator: function (ddoc, viewName)
	 *   Throws an error if the ddoc or viewName is not valid.
	 *   This could be a way to communicate to the user that the configuration for the
	 *   indexer is invalid.
	 */
	function createAbstractMapReduce$1(localDocName, mapper, reducer, ddocValidator) {

	  function tryMap(db, fun, doc) {
	    // emit an event if there was an error thrown by a map function.
	    // putting try/catches in a single function also avoids deoptimizations.
	    try {
	      fun(doc);
	    } catch (e) {
	      emitError$1(db, e);
	    }
	  }

	  function tryReduce(db, fun, keys, values, rereduce) {
	    // same as above, but returning the result or an error. there are two separate
	    // functions to avoid extra memory allocations since the tryCode() case is used
	    // for custom map functions (common) vs this function, which is only used for
	    // custom reduce functions (rare)
	    try {
	      return {output : fun(keys, values, rereduce)};
	    } catch (e) {
	      emitError$1(db, e);
	      return {error: e};
	    }
	  }

	  function sortByKeyThenValue(x, y) {
	    var keyCompare = collate$1(x.key, y.key);
	    return keyCompare !== 0 ? keyCompare : collate$1(x.value, y.value);
	  }

	  function sliceResults(results, limit, skip) {
	    skip = skip || 0;
	    if (typeof limit === 'number') {
	      return results.slice(skip, limit + skip);
	    } else if (skip > 0) {
	      return results.slice(skip);
	    }
	    return results;
	  }

	  function rowToDocId(row) {
	    var val = row.value;
	    // Users can explicitly specify a joined doc _id, or it
	    // defaults to the doc _id that emitted the key/value.
	    var docId = (val && typeof val === 'object' && val._id) || row.id;
	    return docId;
	  }

	  function readAttachmentsAsBlobOrBuffer(res) {
	    res.rows.forEach(function (row) {
	      var atts = row.doc && row.doc._attachments;
	      if (!atts) {
	        return;
	      }
	      Object.keys(atts).forEach(function (filename) {
	        var att = atts[filename];
	        atts[filename].data = b64ToBluffer$1(att.data, att.content_type);
	      });
	    });
	  }

	  function postprocessAttachments(opts) {
	    return function (res) {
	      if (opts.include_docs && opts.attachments && opts.binary) {
	        readAttachmentsAsBlobOrBuffer(res);
	      }
	      return res;
	    };
	  }

	  function addHttpParam(paramName, opts, params, asJson) {
	    // add an http param from opts to params, optionally json-encoded
	    var val = opts[paramName];
	    if (typeof val !== 'undefined') {
	      if (asJson) {
	        val = encodeURIComponent(JSON.stringify(val));
	      }
	      params.push(paramName + '=' + val);
	    }
	  }

	  function coerceInteger(integerCandidate) {
	    if (typeof integerCandidate !== 'undefined') {
	      var asNumber = Number(integerCandidate);
	      // prevents e.g. '1foo' or '1.1' being coerced to 1
	      if (!isNaN(asNumber) && asNumber === parseInt(integerCandidate, 10)) {
	        return asNumber;
	      } else {
	        return integerCandidate;
	      }
	    }
	  }

	  function coerceOptions(opts) {
	    opts.group_level = coerceInteger(opts.group_level);
	    opts.limit = coerceInteger(opts.limit);
	    opts.skip = coerceInteger(opts.skip);
	    return opts;
	  }

	  function checkPositiveInteger(number) {
	    if (number) {
	      if (typeof number !== 'number') {
	        return  new QueryParseError$1('Invalid value for integer: "' +
	          number + '"');
	      }
	      if (number < 0) {
	        return new QueryParseError$1('Invalid value for positive integer: ' +
	          '"' + number + '"');
	      }
	    }
	  }

	  function checkQueryParseError(options, fun) {
	    var startkeyName = options.descending ? 'endkey' : 'startkey';
	    var endkeyName = options.descending ? 'startkey' : 'endkey';

	    if (typeof options[startkeyName] !== 'undefined' &&
	      typeof options[endkeyName] !== 'undefined' &&
	      collate$1(options[startkeyName], options[endkeyName]) > 0) {
	      throw new QueryParseError$1('No rows can match your key range, ' +
	        'reverse your start_key and end_key or set {descending : true}');
	    } else if (fun.reduce && options.reduce !== false) {
	      if (options.include_docs) {
	        throw new QueryParseError$1('{include_docs:true} is invalid for reduce');
	      } else if (options.keys && options.keys.length > 1 &&
	        !options.group && !options.group_level) {
	        throw new QueryParseError$1('Multi-key fetches for reduce views must use ' +
	          '{group: true}');
	      }
	    }
	    ['group_level', 'limit', 'skip'].forEach(function (optionName) {
	      var error = checkPositiveInteger(options[optionName]);
	      if (error) {
	        throw error;
	      }
	    });
	  }

	  function httpQuery(db, fun, opts) {
	    // List of parameters to add to the PUT request
	    var params = [];
	    var body;
	    var method = 'GET';

	    // If opts.reduce exists and is defined, then add it to the list
	    // of parameters.
	    // If reduce=false then the results are that of only the map function
	    // not the final result of map and reduce.
	    addHttpParam('reduce', opts, params);
	    addHttpParam('include_docs', opts, params);
	    addHttpParam('attachments', opts, params);
	    addHttpParam('limit', opts, params);
	    addHttpParam('descending', opts, params);
	    addHttpParam('group', opts, params);
	    addHttpParam('group_level', opts, params);
	    addHttpParam('skip', opts, params);
	    addHttpParam('stale', opts, params);
	    addHttpParam('conflicts', opts, params);
	    addHttpParam('startkey', opts, params, true);
	    addHttpParam('start_key', opts, params, true);
	    addHttpParam('endkey', opts, params, true);
	    addHttpParam('end_key', opts, params, true);
	    addHttpParam('inclusive_end', opts, params);
	    addHttpParam('key', opts, params, true);
	    addHttpParam('update_seq', opts, params);

	    // Format the list of parameters into a valid URI query string
	    params = params.join('&');
	    params = params === '' ? '' : '?' + params;

	    // If keys are supplied, issue a POST to circumvent GET query string limits
	    // see http://wiki.apache.org/couchdb/HTTP_view_API#Querying_Options
	    if (typeof opts.keys !== 'undefined') {
	      var MAX_URL_LENGTH = 2000;
	      // according to http://stackoverflow.com/a/417184/680742,
	      // the de facto URL length limit is 2000 characters

	      var keysAsString =
	        'keys=' + encodeURIComponent(JSON.stringify(opts.keys));
	      if (keysAsString.length + params.length + 1 <= MAX_URL_LENGTH) {
	        // If the keys are short enough, do a GET. we do this to work around
	        // Safari not understanding 304s on POSTs (see pouchdb/pouchdb#1239)
	        params += (params[0] === '?' ? '&' : '?') + keysAsString;
	      } else {
	        method = 'POST';
	        if (typeof fun === 'string') {
	          body = {keys: opts.keys};
	        } else { // fun is {map : mapfun}, so append to this
	          fun.keys = opts.keys;
	        }
	      }
	    }

	    // We are referencing a query defined in the design doc
	    if (typeof fun === 'string') {
	      var parts = parseViewName$1(fun);
	      return db.request({
	        method: method,
	        url: '_design/' + parts[0] + '/_view/' + parts[1] + params,
	        body: body
	      }).then(
	        /* istanbul ignore next */
	        function (result) {
	          // fail the entire request if the result contains an error
	          result.rows.forEach(function (row) {
	            if (row.value && row.value.error && row.value.error === "builtin_reduce_error") {
	              throw new Error(row.reason);
	            }
	          });

	          return result;
	      })
	      .then(postprocessAttachments(opts));
	    }

	    // We are using a temporary view, terrible for performance, good for testing
	    body = body || {};
	    Object.keys(fun).forEach(function (key) {
	      if (Array.isArray(fun[key])) {
	        body[key] = fun[key];
	      } else {
	        body[key] = fun[key].toString();
	      }
	    });
	    return db.request({
	      method: 'POST',
	      url: '_temp_view' + params,
	      body: body
	    }).then(postprocessAttachments(opts));
	  }

	  // custom adapters can define their own api._query
	  // and override the default behavior
	  /* istanbul ignore next */
	  function customQuery(db, fun, opts) {
	    return new PouchPromise$1(function (resolve, reject) {
	      db._query(fun, opts, function (err, res) {
	        if (err) {
	          return reject(err);
	        }
	        resolve(res);
	      });
	    });
	  }

	  // custom adapters can define their own api._viewCleanup
	  // and override the default behavior
	  /* istanbul ignore next */
	  function customViewCleanup(db) {
	    return new PouchPromise$1(function (resolve, reject) {
	      db._viewCleanup(function (err, res) {
	        if (err) {
	          return reject(err);
	        }
	        resolve(res);
	      });
	    });
	  }

	  function defaultsTo(value) {
	    return function (reason) {
	      /* istanbul ignore else */
	      if (reason.status === 404) {
	        return value;
	      } else {
	        throw reason;
	      }
	    };
	  }

	  // returns a promise for a list of docs to update, based on the input docId.
	  // the order doesn't matter, because post-3.2.0, bulkDocs
	  // is an atomic operation in all three adapters.
	  function getDocsToPersist(docId, view, docIdsToChangesAndEmits) {
	    var metaDocId = '_local/doc_' + docId;
	    var defaultMetaDoc = {_id: metaDocId, keys: []};
	    var docData = docIdsToChangesAndEmits.get(docId);
	    var indexableKeysToKeyValues = docData[0];
	    var changes = docData[1];

	    function getMetaDoc() {
	      if (isGenOne$2(changes)) {
	        // generation 1, so we can safely assume initial state
	        // for performance reasons (avoids unnecessary GETs)
	        return PouchPromise$1.resolve(defaultMetaDoc);
	      }
	      return view.db.get(metaDocId).catch(defaultsTo(defaultMetaDoc));
	    }

	    function getKeyValueDocs(metaDoc) {
	      if (!metaDoc.keys.length) {
	        // no keys, no need for a lookup
	        return PouchPromise$1.resolve({rows: []});
	      }
	      return view.db.allDocs({
	        keys: metaDoc.keys,
	        include_docs: true
	      });
	    }

	    function processKeyValueDocs(metaDoc, kvDocsRes) {
	      var kvDocs = [];
	      var oldKeys = new ExportedSet$1();

	      for (var i = 0, len = kvDocsRes.rows.length; i < len; i++) {
	        var row = kvDocsRes.rows[i];
	        var doc = row.doc;
	        if (!doc) { // deleted
	          continue;
	        }
	        kvDocs.push(doc);
	        oldKeys.add(doc._id);
	        doc._deleted = !indexableKeysToKeyValues.has(doc._id);
	        if (!doc._deleted) {
	          var keyValue = indexableKeysToKeyValues.get(doc._id);
	          if ('value' in keyValue) {
	            doc.value = keyValue.value;
	          }
	        }
	      }
	      var newKeys = mapToKeysArray$1(indexableKeysToKeyValues);
	      newKeys.forEach(function (key) {
	        if (!oldKeys.has(key)) {
	          // new doc
	          var kvDoc = {
	            _id: key
	          };
	          var keyValue = indexableKeysToKeyValues.get(key);
	          if ('value' in keyValue) {
	            kvDoc.value = keyValue.value;
	          }
	          kvDocs.push(kvDoc);
	        }
	      });
	      metaDoc.keys = uniq$1(newKeys.concat(metaDoc.keys));
	      kvDocs.push(metaDoc);

	      return kvDocs;
	    }

	    return getMetaDoc().then(function (metaDoc) {
	      return getKeyValueDocs(metaDoc).then(function (kvDocsRes) {
	        return processKeyValueDocs(metaDoc, kvDocsRes);
	      });
	    });
	  }

	  // updates all emitted key/value docs and metaDocs in the mrview database
	  // for the given batch of documents from the source database
	  function saveKeyValues(view, docIdsToChangesAndEmits, seq) {
	    var seqDocId = '_local/lastSeq';
	    return view.db.get(seqDocId)
	      .catch(defaultsTo({_id: seqDocId, seq: 0}))
	      .then(function (lastSeqDoc) {
	        var docIds = mapToKeysArray$1(docIdsToChangesAndEmits);
	        return PouchPromise$1.all(docIds.map(function (docId) {
	          return getDocsToPersist(docId, view, docIdsToChangesAndEmits);
	        })).then(function (listOfDocsToPersist) {
	          var docsToPersist = flatten$1(listOfDocsToPersist);
	          lastSeqDoc.seq = seq;
	          docsToPersist.push(lastSeqDoc);
	          // write all docs in a single operation, update the seq once
	          return view.db.bulkDocs({docs : docsToPersist});
	        });
	      });
	  }

	  function getQueue(view) {
	    var viewName = typeof view === 'string' ? view : view.name;
	    var queue = persistentQueues$1[viewName];
	    if (!queue) {
	      queue = persistentQueues$1[viewName] = new TaskQueue();
	    }
	    return queue;
	  }

	  function updateView(view) {
	    return sequentialize$1(getQueue(view), function () {
	      return updateViewInQueue(view);
	    })();
	  }

	  function updateViewInQueue(view) {
	    // bind the emit function once
	    var mapResults;
	    var doc;

	    function emit(key, value) {
	      var output = {id: doc._id, key: normalizeKey$1(key)};
	      // Don't explicitly store the value unless it's defined and non-null.
	      // This saves on storage space, because often people don't use it.
	      if (typeof value !== 'undefined' && value !== null) {
	        output.value = normalizeKey$1(value);
	      }
	      mapResults.push(output);
	    }

	    var mapFun = mapper(view.mapFun, emit);

	    var currentSeq = view.seq || 0;

	    function processChange(docIdsToChangesAndEmits, seq) {
	      return function () {
	        return saveKeyValues(view, docIdsToChangesAndEmits, seq);
	      };
	    }

	    var queue = new TaskQueue();

	    function processNextBatch() {
	      return view.sourceDB.changes({
	        conflicts: true,
	        include_docs: true,
	        style: 'all_docs',
	        since: currentSeq,
	        limit: CHANGES_BATCH_SIZE$2
	      }).then(processBatch);
	    }

	    function processBatch(response) {
	      var results = response.results;
	      if (!results.length) {
	        return;
	      }
	      var docIdsToChangesAndEmits = createDocIdsToChangesAndEmits(results);
	      queue.add(processChange(docIdsToChangesAndEmits, currentSeq));
	      if (results.length < CHANGES_BATCH_SIZE$2) {
	        return;
	      }
	      return processNextBatch();
	    }

	    function createDocIdsToChangesAndEmits(results) {
	      var docIdsToChangesAndEmits = new ExportedMap$1();
	      for (var i = 0, len = results.length; i < len; i++) {
	        var change = results[i];
	        if (change.doc._id[0] !== '_') {
	          mapResults = [];
	          doc = change.doc;

	          if (!doc._deleted) {
	            tryMap(view.sourceDB, mapFun, doc);
	          }
	          mapResults.sort(sortByKeyThenValue);

	          var indexableKeysToKeyValues = createIndexableKeysToKeyValues(mapResults);
	          docIdsToChangesAndEmits.set(change.doc._id, [
	            indexableKeysToKeyValues,
	            change.changes
	          ]);
	        }
	        currentSeq = change.seq;
	      }
	      return docIdsToChangesAndEmits;
	    }

	    function createIndexableKeysToKeyValues(mapResults) {
	      var indexableKeysToKeyValues = new ExportedMap$1();
	      var lastKey;
	      for (var i = 0, len = mapResults.length; i < len; i++) {
	        var emittedKeyValue = mapResults[i];
	        var complexKey = [emittedKeyValue.key, emittedKeyValue.id];
	        if (i > 0 && collate$1(emittedKeyValue.key, lastKey) === 0) {
	          complexKey.push(i); // dup key+id, so make it unique
	        }
	        indexableKeysToKeyValues.set(toIndexableString$1(complexKey), emittedKeyValue);
	        lastKey = emittedKeyValue.key;
	      }
	      return indexableKeysToKeyValues;
	    }

	    return processNextBatch().then(function () {
	      return queue.finish();
	    }).then(function () {
	      view.seq = currentSeq;
	    });
	  }

	  function reduceView(view, results, options) {
	    if (options.group_level === 0) {
	      delete options.group_level;
	    }

	    var shouldGroup = options.group || options.group_level;

	    var reduceFun = reducer(view.reduceFun);

	    var groups = [];
	    var lvl = isNaN(options.group_level) ? Number.POSITIVE_INFINITY :
	      options.group_level;
	    results.forEach(function (e) {
	      var last = groups[groups.length - 1];
	      var groupKey = shouldGroup ? e.key : null;

	      // only set group_level for array keys
	      if (shouldGroup && Array.isArray(groupKey)) {
	        groupKey = groupKey.slice(0, lvl);
	      }

	      if (last && collate$1(last.groupKey, groupKey) === 0) {
	        last.keys.push([e.key, e.id]);
	        last.values.push(e.value);
	        return;
	      }
	      groups.push({
	        keys: [[e.key, e.id]],
	        values: [e.value],
	        groupKey: groupKey
	      });
	    });
	    results = [];
	    for (var i = 0, len = groups.length; i < len; i++) {
	      var e = groups[i];
	      var reduceTry = tryReduce(view.sourceDB, reduceFun, e.keys, e.values, false);
	      if (reduceTry.error && reduceTry.error instanceof BuiltInError$1) {
	        // CouchDB returns an error if a built-in errors out
	        throw reduceTry.error;
	      }
	      results.push({
	        // CouchDB just sets the value to null if a non-built-in errors out
	        value: reduceTry.error ? null : reduceTry.output,
	        key: e.groupKey
	      });
	    }
	    // no total_rows/offset when reducing
	    return {rows: sliceResults(results, options.limit, options.skip)};
	  }

	  function queryView(view, opts) {
	    return sequentialize$1(getQueue(view), function () {
	      return queryViewInQueue(view, opts);
	    })();
	  }

	  function queryViewInQueue(view, opts) {
	    var totalRows;
	    var shouldReduce = view.reduceFun && opts.reduce !== false;
	    var skip = opts.skip || 0;
	    if (typeof opts.keys !== 'undefined' && !opts.keys.length) {
	      // equivalent query
	      opts.limit = 0;
	      delete opts.keys;
	    }

	    function fetchFromView(viewOpts) {
	      viewOpts.include_docs = true;
	      return view.db.allDocs(viewOpts).then(function (res) {
	        totalRows = res.total_rows;
	        return res.rows.map(function (result) {

	          // implicit migration - in older versions of PouchDB,
	          // we explicitly stored the doc as {id: ..., key: ..., value: ...}
	          // this is tested in a migration test
	          /* istanbul ignore next */
	          if ('value' in result.doc && typeof result.doc.value === 'object' &&
	            result.doc.value !== null) {
	            var keys = Object.keys(result.doc.value).sort();
	            // this detection method is not perfect, but it's unlikely the user
	            // emitted a value which was an object with these 3 exact keys
	            var expectedKeys = ['id', 'key', 'value'];
	            if (!(keys < expectedKeys || keys > expectedKeys)) {
	              return result.doc.value;
	            }
	          }

	          var parsedKeyAndDocId = parseIndexableString$1(result.doc._id);
	          return {
	            key: parsedKeyAndDocId[0],
	            id: parsedKeyAndDocId[1],
	            value: ('value' in result.doc ? result.doc.value : null)
	          };
	        });
	      });
	    }

	    function onMapResultsReady(rows) {
	      var finalResults;
	      if (shouldReduce) {
	        finalResults = reduceView(view, rows, opts);
	      } else {
	        finalResults = {
	          total_rows: totalRows,
	          offset: skip,
	          rows: rows
	        };
	      }
	      /* istanbul ignore if */
	      if (opts.update_seq) {
	        finalResults.update_seq = view.seq;
	      }
	      if (opts.include_docs) {
	        var docIds = uniq$1(rows.map(rowToDocId));

	        return view.sourceDB.allDocs({
	          keys: docIds,
	          include_docs: true,
	          conflicts: opts.conflicts,
	          attachments: opts.attachments,
	          binary: opts.binary
	        }).then(function (allDocsRes) {
	          var docIdsToDocs = new ExportedMap$1();
	          allDocsRes.rows.forEach(function (row) {
	            docIdsToDocs.set(row.id, row.doc);
	          });
	          rows.forEach(function (row) {
	            var docId = rowToDocId(row);
	            var doc = docIdsToDocs.get(docId);
	            if (doc) {
	              row.doc = doc;
	            }
	          });
	          return finalResults;
	        });
	      } else {
	        return finalResults;
	      }
	    }

	    if (typeof opts.keys !== 'undefined') {
	      var keys = opts.keys;
	      var fetchPromises = keys.map(function (key) {
	        var viewOpts = {
	          startkey : toIndexableString$1([key]),
	          endkey   : toIndexableString$1([key, {}])
	        };
	        /* istanbul ignore if */
	        if (opts.update_seq) {
	          viewOpts.update_seq = true;
	        }
	        return fetchFromView(viewOpts);
	      });
	      return PouchPromise$1.all(fetchPromises).then(flatten$1).then(onMapResultsReady);
	    } else { // normal query, no 'keys'
	      var viewOpts = {
	        descending : opts.descending
	      };
	      /* istanbul ignore if */
	      if (opts.update_seq) {
	        viewOpts.update_seq = true;
	      }
	      var startkey;
	      var endkey;
	      if ('start_key' in opts) {
	        startkey = opts.start_key;
	      }
	      if ('startkey' in opts) {
	        startkey = opts.startkey;
	      }
	      if ('end_key' in opts) {
	        endkey = opts.end_key;
	      }
	      if ('endkey' in opts) {
	        endkey = opts.endkey;
	      }
	      if (typeof startkey !== 'undefined') {
	        viewOpts.startkey = opts.descending ?
	          toIndexableString$1([startkey, {}]) :
	          toIndexableString$1([startkey]);
	      }
	      if (typeof endkey !== 'undefined') {
	        var inclusiveEnd = opts.inclusive_end !== false;
	        if (opts.descending) {
	          inclusiveEnd = !inclusiveEnd;
	        }

	        viewOpts.endkey = toIndexableString$1(
	          inclusiveEnd ? [endkey, {}] : [endkey]);
	      }
	      if (typeof opts.key !== 'undefined') {
	        var keyStart = toIndexableString$1([opts.key]);
	        var keyEnd = toIndexableString$1([opts.key, {}]);
	        if (viewOpts.descending) {
	          viewOpts.endkey = keyStart;
	          viewOpts.startkey = keyEnd;
	        } else {
	          viewOpts.startkey = keyStart;
	          viewOpts.endkey = keyEnd;
	        }
	      }
	      if (!shouldReduce) {
	        if (typeof opts.limit === 'number') {
	          viewOpts.limit = opts.limit;
	        }
	        viewOpts.skip = skip;
	      }
	      return fetchFromView(viewOpts).then(onMapResultsReady);
	    }
	  }

	  function httpViewCleanup(db) {
	    return db.request({
	      method: 'POST',
	      url: '_view_cleanup'
	    });
	  }

	  function localViewCleanup(db) {
	    return db.get('_local/' + localDocName).then(function (metaDoc) {
	      var docsToViews = new ExportedMap$1();
	      Object.keys(metaDoc.views).forEach(function (fullViewName) {
	        var parts = parseViewName$1(fullViewName);
	        var designDocName = '_design/' + parts[0];
	        var viewName = parts[1];
	        var views = docsToViews.get(designDocName);
	        if (!views) {
	          views = new ExportedSet$1();
	          docsToViews.set(designDocName, views);
	        }
	        views.add(viewName);
	      });
	      var opts = {
	        keys : mapToKeysArray$1(docsToViews),
	        include_docs : true
	      };
	      return db.allDocs(opts).then(function (res) {
	        var viewsToStatus = {};
	        res.rows.forEach(function (row) {
	          var ddocName = row.key.substring(8); // cuts off '_design/'
	          docsToViews.get(row.key).forEach(function (viewName) {
	            var fullViewName = ddocName + '/' + viewName;
	            /* istanbul ignore if */
	            if (!metaDoc.views[fullViewName]) {
	              // new format, without slashes, to support PouchDB 2.2.0
	              // migration test in pouchdb's browser.migration.js verifies this
	              fullViewName = viewName;
	            }
	            var viewDBNames = Object.keys(metaDoc.views[fullViewName]);
	            // design doc deleted, or view function nonexistent
	            var statusIsGood = row.doc && row.doc.views &&
	              row.doc.views[viewName];
	            viewDBNames.forEach(function (viewDBName) {
	              viewsToStatus[viewDBName] =
	                viewsToStatus[viewDBName] || statusIsGood;
	            });
	          });
	        });
	        var dbsToDelete = Object.keys(viewsToStatus).filter(
	          function (viewDBName) { return !viewsToStatus[viewDBName]; });
	        var destroyPromises = dbsToDelete.map(function (viewDBName) {
	          return sequentialize$1(getQueue(viewDBName), function () {
	            return new db.constructor(viewDBName, db.__opts).destroy();
	          })();
	        });
	        return PouchPromise$1.all(destroyPromises).then(function () {
	          return {ok: true};
	        });
	      });
	    }, defaultsTo({ok: true}));
	  }

	  function queryPromised(db, fun, opts) {
	    /* istanbul ignore next */
	    if (typeof db._query === 'function') {
	      return customQuery(db, fun, opts);
	    }
	    if (isRemote$1(db)) {
	      return httpQuery(db, fun, opts);
	    }
	    
	    if (typeof fun !== 'string') {
	      // temp_view
	      checkQueryParseError(opts, fun);

	      tempViewQueue$1.add(function () {
	        var createViewPromise = createView$1(
	          /* sourceDB */ db,
	          /* viewName */ 'temp_view/temp_view',
	          /* mapFun */ fun.map,
	          /* reduceFun */ fun.reduce,
	          /* temporary */ true,
	          /* localDocName */ localDocName);
	        return createViewPromise.then(function (view) {
	          return fin$1(updateView(view).then(function () {
	            return queryView(view, opts);
	          }), function () {
	            return view.db.destroy();
	          });
	        });
	      });
	      return tempViewQueue$1.finish();
	    } else {
	      // persistent view
	      var fullViewName = fun;
	      var parts = parseViewName$1(fullViewName);
	      var designDocName = parts[0];
	      var viewName = parts[1];
	      return db.get('_design/' + designDocName).then(function (doc) {
	        var fun = doc.views && doc.views[viewName];

	        if (!fun) {
	          // basic validator; it's assumed that every subclass would want this
	          throw new NotFoundError$3('ddoc ' + doc._id + ' has no view named ' +
	            viewName);
	        }

	        ddocValidator(doc, viewName);
	        checkQueryParseError(opts, fun);

	        var createViewPromise = createView$1(
	          /* sourceDB */ db,
	          /* viewName */ fullViewName,
	          /* mapFun */ fun.map,
	          /* reduceFun */ fun.reduce,
	          /* temporary */ false,
	          /* localDocName */ localDocName);
	        return createViewPromise.then(function (view) {
	          if (opts.stale === 'ok' || opts.stale === 'update_after') {
	            if (opts.stale === 'update_after') {
	              nextTick$2(function () {
	                updateView(view);
	              });
	            }
	            return queryView(view, opts);
	          } else { // stale not ok
	            return updateView(view).then(function () {
	              return queryView(view, opts);
	            });
	          }
	        });
	      });
	    }
	  }

	  function abstractQuery(fun, opts, callback) {
	    var db = this;
	    if (typeof opts === 'function') {
	      callback = opts;
	      opts = {};
	    }
	    opts = opts ? coerceOptions(opts) : {};

	    if (typeof fun === 'function') {
	      fun = {map : fun};
	    }

	    var promise = PouchPromise$1.resolve().then(function () {
	      return queryPromised(db, fun, opts);
	    });
	    promisedCallback$1(promise, callback);
	    return promise;
	  }

	  var abstractViewCleanup = callbackify$1(function () {
	    var db = this;
	    /* istanbul ignore next */
	    if (typeof db._viewCleanup === 'function') {
	      return customViewCleanup(db);
	    }
	    if (isRemote$1(db)) {
	      return httpViewCleanup(db);
	    }
	    return localViewCleanup(db);
	  });

	  return {
	    query: abstractQuery,
	    viewCleanup: abstractViewCleanup
	  };
	}

	// we restucture the supplied JSON considerably, because the official
	// Mango API is very particular about a lot of this stuff, but we like
	// to be liberal with what we accept in order to prevent mental
	// breakdowns in our users
	function massageCreateIndexRequest(requestDef) {
	  requestDef = clone$1(requestDef);

	  if (!requestDef.index) {
	    requestDef.index = {};
	  }

	  ['type', 'name', 'ddoc'].forEach(function (key) {
	    if (requestDef.index[key]) {
	      requestDef[key] = requestDef.index[key];
	      delete requestDef.index[key];
	    }
	  });

	  if (requestDef.fields) {
	    requestDef.index.fields = requestDef.fields;
	    delete requestDef.fields;
	  }

	  if (!requestDef.type) {
	    requestDef.type = 'json';
	  }
	  return requestDef;
	}

	function createIndex(db, requestDef, callback) {
	  requestDef = massageCreateIndexRequest(requestDef);

	  db.request({
	    method: 'POST',
	    url: '_index',
	    body: requestDef
	  }, callback);
	}

	function find(db, requestDef, callback) {
	  db.request({
	    method: 'POST',
	    url: '_find',
	    body: requestDef
	  }, callback);
	}

	function explain(db, requestDef, callback) {
	  db.request({
	    method: 'POST',
	    url: '_explain',
	    body: requestDef
	  }, callback);
	}

	function getIndexes(db, callback) {
	  db.request({
	    method: 'GET',
	    url: '_index'
	  }, callback);
	}

	function deleteIndex(db, indexDef, callback) {


	  var ddoc = indexDef.ddoc;
	  var type = indexDef.type || 'json';
	  var name = indexDef.name;

	  if (!ddoc) {
	    return callback(new Error('you must provide an index\'s ddoc'));
	  }

	  if (!name) {
	    return callback(new Error('you must provide an index\'s name'));
	  }

	  var url = '_index/' + [ddoc, type, name].map(encodeURIComponent).join('/');

	  db.request({
	    method: 'DELETE',
	    url: url
	  }, callback);
	}

	function getArguments(fun) {
	  return function () {
	    var len = arguments.length;
	    var args = new Array(len);
	    var i = -1;
	    while (++i < len) {
	      args[i] = arguments[i];
	    }
	    return fun.call(this, args);
	  };
	}
	function callbackify$2(fun) {
	  return getArguments(function (args) {
	    var cb = args.pop();
	    var promise = fun.apply(this, args);
	    promisedCallback$2(promise, cb);
	    return promise;
	  });
	}

	function promisedCallback$2(promise, callback) {
	  promise.then(function (res) {
	    process.nextTick(function () {
	      callback(null, res);
	    });
	  }, function (reason) {
	    process.nextTick(function () {
	      callback(reason);
	    });
	  });
	  return promise;
	}

	var flatten$2 = getArguments(function (args) {
	  var res = [];
	  for (var i = 0, len = args.length; i < len; i++) {
	    var subArr = args[i];
	    if (Array.isArray(subArr)) {
	      res = res.concat(flatten$2.apply(null, subArr));
	    } else {
	      res.push(subArr);
	    }
	  }
	  return res;
	});

	function mergeObjects(arr) {
	  var res = {};
	  for (var i = 0, len = arr.length; i < len; i++) {
	    res = assign$1$1(res, arr[i]);
	  }
	  return res;
	}

	// Selects a list of fields defined in dot notation from one doc
	// and copies them to a new doc. Like underscore _.pick but supports nesting.
	function pick$2(obj, arr) {
	  var res = {};
	  for (var i = 0, len = arr.length; i < len; i++) {
	    var parsedField = parseField$1(arr[i]);
	    var value = getFieldFromDoc$1(obj, parsedField);
	    if (typeof value !== 'undefined') {
	      setFieldInDoc(res, parsedField, value);
	    }
	  }
	  return res;
	}

	// e.g. ['a'], ['a', 'b'] is true, but ['b'], ['a', 'b'] is false
	function oneArrayIsSubArrayOfOther(left, right) {

	  for (var i = 0, len = Math.min(left.length, right.length); i < len; i++) {
	    if (left[i] !== right[i]) {
	      return false;
	    }
	  }
	  return true;
	}

	// e.g.['a', 'b', 'c'], ['a', 'b'] is false
	function oneArrayIsStrictSubArrayOfOther(left, right) {

	  if (left.length > right.length) {
	    return false;
	  }

	  return oneArrayIsSubArrayOfOther(left, right);
	}

	// same as above, but treat the left array as an unordered set
	// e.g. ['b', 'a'], ['a', 'b', 'c'] is true, but ['c'], ['a', 'b', 'c'] is false
	function oneSetIsSubArrayOfOther(left, right) {
	  left = left.slice();
	  for (var i = 0, len = right.length; i < len; i++) {
	    var field = right[i];
	    if (!left.length) {
	      break;
	    }
	    var leftIdx = left.indexOf(field);
	    if (leftIdx === -1) {
	      return false;
	    } else {
	      left.splice(leftIdx, 1);
	    }
	  }
	  return true;
	}

	function arrayToObject(arr) {
	  var res = {};
	  for (var i = 0, len = arr.length; i < len; i++) {
	    res[arr[i]] = true;
	  }
	  return res;
	}

	function max(arr, fun) {
	  var max = null;
	  var maxScore = -1;
	  for (var i = 0, len = arr.length; i < len; i++) {
	    var element = arr[i];
	    var score = fun(element);
	    if (score > maxScore) {
	      maxScore = score;
	      max = element;
	    }
	  }
	  return max;
	}

	function arrayEquals(arr1, arr2) {
	  if (arr1.length !== arr2.length) {
	    return false;
	  }
	  for (var i = 0, len = arr1.length; i < len; i++) {
	    if (arr1[i] !== arr2[i]) {
	      return false;
	    }
	  }
	  return true;
	}

	function uniq$2(arr) {
	  var obj = {};
	  for (var i = 0; i < arr.length; i++) {
	    obj['$' + arr[i]] = true;
	  }
	  return Object.keys(obj).map(function (key) {
	    return key.substring(1);
	  });
	}

	//
	// One thing about these mappers:
	//
	// Per the advice of John-David Dalton (http://youtu.be/NthmeLEhDDM),
	// what you want to do in this case is optimize for the smallest possible
	// function, since that's the thing that gets run over and over again.
	//
	// This code would be a lot simpler if all the if/elses were inside
	// the function, but it would also be a lot less performant.
	//


	function createDeepMultiMapper(fields, emit) {
	  return function (doc) {
	    var toEmit = [];
	    for (var i = 0, iLen = fields.length; i < iLen; i++) {
	      var parsedField = parseField$1(fields[i]);
	      var value = doc;
	      for (var j = 0, jLen = parsedField.length; j < jLen; j++) {
	        var key = parsedField[j];
	        value = value[key];
	        if (typeof value === 'undefined') {
	          return; // don't emit
	        }
	      }
	      toEmit.push(value);
	    }
	    emit(toEmit);
	  };
	}

	function createDeepSingleMapper(field, emit) {
	  var parsedField = parseField$1(field);
	  return function (doc) {
	    var value = doc;
	    for (var i = 0, len = parsedField.length; i < len; i++) {
	      var key = parsedField[i];
	      value = value[key];
	      if (typeof value === 'undefined') {
	        return; // do nothing
	      }
	    }
	    emit(value);
	  };
	}

	function createShallowSingleMapper(field, emit) {
	  return function (doc) {
	    emit(doc[field]);
	  };
	}

	function createShallowMultiMapper(fields, emit) {
	  return function (doc) {
	    var toEmit = [];
	    for (var i = 0, len = fields.length; i < len; i++) {
	      toEmit.push(doc[fields[i]]);
	    }
	    emit(toEmit);
	  };
	}

	function checkShallow(fields) {
	  for (var i = 0, len = fields.length; i < len; i++) {
	    var field = fields[i];
	    if (field.indexOf('.') !== -1) {
	      return false;
	    }
	  }
	  return true;
	}

	function createMapper(fields, emit) {
	  var isShallow = checkShallow(fields);
	  var isSingle = fields.length === 1;

	  // notice we try to optimize for the most common case,
	  // i.e. single shallow indexes
	  if (isShallow) {
	    if (isSingle) {
	      return createShallowSingleMapper(fields[0], emit);
	    } else { // multi
	      return createShallowMultiMapper(fields, emit);
	    }
	  } else { // deep
	    if (isSingle) {
	      return createDeepSingleMapper(fields[0], emit);
	    } else { // multi
	      return createDeepMultiMapper(fields, emit);
	    }
	  }
	}

	function mapper$1(mapFunDef, emit) {
	  // mapFunDef is a list of fields

	  var fields = Object.keys(mapFunDef.fields);

	  return createMapper(fields, emit);
	}

	/* istanbul ignore next */
	function reducer$1(/*reduceFunDef*/) {
	  throw new Error('reduce not supported');
	}

	function ddocValidator$1(ddoc, viewName) {
	  var view = ddoc.views[viewName];
	  // This doesn't actually need to be here apparently, but
	  // I feel safer keeping it.
	  /* istanbul ignore if */
	  if (!view.map || !view.map.fields) {
	    throw new Error('ddoc ' + ddoc._id +' with view ' + viewName +
	      ' doesn\'t have map.fields defined. ' +
	      'maybe it wasn\'t created by this plugin?');
	  }
	}

	var abstractMapper = createAbstractMapReduce$1(
	  /* localDocName */ 'indexes',
	  mapper$1,
	  reducer$1,
	  ddocValidator$1
	);

	// normalize the "sort" value
	function massageSort(sort) {
	  if (!Array.isArray(sort)) {
	    throw new Error('invalid sort json - should be an array');
	  }
	  return sort.map(function (sorting) {
	    if (typeof sorting === 'string') {
	      var obj = {};
	      obj[sorting] = 'asc';
	      return obj;
	    } else {
	      return sorting;
	    }
	  });
	}

	function massageUseIndex(useIndex) {
	  var cleanedUseIndex = [];
	  if (typeof useIndex === 'string') {
	    cleanedUseIndex.push(useIndex);
	  } else {
	    cleanedUseIndex = useIndex;
	  }

	  return cleanedUseIndex.map(function (name) {
	    return name.replace('_design/', '');
	  });
	}

	function massageIndexDef(indexDef) {
	  indexDef.fields = indexDef.fields.map(function (field) {
	    if (typeof field === 'string') {
	      var obj = {};
	      obj[field] = 'asc';
	      return obj;
	    }
	    return field;
	  });
	  return indexDef;
	}

	function getKeyFromDoc(doc, index) {
	  var res = [];
	  for (var i = 0; i < index.def.fields.length; i++) {
	    var field = getKey$1(index.def.fields[i]);
	    res.push(doc[field]);
	  }
	  return res;
	}

	// have to do this manually because REASONS. I don't know why
	// CouchDB didn't implement inclusive_start
	function filterInclusiveStart(rows, targetValue, index) {
	  var indexFields = index.def.fields;
	  for (var i = 0, len = rows.length; i < len; i++) {
	    var row = rows[i];

	    // shave off any docs at the beginning that are <= the
	    // target value

	    var docKey = getKeyFromDoc(row.doc, index);
	    if (indexFields.length === 1) {
	      docKey = docKey[0]; // only one field, not multi-field
	    } else { // more than one field in index
	      // in the case where e.g. the user is searching {$gt: {a: 1}}
	      // but the index is [a, b], then we need to shorten the doc key
	      while (docKey.length > targetValue.length) {
	        docKey.pop();
	      }
	    }
	    //ABS as we just looking for values that don't match
	    if (Math.abs(collate$1(docKey, targetValue)) > 0) {
	      // no need to filter any further; we're past the key
	      break;
	    }
	  }
	  return i > 0 ? rows.slice(i) : rows;
	}

	function reverseOptions(opts) {
	  var newOpts = clone$1(opts);
	  delete newOpts.startkey;
	  delete newOpts.endkey;
	  delete newOpts.inclusive_start;
	  delete newOpts.inclusive_end;

	  if ('endkey' in opts) {
	    newOpts.startkey = opts.endkey;
	  }
	  if ('startkey' in opts) {
	    newOpts.endkey = opts.startkey;
	  }
	  if ('inclusive_start' in opts) {
	    newOpts.inclusive_end = opts.inclusive_start;
	  }
	  if ('inclusive_end' in opts) {
	    newOpts.inclusive_start = opts.inclusive_end;
	  }
	  return newOpts;
	}

	function validateIndex(index) {
	  var ascFields = index.fields.filter(function (field) {
	    return getValue$1(field) === 'asc';
	  });
	  if (ascFields.length !== 0 && ascFields.length !== index.fields.length) {
	    throw new Error('unsupported mixed sorting');
	  }
	}

	function validateSort(requestDef, index) {
	  if (index.defaultUsed && requestDef.sort) {
	    var noneIdSorts = requestDef.sort.filter(function (sortItem) {
	      return Object.keys(sortItem)[0] !== '_id';
	    }).map(function (sortItem) {
	      return Object.keys(sortItem)[0];
	    });

	    if (noneIdSorts.length > 0) {
	      throw new Error('Cannot sort on field(s) "' + noneIdSorts.join(',') +
	      '" when using the default index');
	    }
	  }

	  if (index.defaultUsed) {
	    return;
	  }
	}

	function validateFindRequest(requestDef) {
	  if (typeof requestDef.selector !== 'object') {
	    throw new Error('you must provide a selector when you find()');
	  }

	  /*var selectors = requestDef.selector['$and'] || [requestDef.selector];
	  for (var i = 0; i < selectors.length; i++) {
	    var selector = selectors[i];
	    var keys = Object.keys(selector);
	    if (keys.length === 0) {
	      throw new Error('invalid empty selector');
	    }
	    //var selection = selector[keys[0]];
	    /*if (Object.keys(selection).length !== 1) {
	      throw new Error('invalid selector: ' + JSON.stringify(selection) +
	        ' - it must have exactly one key/value');
	    }
	  }*/
	}

	// determine the maximum number of fields
	// we're going to need to query, e.g. if the user
	// has selection ['a'] and sorting ['a', 'b'], then we
	// need to use the longer of the two: ['a', 'b']
	function getUserFields(selector, sort) {
	  var selectorFields = Object.keys(selector);
	  var sortFields = sort? sort.map(getKey$1) : [];
	  var userFields;
	  if (selectorFields.length >= sortFields.length) {
	    userFields = selectorFields;
	  } else {
	    userFields = sortFields;
	  }

	  if (sortFields.length === 0) {
	    return {
	      fields: userFields
	    };
	  }

	  // sort according to the user's preferred sorting
	  userFields = userFields.sort(function (left, right) {
	    var leftIdx = sortFields.indexOf(left);
	    if (leftIdx === -1) {
	      leftIdx = Number.MAX_VALUE;
	    }
	    var rightIdx = sortFields.indexOf(right);
	    if (rightIdx === -1) {
	      rightIdx = Number.MAX_VALUE;
	    }
	    return leftIdx < rightIdx ? -1 : leftIdx > rightIdx ? 1 : 0;
	  });

	  return {
	    fields: userFields,
	    sortOrder: sort.map(getKey$1)
	  };
	}

	function createIndex$1(db, requestDef) {
	  requestDef = massageCreateIndexRequest(requestDef);
	  var originalIndexDef = clone$1(requestDef.index);
	  requestDef.index = massageIndexDef(requestDef.index);

	  validateIndex(requestDef.index);

	  // calculating md5 is expensive - memoize and only
	  // run if required
	  var md5;
	  function getMd5() {
	    return md5 || (md5 = stringMd5$1(JSON.stringify(requestDef)));
	  }

	  var viewName = requestDef.name || ('idx-' + getMd5());

	  var ddocName = requestDef.ddoc || ('idx-' + getMd5());
	  var ddocId = '_design/' + ddocName;

	  var hasInvalidLanguage = false;
	  var viewExists = false;

	  function updateDdoc(doc) {
	    if (doc._rev && doc.language !== 'query') {
	      hasInvalidLanguage = true;
	    }
	    doc.language = 'query';
	    doc.views = doc.views || {};

	    viewExists = !!doc.views[viewName];

	    if (viewExists) {
	      return false;
	    }

	    doc.views[viewName] = {
	      map: {
	        fields: mergeObjects(requestDef.index.fields)
	      },
	      reduce: '_count',
	      options: {
	        def: originalIndexDef
	      }
	    };

	    return doc;
	  }

	  db.constructor.emit('debug', ['find', 'creating index', ddocId]);

	  return upsert$1(db, ddocId, updateDdoc).then(function () {
	    if (hasInvalidLanguage) {
	      throw new Error('invalid language for ddoc with id "' +
	      ddocId +
	      '" (should be "query")');
	    }
	  }).then(function () {
	    // kick off a build
	    // TODO: abstract-pouchdb-mapreduce should support auto-updating
	    // TODO: should also use update_after, but pouchdb/pouchdb#3415 blocks me
	    var signature = ddocName + '/' + viewName;
	    return abstractMapper.query.call(db, signature, {
	      limit: 0,
	      reduce: false
	    }).then(function () {
	      return {
	        id: ddocId,
	        name: viewName,
	        result: viewExists ? 'exists' : 'created'
	      };
	    });
	  });
	}

	function getIndexes$1(db) {
	  // just search through all the design docs and filter in-memory.
	  // hopefully there aren't that many ddocs.
	  return db.allDocs({
	    startkey: '_design/',
	    endkey: '_design/\uffff',
	    include_docs: true
	  }).then(function (allDocsRes) {
	    var res = {
	      indexes: [{
	        ddoc: null,
	        name: '_all_docs',
	        type: 'special',
	        def: {
	          fields: [{_id: 'asc'}]
	        }
	      }]
	    };

	    res.indexes = flatten$2(res.indexes, allDocsRes.rows.filter(function (row) {
	      return row.doc.language === 'query';
	    }).map(function (row) {
	      var viewNames = row.doc.views !== undefined ? Object.keys(row.doc.views) : [];

	      return viewNames.map(function (viewName) {
	        var view = row.doc.views[viewName];
	        return {
	          ddoc: row.id,
	          name: viewName,
	          type: 'json',
	          def: massageIndexDef(view.options.def)
	        };
	      });
	    }));

	    // these are sorted by view name for some reason
	    res.indexes.sort(function (left, right) {
	      return compare$2(left.name, right.name);
	    });
	    res.total_rows = res.indexes.length;
	    return res;
	  });
	}

	// couchdb lowest collation value
	var COLLATE_LO = null;

	// couchdb highest collation value (TODO: well not really, but close enough amirite)
	var COLLATE_HI = {"\uffff": {}};

	// couchdb second-lowest collation value

	function checkFieldInIndex(index, field) {
	  var indexFields = index.def.fields.map(getKey$1);
	  for (var i = 0, len = indexFields.length; i < len; i++) {
	    var indexField = indexFields[i];
	    if (field === indexField) {
	      return true;
	    }
	  }
	  return false;
	}

	// so when you do e.g. $eq/$eq, we can do it entirely in the database.
	// but when you do e.g. $gt/$eq, the first part can be done
	// in the database, but the second part has to be done in-memory,
	// because $gt has forced us to lose precision.
	// so that's what this determines
	function userOperatorLosesPrecision(selector, field) {
	  var matcher = selector[field];
	  var userOperator = getKey$1(matcher);

	  return userOperator !== '$eq';
	}

	// sort the user fields by their position in the index,
	// if they're in the index
	function sortFieldsByIndex(userFields, index) {
	  var indexFields = index.def.fields.map(getKey$1);

	  return userFields.slice().sort(function (a, b) {
	    var aIdx = indexFields.indexOf(a);
	    var bIdx = indexFields.indexOf(b);
	    if (aIdx === -1) {
	      aIdx = Number.MAX_VALUE;
	    }
	    if (bIdx === -1) {
	      bIdx = Number.MAX_VALUE;
	    }
	    return compare$2(aIdx, bIdx);
	  });
	}

	// first pass to try to find fields that will need to be sorted in-memory
	function getBasicInMemoryFields(index, selector, userFields) {

	  userFields = sortFieldsByIndex(userFields, index);

	  // check if any of the user selectors lose precision
	  var needToFilterInMemory = false;
	  for (var i = 0, len = userFields.length; i < len; i++) {
	    var field = userFields[i];
	    if (needToFilterInMemory || !checkFieldInIndex(index, field)) {
	      return userFields.slice(i);
	    }
	    if (i < len - 1 && userOperatorLosesPrecision(selector, field)) {
	      needToFilterInMemory = true;
	    }
	  }
	  return [];
	}

	function getInMemoryFieldsFromNe(selector) {
	  var fields = [];
	  Object.keys(selector).forEach(function (field) {
	    var matcher = selector[field];
	    Object.keys(matcher).forEach(function (operator) {
	      if (operator === '$ne') {
	        fields.push(field);
	      }
	    });
	  });
	  return fields;
	}

	function getInMemoryFields(coreInMemoryFields, index, selector, userFields) {
	  var result = flatten$2(
	    // in-memory fields reported as necessary by the query planner
	    coreInMemoryFields,
	    // combine with another pass that checks for any we may have missed
	    getBasicInMemoryFields(index, selector, userFields),
	    // combine with another pass that checks for $ne's
	    getInMemoryFieldsFromNe(selector)
	  );

	  return sortFieldsByIndex(uniq$2(result), index);
	}

	// check that at least one field in the user's query is represented
	// in the index. order matters in the case of sorts
	function checkIndexFieldsMatch(indexFields, sortOrder, fields) {
	  if (sortOrder) {
	    // array has to be a strict subarray of index array. furthermore,
	    // the sortOrder fields need to all be represented in the index
	    var sortMatches = oneArrayIsStrictSubArrayOfOther(sortOrder, indexFields);
	    var selectorMatches = oneArrayIsSubArrayOfOther(fields, indexFields);

	    return sortMatches && selectorMatches;
	  }

	  // all of the user's specified fields still need to be
	  // on the left side of the index array, although the order
	  // doesn't matter
	  return oneSetIsSubArrayOfOther(fields, indexFields);
	}

	var logicalMatchers = ['$eq', '$gt', '$gte', '$lt', '$lte'];
	function isNonLogicalMatcher(matcher) {
	  return logicalMatchers.indexOf(matcher) === -1;
	}

	// check all the index fields for usages of '$ne'
	// e.g. if the user queries {foo: {$ne: 'foo'}, bar: {$eq: 'bar'}},
	// then we can neither use an index on ['foo'] nor an index on
	// ['foo', 'bar'], but we can use an index on ['bar'] or ['bar', 'foo']
	function checkFieldsLogicallySound(indexFields, selector) {
	  var firstField = indexFields[0];
	  var matcher = selector[firstField];

	  if (typeof matcher === 'undefined') {
	    /* istanbul ignore next */
	    return true;
	  }

	  var hasLogicalOperator = Object.keys(matcher).some(function (matcherKey) {
	    return !(isNonLogicalMatcher(matcherKey));
	  });

	  if (!hasLogicalOperator) {
	    return false;
	  }

	  var isInvalidNe = Object.keys(matcher).length === 1 &&
	    getKey$1(matcher) === '$ne';

	  return !isInvalidNe;
	}

	function checkIndexMatches(index, sortOrder, fields, selector) {

	  var indexFields = index.def.fields.map(getKey$1);

	  var fieldsMatch = checkIndexFieldsMatch(indexFields, sortOrder, fields);

	  if (!fieldsMatch) {
	    return false;
	  }

	  return checkFieldsLogicallySound(indexFields, selector);
	}

	//
	// the algorithm is very simple:
	// take all the fields the user supplies, and if those fields
	// are a strict subset of the fields in some index,
	// then use that index
	//
	//
	function findMatchingIndexes(selector, userFields, sortOrder, indexes) {

	  return indexes.reduce(function (res, index) {
	    var indexMatches = checkIndexMatches(index, sortOrder, userFields, selector);
	    if (indexMatches) {
	      res.push(index);
	    }
	    return res;
	  }, []);
	}

	// find the best index, i.e. the one that matches the most fields
	// in the user's query
	function findBestMatchingIndex(selector, userFields, sortOrder, indexes, useIndex) {

	  var matchingIndexes = findMatchingIndexes(selector, userFields, sortOrder, indexes);

	  if (matchingIndexes.length === 0) {
	    if (useIndex) {
	      throw {
	        error: "no_usable_index",
	        message: "There is no index available for this selector."
	      };
	    }
	    //return `all_docs` as a default index;
	    //I'm assuming that _all_docs is always first
	    var defaultIndex = indexes[0];
	    defaultIndex.defaultUsed = true;
	    return defaultIndex;
	  }
	  if (matchingIndexes.length === 1 && !useIndex) {
	    return matchingIndexes[0];
	  }

	  var userFieldsMap = arrayToObject(userFields);

	  function scoreIndex(index) {
	    var indexFields = index.def.fields.map(getKey$1);
	    var score = 0;
	    for (var i = 0, len = indexFields.length; i < len; i++) {
	      var indexField = indexFields[i];
	      if (userFieldsMap[indexField]) {
	        score++;
	      }
	    }
	    return score;
	  }

	  if (useIndex) {
	    var useIndexDdoc = '_design/' + useIndex[0];
	    var useIndexName = useIndex.length === 2 ? useIndex[1] : false;
	    var index = matchingIndexes.find(function (index) {
	      if (useIndexName && index.ddoc === useIndexDdoc && useIndexName === index.name) {
	        return true;
	      }

	      if (index.ddoc === useIndexDdoc) {
	        /* istanbul ignore next */
	        return true;
	      }

	      return false;
	    });

	    if (!index) {
	      throw {
	        error: "unknown_error",
	        message: "Could not find that index or could not use that index for the query"
	      };
	    }
	    return index;
	  }

	  return max(matchingIndexes, scoreIndex);
	}

	function getSingleFieldQueryOptsFor(userOperator, userValue) {
	  switch (userOperator) {
	    case '$eq':
	      return {key: userValue};
	    case '$lte':
	      return {endkey: userValue};
	    case '$gte':
	      return {startkey: userValue};
	    case '$lt':
	      return {
	        endkey: userValue,
	        inclusive_end: false
	      };
	    case '$gt':
	      return {
	        startkey: userValue,
	        inclusive_start: false
	      };
	  }
	}

	function getSingleFieldCoreQueryPlan(selector, index) {
	  var field = getKey$1(index.def.fields[0]);
	  //ignoring this because the test to exercise the branch is skipped at the moment
	  /* istanbul ignore next */
	  var matcher = selector[field] || {};
	  var inMemoryFields = [];

	  var userOperators = Object.keys(matcher);

	  var combinedOpts;

	  userOperators.forEach(function (userOperator) {

	    if (isNonLogicalMatcher(userOperator)) {
	      inMemoryFields.push(field);
	      return;
	    }

	    var userValue = matcher[userOperator];

	    var newQueryOpts = getSingleFieldQueryOptsFor(userOperator, userValue);

	    if (combinedOpts) {
	      combinedOpts = mergeObjects([combinedOpts, newQueryOpts]);
	    } else {
	      combinedOpts = newQueryOpts;
	    }
	  });

	  return {
	    queryOpts: combinedOpts,
	    inMemoryFields: inMemoryFields
	  };
	}

	function getMultiFieldCoreQueryPlan(userOperator, userValue) {
	  switch (userOperator) {
	    case '$eq':
	      return {
	        startkey: userValue,
	        endkey: userValue
	      };
	    case '$lte':
	      return {
	        endkey: userValue
	      };
	    case '$gte':
	      return {
	        startkey: userValue
	      };
	    case '$lt':
	      return {
	        endkey: userValue,
	        inclusive_end: false
	      };
	    case '$gt':
	      return {
	        startkey: userValue,
	        inclusive_start: false
	      };
	  }
	}

	function getMultiFieldQueryOpts(selector, index) {

	  var indexFields = index.def.fields.map(getKey$1);

	  var inMemoryFields = [];
	  var startkey = [];
	  var endkey = [];
	  var inclusiveStart;
	  var inclusiveEnd;


	  function finish(i) {

	    if (inclusiveStart !== false) {
	      startkey.push(COLLATE_LO);
	    }
	    if (inclusiveEnd !== false) {
	      endkey.push(COLLATE_HI);
	    }
	    // keep track of the fields where we lost specificity,
	    // and therefore need to filter in-memory
	    inMemoryFields = indexFields.slice(i);
	  }

	  for (var i = 0, len = indexFields.length; i < len; i++) {
	    var indexField = indexFields[i];

	    var matcher = selector[indexField];

	    if (!matcher || !Object.keys(matcher).length) { // fewer fields in user query than in index
	      finish(i);
	      break;
	    } else if (i > 0) {
	      if (Object.keys(matcher).some(isNonLogicalMatcher)) { // non-logical are ignored
	        finish(i);
	        break;
	      }
	      var usingGtlt = (
	        '$gt' in matcher || '$gte' in matcher ||
	        '$lt' in matcher || '$lte' in matcher);
	      var previousKeys = Object.keys(selector[indexFields[i - 1]]);
	      var previousWasEq = arrayEquals(previousKeys, ['$eq']);
	      var previousWasSame = arrayEquals(previousKeys, Object.keys(matcher));
	      var gtltLostSpecificity = usingGtlt && !previousWasEq && !previousWasSame;
	      if (gtltLostSpecificity) {
	        finish(i);
	        break;
	      }
	    }

	    var userOperators = Object.keys(matcher);

	    var combinedOpts = null;

	    for (var j = 0; j < userOperators.length; j++) {
	      var userOperator = userOperators[j];
	      var userValue = matcher[userOperator];

	      var newOpts = getMultiFieldCoreQueryPlan(userOperator, userValue);

	      if (combinedOpts) {
	        combinedOpts = mergeObjects([combinedOpts, newOpts]);
	      } else {
	        combinedOpts = newOpts;
	      }
	    }

	    startkey.push('startkey' in combinedOpts ? combinedOpts.startkey : COLLATE_LO);
	    endkey.push('endkey' in combinedOpts ? combinedOpts.endkey : COLLATE_HI);
	    if ('inclusive_start' in combinedOpts) {
	      inclusiveStart = combinedOpts.inclusive_start;
	    }
	    if ('inclusive_end' in combinedOpts) {
	      inclusiveEnd = combinedOpts.inclusive_end;
	    }
	  }

	  var res = {
	    startkey: startkey,
	    endkey: endkey
	  };

	  if (typeof inclusiveStart !== 'undefined') {
	    res.inclusive_start = inclusiveStart;
	  }
	  if (typeof inclusiveEnd !== 'undefined') {
	    res.inclusive_end = inclusiveEnd;
	  }

	  return {
	    queryOpts: res,
	    inMemoryFields: inMemoryFields
	  };
	}

	function getDefaultQueryPlan(selector) {
	  //using default index, so all fields need to be done in memory
	  return {
	    queryOpts: {startkey: null},
	    inMemoryFields: [Object.keys(selector)]
	  };
	}

	function getCoreQueryPlan(selector, index) {
	  if (index.defaultUsed) {
	    return getDefaultQueryPlan(selector, index);
	  }

	  if (index.def.fields.length === 1) {
	    // one field in index, so the value was indexed as a singleton
	    return getSingleFieldCoreQueryPlan(selector, index);
	  }
	  // else index has multiple fields, so the value was indexed as an array
	  return getMultiFieldQueryOpts(selector, index);
	}

	function planQuery(request, indexes) {

	  var selector = request.selector;
	  var sort = request.sort;

	  var userFieldsRes = getUserFields(selector, sort);

	  var userFields = userFieldsRes.fields;
	  var sortOrder = userFieldsRes.sortOrder;
	  var index = findBestMatchingIndex(selector, userFields, sortOrder, indexes, request.use_index);

	  var coreQueryPlan = getCoreQueryPlan(selector, index);
	  var queryOpts = coreQueryPlan.queryOpts;
	  var coreInMemoryFields = coreQueryPlan.inMemoryFields;

	  var inMemoryFields = getInMemoryFields(coreInMemoryFields, index, selector, userFields);

	  var res = {
	    queryOpts: queryOpts,
	    index: index,
	    inMemoryFields: inMemoryFields
	  };
	  return res;
	}

	function indexToSignature(index) {
	  // remove '_design/'
	  return index.ddoc.substring(8) + '/' + index.name;
	}

	function doAllDocs(db, originalOpts) {
	  var opts = clone$1(originalOpts);

	  // CouchDB responds in weird ways when you provide a non-string to _id;
	  // we mimic the behavior for consistency. See issue66 tests for details.

	  if (opts.descending) {
	    if ('endkey' in opts && typeof opts.endkey !== 'string') {
	      opts.endkey = '';
	    }
	    if ('startkey' in opts && typeof opts.startkey !== 'string') {
	      opts.limit = 0;
	    }
	  } else {
	    if ('startkey' in opts && typeof opts.startkey !== 'string') {
	      opts.startkey = '';
	    }
	    if ('endkey' in opts && typeof opts.endkey !== 'string') {
	      opts.limit = 0;
	    }
	  }
	  if ('key' in opts && typeof opts.key !== 'string') {
	    opts.limit = 0;
	  }

	  return db.allDocs(opts)
	  .then(function (res) {
	    // filter out any design docs that _all_docs might return
	    res.rows = res.rows.filter(function (row) {
	      return !/^_design\//.test(row.id);
	    });
	    return res;
	  });
	}

	function find$1(db, requestDef, explain) {
	  if (requestDef.selector) {
	    requestDef.selector = massageSelector$1(requestDef.selector);
	  }

	  if (requestDef.sort) {
	    requestDef.sort = massageSort(requestDef.sort);
	  }

	  if (requestDef.use_index) {
	    requestDef.use_index = massageUseIndex(requestDef.use_index);
	  }

	  validateFindRequest(requestDef);

	  return getIndexes$1(db).then(function (getIndexesRes) {

	    db.constructor.emit('debug', ['find', 'planning query', requestDef]);
	    var queryPlan = planQuery(requestDef, getIndexesRes.indexes);
	    db.constructor.emit('debug', ['find', 'query plan', queryPlan]);

	    var indexToUse = queryPlan.index;

	    validateSort(requestDef, indexToUse);

	    var opts = assign$1$1({
	      include_docs: true,
	      reduce: false
	    }, queryPlan.queryOpts);

	    if ('startkey' in opts && 'endkey' in opts &&
	        collate$1(opts.startkey, opts.endkey) > 0) {
	      // can't possibly return any results, startkey > endkey
	      /* istanbul ignore next */
	      return {docs: []};
	    }

	    var isDescending = requestDef.sort &&
	      typeof requestDef.sort[0] !== 'string' &&
	      getValue$1(requestDef.sort[0]) === 'desc';

	    if (isDescending) {
	      // either all descending or all ascending
	      opts.descending = true;
	      opts = reverseOptions(opts);
	    }

	    if (!queryPlan.inMemoryFields.length) {
	      // no in-memory filtering necessary, so we can let the
	      // database do the limit/skip for us
	      if ('limit' in requestDef) {
	        opts.limit = requestDef.limit;
	      }
	      if ('skip' in requestDef) {
	        opts.skip = requestDef.skip;
	      }
	    }

	    if (explain) {
	      return PouchPromise$1.resolve(queryPlan, opts);
	    }

	    return PouchPromise$1.resolve().then(function () {
	      if (indexToUse.name === '_all_docs') {
	        return doAllDocs(db, opts);
	      } else {
	        var signature = indexToSignature(indexToUse);
	        return abstractMapper.query.call(db, signature, opts);
	      }
	    }).then(function (res) {
	      if (opts.inclusive_start === false) {
	        // may have to manually filter the first one,
	        // since couchdb has no true inclusive_start option
	        res.rows = filterInclusiveStart(res.rows, opts.startkey, indexToUse);
	      }

	      if (queryPlan.inMemoryFields.length) {
	        // need to filter some stuff in-memory
	        res.rows = filterInMemoryFields$1(res.rows, requestDef, queryPlan.inMemoryFields);
	      }

	      var resp = {
	        docs: res.rows.map(function (row) {
	          var doc = row.doc;
	          if (requestDef.fields) {
	            return pick$2(doc, requestDef.fields);
	          }
	          return doc;
	        })
	      };

	      if (indexToUse.defaultUsed) {
	        resp.warning = 'no matching index found, create an index to optimize query time';
	      }

	      return resp;
	    });
	  });
	}

	function explain$1(db, requestDef) {
	  return find$1(db, requestDef, true)
	  .then(function (queryPlan) {
	    return {
	      dbname: db.name,
	      index: queryPlan.index,
	      selector: requestDef.selector,
	      range: {
	        start_key: queryPlan.queryOpts.startkey,
	        end_key: queryPlan.queryOpts.endkey,
	      },
	      opts: {
	        use_index: requestDef.use_index || [],
	        bookmark: "nil", //hardcoded to match CouchDB since its not supported,
	        limit: requestDef.limit,
	        skip: requestDef.skip,
	        sort: requestDef.sort || {},
	        fields: requestDef.fields,
	        conflicts: false, //hardcoded to match CouchDB since its not supported,
	        r: [49], // hardcoded to match CouchDB since its not support
	      },
	      limit: requestDef.limit,
	      skip: requestDef.skip || 0,
	      fields: requestDef.fields,
	    };
	  });
	}

	function deleteIndex$1(db, index) {

	  if (!index.ddoc) {
	    throw new Error('you must supply an index.ddoc when deleting');
	  }

	  if (!index.name) {
	    throw new Error('you must supply an index.name when deleting');
	  }

	  var docId = index.ddoc;
	  var viewName = index.name;

	  function deltaFun(doc) {
	    if (Object.keys(doc.views).length === 1 && doc.views[viewName]) {
	      // only one view in this ddoc, delete the whole ddoc
	      return {_id: docId, _deleted: true};
	    }
	    // more than one view here, just remove the view
	    delete doc.views[viewName];
	    return doc;
	  }

	  return upsert$1(db, docId, deltaFun).then(function () {
	    return abstractMapper.viewCleanup.apply(db);
	  }).then(function () {
	    return {ok: true};
	  });
	}

	var createIndexAsCallback = callbackify$2(createIndex$1);
	var findAsCallback = callbackify$2(find$1);
	var explainAsCallback = callbackify$2(explain$1);
	var getIndexesAsCallback = callbackify$2(getIndexes$1);
	var deleteIndexAsCallback = callbackify$2(deleteIndex$1);

	var plugin = {};
	plugin.createIndex = toPromise$1(function (requestDef, callback) {

	  if (typeof requestDef !== 'object') {
	    return callback(new Error('you must provide an index to create'));
	  }

	  var createIndex$$1 = isRemote$1(this) ?
	    createIndex : createIndexAsCallback;
	  createIndex$$1(this, requestDef, callback);
	});

	plugin.find = toPromise$1(function (requestDef, callback) {

	  if (typeof callback === 'undefined') {
	    callback = requestDef;
	    requestDef = undefined;
	  }

	  if (typeof requestDef !== 'object') {
	    return callback(new Error('you must provide search parameters to find()'));
	  }

	  var find$$1 = isRemote$1(this) ? find : findAsCallback;
	  find$$1(this, requestDef, callback);
	});

	plugin.explain = toPromise$1(function (requestDef, callback) {

	  if (typeof callback === 'undefined') {
	    callback = requestDef;
	    requestDef = undefined;
	  }

	  if (typeof requestDef !== 'object') {
	    return callback(new Error('you must provide search parameters to explain()'));
	  }

	  var find$$1 = isRemote$1(this) ? explain : explainAsCallback;
	  find$$1(this, requestDef, callback);
	});

	plugin.getIndexes = toPromise$1(function (callback) {

	  var getIndexes$$1 = isRemote$1(this) ? getIndexes : getIndexesAsCallback;
	  getIndexes$$1(this, callback);
	});

	plugin.deleteIndex = toPromise$1(function (indexDef, callback) {

	  if (typeof indexDef !== 'object') {
	    return callback(new Error('you must provide an index to delete'));
	  }

	  var deleteIndex$$1 = isRemote$1(this) ?
	    deleteIndex : deleteIndexAsCallback;
	  deleteIndex$$1(this, indexDef, callback);
	});

	var index_es$1 = /*#__PURE__*/Object.freeze({
		default: plugin
	});

	var require$$0 = ( index_es && PouchDB ) || index_es;

	var require$$1 = ( index_es$1 && plugin ) || index_es$1;

	let PouchDB$1 = require$$0;
	if (typeof PouchDB$1.default === 'function') {
	    PouchDB$1 = PouchDB$1.default;
	}
	PouchDB$1.plugin(require$$1);

	const DB$1 = {
	    pos: null,
	    dp: null,
	    sdp: null
	};

	const open$1 = (dbPath, options = {}) => {
	    const dbName = options.type || 'pos';
	    if (!DB$1.hasOwnProperty(dbName)) return;
	    DB$1[dbName] = new PouchDB$1(`${dbPath}/${dbName}`, options);

	    options.index && DB$1[dbName].createIndex({
	        index: options.index
	    });
	};

	const handleArgs = obj => {
	    const dbName = obj.type || 'pos';
	    if (!DB$1.hasOwnProperty(dbName)) return {};
	    const db = DB$1[dbName];
	    const obj1 = { ...obj };
	    delete obj1.type;
	    return { db, obj: obj1 };
	};

	const find$2 = queryObj => {
	    const { db, obj } = handleArgs(queryObj);
	    return db.find({ selector: obj });
	};

	const get = ({ type, _id }) => {
	    const dbName = type || 'pos';
	    if (!DB$1.hasOwnProperty(dbName)) return;
	    return DB$1[dbName].get(_id);
	};

	const put = docObj => {
	    const { db, obj } = handleArgs(docObj);
	    return db.put(obj);
	};

	const post = docObj => {
	    const { db, obj } = handleArgs(docObj);
	    return db.post(obj);
	};

	var dao = {
	    open: open$1,
	    find: find$2,
	    get,
	    put,
	    post
	};

	var browser$1 = dao;

	return browser$1;

})));
