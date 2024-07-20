[![npm version](https://badge.fury.io/js/botjam.svg)](https://badge.fury.io/js/botjam)

# Botjam

[Experimental] Botjam is a simple, declarative, and agent-less automated system configuration tool in TypeScript. Use your familiar language to configure servers idempotently!

![image](https://github.com/user-attachments/assets/6e429a25-0547-49b5-88fe-f0940dc8e9b5)

# Features

- Ansible-like syntax
- Autocomplete friendly TypeScript
- Declarative syntax
- Fast execution
- Agent-less

# Getting Started

First, install it:

```bash
pnpm install botjam
```

Then, write your first configuration. This example sets up a cronjob to remove systemd logs.

```typescript
// dotfiles.ts

import { botjam } from '../dist'

botjam.configure({
  servers: ['localhost'],
})

for (const dotfile of ['.tmux.conf', 'prettier.config.js']) {
  botjam.tasks.file({
    src: `~/.dotfiles/home/${dotfile}`,
    dest: `~/${dotfile}`,
    state: 'link',
  })
}

botjam.run()
```

Running that script will configure server and the output should be like this:

```
✔ [1/2] Ensure file existence of: .tmux.conf
ℹ ==> CHANGED                                                                       8:02:53 PM
✔ [2/2] Ensure file existence of: prettier.config.js
ℹ Cleaning up...                                                                    8:02:53 PM
✔ Success!                                                                          8:02:53 PM
```

# TODO

- [ ] Add more core modules
- [ ] Remote file controls
- [ ] Secrets management
- [ ] Extra vers on runtime
