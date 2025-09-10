import { useEffect, useCallback, useMemo, useState } from 'react';
import { generateScn, initializeTokenizer, countTokens } from 'scn-ts-core';
import { Button } from './components/ui/button';
import { Textarea } from './components/ui/textarea';
import LogViewer from './components/LogViewer';
import { OutputOptions } from './components/OutputOptions';
import { Legend } from './components/Legend';
import { Play, Loader, Copy, Check, StopCircle, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionHeader, AccordionTrigger } from './components/ui/accordion';
import { useAnalysis } from './hooks/useAnalysis.hook';
import { useClipboard } from './hooks/useClipboard.hook';
import { useResizableSidebar } from './hooks/useResizableSidebar.hook';
import { useAppStore } from './stores/app.store';
import { cn } from './lib/utils';
import type { CodeSymbol } from 'scn-ts-core';

function App() {
  const {
    filesInput,
    setFilesInput,
    scnOutput,
    setScnOutput,
    formattingOptions,
    setFormattingOptions,
    includePattern,
    setIncludePattern,
    excludePattern,
    setExcludePattern,
  } = useAppStore();

  const {
    isInitialized,
    isLoading,
    analysisResult,
    progress,
    logs,
    analysisTime,
    tokenImpact,
    handleAnalyze: performAnalysis,
    handleStop,
    onLogPartial,
  } = useAnalysis();

  const [zoomLevel, setZoomLevel] = useState(1);
  const baseFontSizeRem = 0.75; // Corresponds to text-xs

  const handleZoomIn = () => setZoomLevel(z => Math.min(z * 1.2, 4));
  const handleZoomOut = () => setZoomLevel(z => Math.max(z / 1.2, 0.25));
  const handleZoomReset = () => setZoomLevel(1);

  const { sidebarWidth, handleMouseDown } = useResizableSidebar(480);
  const { isCopied, handleCopy: performCopy } = useClipboard();

  useEffect(() => {
    if (!initializeTokenizer()) {
      onLogPartial({ level: 'error', message: 'Failed to initialize tokenizer.' });
    }
  }, [onLogPartial]);

  useEffect(() => {
    if (analysisResult) {
      setScnOutput(generateScn(analysisResult, formattingOptions));
    } else {
      setScnOutput('');
    }
  }, [analysisResult, formattingOptions]);

  const { tokenCounts, tokenReductionPercent } = useMemo(() => {
    const input = countTokens(filesInput);
    const output = countTokens(scnOutput);
    let reductionPercent: number | null = null;
    if (input > 0) {
      reductionPercent = ((input - output) / input) * 100;
    }
    return {
      tokenCounts: { input, output },
      tokenReductionPercent: reductionPercent,
    };
  }, [filesInput, scnOutput]);

  const handleCopy = useCallback(() => {
    performCopy(scnOutput);
  }, [performCopy, scnOutput]);

  const handleAnalyze = useCallback(async () => {
    performAnalysis(filesInput, formattingOptions, includePattern, excludePattern);
  }, [performAnalysis, filesInput, formattingOptions, includePattern, excludePattern]);

  const { totalSymbols, visibleSymbols } = useMemo(() => {
    if (!analysisResult) {
      return { totalSymbols: 0, visibleSymbols: 0 };
    }
    const allSymbols: CodeSymbol[] = analysisResult.flatMap(file => file.symbols);
    const total = allSymbols.length;
    let visibleSymbolsArr = allSymbols;
    if (formattingOptions.showOnlyExports) {
      visibleSymbolsArr = visibleSymbolsArr.filter(symbol => symbol.isExported);
    }
    if (formattingOptions.displayFilters) {
      const filters = formattingOptions.displayFilters;
      visibleSymbolsArr = visibleSymbolsArr.filter(symbol => {
        return (filters[symbol.kind] ?? filters['*'] ?? true);
      });
    }
    return { totalSymbols: total, visibleSymbols: visibleSymbolsArr.length };
  }, [analysisResult, formattingOptions.displayFilters, formattingOptions.showOnlyExports]);

  return (
    <div className="h-screen w-screen flex bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside style={{ width: `${sidebarWidth}px` }} className="max-w-[80%] min-w-[320px] flex-shrink-0 flex flex-col border-r">
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b bg-background relative z-20">
          <h1 className="text-xl font-bold tracking-tight">SCN-TS Web Demo</h1>
          <div className="flex items-center space-x-2">
            {isLoading ? (
              <>
                <Button disabled className="w-32 justify-center">
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  <span>{progress ? `${Math.round(progress.percentage)}%` : 'Analyzing...'}</span>
                </Button>
                <Button onClick={handleStop} variant="outline" size="icon" title="Stop analysis">
                  <StopCircle className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button onClick={handleAnalyze} disabled={!isInitialized} className="w-32 justify-center">
                <Play className="mr-2 h-4 w-4" />
                <span>Analyze</span>
              </Button>
            )}
          </div>
        </div>

        <div className="flex-grow overflow-y-auto">
          <Accordion type="multiple" defaultValue={['input', 'filtering', 'options', 'logs']} className="w-full">
            <AccordionItem value="input">
              <AccordionHeader>
                <AccordionTrigger className="px-4 text-sm font-semibold hover:no-underline">
                  <div className="flex w-full justify-between items-center">
                    <span>Input Files (JSON)</span>
                    <span className="text-xs font-normal text-muted-foreground tabular-nums">
                      {tokenCounts.input.toLocaleString()} tokens
                    </span>
                  </div>
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent className="p-4">
                <div className="h-96">
                  <Textarea
                    value={filesInput}
                    onChange={(e) => setFilesInput(e.currentTarget.value)}
                    className="h-full w-full font-mono text-xs resize-none"
                    placeholder="Paste an array of FileContent objects here..."
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="filtering">
              <AccordionHeader>
                <AccordionTrigger className="px-4 text-sm font-semibold hover:no-underline">
                  File Filtering (Globs)
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent className="p-4 space-y-4">
                <div>
                  <label htmlFor="include-glob" className="text-xs font-medium">Include</label>
                  <Textarea
                    id="include-glob"
                    value={includePattern}
                    onChange={(e) => setIncludePattern(e.currentTarget.value)}
                    className="h-24 w-full font-mono text-xs resize-y mt-1"
                    placeholder="e.g. src/**/*.ts"
                  />
                  <p className="text-xs text-muted-foreground mt-1">One pattern per line. Matches against file paths.</p>
                </div>
                <div>
                  <label htmlFor="exclude-glob" className="text-xs font-medium">Exclude</label>
                  <Textarea
                    id="exclude-glob"
                    value={excludePattern}
                    onChange={(e) => setExcludePattern(e.currentTarget.value)}
                    className="h-24 w-full font-mono text-xs resize-y mt-1"
                    placeholder="e.g. **/*.spec.ts&#10;**/node_modules/**"
                  />
                  <p className="text-xs text-muted-foreground mt-1">One pattern per line. Exclude takes precedence.</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="options">
              <AccordionHeader className="items-center">
                <AccordionTrigger className="px-4 text-sm font-semibold hover:no-underline">
                  <div className="flex w-full items-center justify-between">
                    <span>Formatting Options</span>
                      {analysisResult && (
                        <span className="text-xs font-normal text-muted-foreground tabular-nums">
                          {visibleSymbols} / {totalSymbols} symbols
                        </span>
                      )}
                  </div>
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent className="px-4 pt-4">
                <OutputOptions options={formattingOptions} setOptions={setFormattingOptions} tokenImpact={tokenImpact} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="logs">
              <AccordionHeader>
                <AccordionTrigger className="px-4 text-sm font-semibold hover:no-underline">Logs</AccordionTrigger>
              </AccordionHeader>
              <AccordionContent className="px-4 pt-4">
                <LogViewer logs={logs} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </aside>

      {/* Resizer */}
      <div
        role="separator"
        onMouseDown={handleMouseDown}
        className="w-1.5 flex-shrink-0 cursor-col-resize hover:bg-primary/20 transition-colors duration-200"
      />

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col overflow-hidden relative group">
        <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <h2 className="text-lg font-semibold leading-none tracking-tight">Output (SCN)</h2>
          <div className="flex items-center gap-4">
            {analysisTime !== null && (
              <span className="text-sm text-muted-foreground">
                Analyzed in {(analysisTime / 1000).toFixed(2)}s
              </span>
            )}
            <span className="text-sm font-normal text-muted-foreground tabular-nums">{tokenCounts.output.toLocaleString()} tokens</span>
            {tokenReductionPercent !== null && analysisResult && (
              <span
                className={cn(
                  "text-sm font-medium tabular-nums",
                  tokenReductionPercent >= 0 ? "text-green-500" : "text-red-500"
                )}
                title="Token count change from input to output"
              >
                {tokenReductionPercent >= 0 ? '▼' : '▲'}{' '}
                {Math.abs(tokenReductionPercent).toFixed(0)}%
              </span>
            )}
            <Button variant="ghost" size="icon" onClick={handleCopy} disabled={!scnOutput} title="Copy to clipboard">
              {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="p-4 flex-grow overflow-auto font-mono text-xs relative group">
          <Legend />
          <pre
            className="whitespace-pre-wrap"
            style={{
              fontSize: `${baseFontSizeRem * zoomLevel}rem`,
              lineHeight: `${zoomLevel}rem`,
            }}
          >
            {scnOutput || (isLoading ? "Generating..." : "Output will appear here.")}
          </pre>
        </div>
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1 rounded-md border bg-background/80 p-1 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
          <Button variant="ghost" size="icon" onClick={handleZoomOut} title="Zoom out" className="h-7 w-7">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleZoomReset} title="Reset zoom" className="h-7 w-7">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleZoomIn} title="Zoom in" className="h-7 w-7">
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}

export default App;
