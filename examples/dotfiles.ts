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
