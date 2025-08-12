
based on docs/test.plan.md, please;

1. implement test/unit/[categories]/*.test.ts files and test/test.util.ts
2. Test cases should be isolated and clean no left over even on sigterm
3. Test should use bun:test describe,it,afterAll,beforeAll,afterEach,beforeEach without mock
4. Create challenging, thorough test cases that fully verify implementation
5. Test cases should match expected requirements
6. Do not create test of tricks, simulation, stub, mock, etc. you should produce code of real algorithm
7. Do not create any new file for helper,script etc. just do what prompted.
8. test expectation; do not use `contain`, should use exact match!!
9. type of any, unknown, casting as: they are strictly forbidden!!!
10. if you need to have repograph-core improvement/modification, just create docs/todo.repograph.md
