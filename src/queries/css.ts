export const cssQueries = `
(rule_set) @symbol.css_class.def @scope.css_class.def
(at_rule) @symbol.css_at_rule.def @scope.css_at_rule.def
(declaration (property_name) @symbol.css_variable.def
  (#match? @symbol.css_variable.def "^--"))
(call_expression 
  (function_name) @__fn
  (arguments (plain_value) @rel.references)
  (#eq? @__fn "var"))
`;