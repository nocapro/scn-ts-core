export const goQueries = `
(function_declaration
 name: (identifier) @symbol.function.def) @scope.function.def

(go_statement
  (call_expression) @rel.goroutine)

(call_expression
  function: (selector_expression
    field: (field_identifier) @rel.call.selector)
  )
`;