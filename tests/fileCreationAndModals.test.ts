import { describe, it, expect } from 'vitest';

describe('File & Workspace Management Validation Suite', () => {
  const validateItemName = (name: string, type: 'file' | 'folder'): string | null => {
    const trimmed = name.trim();
    if (!trimmed) {
      return type === 'folder' ? 'Folder name cannot be empty' : 'File name cannot be empty';
    }
    if (trimmed.includes('..')) {
      return 'Directory traversal ("..") is not allowed';
    }
    if (/[*?"<>|:]/.test(trimmed)) {
      return 'Name contains invalid characters (* ? " < > | :)';
    }
    if (type === 'folder' && (trimmed.startsWith('/') || trimmed.endsWith('/'))) {
      return 'Folder name should not start or end with a slash';
    }
    return null;
  };

  const getStarterContent = (fileName: string): string => {
    const clean = fileName.trim().toLowerCase();
    if (clean.endsWith('.java')) {
      const baseName = fileName.split('/').pop()?.replace('.java', '') || 'Main';
      return `public class ${baseName} {\n    public static void main(String[] args) {\n        System.out.println("Hello from ${baseName}!");\n    }\n}\n`;
    }
    if (clean.endsWith('.html')) {
      return `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <title>Forge App</title>\n</head>\n<body>\n    <h1>Hello from Forge AI Desktop IDE!</h1>\n</body>\n</html>\n`;
    }
    if (clean.endsWith('.py')) {
      return `def main():\n    print("Hello from Forge AI Desktop IDE!")\n\nif __name__ == "__main__":\n    main()\n`;
    }
    if (clean.endsWith('.js') || clean.endsWith('.ts')) {
      return `// Created in Forge AI Desktop IDE\nconsole.log("Hello from ${fileName}!");\n`;
    }
    return '';
  };

  it('correctly accepts valid file names and subdirectories', () => {
    expect(validateItemName('Main.java', 'file')).toBeNull();
    expect(validateItemName('src/com/app/Main.java', 'file')).toBeNull();
    expect(validateItemName('index.ts', 'file')).toBeNull();
    expect(validateItemName('style.css', 'file')).toBeNull();
    expect(validateItemName('src', 'folder')).toBeNull();
    expect(validateItemName('components', 'folder')).toBeNull();
  });

  it('rejects empty, traversal, and invalid character names', () => {
    expect(validateItemName('', 'file')).toBe('File name cannot be empty');
    expect(validateItemName('   ', 'folder')).toBe('Folder name cannot be empty');
    expect(validateItemName('../evil.js', 'file')).toBe('Directory traversal ("..") is not allowed');
    expect(validateItemName('bad*file.txt', 'file')).toBe('Name contains invalid characters (* ? " < > | :)');
    expect(validateItemName('bad?dir', 'folder')).toBe('Name contains invalid characters (* ? " < > | :)');
    expect(validateItemName('/leadingSlash', 'folder')).toBe('Folder name should not start or end with a slash');
  });

  it('generates appropriate boilerplate code for Java files', () => {
    const content = getStarterContent('MyService.java');
    expect(content).toContain('public class MyService');
    expect(content).toContain('public static void main');
  });

  it('generates appropriate boilerplate code for HTML, Python, and JavaScript', () => {
    expect(getStarterContent('index.html')).toContain('<!DOCTYPE html>');
    expect(getStarterContent('app.py')).toContain('def main():');
    expect(getStarterContent('util.ts')).toContain('// Created in Forge AI Desktop IDE');
  });

  it('correctly filters recent files to only those matching current workspace', () => {
    const workspacePath = 'D:/cccc';
    const recentFiles = [
      { id: '1', name: 'resources.yaml', path: 'D:/old_project/resources.yaml', lastOpened: 1 },
      { id: '2', name: 'package-lock.json', path: 'D:/other/package-lock.json', lastOpened: 2 },
      { id: '3', name: 'Main.java', path: 'D:/cccc/Main.java', lastOpened: 3 },
      { id: '4', name: 'App.tsx', path: 'D:/cccc/src/App.tsx', lastOpened: 4 },
    ];

    const normWorkspace = workspacePath.replace(/\\/g, '/').toLowerCase();
    const valid = recentFiles.filter((rf) => {
      const normPath = rf.path.replace(/\\/g, '/').toLowerCase();
      return normPath.startsWith(normWorkspace);
    });

    expect(valid).toHaveLength(2);
    expect(valid.map((f) => f.name)).toEqual(['Main.java', 'App.tsx']);
  });

  it('correctly appends finalized voice transcript to prompt without duplicates', () => {
    let input = 'Please write a Java program';
    const appendTranscript = (text: string) => {
      const trimmed = input.trim();
      input = trimmed ? `${trimmed} ${text.trim()}` : text.trim();
    };

    appendTranscript('with unit tests');
    expect(input).toBe('Please write a Java program with unit tests');

    appendTranscript('and comments.');
    expect(input).toBe('Please write a Java program with unit tests and comments.');
  });

  it('properly distinguishes interim vs final speech transcript events', () => {
    let interim = '';
    let finalInput = '';

    const handleVoiceEvent = (event: { text: string; isFinal: boolean }) => {
      if (event.isFinal) {
        interim = '';
        finalInput = finalInput ? `${finalInput} ${event.text}` : event.text;
      } else {
        interim = event.text;
      }
    };

    handleVoiceEvent({ text: 'create a fol', isFinal: false });
    expect(interim).toBe('create a fol');
    expect(finalInput).toBe('');

    handleVoiceEvent({ text: 'create a folder', isFinal: true });
    expect(interim).toBe('');
    expect(finalInput).toBe('create a folder');
  });
});
