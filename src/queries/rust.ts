export const rustQueries = `
(struct_item
  name: (type_identifier) @symbol.rust_struct.def)

(trait_item
  name: (type_identifier) @symbol.rust_trait.def)
  
(impl_item) @scope.rust_impl.def

(attribute_item
  (attribute (identifier) @rel.macro))

(function_item
  name: (identifier) @symbol.function.def) @scope.function.def
`;