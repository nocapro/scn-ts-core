import { describe, it } from 'bun:test';
import { runTestForFixture } from '../../test.util.ts';
import path from 'node:path';

const fixtureDir = path.join(import.meta.dir, '..', 'fixtures');

describe('Dependency Graph Analysis', () => {
    it('09: Complex Dependency Graph (Circular & Peer)', async () => {
        await runTestForFixture(path.join(fixtureDir, '09.dep-graph-circular.fixture.yaml'));
    });

    it('10: Monorepo-style Path Aliases', async () => {
        await runTestForFixture(path.join(fixtureDir, '10.monorepo-aliases.fixture.yaml'));
    });
    
    it('16: Diamond Dependency Graph', async () => {
        await runTestForFixture(path.join(fixtureDir, '16.dep-graph-diamond.fixture.yaml'));
    });
    
    it('17: Dynamic Imports and Code Splitting', async () => {
        await runTestForFixture(path.join(fixtureDir, '17.dynamic-imports.fixture.yaml'));
    });
    
    it('25: GraphQL Code Generation Flow', async () => {
        await runTestForFixture(path.join(fixtureDir, '25.graphql-codegen.fixture.yaml'));
    });
});