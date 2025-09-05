import type { FileContent } from "scn-ts-core";

const files: FileContent[] = [
  {
    path: "src/main.tsx",
    content: `import React from 'react';
import { Page } from './components/layout/Page';
import { UserProfile } from './components/UserProfile';
import { getUser } from './api/client';
import { Log } from './services/logger';
import { createTokenProvider } from './auth/token';
import './styles/main.css';

async function main() {
    Log('App starting...');

    const tokenProvider = createTokenProvider();
    console.log('Auth token:', tokenProvider.getToken());

    const user = await getUser('1');
    
    const App = () => (
        <Page>
            <UserProfile initialUser={user} />
        </Page>
    );
    
    console.log('App ready to be rendered.');
    // The existence of <App /> is enough for analysis.
    // In a real app: ReactDOM.render(<App />, document.getElementById('root'));
    Log('App finished setup.');
}

main();
`
  },
  {
    path: "src/api/client.ts",
    content: `import type { User } from '../types';
import { capitalize } from '../utils/string';

const API_BASE = '/api/v1';

export async function getUser(id: string): Promise<User> {
    console.log(\`Fetching user \${id} from \${API_BASE}\`);
    await new Promise(res => setTimeout(res, 100));
    return {
        id,
        name: capitalize('john doe'),
        email: 'john.doe@example.com',
    };
}

export const updateUser = async (user: Partial<User> & { id: string }): Promise<User> => {
    console.log(\`Updating user \${user.id}\`);
    await new Promise(res => setTimeout(res, 100));
    const fullUser = await getUser(user.id);
    return { ...fullUser, ...user };
};
`
  },
  {
    path: "src/components/Button.tsx",
    content: `import React from 'react';
import './../styles/components/button.css';

type ButtonVariant = 'primary' | 'secondary';

export interface ButtonProps {
    text: string;
    variant?: ButtonVariant;
    onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ text, variant = 'primary', onClick }) => {
    return (
        <button className={\`btn btn-\${variant}\`} onClick={onClick}>
            {text}
        </button>
    );
};
`
  },
  {
    path: "src/components/UserProfile.tsx",
    content: `import React from 'react';
import type { User } from '../types';
import { useUser } from '../hooks/useUser';

// Fake styled-component to test parser. In a real app this would be \`import styled from 'styled-components';\`
const styled = {
  div: (template: TemplateStringsArray) => (props: any) => React.createElement('div', props)
};

const UserCard = styled.div\`
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 8px;
\`;

interface UserProfileProps {
    initialUser: User;
}

export function UserProfile({ initialUser }: UserProfileProps): React.ReactElement {
    const { user, updateUser } = useUser(initialUser.id, initialUser);

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <UserCard>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <button onClick={() => updateUser({ name: 'Jane Doe' })}>
                Change Name
            </button>
        </UserCard>
    );
}
`
  },
  {
    path: "src/components/layout/Page.tsx",
    content: `import React from 'react';
import { Button } from '../Button';
import type { Theme } from '../../types';

interface PageProps {
    children: React.ReactNode;
}

const theme: Theme = 'light';

export const Page = ({ children }: PageProps): React.ReactElement => {
    return (
        <div className={\`page-container theme-\${theme}\`}>
            <header>
                <h1>My App</h1>
                <Button text="Logout" />
            </header>
            <main>
                {children}
            </main>
        </div>
    );
};
`
  },
  {
    path: "src/hooks/useUser.ts",
    content: `import { getUser, updateUser as apiUpdateUser } from '../api/client';
import type { User } from '../types';

// This is a fake hook for dependency analysis purposes.
export function useUser(userId: string, initialUser?: User) {
    let user: User | null = initialUser || null;

    const fetchUser = async () => {
        user = await getUser(userId);
    };

    if (!user) {
        fetchUser();
    }

    const updateUser = async (data: Partial<User>) => {
        if (!user) return;
        const updatedUser = await apiUpdateUser({ ...data, id: userId });
        user = updatedUser;
    };

    return { user, updateUser };
}
`
  },
  {
    path: "src/styles/main.css",
    content: `@import url('./components/button.css');

:root {
    --primary-color: #007bff;
}

body {
    font-family: sans-serif;
    background-color: #f0f0f0;
}

.page-container {
    max-width: 960px;
    margin: 0 auto;
}
`
  },
  {
    path: "src/styles/components/button.css",
    content: `.btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.btn-primary {
    background-color: var(--primary-color);
    color: white;
}

.btn-secondary {
    background-color: gray;
    color: white;
}
`
  },
  {
    path: "src/types/index.ts",
    content: `export interface User {
    id: string;
    name: string;
    email: string;
}

export type Theme = 'light' | 'dark';
`
  },
  {
    path: "src/utils/string.ts",
    content: `/**
 * Capitalizes the first letter of a string.
 */
export function capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}
`
  },
  {
    path: "src/auth/token.ts",
    content: `import { generate_secret } from '../services/auth'; // fake import from .rs

export function createTokenProvider() {
    const secret = generate_secret();
    return {
        getToken(): string {
            return \`fake-token-with-\${secret}\`;
        }
    };
}
`
  },
  {
    path: "src/services/logger.go",
    content: `package services

import "fmt"

// Log prints a message to the console.
func Log(message string) {
	fmt.Println("[Go Logger]", message)
}
`
  },
  {
    path: "src/services/auth.rs",
    content: `// A simple auth service mock
pub struct AuthService {
    secret_key: String,
}

impl AuthService {
    pub fn new(secret: &str) -> Self {
        AuthService {
            secret_key: secret.to_string(),
        }
    }

    pub fn verify_token(&self, token: &str) -> bool {
        // In a real app, you'd have complex logic here.
        token.len() > 10 && self.secret_key != ""
    }
}

pub fn generate_secret() -> String {
    "super_secret_key_from_rust".to_string()
}
`
  },
];

export const defaultFilesJSON = JSON.stringify(files, null, 2);