declare module 'dompurify' {
  export interface DOMPurifyI {
    sanitize(html: string | Node, options?: any): string;
    addHook(hook: string, callback: (node: Node, data: any, config: any) => void): DOMPurifyI;
    removeHook(hook: string): DOMPurifyI;
    removeHooks(hook: string): DOMPurifyI;
    isValidAttribute(tag: string, attr: string, value: string): boolean;
    setConfig(cfg: any): DOMPurifyI;
    clearConfig(): void;
    version: string;
  }

  const DOMPurify: DOMPurifyI;
  export default DOMPurify;
}
