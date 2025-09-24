import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'

const nodeDir = dirname(process.execPath)
const npmCli = join(nodeDir, 'node_modules', 'npm', 'bin', 'npm-cli.js')

const result = spawnSync(process.execPath, [npmCli, 'install', '--no-audit'], {
  stdio: 'inherit',
  cwd: join(process.cwd(), 'web'),
})

if (result.status !== 0) {
  process.exit(result.status ?? 1)
}
