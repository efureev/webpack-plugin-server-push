"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractTarget = void 0;
class AbstractTarget {
    constructor(options) {
        this.filename = 'push.conf';
        this.index = 'index.html';
        if (options.filename) {
            this.filename = options.filename;
        }
        if (options.index) {
            this.index = options.index;
        }
    }
}
exports.AbstractTarget = AbstractTarget;
