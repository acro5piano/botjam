import { botjam } from '../dist'

botjam.configure({
  hosts: ['localhost'],
  become: true,
})

botjam.tasks.pacman({
  name: 'cronie',
  updateCache: true,
  state: 'present',
})

// botjam.tasks.cron({
//   name: 'Vacuum old logs on 12am',
//   minute: '0',
//   hour: '0',
//   job: 'journalctl --vacuum-time=60d >/dev/null 2>&1',
// })

// botjam.tasks.systemd({
//   name: 'cron',
//   state: 'restarted',
//   enabled: true,
// })

botjam.run()
