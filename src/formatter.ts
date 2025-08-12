import type { CodeSymbol, SourceFile } from './types';
import { topologicalSort } from './utils/graph';

const ICONS: Record<string, string> = {
    class: '◇', interface: '{}', function: '~', method: '~',
    variable: '@', property: '@', enum: '☰', enum_member: '@',
    type_alias: '=:', react_component: '◇', jsx_element: '⛶',
    css_class: '¶', css_id: '¶', css_tag: '¶', css_at_rule: '¶',
    go_package: '◇',
    rust_struct: '◇', rust_trait: '{}', rust_impl: '+',
    error: '[error]', default: '?',
};

const formatSymbolId = (symbol: CodeSymbol) => `(${symbol.fileId}.${symbol.id.split(':')[0]})`;

const formatSymbol = (symbol: CodeSymbol, allFiles: SourceFile[]): string[] => {
    const icon = ICONS[symbol.kind] || ICONS.default;
    const prefix = symbol.isExported ? '+' : '-';
    let name = symbol.name === '<anonymous>' ? '' : ` ${symbol.name}`;
    if (symbol.kind === 'variable' && name.trim() === 'default') name = '';

    const mods = [
        symbol.isAbstract && 'abstract',
        symbol.isStatic && 'static',
    ].filter(Boolean).join(' ');
    const modStr = mods ? ` [${mods}]` : '';

    const suffix = [
        symbol.isAsync && '...',
        symbol.isPure && 'o',
    ].filter(Boolean).join(' ');

    const line = `  ${prefix} ${icon} ${formatSymbolId(symbol)}${name}${modStr}${suffix}`;
    const result = [line];

    const outgoing = new Map<number, Set<string>>();
    const unresolvedDeps: string[] = [];
    symbol.dependencies.forEach(dep => {
        if (dep.resolvedFileId !== undefined && dep.resolvedFileId !== symbol.fileId) {
            if (!outgoing.has(dep.resolvedFileId)) outgoing.set(dep.resolvedFileId, new Set());
            if (dep.resolvedSymbolId) {
                const targetSymbol = allFiles.find(f => f.id === dep.resolvedFileId)?.symbols.find(s => s.id === dep.resolvedSymbolId);
                if (targetSymbol) {
                    let text = formatSymbolId(targetSymbol);
                    if (dep.kind === 'goroutine') {
                        text += ' [goroutine]';
                    }
                    outgoing.get(dep.resolvedFileId)!.add(text);
                }
            }
        } else if (dep.resolvedFileId === undefined) {
            if (dep.kind === 'macro') {
                unresolvedDeps.push(`${dep.targetName} [macro]`);
            }
        }
    });

    const outgoingParts: string[] = [];
    if (outgoing.size > 0) {
        const resolvedParts = Array.from(outgoing.entries()).map(([fileId, symbolIds]) => {
            return symbolIds.size > 0 ? `${Array.from(symbolIds).join(', ')}` : `(${fileId}.0)`;
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
                if (d.resolvedFileId === symbol.fileId && d.resolvedSymbolId === symbol.id) {
                    if(!incoming.has(file.id)) incoming.set(file.id, new Set());
                    incoming.get(file.id)!.add(formatSymbolId(s));
                }
            });
        });
    });

    if (incoming.size > 0) {
        const parts = Array.from(incoming.entries()).map(([_fileId, symbolIds]) => Array.from(symbolIds).join(', '));
        result.push(`    <- ${parts.join(', ')}`);
    }

    return result;
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

    const symbolLines = file.symbols.flatMap(s => formatSymbol(s, allFiles));

    return [header, ...symbolLines].join('\n');
};

export const formatScn = (analyzedFiles: SourceFile[]): string => {
    const sortedFiles = topologicalSort(analyzedFiles);
    return sortedFiles.map(file => formatFile(file, analyzedFiles)).join('\n\n');
};