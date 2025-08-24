// A simplified path utility for browser environments that assumes POSIX-style paths.
export default {
    join(...parts: string[]): string {
        const path = parts.join('/');
        // Replace multiple slashes, but keep leading slashes for absolute paths
        return path.replace(/[/]+/g, '/');
    },

    dirname(p: string): string {
        const i = p.lastIndexOf('/');
        if (i === -1) return '.';
        if (i === 0) return '/'; // root directory
        const result = p.substring(0, i);
        return result || '/';
    },

    extname(p: string): string {
        const i = p.lastIndexOf('.');
        // ensure it's not the first char and a slash doesn't appear after it
        if (i <= 0 || p.lastIndexOf('/') > i) return '';
        return p.substring(i);
    },

    resolve(...args: string[]): string {
        let resolvedPath = '';
        let resolvedAbsolute = false;
        
        for (let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
            const path = (i >= 0 ? args[i] : '/')!; // CWD is root for web
            if (path.length === 0 && i >= 0) continue;
            
            resolvedPath = path + '/' + resolvedPath;
            resolvedAbsolute = path.charAt(0) === '/';
        }
        
        const parts = resolvedPath.split('/').filter(p => p);
        const stack: string[] = [];
        for (const p of parts) {
            if (p === '..') {
                stack.pop();
            } else if (p !== '.') {
                stack.push(p);
            }
        }
        
        let result = stack.join('/');
        if (resolvedAbsolute) {
            result = '/' + result;
        }
        
        return result || (resolvedAbsolute ? '/' : '.');
    },

    relative(from: string, to: string): string {
        const fromParts = from.split('/').filter(p => p && p !== '.');
        const toParts = to.split('/').filter(p => p && p !== '.');
        
        let i = 0;
        while(i < fromParts.length && i < toParts.length && fromParts[i] === toParts[i]) {
            i++;
        }
        
        const upCount = fromParts.length - i;
        const remainingTo = toParts.slice(i);
        
        const ups = Array(upCount).fill('..');
        const resultParts = [...ups, ...remainingTo];
        
        return resultParts.join('/') || '.';
    }
};