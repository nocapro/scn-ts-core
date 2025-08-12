import { describe, it } from 'bun:test';
import { runTestForFixture } from '../../test.util.ts';
import path from 'node:path';

const fixtureDir = path.join(import.meta.dir, '..', 'fixtures');

describe('Advanced, Edge Case, and Multi-language Features', () => {
    it('03: Advanced TS (Inheritance, Enums, Pure Functions)', async () => {
        await runTestForFixture(path.join(fixtureDir, '03.advanced-ts.fixture.yaml'));
    });

    it('05: Edge Cases (Empty & Anonymous)', async () => {
        await runTestForFixture(path.join(fixtureDir, '05.edge-cases.fixture.yaml'));
    });
    
    it('06: Advanced TypeScript (Generics, Decorators, Type Guards, Re-exports)', async () => {
        await runTestForFixture(path.join(fixtureDir, '06.advanced-ts-2.fixture.yaml'));
    });

    it('15: Multi-Language Project (Java & Python Integration)', async () => {
        await runTestForFixture(path.join(fixtureDir, '15.multi-language.fixture.yaml'));
    });
    
    it('18: File with Only Comments or Whitespace', async () => {
        await runTestForFixture(path.join(fixtureDir, '18.empty-files.fixture.yaml'));
    });
    
    it('21: WebAssembly (WASM) & Web Workers', async () => {
        await runTestForFixture(path.join(fixtureDir, '21.wasm-workers.fixture.yaml'));
    });

    it('26: Go Language Features (Goroutines, Channels)', async () => {
        await runTestForFixture(path.join(fixtureDir, '26.go-features.fixture.yaml'));
    });

    it('27: Rust Language Features (Traits, Impls, Macros)', async () => {
        await runTestForFixture(path.join(fixtureDir, '27.rust-features.fixture.yaml'));
    });

    it('28: Error Resilience (Syntax Error in One File)', async () => {
        await runTestForFixture(path.join(fixtureDir, '28.error-resilience.fixture.yaml'));
    });
});