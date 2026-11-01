/**
 * GenerativeActionService
 * Parses and executes generative actions directly on the filesystem and terminal from AI responses.
 * Enforces:
 * 1. AI DOES THE WORK (creates real folders, writes real files, executes real commands).
 * 2. NO HASHTAG HEADERS (#, ##, ###) or marketing taglines.
 * 3. Structured step-by-step reporting.
 */

export interface GenerativeFileAction {
  path: string;
  name: string;
  content: string;
}

export interface GenerativeExecutionResult {
  hasActions: boolean;
  createdDirectories: string[];
  writtenFiles: GenerativeFileAction[];
  executeCommands: string[];
  stepLogs: string[];
  cleanText: string;
}

export class GenerativeActionService {
  /**
   * Cleans text to eliminate markdown hashtag headers (#, ##), cheesy marketing taglines,
   * and raw action syntax, replacing them with clean plain-language prose.
   */
  public static cleanOutput(raw: string): string {
    if (!raw) return '';

    return raw
      // Strip action blocks so the user doesn't see raw parser syntax
      .replace(/```(?:forge|action):(?:create_directory|write_file|execute)[\s\S]*?```/gi, '')
      // Replace markdown hashtag headers with bold plain step labels
      .replace(/^#{1,6}\s*(.+)$/gm, (_match, title) => {
        const cleanTitle = title.trim();
        return `**${cleanTitle}**`;
      })
      // Strip excessive hashtags within lines
      .replace(/#([a-zA-Z0-9_\-]+)/g, '$1')
      // Clean up multiple empty lines
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  /**
   * Removes YAML block scalar markers (like "content: |") and leading indentations.
   */
  public static cleanFileContent(raw: string): string {
    if (!raw) return '';
    let content = raw.replace(/^(?:content|code):\s*\|?\s*\r?\n/, '');
    const lines = content.split(/\r?\n/);
    const minIndent = lines
      .filter((l) => l.trim().length > 0)
      .reduce((min, l) => Math.min(min, l.match(/^\s*/)?.[0].length || 0), Infinity);
    if (minIndent > 0 && minIndent !== Infinity) {
      content = lines
        .map((l) => (l.startsWith(' '.repeat(minIndent)) ? l.slice(minIndent) : l))
        .join('\n');
    }
    return content.trim();
  }

  /**
   * Parses explicit action blocks and smart fallback heuristics from the model response.
   */
  public static parseActions(
    prompt: string,
    modelResponse: string,
    workspacePath: string,
    activeFilePath?: string
  ): GenerativeExecutionResult {
    const root = workspacePath ? workspacePath.replace(/\\/g, '/') : '.';
    const createdDirectories: string[] = [];
    const writtenFiles: GenerativeFileAction[] = [];
    const executeCommands: string[] = [];
    const stepLogs: string[] = [];

    // 1. Explicit action:create_directory or forge:create_directory
    const dirBlockRegex = /```(?:forge|action):create_directory\s*\n(?:path:\s*)?([^\n\r]+)\s*```/gi;
    let dirMatch: RegExpExecArray | null;
    while ((dirMatch = dirBlockRegex.exec(modelResponse)) !== null) {
      const rawPath = dirMatch[1].trim();
      // Ignore file names incorrectly emitted in create_directory
      if (/\.[a-zA-Z0-9]{1,6}$/.test(rawPath)) continue;
      const resolved = this.resolvePath(root, rawPath);
      if (!createdDirectories.includes(resolved)) {
        createdDirectories.push(resolved);
      }
    }

    // 2. Explicit action:write_file or forge:write_file
    const fileBlockRegex = /```(?:forge|action):write_file\s*\n(?:path:\s*)?([^\n\r]+)\s*\n([\s\S]*?)```/gi;
    let fileMatch: RegExpExecArray | null;
    while ((fileMatch = fileBlockRegex.exec(modelResponse)) !== null) {
      const rawPath = fileMatch[1].trim().replace(/^path:\s*/i, '');
      const rawContent = fileMatch[2];
      const content = this.cleanFileContent(rawContent);
      const resolved = this.resolvePath(root, rawPath);
      const name = resolved.split('/').pop() || 'file';
      writtenFiles.push({ path: resolved, name, content });

      // Automatically infer parent directory
      const parentDir = resolved.substring(0, resolved.lastIndexOf('/'));
      if (parentDir && parentDir !== root && !createdDirectories.includes(parentDir)) {
        createdDirectories.push(parentDir);
      }
    }

    // 3. Explicit action:execute or forge:execute
    const execBlockRegex = /```(?:forge|action):execute\s*\n(?:command:\s*)?([^\n\r`]+)\s*```/gi;
    let execMatch: RegExpExecArray | null;
    while ((execMatch = execBlockRegex.exec(modelResponse)) !== null) {
      const rawCmd = execMatch[1].trim().replace(/^command:\s*/i, '');
      if (rawCmd && !executeCommands.includes(rawCmd)) {
        executeCommands.push(rawCmd);
      }
    }

    // 4. Smart Heuristic Fallback for Program Generation:
    const lowerPrompt = prompt.toLowerCase();
    const wantsFolder = lowerPrompt.includes('create a folder') ||
                        lowerPrompt.includes('create folder') ||
                        lowerPrompt.includes('new folder') ||
                        lowerPrompt.includes('make a folder') ||
                        lowerPrompt.includes('make folder') ||
                        lowerPrompt.includes('create directory');

    const wantsProgram = lowerPrompt.includes('write a') ||
                         lowerPrompt.includes('create a') ||
                         lowerPrompt.includes('java program') ||
                         lowerPrompt.includes('python program') ||
                         lowerPrompt.includes('write code') ||
                         lowerPrompt.includes('generate code');

    if ((wantsFolder || wantsProgram) && writtenFiles.length === 0) {
      const codeBlockRegex = /```([a-zA-Z0-9_\-\+]*)\s*\n([\s\S]*?)```/g;
      let match: RegExpExecArray | null;
      let blockIndex = 0;

      while ((match = codeBlockRegex.exec(modelResponse)) !== null) {
        const lang = (match[1] || '').trim().toLowerCase();
        const code = this.cleanFileContent(match[2]);

        if (lang.startsWith('forge:') || lang.startsWith('action:')) continue;

        let targetFolder = 'src';
        const folderNameMatch = prompt.match(/(?:folder|directory)(?:\s+(?:named|called|path))?\s+([a-zA-Z0-9_\-\.\/]+)/i);
        if (folderNameMatch && !['and', 'to', 'in', 'with', 'a', 'the'].includes(folderNameMatch[1].toLowerCase()) && !/\.[a-zA-Z0-9]{1,6}$/.test(folderNameMatch[1])) {
          targetFolder = folderNameMatch[1].trim();
        } else if (lowerPrompt.includes('java')) {
          targetFolder = 'src';
        } else if (lowerPrompt.includes('python')) {
          targetFolder = 'src';
        }

        const resolvedDir = this.resolvePath(root, targetFolder);
        if (!createdDirectories.includes(resolvedDir)) {
          createdDirectories.push(resolvedDir);
        }

        // Determine file name
        let fileName = `Main.${this.getExtensionForLanguage(lang, lowerPrompt)}`;
        const fileNameMatch = prompt.match(/(?:file|program)(?:\s+(?:named|called))?\s+([a-zA-Z0-9_\-\.]+\.[a-zA-Z0-9]+)/i);
        if (fileNameMatch) {
          fileName = fileNameMatch[1].trim();
        } else if (lang === 'java' || lowerPrompt.includes('java')) {
          const classMatch = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
          fileName = classMatch ? `${classMatch[1]}.java` : 'Main.java';
        }

        if (blockIndex > 0) {
          fileName = `Helper${blockIndex}.${this.getExtensionForLanguage(lang, lowerPrompt)}`;
        }

        const filePath = `${resolvedDir}/${fileName}`;
        writtenFiles.push({ path: filePath, name: fileName, content: code });
        blockIndex++;
      }
    }

    // 5. Smart Heuristic Fallback for "Run This" / Execution:
    const isRunIntent = lowerPrompt.includes('run this') ||
                        lowerPrompt === 'run' ||
                        lowerPrompt.startsWith('run ') ||
                        lowerPrompt.includes('compile and run') ||
                        lowerPrompt.includes('execute this');

    if (isRunIntent && executeCommands.length === 0) {
      // Check if model emitted commands in plain prose or bash block
      const cmdRegex = /(?:javac\s+[^\n\r]+|java\s+[^\n\r]+|python\s+[^\n\r]+|node\s+[^\n\r]+)/gi;
      let cmdMatch: RegExpExecArray | null;
      while ((cmdMatch = cmdRegex.exec(modelResponse)) !== null) {
        const cmd = cmdMatch[0].trim();
        if (!executeCommands.includes(cmd)) {
          executeCommands.push(cmd);
        }
      }

      // If still empty, synthesize command from active file
      if (executeCommands.length === 0 && activeFilePath) {
        const normPath = activeFilePath.replace(/\\/g, '/');
        const fileName = normPath.split('/').pop() || '';
        const dirName = normPath.substring(0, normPath.lastIndexOf('/')) || root;

        if (fileName.endsWith('.java')) {
          const className = fileName.replace('.java', '');
          executeCommands.push(`cd "${dirName}"; javac "${fileName}"; java "${className}"`);
        } else if (fileName.endsWith('.py')) {
          executeCommands.push(`python "${normPath}"`);
        } else if (fileName.endsWith('.js') || fileName.endsWith('.ts')) {
          executeCommands.push(`node "${normPath}"`);
        }
      }
    }

    // Filter out any directory that is actually a file
    const filteredDirectories = createdDirectories.filter(
      (d) => !/\.[a-zA-Z0-9]{1,6}$/.test(d) && !writtenFiles.some((f) => f.path === d)
    );

    // Generate Step Logs
    let stepNum = 1;
    for (const dir of filteredDirectories) {
      const rel = dir.replace(root, '').replace(/^\//, '');
      stepLogs.push(`Step ${stepNum++}: Created folder \`${rel || dir}\``);
    }
    for (const file of writtenFiles) {
      const rel = file.path.replace(root, '').replace(/^\//, '');
      stepLogs.push(`Step ${stepNum++}: Generated file \`${rel || file.name}\``);
      stepLogs.push(`Step ${stepNum++}: Opened \`${file.name}\` in Monaco Editor`);
    }
    for (const cmd of executeCommands) {
      stepLogs.push(`Step ${stepNum++}: Executed in terminal: \`${cmd}\``);
    }

    const cleanText = this.cleanOutput(modelResponse);

    return {
      hasActions: filteredDirectories.length > 0 || writtenFiles.length > 0 || executeCommands.length > 0,
      createdDirectories: filteredDirectories,
      writtenFiles,
      executeCommands,
      stepLogs,
      cleanText,
    };
  }

  private static resolvePath(root: string, raw: string): string {
    const cleanRaw = raw.replace(/\\/g, '/').replace(/^\.\//, '').trim();
    if (cleanRaw.startsWith(root)) {
      return cleanRaw;
    }
    return `${root}/${cleanRaw}`.replace(/\/\//g, '/');
  }

  private static getExtensionForLanguage(lang: string, promptLower: string): string {
    if (lang === 'java' || promptLower.includes('java')) return 'java';
    if (lang === 'python' || lang === 'py' || promptLower.includes('python')) return 'py';
    if (lang === 'typescript' || lang === 'ts' || promptLower.includes('typescript')) return 'ts';
    if (lang === 'javascript' || lang === 'js' || promptLower.includes('javascript')) return 'js';
    if (lang === 'cpp' || lang === 'c++') return 'cpp';
    if (lang === 'c') return 'c';
    if (lang === 'html') return 'html';
    if (lang === 'css') return 'css';
    if (lang === 'json') return 'json';
    if (lang === 'rust' || lang === 'rs') return 'rs';
    if (lang === 'go') return 'go';
    return 'txt';
  }
}
