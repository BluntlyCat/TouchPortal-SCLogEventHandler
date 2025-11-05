import { Handler, Line } from './types';

export class EventRouter {
    private _handlers: Handler[] = [];

    public register(handler: Handler) {
        this._handlers.push(handler);
    }

    public route(line: Line) {
        for (const h of this._handlers) {
            const re = new RegExp(`\\b${this.escapeRegex(h.key)}\\b`, 'i');
            if (re.test(line.str)) {
                h.handle(line);
            }
        }
    }

    private escapeRegex(s: string) {
        return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}