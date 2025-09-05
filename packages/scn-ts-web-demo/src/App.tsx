import { useState, useEffect, useCallback } from 'react';
import { generateScn } from 'scn-ts-core';
import { defaultFilesJSON } from './default-files';
import { Button } from './components/ui/button';
import { Textarea } from './components/ui/textarea';
import LogViewer from './components/LogViewer';
import OutputOptions from './components/OutputOptions';
import { Legend } from './components/Legend';
import { Play, Loader, Copy, Check, StopCircle } from 'lucide-react';
import type { FormattingOptions } from './types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './components/ui/accordion';
import { useAnalysis } from './hooks/useAnalysis.hook';
import { useClipboard } from './hooks/useClipboard.hook';
import { useResizableSidebar } from './hooks/useResizableSidebar.hook';
import { useTokenCounter } from './hooks/useTokenCounter.hook';

function App() {
  const [filesInput, setFilesInput] = useState(defaultFilesJSON);
  const [scnOutput, setScnOutput] = useState('');
  const [formattingOptions, setFormattingOptions] = useState<FormattingOptions>({
    showOutgoing: true,
    showIncoming: true,
    showIcons: true,
    showExportedIndicator: true,
    showPrivateIndicator: true,
    showModifiers: true,
    showTags: true,
    showSymbolIds: true,
    groupMembers: true,
    displayFilters: {},
    showFilePrefix: true,
    showFileIds: true,
  });

  const {
    isInitialized,
    isLoading,
    analysisResult,
    progress,
    logs,
    analysisTime,
    handleAnalyze: performAnalysis,
    handleStop,
    onLogPartial,
  } = useAnalysis();

  const { sidebarWidth, handleMouseDown } = useResizableSidebar(480);
  const { isCopied, handleCopy: performCopy } = useClipboard();
  const tokenCounts = useTokenCounter(filesInput, scnOutput, onLogPartial);

  useEffect(() => {
    if (analysisResult) {
      setScnOutput(generateScn(analysisResult, formattingOptions));
    } else {
      setScnOutput('');
    }
  }, [analysisResult, formattingOptions]);

  const handleCopy = useCallback(() => {
    performCopy(scnOutput);
  }, [performCopy, scnOutput]);

  const handleAnalyze = useCallback(async () => {
    performAnalysis(filesInput);
  }, [performAnalysis, filesInput]);

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
          <Accordion type="multiple" defaultValue={['input', 'options', 'logs']} className="w-full">
            <AccordionItem value="input">
              <AccordionTrigger className="px-4 text-sm font-semibold hover:no-underline">
                <div className="flex w-full justify-between items-center">
                  <span>Input Files (JSON)</span>
                  <span className="text-xs font-normal text-muted-foreground tabular-nums">
                    {tokenCounts.input.toLocaleString()} tokens
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="px-4 pb-4 h-96">
                  <Textarea
                    value={filesInput}
                    onChange={(e) => setFilesInput(e.currentTarget.value)}
                    className="h-full w-full font-mono text-xs resize-none"
                    placeholder="Paste an array of FileContent objects here..."
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="options">
              <AccordionTrigger className="px-4 text-sm font-semibold hover:no-underline">Formatting Options</AccordionTrigger>
              <AccordionContent className="px-4">
                <OutputOptions options={formattingOptions} setOptions={setFormattingOptions} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="logs">
              <AccordionTrigger className="px-4 text-sm font-semibold hover:no-underline">Logs</AccordionTrigger>
              <AccordionContent className="px-4">
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
      <main className="flex-grow flex flex-col overflow-hidden relative">
        <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <h2 className="text-lg font-semibold leading-none tracking-tight">Output (SCN)</h2>
          <div className="flex items-center gap-4">
            {analysisTime !== null && (
              <span className="text-sm text-muted-foreground">
                Analyzed in {(analysisTime / 1000).toFixed(2)}s
              </span>
            )}
            <span className="text-sm font-normal text-muted-foreground tabular-nums">{tokenCounts.output.toLocaleString()} tokens</span>
            <Button variant="ghost" size="icon" onClick={handleCopy} disabled={!scnOutput} title="Copy to clipboard">
              {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="p-4 flex-grow overflow-auto font-mono text-xs relative">
          <Legend />
          <pre className="whitespace-pre-wrap">
            {scnOutput || (isLoading ? "Generating..." : "Output will appear here.")}
          </pre>
        </div>
      </main>
    </div>
  );
}

export default App;
