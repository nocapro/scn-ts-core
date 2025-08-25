import type { CodeSymbol, SourceFile } from './types';
import { topologicalSort } from './utils/graph';

const ICONS: Record<string, string> = {
    class: '◇', interface: '{}', function: '~', method: '~',
    constructor: '~',
    variable: '@', property: '@', enum: '☰', enum_member: '@',
    type_alias: '=:', react_component: '◇', jsx_element: '⛶', styled_component: '~',
    css_class: '¶', css_id: '¶', css_tag: '¶', css_at_rule: '¶',
    go_package: '◇',
    rust_struct: '◇', rust_trait: '{}', rust_impl: '+',
    error: '[error]', default: '?',
};

// Compute display index per file based on eligible symbols (exclude properties and constructors)
const isIdEligible = (symbol: CodeSymbol): boolean => {
    if (symbol.kind === 'property' || symbol.kind === 'constructor') return false;
    if (symbol.kind === 'variable') return symbol.isExported || symbol.name === 'module.exports' || symbol.name === 'default';
    if (symbol.kind === 'method') return !!symbol.isExported;
    return true;
};

const getDisplayIndex = (file: SourceFile, symbol: CodeSymbol): number | null => {
    const ordered = file.symbols
        .filter(isIdEligible)
        .sort((a, b) => a.range.start.line - b.range.start.line || a.range.start.column - b.range.start.column);
    const index = ordered.findIndex(s => s === symbol);
    return index === -1 ? null : index + 1;
};

const formatSymbolIdDisplay = (file: SourceFile, symbol: CodeSymbol): string | null => {
    const idx = getDisplayIndex(file, symbol);
    if (idx == null) return null;
    return `(${file.id}.${idx})`;
};

const formatSymbol = (symbol: CodeSymbol, allFiles: SourceFile[]): string[] => {
    let icon = ICONS[symbol.kind] || ICONS.default || '?';
    const prefix = symbol.isExported ? '+' : '-';
    let name = symbol.name === '<anonymous>' ? '' : symbol.name;
    if (symbol.kind === 'variable' && name.trim() === 'default') name = '';
    
    // Handle styled components: ~div ComponentName, ~h1 ComponentName, etc.
    if (symbol.kind === 'styled_component' && (symbol as any)._styledTag) {
        const tagName = (symbol as any)._styledTag;
        icon = `~${tagName}`;
    }

    const mods = [
        symbol.isAbstract && 'abstract',
        symbol.isStatic && 'static',
    ].filter(Boolean).join(' ');
    const modStr = mods ? ` [${mods}]` : '';

    const suffixParts: string[] = [];
    if (symbol.signature) name += symbol.name === '<anonymous>' ? symbol.signature : `${symbol.signature}`;
    if (symbol.typeAnnotation) name += `: ${symbol.typeAnnotation}`;
    if (symbol.typeAliasValue) name += ` ${symbol.typeAliasValue}`;
    // Merge async + throws into a single token '...!'
    const asyncToken = symbol.isAsync ? '...' : '';
    const throwsToken = symbol.throws ? '!' : '';
    const asyncThrows = (asyncToken + throwsToken) || '';
    if (asyncThrows) suffixParts.push(asyncThrows);
    if (symbol.isPure) suffixParts.push('o');
    if (symbol.labels && symbol.labels.length > 0) suffixParts.push(...symbol.labels.map(l => `[${l}]`));
    const suffix = suffixParts.join(' ');

    // Build ID portion conditionally
    const file = allFiles.find(f => f.id === symbol.fileId)!;
    const idPart = formatSymbolIdDisplay(file, symbol);
    const idText = (symbol.kind === 'property' || symbol.kind === 'constructor') ? null : (idPart ?? null);
    const segments: string[] = [prefix, icon];
    if (idText) segments.push(idText);
    if (name) segments.push(name.trim());
    if (modStr) segments.push(modStr);
    if (suffix) segments.push(suffix);
    const line = `  ${segments.filter(Boolean).join(' ')}`;
    const result = [line];

    const outgoing = new Map<number, Set<string>>();
    const unresolvedDeps: string[] = [];
    symbol.dependencies.forEach(dep => {
        if (dep.resolvedFileId !== undefined && dep.resolvedFileId !== symbol.fileId) {
            if (!outgoing.has(dep.resolvedFileId)) outgoing.set(dep.resolvedFileId, new Set());
            if (dep.resolvedSymbolId) {
                const targetFile = allFiles.find(f => f.id === dep.resolvedFileId);
                const targetSymbol = targetFile?.symbols.find(s => s.id === dep.resolvedSymbolId);
                if (targetSymbol) {
                    const displayId = formatSymbolIdDisplay(targetFile!, targetSymbol);
                    let text = displayId ?? `(${targetFile!.id}.0)`;
                    if (dep.kind === 'goroutine') {
                        text += ' [goroutine]';
                    }
                    outgoing.get(dep.resolvedFileId)!.add(text);
                }
            } else {
                let text = `(${dep.resolvedFileId}.0)`;
                if (dep.kind === 'dynamic_import') text += ' [dynamic]';
                outgoing.get(dep.resolvedFileId)!.add(text);
            }
        } else if (dep.resolvedFileId === undefined) {
            if (dep.kind === 'macro') {
                unresolvedDeps.push(`${dep.targetName} [macro]`);
            }
        }
    });

    const outgoingParts: string[] = [];
    if (outgoing.size > 0) {
        const resolvedParts = Array.from(outgoing.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([fileId, symbolIds]) => {
                const items = Array.from(symbolIds).sort();
                return items.length > 0 ? `${items.join(', ')}` : `(${fileId}.0)`;
            });
        outgoingParts.push(...resolvedParts);
    }
    outgoingParts.push(...unresolvedDeps);

    if (outgoingParts.length > 0) {
        result.push(`    -> ${outgoingParts.join(', ')}`);
    }
    
    const incoming = new Map<number, Set<string>>();
    allFiles.forEach(file => {
        file.symbols.forEach(s => {
            s.dependencies.forEach(d => {
                if (d.resolvedFileId === symbol.fileId && d.resolvedSymbolId === symbol.id && s !== symbol) {
                    if(!incoming.has(file.id)) incoming.set(file.id, new Set());
                    // Suppress same-file incoming for properties
                    if (file.id === symbol.fileId && symbol.kind === 'property') return;
                    const disp = formatSymbolIdDisplay(file, s) ?? `(${file.id}.0)`;
                    incoming.get(file.id)!.add(disp);
                }
            });
        });
        // Include file-level imports to this file as incoming for exported symbols
        // but only if there is no symbol-level incoming from that file already
        if (file.id !== symbol.fileId && symbol.isExported) {
            file.fileRelationships?.forEach(rel => {
                if (rel.resolvedFileId === symbol.fileId) {
                    const already = incoming.get(file.id);
                    if (!already || already.size === 0) {
                        if(!incoming.has(file.id)) incoming.set(file.id, new Set());
                        incoming.get(file.id)!.add(`(${file.id}.0)`);
                    }
                }
            });
        }
    });

    if (incoming.size > 0) {
        const parts = Array.from(incoming.entries()).map(([_fileId, symbolIds]) => Array.from(symbolIds).join(', '));
        result.push(`    <- ${parts.join(', ')}`);
    }

    return result;
};


