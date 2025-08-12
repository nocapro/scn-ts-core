import type { Range } from '../types';
import type Parser from 'web-tree-sitter';

export const getNodeText = (node: Parser.SyntaxNode, sourceCode: string): string => {
    return sourceCode.substring(node.startIndex, node.endIndex);
};

export const getNodeRange = (node: Parser.SyntaxNode): Range => {
    return {
        start: { line: node.startPosition.row, column: node.startPosition.column },
        end: { line: node.endPosition.row, column: node.endPosition.column },
    };
};

export const findChild = (node: Parser.SyntaxNode, type: string | string[]): Parser.SyntaxNode | null => {
    const types = Array.isArray(type) ? type : [type];
    return node.children.find((c: Parser.SyntaxNode) => types.includes(c.type)) || null;
}

export const findChildByFieldName = (node: Parser.SyntaxNode, fieldName: string): Parser.SyntaxNode | null => {
    return node.childForFieldName(fieldName);
};

export const getIdentifier = (node: Parser.SyntaxNode, sourceCode: string, defaultName: string = '<anonymous>'): string => {
    const nameNode = findChildByFieldName(node, 'name') ?? findChild(node, ['identifier', 'property_identifier']);
    return nameNode ? getNodeText(nameNode, sourceCode) : defaultName;
};