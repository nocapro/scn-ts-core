export const cssQueries = `
(class_selector
  (class_name) @symbol.css_class.def)

(id_selector
  (id_name) @symbol.css_id.def)
  
(tag_name) @symbol.css_tag.def

(at_rule
  (at_keyword) @symbol.css_at_rule.def)

(declaration
  (property_name) @symbol.css_property.def)

`;