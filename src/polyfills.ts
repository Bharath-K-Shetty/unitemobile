import { Buffer } from 'buffer';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

if (typeof globalThis.Buffer === 'undefined') {
  (globalThis as any).Buffer = Buffer;
}

if (!Buffer.prototype.subarray) {
  Buffer.prototype.subarray = function (begin: number, end?: number): Uint8Array {
    const result = Uint8Array.prototype.subarray.call(this, begin, end);
    Object.setPrototypeOf(result, Buffer.prototype);
    return result;
  };
}

// Patch TextEncoder for Anchor dependencies
if (typeof globalThis.TextEncoder === 'undefined') {
  (globalThis as any).TextEncoder = require('text-encoding').TextEncoder;
}

// Patch assert for Anchor dependencies
if (typeof globalThis.assert === 'undefined') {
  (globalThis as any).assert = require('assert');
}
