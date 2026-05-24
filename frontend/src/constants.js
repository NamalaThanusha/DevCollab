// frontend/src/constants.js
export const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python',     label: 'Python'     },
  { value: 'java',       label: 'Java'       },
  { value: 'cpp',        label: 'C++'        },
  { value: 'c',          label: 'C'          },
  { value: 'csharp',     label: 'C#'         },
  { value: 'go',         label: 'Go'         },
  { value: 'rust',       label: 'Rust'       },
  { value: 'php',        label: 'PHP'        },
  { value: 'ruby',       label: 'Ruby'       },
  { value: 'swift',      label: 'Swift'      },
  { value: 'kotlin',     label: 'Kotlin'     },
  { value: 'html',       label: 'HTML'       },
  { value: 'css',        label: 'CSS'        },
  { value: 'sql',        label: 'SQL'        },
  { value: 'bash',       label: 'Bash'       },
  { value: 'json',       label: 'JSON'       },
  { value: 'yaml',       label: 'YAML'       },
  { value: 'markdown',   label: 'Markdown'   },
]

export const DEFAULT_CODE = {
  javascript: `// Write your JavaScript code here
function greet(name) {
  return \`Hello, \${name}!\`
}

console.log(greet('World'))`,

  typescript: `// Write your TypeScript code here
function greet(name: string): string {
  return \`Hello, \${name}!\`
}

console.log(greet('World'))`,

  python: `# Write your Python code here
def greet(name: str) -> str:
    return f"Hello, {name}!"

print(greet("World"))`,

  java: `// Write your Java code here
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,

  cpp: `// Write your C++ code here
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,

  default: `// Write your code here`
}