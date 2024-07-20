import { botjam } from '../dist'

botjam.configure({
  servers: [
    {
      host: 'server1.example.com',
      username: 'admin',
      privateKeyPath: '/path/to/id_rsa',
    },
    {
      host: 'server2.example.com',
      username: 'admin',
      privateKeyPath: '/path/to/id_rsa',
    },
  ],
  become: true,
})

botjam.tasks.shell({
  debug: true,
  cmd: 'ls >> /tmp/botjam',
})

botjam.run()
