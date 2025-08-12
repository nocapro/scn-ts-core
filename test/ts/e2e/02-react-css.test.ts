import { describe, it } from 'bun:test';
import { runTestForFixture } from '../../test.util.ts';
import path from 'node:path';

const fixtureDir = path.join(import.meta.dir, '..', 'fixtures');

describe('React & CSS Features', () => {
    it('02: React/JSX and CSS Integration', async () => {
        await runTestForFixture(path.join(fixtureDir, '02.react-css.fixture.yaml'));
    });

    it('07: Advanced React (Hooks, Context, HOCs, Refs)', async () => {
        await runTestForFixture(path.join(fixtureDir, '07.advanced-react.fixture.yaml'));
    });
    
    it('08: Advanced CSS (Variables, Media Queries, Pseudo-selectors)', async () => {
        await runTestForFixture(path.join(fixtureDir, '08.advanced-css.fixture.yaml'));
    });
    
    it('13: Advanced React Render Patterns (Render Props & Fragments)', async () => {
        await runTestForFixture(path.join(fixtureDir, '13.react-render-props.fixture.yaml'));
    });
    
    it('14: Complex CSS Selectors and Rules', async () => {
        await runTestForFixture(path.join(fixtureDir, '14.complex-css.fixture.yaml'));
    });
    
    it('20: CSS-in-JS (e.g., Styled-Components, Emotion)', async () => {
        await runTestForFixture(path.join(fixtureDir, '20.css-in-js.fixture.yaml'));
    });
    
    it('22: React Server Components & Directives', async () => {
        await runTestForFixture(path.join(fixtureDir, '22.react-server-components.fixture.yaml'));
    });
});