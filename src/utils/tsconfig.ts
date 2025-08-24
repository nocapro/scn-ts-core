import path from './path';

export interface TsConfig {
    compilerOptions?: {
        baseUrl?: string;
        paths?: Record<string, string[]>;
    };
}

const createPathResolver = (baseUrl: string, paths: Record<string, string[]>) => {
    const aliasEntries = Object.entries(paths).map(([alias, resolutions]) => {
        return {
            pattern: new RegExp(`^${alias.replace('*', '(.*)')}$`),
            resolutions,
        };
    });

    return (importPath: string): string | null => {
        for (const { pattern, resolutions } of aliasEntries) {
            const match = importPath.match(pattern);
            if (match && resolutions[0]) {
                const captured = match[1] || '';
                // Return the first resolved path.
                const resolvedPath = resolutions[0].replace('*', captured);
                return path.join(baseUrl, resolvedPath).replace(/\\/g, '/');
            }
        }
        return null; // Not an alias
    };
};

export type PathResolver = ReturnType<typeof createPathResolver>;

export const getPathResolver = (tsconfig?: TsConfig | null): PathResolver => {
    const baseUrl = tsconfig?.compilerOptions?.baseUrl || '.';
    const paths = tsconfig?.compilerOptions?.paths ?? {};
    // The baseUrl from tsconfig is relative to the tsconfig file itself (the root).
    // The final paths we create should be relative to the root to match our file list.
    return createPathResolver(baseUrl, paths);
};