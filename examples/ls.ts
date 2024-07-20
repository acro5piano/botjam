import { botjam } from '../dist'

botjam.configure({
  hosts: ['botjam_stg1', 'botjam_stg2'],
  become: true,
})

botjam.tasks.shell({
  cmd: 'ls',
})

botjam.run()
