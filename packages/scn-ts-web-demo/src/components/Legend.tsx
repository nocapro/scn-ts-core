import * as React from 'react';
import { Button } from './ui/button';
import { HelpCircle, X } from 'lucide-react';
import { ICONS, SCN_SYMBOLS } from 'scn-ts-core';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion"

const symbolIconGroups: Record<string, (keyof typeof ICONS)[]> = {
  'Class or Component': ['class', 'react_component'],
  'Interface or Trait': ['interface', 'rust_trait'],
  'Function or Method': ['function', 'method', 'styled_component'],
  'Variable or Property': ['variable', 'property'],
  Enum: ['enum'],
  'Type Alias': ['type_alias'],
  'JSX Element': ['jsx_element'],
  'CSS Selector': ['css_class'],
};

const symbolIcons = Object.entries(symbolIconGroups).flatMap(([description, iconKeys]) =>
  iconKeys.map(key => ({ symbol: ICONS[key], description }))
);

const legendSections = [
  {
    title: 'Prefixes',
    items: [
      { symbol: SCN_SYMBOLS.FILE_PREFIX, description: 'File path' },
      { symbol: SCN_SYMBOLS.EXPORTED_PREFIX, description: 'Exported symbol' },
      { symbol: SCN_SYMBOLS.PRIVATE_PREFIX, description: 'Private/unexported symbol' },
    ],
  },
  {
    title: 'Symbol Icons',
    items: Array.from(new Map(symbolIcons.map(item => [item.symbol, item])).values()),
  },
  {
    title: 'Relationships',
    items: [
      { symbol: SCN_SYMBOLS.OUTGOING_ARROW, description: 'Outgoing dependency' },
      { symbol: SCN_SYMBOLS.INCOMING_ARROW, description: 'Incoming dependency' },
    ],
  },
  {
    title: 'Modifiers & Tags',
    items: [
      { symbol: SCN_SYMBOLS.ASYNC, description: 'Async' },
      { symbol: SCN_SYMBOLS.THROWS, description: 'Throws error' },
      { symbol: SCN_SYMBOLS.PURE, description: 'Pure (no side-effects)' },
      { symbol: SCN_SYMBOLS.TAG_STYLED, description: 'Styled component' },
      { symbol: SCN_SYMBOLS.TAG_DYNAMIC, description: 'Dynamic import' },
      { symbol: SCN_SYMBOLS.TAG_GENERATED, description: 'Generated file' },
    ],
  },
];

const LegendItem: React.FC<{ symbol: string; description: string }> = ({ symbol, description }) => (
  <div className="grid grid-cols-[3rem_1fr] items-center gap-x-3 text-sm">
    <code className="font-mono text-base font-bold text-foreground/90 justify-self-center">{symbol}</code>
    <span className="text-muted-foreground">{description}</span>
  </div>
);

export const Legend: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!isOpen) {
    return (
      <div className="sticky top-4 right-4 z-30 float-right">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setIsOpen(true)}
          title="Show Legend"
          className="rounded-full shadow-lg"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="sticky top-4 right-4 z-30 float-right">
      <Card className="w-80 max-h-[80vh] flex flex-col shadow-2xl bg-background/90 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b">
          <CardTitle className="text-base">Legend</CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0 overflow-y-auto">
          <Accordion type="multiple" defaultValue={legendSections.map(s => s.title)} className="w-full">
            {legendSections.map(({ title, items }) => (
              <AccordionItem key={title} value={title}>
                <AccordionTrigger className="px-4 py-2 text-sm hover:no-underline">{title}</AccordionTrigger>
                <AccordionContent className="px-4 pt-3 pb-3">
                  <div className="space-y-1.5">
                    {items.map(({ symbol, description }) =>
                      symbol && <LegendItem key={`${symbol}-${description}`} symbol={symbol} description={description} />
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};