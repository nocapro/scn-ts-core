import { describe, it } from 'bun:test';
import { runTestForFixture } from '../test.util';
import path from 'node:path';

const fixtureDir = path.join(import.meta.dir, '..', 'fixtures');

describe('Core Language Features', () => {
    it('01: Core TypeScript Features (Class, Interface, Qualifiers)', async () => {
        await runTestForFixture(path.join(fixtureDir, '01.core-ts.fixture.yaml'));
    });

    it('04: JavaScript Syntax (ESM & CJS)', async () => {
        await runTestForFixture(path.join(fixtureDir, '04.js-syntax.fixture.yaml'));
    });
    
    it('11: TypeScript Advanced Modifiers & Class Features', async () => {
        await runTestForFixture(path.join(fixtureDir, '11.ts-modifiers.fixture.yaml'));
    });
    
    it('12: JavaScript Prototypes and IIFE', async () => {
        await runTestForFixture(path.join(fixtureDir, '12.js-prototype-iife.fixture.yaml'));
    });
    
    it('19: Advanced TypeScript Types (Conditional, Mapped, Template Literals)', async () => {
        await runTestForFixture(path.join(fixtureDir, '19.advanced-ts-types.fixture.yaml'));
    });
    
    it('23: JavaScript Proxy, Symbol, and Tagged Templates', async () => {
        await runTestForFixture(path.join(fixtureDir, '23.js-proxy-symbol.fixture.yaml'));
    });
    
    it('24: Ambient Modules & Triple-Slash Directives', async () => {
        await runTestForFixture(path.join(fixtureDir, '24.ts-ambient-modules.fixture.yaml'));
    });
});