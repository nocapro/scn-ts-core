export const goQueries = `
(package_clause
  (package_identifier) @symbol.go_package.def)

(function_declaration
 name: (identifier) @symbol.function.def) @scope.function.def

(go_statement
  (call_expression
    function: (identifier) @rel.goroutine))

(call_expression
  function: (identifier) @rel.call)
(call_expression
  function: (selector_expression
    field: (field_identifier) @rel.call))

(import_spec
  (string_literal) @rel.import.source)
`;