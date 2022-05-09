"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractTarget = void 0;
class AbstractTarget {
    filename = 'push.conf';
    index = 'index.html';
    constructor(options) {
        if (options.filename) {
            this.filename = options.filename;
        }
        if (options.index) {
            this.index = options.index;
        }
    }
}
exports.AbstractTarget = AbstractTarget;
