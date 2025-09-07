import * as React from 'react';
import type { FormattingOptions, FormattingPreset } from '../types';
import { ChevronDown, ChevronRight, ListChecks, ListX, ChevronsDown, ChevronsUp, X } from 'lucide-react';
import { getFormattingOptionsForPreset, type FormattingOptionsTokenImpact } from 'scn-ts-core';
import { cn } from '../lib/utils';

import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface OutputOptionsProps {
  options: FormattingOptions;
  setOptions: React.Dispatch<React.SetStateAction<FormattingOptions>>;
  tokenImpact: FormattingOptionsTokenImpact | null;
}

type RegularOptionKey = keyof Omit<FormattingOptions, 'displayFilters' | 'preset'>;
type OptionItem = RegularOptionKey | string | { name: string; children: OptionItem[] };

const symbolKindLabels: Record<string, string> = {
  // TS/JS
  class: 'Classes',
  interface: 'Interfaces',
  function: 'Functions',
  method: 'Methods',
  constructor: 'Constructors',
  variable: 'Variables',
  property: 'Properties',
  enum: 'Enums',
  enum_member: 'Enum Members',
  type_alias: 'Type Aliases',
  module: 'Modules',
  // React
  react_component: 'React Components',
  styled_component: 'Styled Components',
  jsx_element: 'JSX Elements',
  // CSS
  css_class: 'CSS Classes',
  css_id: 'CSS IDs',
  css_tag: 'CSS Tags',
  css_at_rule: 'CSS At-Rules',
  css_variable: 'CSS Variables',
  // Go
  go_package: 'Go Packages',
  // Rust
  rust_struct: 'Rust Structs',
  rust_trait: 'Rust Traits',
  rust_impl: 'Rust Impls',
};

const tsDeclarationKinds = ['class', 'interface', 'function', 'variable', 'enum', 'type_alias', 'module'];
const tsMemberKinds = ['method', 'constructor', 'property', 'enum_member'];
const reactKinds = ['react_component', 'styled_component', 'jsx_element'];
const cssKinds = ['css_class', 'css_id', 'css_tag', 'css_at_rule', 'css_variable'];
const goKinds = ['go_package'];
const rustKinds = ['rust_struct', 'rust_trait', 'rust_impl'];

const toFilter = (kind: string): string => `filter:${kind}`;

const symbolVisibilityTree: OptionItem = {
  name: 'Symbol Visibility',
  children: [
    {
      name: 'TypeScript/JavaScript',
      children: [
        { name: 'Declarations', children: tsDeclarationKinds.map(toFilter) },
        { name: 'Members', children: tsMemberKinds.map(toFilter) },
      ],
    },
    { name: 'React', children: reactKinds.map(toFilter) },
    { name: 'CSS', children: cssKinds.map(toFilter) },
    {
      name: 'Other Languages',
      children: [
        { name: 'Go', children: goKinds.map(toFilter) },
        { name: 'Rust', children: rustKinds.map(toFilter) },
      ],
    },
  ],
};

const optionTree: OptionItem[] = [
  {
    name: 'Display Elements',
    children: [
      'showIcons',
      {
        name: 'Indicators',
        children: ['showExportedIndicator', 'showPrivateIndicator'],
      },
      'showModifiers',
      'showTags',
      {
        name: 'Identifiers',
        children: ['showFilePrefix', 'showFileIds', 'showSymbolIds'],
      },
    ],
  },
  {
    name: 'Relationships',
    children: ['showOutgoing', 'showIncoming'],
  },
  {
    name: 'Structure',
    children: ['groupMembers', 'showOnlyExports'],
  },
  symbolVisibilityTree,
];

const optionLabels: Record<RegularOptionKey, string> & Record<string, string> = {
  ...symbolKindLabels,
  showIcons: 'Icons',
  showExportedIndicator: 'Exported (+)',
  showPrivateIndicator: 'Private (-)',
  showModifiers: 'Modifiers',
  showTags: 'Tags',
  showSymbolIds: 'Symbol IDs',
  showFilePrefix: 'File Prefix (§)',
  showFileIds: 'File IDs',
  showOutgoing: 'Outgoing',
  showIncoming: 'Incoming',
  groupMembers: 'Group Members',
  showOnlyExports: 'Show Only Exports',
};

function getAllKeys(item: OptionItem): string[] {
  if (typeof item === 'string') {
    return [item];
  }
  return item.children.flatMap(getAllKeys);
}

const getAllGroupNames = (items: OptionItem[]): string[] => {
  return items.flatMap(item => {
    if (typeof item === 'object' && 'name' in item) {
      return [item.name, ...getAllGroupNames(item.children)];
    }
    return [];
  });
}

