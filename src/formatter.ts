import type { CodeSymbol, SourceFile, FormattingOptions } from './types';
import { topologicalSort } from './utils/graph';
import { ICONS, SCN_SYMBOLS } from './constants';

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

const formatSymbol = (symbol: CodeSymbol, allFiles: SourceFile[], options: FormattingOptions): string[] => {
    let icon = ICONS[symbol.kind] || ICONS.default || '?';
    const prefix = symbol.isExported ? SCN_SYMBOLS.EXPORTED_PREFIX : SCN_SYMBOLS.PRIVATE_PREFIX;
    let name = symbol.name === '<anonymous>' ? '' : symbol.name;
    if (symbol.kind === 'variable' && name.trim() === 'default') name = '';
    
    // Handle styled components: ~div ComponentName, ~h1 ComponentName, etc.
    if (symbol.kind === 'styled_component' && (symbol as any)._styledTag) {
        const tagName = (symbol as any)._styledTag;
        icon = `~${tagName}`;
    }

    const mods: string[] = [];
    if (symbol.isAbstract) mods.push(SCN_SYMBOLS.TAG_ABSTRACT.slice(1, -1));
    if (symbol.isStatic) mods.push(SCN_SYMBOLS.TAG_STATIC.slice(1, -1));
    const modStr = mods.length > 0 ? ` [${mods.join(' ')}]` : '';

    const suffixParts: string[] = [];
    if (symbol.signature) name += symbol.name === '<anonymous>' ? symbol.signature : `${symbol.signature}`;
    if (symbol.typeAnnotation) name += `: ${symbol.typeAnnotation}`;
    if (symbol.typeAliasValue) name += ` ${symbol.typeAliasValue}`;
    // Merge async + throws into a single token
    const asyncToken = symbol.isAsync ? SCN_SYMBOLS.ASYNC : '';
    const throwsToken = symbol.throws ? SCN_SYMBOLS.THROWS : '';
    const asyncThrows = (asyncToken + throwsToken) || '';
    if (asyncThrows) suffixParts.push(asyncThrows);
    if (symbol.isPure) suffixParts.push(SCN_SYMBOLS.PURE);
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

    const { showOutgoing = true, showIncoming = true } = options;

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
                        text += ` ${SCN_SYMBOLS.TAG_GOROUTINE}`;
                    }
                    outgoing.get(dep.resolvedFileId)!.add(text);
                }
            } else {
                let text = `(${dep.resolvedFileId}.0)`;
                if (dep.kind === 'dynamic_import') text += ` ${SCN_SYMBOLS.TAG_DYNAMIC}`;
                outgoing.get(dep.resolvedFileId)!.add(text);
            }
        } else if (dep.resolvedFileId === undefined) {
            if (dep.kind === 'macro') {
                unresolvedDeps.push(`${dep.targetName} ${SCN_SYMBOLS.TAG_MACRO}`);
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

    if (showOutgoing && outgoingParts.length > 0) {
        result.push(`    ${SCN_SYMBOLS.OUTGOING_ARROW} ${outgoingParts.join(', ')}`);
    }
    
    if (!showIncoming) return result;

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
        result.push(`    ${SCN_SYMBOLS.INCOMING_ARROW} ${parts.join(', ')}`);
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

const formatFile = (file: SourceFile, allFiles: SourceFile[], options: FormattingOptions): string => {
    if (file.parseError) return `${SCN_SYMBOLS.FILE_PREFIX} (${file.id}) ${file.relativePath} [error]`;
    if (!file.sourceCode.trim()) return `${SCN_SYMBOLS.FILE_PREFIX} (${file.id}) ${file.relativePath}`;

    const directives = [
        file.isGenerated && SCN_SYMBOLS.TAG_GENERATED.slice(1, -1),
        ...(file.languageDirectives || [])
    ].filter(Boolean);
    const directiveStr = directives.length > 0 ? ` [${directives.join(' ')}]` : '';
    const header = `${SCN_SYMBOLS.FILE_PREFIX} (${file.id}) ${file.relativePath}${directiveStr}`;

    const headerLines: string[] = [header];

    const { showOutgoing = true, showIncoming = true } = options;

    // File-level outgoing/incoming dependencies
    const outgoing: string[] = [];
    if (file.fileRelationships) {
        const outgoingFiles = new Set<number>();
        file.fileRelationships.forEach(rel => {
            // Only show true file-level imports on the header
            if ((rel.kind === 'import' || rel.kind === 'dynamic_import') && rel.resolvedFileId && rel.resolvedFileId !== file.id) {
                let text = `(${rel.resolvedFileId}.0)`;
                if (rel.kind === 'dynamic_import') text += ` ${SCN_SYMBOLS.TAG_DYNAMIC}`;
                outgoingFiles.add(rel.resolvedFileId);
                outgoing.push(text);
            }
        });
        if (showOutgoing && outgoing.length > 0) {
            headerLines.push(`  ${SCN_SYMBOLS.OUTGOING_ARROW} ${Array.from(new Set(outgoing)).sort().join(', ')}`);
        }
    }

    // Incoming: any other file that has a file-level relationship pointing here
    const incoming: string[] = [];
    if (showIncoming) {
        allFiles.forEach(other => {
            if (other.id === file.id) return;
            other.fileRelationships?.forEach(rel => {
                if (rel.resolvedFileId === file.id) incoming.push(`(${other.id}.0)`);
            });
        });
        if (incoming.length > 0) headerLines.push(`  ${SCN_SYMBOLS.INCOMING_ARROW} ${Array.from(new Set(incoming)).sort().join(', ')}`);
    }
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
        const lines = formatSymbol(sym, allFiles, options);
        symbolLines.push(...lines);
        if (childrenMap.has(sym.id)) {
            const kids = childrenMap.get(sym.id)!;
            for (const kid of kids) {
                const kLines = formatSymbol(kid, allFiles, options).map(l => `  ${l}`);
                symbolLines.push(...kLines);
            }
        }
    }

    // If we hid symbols (or there were none to begin with for an entry file),
    // aggregate outgoing dependencies from all symbols onto the file header
    if (showOutgoing && symbolsToPrint.length === 0) {
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
                if (dep.kind === 'dynamic_import') text += ` ${SCN_SYMBOLS.TAG_DYNAMIC}`;
                aggOutgoing.get(dep.resolvedFileId)!.add(text);
            } else if (dep.resolvedFileId === undefined && dep.kind === 'macro') {
                unresolvedDeps.push(`${dep.targetName} ${SCN_SYMBOLS.TAG_MACRO}`);
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
                headerLines.push(`  ${SCN_SYMBOLS.OUTGOING_ARROW} ${part}`);
            }
        }
    }
    return [...headerLines, ...symbolLines].join('\n');
};

export const formatScn = (analyzedFiles: SourceFile[], options: FormattingOptions = {}): string => {
    const sortedFiles = topologicalSort(analyzedFiles);
    return sortedFiles.map(file => formatFile(file, analyzedFiles, options)).join('\n\n');
};