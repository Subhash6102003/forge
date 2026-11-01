import { describe, it, expect } from 'vitest';
import { GenerativeActionService } from '../src/services/generativeActionService';

describe('GenerativeActionService Suite', () => {
  it('cleans hashtags and taglines into clean plain-language prose', () => {
    const raw = `### Setting up your Java environment\n# Best local AI ever!\nHere is the step to run.`;
    const cleaned = GenerativeActionService.cleanOutput(raw);

    expect(cleaned).not.toContain('###');
    expect(cleaned).toContain('**Setting up your Java environment**');
    expect(cleaned).not.toContain('# Best');
  });

  it('parses explicit forge action blocks for directory and file creation', () => {
    const rawResponse = `
I have prepared the project structure for you.

\`\`\`forge:create_directory
path: src/java
\`\`\`

\`\`\`forge:write_file
path: src/java/Main.java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Forge!");
    }
}
\`\`\`
`;

    const result = GenerativeActionService.parseActions(
      'create a folder in src/java and write a Java program',
      rawResponse,
      'd:/my-project'
    );

    expect(result.hasActions).toBe(true);
    expect(result.createdDirectories).toContain('d:/my-project/src/java');
    expect(result.writtenFiles.length).toBe(1);
    expect(result.writtenFiles[0].path).toBe('d:/my-project/src/java/Main.java');
    expect(result.writtenFiles[0].content).toContain('System.out.println');
    expect(result.stepLogs.length).toBeGreaterThanOrEqual(2);
    expect(result.stepLogs[0]).toContain('Created folder');
  });

  it('smart fallback: generates folder and file when user prompt asks to create folder and Java code', () => {
    const rawResponse = `
Here is the implementation:

\`\`\`java
public class Calculator {
    public static void main(String[] args) {
        System.out.println("Sum: " + (5 + 10));
    }
}
\`\`\`
`;

    const result = GenerativeActionService.parseActions(
      'create a folder and write a Java program',
      rawResponse,
      'd:/workspace'
    );

    expect(result.hasActions).toBe(true);
    expect(result.createdDirectories.length).toBeGreaterThan(0);
    expect(result.writtenFiles.length).toBe(1);
    expect(result.writtenFiles[0].name).toBe('Calculator.java');
    expect(result.writtenFiles[0].content).toContain('Calculator');
    expect(result.stepLogs.some(s => s.includes('Created folder'))).toBe(true);
    expect(result.stepLogs.some(s => s.includes('Generated file'))).toBe(true);
  });
});
