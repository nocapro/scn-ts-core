export const goQueries = `
(package_clause
  (package_identifier) @symbol.go_package.def) @scope.go_package.def

(function_declaration
 name: (identifier) @symbol.function.def) @scope.function.def

(go_statement
  (call_expression
    function: (_) @rel.goroutine))

(call_expression
  function: (_) @rel.call)

(import_spec
  path: (interpreted_string_literal) @rel.import.source)
`;