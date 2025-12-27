import { ReactiveController, ReactiveControllerHost } from 'lit';

export type ResizeCallback = (entry: ResizeObserverEntry) => void;

export class ResizeController implements ReactiveController {
  private host: ReactiveControllerHost & Element;
  private resizeObserver: ResizeObserver | null = null;
  private callback: ResizeCallback;

  constructor(host: ReactiveControllerHost & Element, callback: ResizeCallback) {
    this.host = host;
    this.callback = callback;
    host.addController(this);
  }

  hostConnected() {
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this.callback(entry);
      }
    });
    this.resizeObserver.observe(this.host);
  }

  hostDisconnected() {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
  }
}
