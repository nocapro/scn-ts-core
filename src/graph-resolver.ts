import type { SourceFile, PathResolver, Relationship } from './types';
import path from './utils/path';

type FileMap = Map<string, SourceFile>;
type SymbolMap = Map<number, Map<string, string>>;

const findFileByImportPath = (importPath: string, currentFile: SourceFile, fileMap: FileMap, pathResolver: PathResolver, root: string): SourceFile | undefined => {
    const currentDir = path.dirname(currentFile.absolutePath);
    const aliasedPath = pathResolver(importPath);

    const resolvedPath = aliasedPath ? path.resolve(root, aliasedPath) : path.resolve(currentDir, importPath);

    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.css', '.go', '.rs', '.py', '.java', '.graphql', ''];
    for (const ext of extensions) {
        const tryPath = (resolvedPath + ext).replace(/\\/g, '/');
        const relative = path.relative(root, tryPath).replace(/\\/g, '/');
        if (fileMap.has(relative)) return fileMap.get(relative);
        
        const tryIndexPath = path.join(resolvedPath, 'index' + ext).replace(/\\/g, '/');
        const relativeIndex = path.relative(root, tryIndexPath).replace(/\\/g, '/');
        if(fileMap.has(relativeIndex)) return fileMap.get(relativeIndex);
    }
    return undefined;
};


const resolveRelationship = (rel: Relationship, sourceFile: SourceFile, fileMap: FileMap, symbolMap: SymbolMap, pathResolver: PathResolver, root: string) => {
    if (rel.kind === 'import') {
        const targetFile = findFileByImportPath(rel.targetName, sourceFile, fileMap, pathResolver, root);
        if (targetFile) rel.resolvedFileId = targetFile.id;
        return;
    }
    
    // Handle dynamic imports
    if (rel.kind === 'dynamic_import') {
        const targetFile = findFileByImportPath(rel.targetName, sourceFile, fileMap, pathResolver, root);
        if (targetFile) rel.resolvedFileId = targetFile.id;
        return;
    }
    
    // Attempt intra-file resolution first
    const intraFileSymbol = sourceFile.symbols.find(s => s.name === rel.targetName);
    if (intraFileSymbol) {
        rel.resolvedSymbolId = intraFileSymbol.id;
        rel.resolvedFileId = sourceFile.id;
        return;
    }
    
    // Attempt inter-file resolution via explicit imports of the current file
    if (sourceFile.fileRelationships) {
        for (const importRel of sourceFile.fileRelationships) {
            // We only care about resolved imports that bring in symbols
            if ((importRel.kind === 'import' || importRel.kind === 'dynamic_import') && importRel.resolvedFileId !== undefined) {
                const targetFileSymbols = symbolMap.get(importRel.resolvedFileId);
                // Does the file we imported from export a symbol with the name we're looking for?
                if (targetFileSymbols?.has(rel.targetName)) {
                    rel.resolvedFileId = importRel.resolvedFileId;
                    rel.resolvedSymbolId = targetFileSymbols.get(rel.targetName);
                    return; // Found it!
                }
            }
        }
    }
};

export const resolveGraph = (sourceFiles: SourceFile[], pathResolver: PathResolver, root: string): SourceFile[] => {
    const fileMap: FileMap = new Map(sourceFiles.map(f => [f.relativePath.replace(/\\/g, '/'), f]));
    const symbolMap: SymbolMap = new Map();
    for(const file of sourceFiles) {
        const fileSymbolMap = new Map(file.symbols.filter(s => s.isExported).map(s => [s.name, s.id]));
        symbolMap.set(file.id, fileSymbolMap);
    }
    
    for (const sourceFile of sourceFiles) {
        // Resolve file-level relationships (e.g., imports that aren't tied to a symbol)
        if (sourceFile.fileRelationships) {
            for (const rel of sourceFile.fileRelationships) {
                resolveRelationship(rel, sourceFile, fileMap, symbolMap, pathResolver, root);
            }
        }
        for (const symbol of sourceFile.symbols) {
            for (const rel of symbol.dependencies) {
                resolveRelationship(rel, sourceFile, fileMap, symbolMap, pathResolver, root);
            }
        }
    }
    return sourceFiles;
};