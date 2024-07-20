# botjam

Botjam is a simple, declarative, and agent-less system configuration automation tool in TypeScript.

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
// cronjob.ts

import { botjam } from 'botjam'

botjam.configure({
  hosts: 'yourserver.example.com',
  become: true,
})

botjam.tasks.apt({
  name: 'cron',
  updateCache: true,
  state: 'present',
})

botjam.tasks.cron('Vacuum old logs on 12am', {
  minute: '0',
  hour: '0',
  job: 'journalctl --vacuum-time=14d >/dev/null 2>&1',
})

botjam.tasks.systemd({
  name: 'cron',
  state: 'restarted',
  enabled: true,
})

botjam.run()
```

Running that script will configure server and the output should be like this:

```
PLAY [cronjob.ts] **************************************************************

TASK [apt] *********************************************************************
Thursday 18 July 2024  09:32:32 +0000 (0:00:00.039)       0:00:00.039 *********
changed: [yourserver.example.com]

TASK [cron] ********************************************************************
Thursday 18 July 2024  09:32:33 +0000 (0:00:01.476)       0:00:01.515 *********
changed: [yourserver.example.com]

TASK [systemd] *****************************************************************
Thursday 18 July 2024  09:32:34 +0000 (0:00:00.893)       0:00:02.408 *********
changed: [yourserver.example.com]

PLAY RECAP *********************************************************************
yourserver.example.com         : ok=3    changed=3    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0

Thursday 18 July 2024  09:32:35 +0000 (0:00:00.121)       0:00:03.529 *********
===============================================================================
apt install ------------------------------------------------------------ 1.476s
cron job --------------------------------------------------------------- 0.893s
systemd service -------------------------------------------------------- 0.121s
```
