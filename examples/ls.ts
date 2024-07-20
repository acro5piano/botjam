import { botjam } from '../dist'

botjam.configure({
  hosts: ['yourserver.example.com'],
  become: true,
})

botjam.tasks.shell({
  debug: true,
  cmd: 'ls | tee -a /tmp/botjam > /dev/stdout',
})

botjam.run()
