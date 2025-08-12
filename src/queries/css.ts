export const cssQueries = `
(rule_set) @symbol.css_class.def @scope.css_class.def
(at_rule) @symbol.css_at_rule.def @scope.css_at_rule.def
(declaration (custom_property_name) @symbol.css_variable.def)
(var_function (custom_property_name) @rel.references)
`;