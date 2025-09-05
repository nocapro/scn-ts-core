import { describe, it, expect, beforeAll } from 'bun:test';
import { calculateTokenImpact, initializeTokenizer } from '../../src/main';
import type { SourceFile, FormattingOptions, CodeSymbol } from '../../src/types';

const mockFile: SourceFile = {
    id: 1,
    relativePath: 'test.ts',
    absolutePath: '/test.ts',
    sourceCode: `
        export class MyClass {
            myMethod() {}
        }
        export const myVar = 1;
    `,
    language: { id: 'typescript', name: 'TypeScript', extensions: ['.ts'], wasmPath: '' } as any,
    symbols: [
        {
            id: '1.1',
            fileId: 1,
            name: 'MyClass',
            kind: 'class',
            isExported: true,
            dependencies: [],
            range: { start: { line: 1, column: 8 }, end: { line: 1, column: 15 } },
            scopeRange: { start: { line: 1, column: 17 }, end: { line: 3, column: 9 } },
        } as CodeSymbol,
        {
            id: '1.2',
            fileId: 1,
            name: 'myMethod',
            kind: 'method',
            isExported: false,
            dependencies: [],
            range: { start: { line: 2, column: 12 }, end: { line: 2, column: 20 } },
            scopeRange: { start: { line: 2, column: 24 }, end: { line: 2, column: 26 } },
        } as CodeSymbol,
        {
            id: '1.3',
            fileId: 1,
            name: 'myVar',
            kind: 'variable',
            isExported: true,
            dependencies: [],
            range: { start: { line: 4, column: 20 }, end: { line: 4, column: 25 } },
            scopeRange: { start: { line: 4, column: 8 }, end: { line: 4, column: 29 } },
        } as CodeSymbol,
    ],
    parseError: false,
};
const mockSourceFiles: SourceFile[] = [mockFile];

describe('calculateTokenImpact', () => {
    beforeAll(() => {
        initializeTokenizer();
    });

    it('should calculate negative impact for disabling a default-on option (showIcons)', () => {
        const baseOptions: FormattingOptions = {}; // Defaults to true
        const impact = calculateTokenImpact(mockSourceFiles, baseOptions);
        
        expect(impact.options.showIcons).toBeDefined();
        expect(impact.options.showIcons).toBeLessThan(0);
    });

    it('should calculate positive impact for enabling an option that was off', () => {
        const baseOptions: FormattingOptions = { showIcons: false };
        const impact = calculateTokenImpact(mockSourceFiles, baseOptions);

        expect(impact.options.showIcons).toBeDefined();
        expect(impact.options.showIcons).toBeGreaterThan(0);
    });

    it('should calculate negative impact for disabling showExportedIndicator', () => {
        const baseOptions: FormattingOptions = {};
        const impact = calculateTokenImpact(mockSourceFiles, baseOptions);

        expect(impact.options.showExportedIndicator).toBeDefined();
        expect(impact.options.showExportedIndicator).toBeLessThan(0);
    });

    it('should calculate negative impact for disabling groupMembers', () => {
        const baseOptions: FormattingOptions = {};
        const impact = calculateTokenImpact(mockSourceFiles, baseOptions);

        // Disabling grouping should change whitespace, likely reducing tokens
        expect(impact.options.groupMembers).toBeDefined();
        // The impact could be small, or even zero if whitespace changes don't cross token boundaries, but it shouldn't be positive.
        expect(impact.options.groupMembers).toBeLessThanOrEqual(0);
    });

    it('should calculate impact for displayFilters', () => {
        const baseOptions: FormattingOptions = {};
        const impact = calculateTokenImpact(mockSourceFiles, baseOptions);

        // Hiding a symbol kind should reduce tokens
        expect(impact.displayFilters.class).toBeDefined();
        expect(impact.displayFilters.class).toBeLessThan(0);
        expect(impact.displayFilters.method).toBeDefined();
        expect(impact.displayFilters.method).toBeLessThan(0);
        expect(impact.displayFilters.variable).toBeDefined();
        expect(impact.displayFilters.variable).toBeLessThan(0);
    });

    it('should return zero impact for a symbol kind not present in the source', () => {
        const baseOptions: FormattingOptions = {};
        const impact = calculateTokenImpact(mockSourceFiles, baseOptions);
        
        expect(impact.displayFilters.interface).toBeUndefined();
    });
});