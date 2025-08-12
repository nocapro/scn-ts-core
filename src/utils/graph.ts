import type { SourceFile } from '../types';

export const topologicalSort = (sourceFiles: SourceFile[]): SourceFile[] => {
    const adj = new Map<number, Set<number>>();
    const inDegree = new Map<number, number>();
    const idToFile = new Map<number, SourceFile>();

    for (const file of sourceFiles) {
        adj.set(file.id, new Set());
        inDegree.set(file.id, 0);
        idToFile.set(file.id, file);
    }

    for (const file of sourceFiles) {
        for (const symbol of file.symbols) {
            for (const dep of symbol.dependencies) {
                // Create a directed edge from the dependency to the current file
                if (dep.resolvedFileId !== undefined && dep.resolvedFileId !== file.id) {
                    if (!adj.get(dep.resolvedFileId)?.has(file.id)) {
                         adj.get(dep.resolvedFileId)!.add(file.id);
                         inDegree.set(file.id, (inDegree.get(file.id) || 0) + 1);
                    }
                }
            }
        }
    }

    const queue: number[] = [];
    for (const [id, degree] of inDegree.entries()) {
        if (degree === 0) {
            queue.push(id);
        }
    }
    queue.sort((a,b) => a - b);

    const sorted: SourceFile[] = [];
    while (queue.length > 0) {
        const u = queue.shift()!;
        sorted.push(idToFile.get(u)!);

        const neighbors = Array.from(adj.get(u) || []).sort((a,b) => a-b);
        for (const v of neighbors) {
            inDegree.set(v, (inDegree.get(v) || 1) - 1);
            if (inDegree.get(v) === 0) {
                queue.push(v);
            }
        }
        queue.sort((a,b) => a - b);
    }

    if (sorted.length < sourceFiles.length) {
        const sortedIds = new Set(sorted.map(f => f.id));
        sourceFiles.forEach(f => {
            if (!sortedIds.has(f.id)) {
                sorted.push(f);
            }
        });
    }

    // The fixtures expect a specific order that seems to be a standard topological sort,
    // not a reverse one. Let's stick with the standard sort.
    return sorted;
};