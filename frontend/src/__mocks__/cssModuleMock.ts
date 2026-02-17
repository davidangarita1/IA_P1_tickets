// Mock for CSS Modules — returns a Proxy that returns the className as-is
// This allows tests like `styles.container` to return "container"
const handler: ProxyHandler<Record<string, string>> = {
    get: function (_target, prop: string) {
        return prop;
    },
};

export default new Proxy({} as Record<string, string>, handler);
