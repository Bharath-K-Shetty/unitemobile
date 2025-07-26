export { };

declare global {
  // Add global types explicitly
  var assert: typeof import('assert');
  var TextEncoder: typeof TextEncoder;
  var Buffer: typeof import('buffer').Buffer;
}