const isWithin = (inner: CodeSymbol, outer: CodeSymbol): boolean => {
    const a = inner.range;
    const b = outer.scopeRange;
    return (
        (a.start.line > b.start.line || (a.start.line === b.start.line && a.start.column >= b.start.column)) &&
        (a.end.line < b.end.line || (a.end.line === b.end.line && a.end.column <= b.end.column))
    );
};

const buildChildrenMap = (symbols: CodeSymbol[]): Map<string, CodeSymbol[]> => {
    const parents = symbols.filter(s => s.kind === 'class' || s.kind === 'interface' || s.kind === 'react_component');
    const map = new Map<string, CodeSymbol[]>();
    for (const parent of parents) map.set(parent.id, []);
    for (const sym of symbols) {
        if (sym.kind === 'class' || sym.kind === 'interface' || sym.kind === 'react_component') continue;
        const parent = parents
            .filter(p => isWithin(sym, p))
            .sort((a, b) => (a.scopeRange.end.line - a.scopeRange.start.line) - (b.scopeRange.end.line - b.scopeRange.start.line))[0];
        if (parent) {
            map.get(parent.id)!.push(sym);
        }
    }
    // Sort children by position
    for (const [, arr] of map.entries()) {
        arr.sort((a, b) => a.range.start.line - b.range.start.line || a.range.start.column - b.range.start.column);
    }
    return map;
};

