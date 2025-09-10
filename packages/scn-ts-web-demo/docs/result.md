input


[
  {
    "path": "src/main.ts",
    "content": "import { formatMessage } from './utils/formatter';\nimport { createButton } from './ui/button';\nimport { Greeter } from './services/greeter.py';\n\nconsole.log('App starting...');\n\nconst message = formatMessage('World');\nconst button = createButton('Click Me');\nconst greeter = new Greeter();\n\ndocument.body.innerHTML = `<h1>${message}</h1>`;\ndocument.body.appendChild(button);\nconsole.log(greeter.greet());\n"
  },
  {
    "path": "src/utils/formatter.ts",
    "content": "/**\n * Formats a message with a greeting.\n * @param name The name to include in the message.\n * @returns The formatted message.\n */\nexport const formatMessage = (name: string): string => {\n  return `Hello, ${name}!`;\n};\n"
  },
  {
    "path": "src/ui/button.ts",
    "content": "import { formatMessage } from '../utils/formatter';\n\nexport function createButton(text: string) {\n  const btn = document.createElement('button');\n  btn.textContent = text;\n  // This is a contrived call to create a graph edge\n  btn.ariaLabel = formatMessage('Button');\n  return btn;\n}\n"
  },
  {
    "path": "src/styles.css",
    "content": "body {\n  font-family: sans-serif;\n  background-color: #f0f0f0;\n}\n\nh1 {\n  color: #333;\n}"
  },
  {
    "path": "src/services/greeter.py",
    "content": "class Greeter:\n    def __init__(self):\n        self.message = \"Hello from Python\"\n\n    def greet(self):\n        return self.message\n"
  },
  {
    "path": "src/data/user.java",
    "content": "package com.example.data;\n\npublic class User {\n    private String name;\n\n    public User(String name) {\n        this.name = name;\n    }\n\n    public String getName() {\n        return name;\n    }\n}\n"
  }
]


output

§ 1 src/data/user.java
  ◇ 1.1 User
    + ~ 1.2 getName()

§ 2 src/main.ts
  > 2, 3, 5, 6
  @ 2.1 message = formatMessage('World')
    > 6.1
  @ 2.2 button = createButton('Click Me')
    > 5.1
  @ 2.3 greeter = new Greeter()
    > 3.1

§ 3 src/services/greeter.py
  < 2
  ◇ 3.1 Greeter
    < 2.3
    ~ 3.2 __init__(self): #self.message
    @ 3.3 self.message = "Hello from Python"
    ~ 3.4 greet(self): #return self.message

§ 4 src/styles.css
  ¶ 4.1 body { 💧 ✍ }
  ¶ 4.2 h1 { 💧 }

§ 5 src/ui/button.ts
  > 6
  < 2
  + ~ 5.1 createButton(text: #)
    > 6.1
    < 2.2

§ 6 src/utils/formatter.ts
  < 2, 5
  + ~ 6.1 formatMessage(name: #): #string
    < 2.1, 5.1
