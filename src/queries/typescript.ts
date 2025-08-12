export const typescriptQueries = `
; Variable declarations (const, let, var)
(lexical_declaration 
  (variable_declarator 
    (identifier) @symbol.variable.def))

; Export statements with variable declarations
(export_statement
  (lexical_declaration 
    (variable_declarator 
      (identifier) @symbol.variable.def)))

; Function declarations
(function_declaration 
  (identifier) @symbol.function.def)

; Class declarations
(class_declaration 
  (identifier) @symbol.class.def)

; Import statements - capture the source string
(import_statement 
  (string) @rel.import.source)

; Import specifiers - capture imported names
(import_specifier 
  (identifier) @rel.import.named)

; Export statements - capture the source string
(export_statement 
  (string) @rel.export.source)

; Function calls
(call_expression 
  (identifier) @rel.call)

; Member expression calls
(call_expression 
  (member_expression 
    (property_identifier) @rel.call))

; All identifiers as fallback
(identifier) @symbol.identifier.def
`;