export const OutputOptions: React.FC<OutputOptionsProps> = ({ options, setOptions, tokenImpact }) => {
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(
    () =>
      new Set([
        'Display Elements', 'Indicators', 'Relationships', 'Structure',
        'TypeScript/JavaScript',
        'React', 'Identifiers',
      ])
  );

  const [searchTerm, setSearchTerm] = React.useState('');

  const allOptionKeys = React.useMemo(() => optionTree.flatMap(getAllKeys), []);

  const areAllSelected = React.useMemo(() => {
    if (allOptionKeys.length === 0) return false;
    return allOptionKeys.every(key => {
      if (key.startsWith('filter:')) {
        const kind = key.substring('filter:'.length);
        if (options.displayFilters && Object.hasOwn(options.displayFilters, kind)) {
          return options.displayFilters[kind] as boolean;
        }
        return true; // Default is selected
      }
      return options[key as RegularOptionKey] ?? true;
    });
  }, [allOptionKeys, options]);

  const filteredOptionTree = React.useMemo(() => {
    if (!searchTerm.trim()) return optionTree;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    function filter(item: OptionItem): OptionItem | null {
      if (typeof item === 'string') {
        const label = optionLabels[item as keyof typeof optionLabels] || item;
        return label.toLowerCase().includes(lowerCaseSearchTerm) ? item : null;
      }

      if (item.name.toLowerCase().includes(lowerCaseSearchTerm)) {
        return item; // Keep group and all its children if group name matches
      }

      const filteredChildren = item.children.map(filter).filter((c): c is OptionItem => c !== null);
      if (filteredChildren.length > 0) {
        return { ...item, children: filteredChildren };
      }
      return null;
    }
    return optionTree.map(filter).filter((i): i is OptionItem => i !== null);
  }, [searchTerm]);

  const allFilteredGroupNames = React.useMemo(() => getAllGroupNames(filteredOptionTree), [filteredOptionTree]);
  const areAllExpanded = React.useMemo(() => 
    allFilteredGroupNames.length > 0 && allFilteredGroupNames.every(g => expandedGroups.has(g)), 
    [allFilteredGroupNames, expandedGroups]);

  React.useEffect(() => {
    if (searchTerm.trim()) {
      setExpandedGroups(new Set(allFilteredGroupNames));
    }
  }, [searchTerm, allFilteredGroupNames]);

  const expandAll = React.useCallback(() => setExpandedGroups(new Set(allFilteredGroupNames)), [allFilteredGroupNames]);
  const collapseAll = React.useCallback(() => {
    setExpandedGroups(new Set());
  }, []);
  const selectAll = React.useCallback(() => {
    setOptions(prev => {
      const newOptions: FormattingOptions = { ...prev, preset: undefined };
      const newDisplayFilters = { ...(prev.displayFilters ?? {}) };

      for (const key of allOptionKeys) {
        if (key.startsWith('filter:')) {
          newDisplayFilters[key.substring('filter:'.length)] = true;
        } else {
          newOptions[key as RegularOptionKey] = true;
        }
      }
      newOptions.displayFilters = newDisplayFilters;
      return newOptions;
    });
  }, [allOptionKeys]);
  const deselectAll = React.useCallback(() => {
    setOptions(prev => {
      const newOptions: FormattingOptions = { ...prev, preset: undefined };
      const newDisplayFilters = { ...(prev.displayFilters ?? {}) };

      for (const key of allOptionKeys) {
        if (key.startsWith('filter:')) {
          newDisplayFilters[key.substring('filter:'.length)] = false;
        } else {
          newOptions[key as RegularOptionKey] = false;
        }
      }
      newOptions.displayFilters = newDisplayFilters;
      return newOptions;
    });
  }, [allOptionKeys]);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  const handleChange = (optionKey: string) => (checked: boolean | 'indeterminate') => {
    const isChecked = checked === true;
    if (optionKey.startsWith('filter:')) {
      const kind = optionKey.substring('filter:'.length);
      setOptions(prev => ({
        ...prev,
        preset: undefined,
        displayFilters: { ...(prev.displayFilters ?? {}), [kind]: isChecked },
      }));
    } else {
      setOptions(prev => ({ ...prev, preset: undefined, [optionKey]: isChecked }));
    }
  };

  const handleGroupChange = (keys: ReadonlyArray<string>) => (checked: boolean | 'indeterminate') => {
    const isChecked = checked === true;
    setOptions(prev => {
      const newOptions: FormattingOptions = { ...prev, preset: undefined };
      const newDisplayFilters = { ...(prev.displayFilters ?? {}) };

      for (const key of keys) {
        if (key.startsWith('filter:')) {
          newDisplayFilters[key.substring('filter:'.length)] = isChecked;
        } else {
          newOptions[key as RegularOptionKey] = isChecked;
        }
      }
      newOptions.displayFilters = newDisplayFilters;
      return newOptions;
    });
  };

  const renderItem = (item: OptionItem, level: number): React.ReactNode => {
    if (typeof item === 'string') {
      const key = item as string;
      const isFilter = key.startsWith('filter:');
      const filterKind = isFilter ? key.substring('filter:'.length) : null;
      const labelKey = filterKind ?? key;

      return (
        <div key={key} style={{ paddingLeft: `${level * 1.5}rem` }} className="flex items-center space-x-1.5">
          <Checkbox
            id={key}
            checked={isFilter
              ? (options.displayFilters && Object.hasOwn(options.displayFilters, filterKind!)
                ? options.displayFilters[filterKind!]
                : true)
              : (options[key as RegularOptionKey] ?? true)}
            onCheckedChange={handleChange(key)}
          />
          <Label htmlFor={key} className="flex-1 cursor-pointer select-none text-sm text-muted-foreground font-normal">
            <div className="flex justify-between items-center">
              <span>{optionLabels[labelKey as keyof typeof optionLabels] ?? labelKey}</span>
              {tokenImpact && (
                <span className="text-xs font-mono tabular-nums text-foreground/50">
                  {(() => {
                    let impact: number | undefined;
                    if (isFilter) {
                      if (tokenImpact.displayFilters && Object.hasOwn(tokenImpact.displayFilters, filterKind!)) {
                        impact = tokenImpact.displayFilters[filterKind!];
                      }
                    } else {
                      impact = tokenImpact.options?.[key as RegularOptionKey];
                    }
                    if (impact === undefined) return null;
                    return `${impact > 0 ? '+' : ''}${impact}`;
                  })()}
                </span>
              )}
            </div>
          </Label>
        </div>
      );
    }

    const { name, children } = item;
    const isExpanded = expandedGroups.has(name);
    const allKeys = getAllKeys(item);
    const allChecked = allKeys.every(key => {
      if (key.startsWith('filter:')) {
        const kind = key.substring('filter:'.length);
        return (options.displayFilters && Object.hasOwn(options.displayFilters, kind))
          ? options.displayFilters[kind]
          : true;
      }
      return options[key as RegularOptionKey] ?? true;
    });
    const groupTokenImpact = tokenImpact ? allKeys.reduce((sum, key) => {
      let impact: number | undefined;
      if (key.startsWith('filter:')) {
        const kind = key.substring('filter:'.length);
        if (tokenImpact.displayFilters && Object.hasOwn(tokenImpact.displayFilters, kind)) {
          impact = tokenImpact.displayFilters[kind];
        }
      } else {
        impact = tokenImpact.options?.[key as RegularOptionKey];
      }
      return sum + (impact ?? 0);
    }, 0) : null;

    const impactDisplay = tokenImpact && groupTokenImpact !== null ? (
      <span className="text-xs font-mono tabular-nums text-foreground/50 ml-auto mr-2">
        {(() => {
          const impact = groupTokenImpact;
          if (impact === undefined) return null;
          return `${impact > 0 ? '+' : ''}${impact}`;
        })()}
      </span>
    ) : null;

    return (
      <div key={name}>
        <div
          className="flex items-center space-x-1.5 py-1 rounded-md hover:bg-accent/50 cursor-pointer select-none -mx-2 px-2"
          style={{ paddingLeft: `calc(${level * 1.5}rem + 0.5rem)` }}
          onClick={() => toggleGroup(name)}
        >
          {isExpanded ? <ChevronDown className="h-4 w-4 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 flex-shrink-0" />}
          <Checkbox
            id={`group-${name.replace(/\s+/g, '-')}`}
            title={`Toggle all in ${name}`}
            checked={allChecked}
            onCheckedChange={handleGroupChange(allKeys)}
            onClick={(e: React.MouseEvent) => e.stopPropagation()} // Prevent row click from firing
          />
          <Label
            htmlFor={`group-${name.replace(/\s+/g, '-')}`} // The label itself is clickable
            className="flex-1 font-semibold text-sm cursor-pointer select-none"
          >
            <div className="flex justify-between items-center">
              <span>{name}</span> {impactDisplay}</div>
          </Label>
        </div>
        {isExpanded && (
          <div className="pt-1.5 space-y-1.5">
            {children.map(child => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const presets: FormattingPreset[] = ['minimal', 'compact', 'default', 'detailed', 'verbose'];

  return (
    <div className="space-y-1">
      <div className="flex justify-between gap-1 mb-3">
        {presets.map(p => (
          <Button
            key={p}
            variant={options.preset === p ? 'default' : 'outline'}
            size="sm"
            onClick={() => setOptions(getFormattingOptionsForPreset(p))}
            className={cn("capitalize flex-1 text-xs h-7", options.preset !== p && "text-muted-foreground")}
          >
            {p}
          </Button>
        ))}
      </div>
      <div className="flex gap-2 mb-3">
        <div className="relative flex-grow">
          <Input
            placeholder="Search options..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 text-xs pr-8"
          />
          {searchTerm && (
            <Button variant="ghost" size="icon" onClick={() => setSearchTerm('')} className="absolute right-0 top-0 h-8 w-8 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={areAllSelected ? deselectAll : selectAll} title={areAllSelected ? "Deselect all" : "Select all"} className="h-8 w-8 text-muted-foreground hover:text-foreground">
            {areAllSelected ? <ListX className="h-4 w-4" /> : <ListChecks className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={areAllExpanded ? collapseAll : expandAll} title={areAllExpanded ? "Collapse all" : "Expand all"} className="h-8 w-8 text-muted-foreground hover:text-foreground">
            {areAllExpanded ? <ChevronsUp className="h-4 w-4" /> : <ChevronsDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      {filteredOptionTree.map(item => renderItem(item, 0))}
    </div>
  );
};