const formatFile = (file: SourceFile, allFiles: SourceFile[]): string => {
    if (file.parseError) return `§ (${file.id}) ${file.relativePath} [error]`;
    if (!file.sourceCode.trim()) return `§ (${file.id}) ${file.relativePath}`;

    const directives = [
        file.isGenerated && 'generated',
        ...(file.languageDirectives || [])
    ].filter(Boolean);
    const directiveStr = directives.length > 0 ? ` [${directives.join(' ')}]` : '';
    const header = `§ (${file.id}) ${file.relativePath}${directiveStr}`;

    const headerLines: string[] = [header];

    // File-level outgoing/incoming dependencies
    const outgoing: string[] = [];
    if (file.fileRelationships) {
        const outgoingFiles = new Set<number>();
        file.fileRelationships.forEach(rel => {
            // Only show true file-level imports on the header
            if ((rel.kind === 'import' || rel.kind === 'dynamic_import') && rel.resolvedFileId && rel.resolvedFileId !== file.id) {
                let text = `(${rel.resolvedFileId}.0)`;
                if (rel.kind === 'dynamic_import') text += ' [dynamic]';
                outgoingFiles.add(rel.resolvedFileId);
                outgoing.push(text);
            }
        });
        if (outgoing.length > 0) headerLines.push(`  -> ${Array.from(new Set(outgoing)).sort().join(', ')}`);
    }

    // Incoming: any other file that has a file-level relationship pointing here
    const incoming: string[] = [];
    allFiles.forEach(other => {
        if (other.id === file.id) return;
        other.fileRelationships?.forEach(rel => {
            if (rel.resolvedFileId === file.id) incoming.push(`(${other.id}.0)`);
        });
    });
    if (incoming.length > 0) headerLines.push(`  <- ${Array.from(new Set(incoming)).sort().join(', ')}`);

    // If file has no exported symbols, only show symbols that are "entry points" for analysis,
    // which we define as having outgoing dependencies.
    const hasExports = file.symbols.some(s => s.isExported);
    let symbolsToPrint = hasExports
        ? file.symbols.slice()
        : file.symbols.filter(s => s.dependencies.length > 0);

    // Group properties/methods under their class/interface parent
    const childrenMap = buildChildrenMap(symbolsToPrint);
    const childIds = new Set<string>(Array.from(childrenMap.values()).flat().map(s => s.id));
    const topLevel = symbolsToPrint.filter(s => !childIds.has(s.id));

    const symbolLines: string[] = [];
    for (const sym of topLevel) {
        const lines = formatSymbol(sym, allFiles);
        symbolLines.push(...lines);
        if (childrenMap.has(sym.id)) {
            const kids = childrenMap.get(sym.id)!;
            for (const kid of kids) {
                const kLines = formatSymbol(kid, allFiles).map(l => `  ${l}`);
                symbolLines.push(...kLines);
            }
        }
    }

    // If we hid symbols (or there were none to begin with for an entry file),
    // aggregate outgoing dependencies from all symbols onto the file header
    if (symbolsToPrint.length === 0) {
        const aggOutgoing = new Map<number, Set<string>>();
        const unresolvedDeps: string[] = [];

        const processDep = (dep: import('./types').Relationship) => {
            if (dep.resolvedFileId && dep.resolvedFileId !== file.id) {
                if (!aggOutgoing.has(dep.resolvedFileId)) aggOutgoing.set(dep.resolvedFileId, new Set());
                let text = `(${dep.resolvedFileId}.0)`; // Default to file-level
                if (dep.resolvedSymbolId) {
                    const targetFile = allFiles.find(f => f.id === dep.resolvedFileId)!;
                    const targetSymbol = targetFile.symbols.find(ts => ts.id === dep.resolvedSymbolId);
                    if (targetSymbol) {
                        text = formatSymbolIdDisplay(targetFile, targetSymbol) ?? `(${dep.resolvedFileId}.0)`;
                    }
                }
                if (dep.kind === 'dynamic_import') text += ' [dynamic]';
                aggOutgoing.get(dep.resolvedFileId)!.add(text);
            } else if (dep.resolvedFileId === undefined && dep.kind === 'macro') {
                unresolvedDeps.push(`${dep.targetName} [macro]`);
            }
        };

        file.symbols.forEach(s => s.dependencies.forEach(processDep));
        file.fileRelationships?.forEach(processDep);

        const outgoingParts: string[] = [];
        if (aggOutgoing.size > 0) {
            const resolvedParts = Array.from(aggOutgoing.entries())
                .sort((a, b) => a[0] - b[0])
                .flatMap(([, symbolIds]) => Array.from(symbolIds).sort());
            outgoingParts.push(...resolvedParts);
        }
        outgoingParts.push(...unresolvedDeps);

        if (outgoingParts.length > 0) {
            // Some fixtures expect separate -> lines per dependency.
            // This preserves that behavior.
            for (const part of outgoingParts) {
                headerLines.push(`  -> ${part}`);
            }
        }
    }
    return [...headerLines, ...symbolLines].join('\n');
};

export const formatScn = (analyzedFiles: SourceFile[]): string => {
    const sortedFiles = topologicalSort(analyzedFiles);
    return sortedFiles.map(file => formatFile(file, analyzedFiles)).join('\n\n');
};