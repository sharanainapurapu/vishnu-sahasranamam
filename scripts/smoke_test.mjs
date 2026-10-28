// Throwaway runtime smoke test (not part of the build). Run with the dev server
// up: node scripts/smoke_test.mjs <baseUrl>
import { chromium } from 'playwright'

const base = process.argv[2] || 'http://localhost:5174/'
const errors = []
const audio = []

const browser = await chromium.launch()
const page = await browser.newPage()
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', (e) => errors.push(String(e)))
page.on('request', (r) => { if (/\/audio\/.+\.m4a/.test(r.url())) audio.push(r.url()) })

let failed = 0
const check = (cond, msg) => { if (!cond) failed++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${msg}`) }

await page.goto(base, { waitUntil: 'networkidle' })

check(await page.getByRole('heading', { name: 'Vishnu Sahasranamam' }).first().isVisible(), 'app header renders')

const tutorialBtn = page.getByRole('button', { name: 'Tutorial', exact: true })
const nonTutBtn = page.getByRole('button', { name: 'Non-tutorial', exact: true })
check(await tutorialBtn.getAttribute('aria-pressed') === 'true', 'tutorial is default mode')

const gridButtons = page.locator('.grid-scroll button')
check(await gridButtons.count() > 100, `grid shows many verses (${await gridButtons.count()})`)

// Single tap only SELECTS (no auto-play); a Play button appears.
audio.length = 0
await gridButtons.nth(0).click()
await page.waitForTimeout(700)
check(audio.length === 0, 'single tap does not auto-play')
const playSingle = page.getByRole('button', { name: /^Play / })
check(await playSingle.count() === 1, 'single tap reveals a Play button')

// Press Play → the verse plays (player switches to Pause). Audio may come from
// cache on replay, so assert on playback state rather than a network fetch.
await playSingle.click()
await page.waitForTimeout(1200)
check(await page.getByRole('button', { name: 'Pause' }).count() === 1, 'Play button starts playback (shows Pause)')
check(audio.every((u) => /\/audio\/tutorial\//.test(u)), 'any single-mode fetch came from tutorial/')

// Tap a second, different verse → forms a range, Play button becomes range.
audio.length = 0
await gridButtons.nth(4).click()
await page.waitForTimeout(500)
const playBtn = page.getByRole('button', { name: /^Play / })
check(await playBtn.count() === 1, 'range selection shows a Play button')
check(audio.length === 0, 'forming a range does not auto-play')

// Press Play → range plays and shows infinite repeat.
await playBtn.click()
await page.waitForTimeout(1200)
check(await page.getByText('Repeating ∞').isVisible().catch(() => false), 'range shows infinite repeat')
check(await page.getByRole('button', { name: 'Pause' }).count() === 1, 'range Play starts playback (shows Pause)')

// Switch to non-tutorial; grid shows bundles; tapping two spans whole bundles.
await nonTutBtn.click()
await page.waitForTimeout(500)
check(await nonTutBtn.getAttribute('aria-pressed') === 'true', 'switched to non-tutorial')
const bundleLabels = await page.locator('.grid-scroll button').evaluateAll(
  (els) => els.slice(0, 10).map((e) => e.textContent)
)
check(bundleLabels.some((t) => t.includes('–')), `non-tutorial grid shows bundle ranges (${bundleLabels.join(', ')})`)

audio.length = 0
const ntButtons = page.locator('.grid-scroll button:not([disabled])')
await ntButtons.nth(0).click()
await page.waitForTimeout(400)
await page.getByRole('button', { name: /^Play / }).click()
await page.waitForTimeout(1500)
const ntPlaying = await page.getByRole('button', { name: 'Pause' }).count() === 1
check(ntPlaying, 'non-tutorial play starts playback')
check(audio.every((u) => /\/audio\/nontutorial\//.test(u)), 'any non-tutorial fetch came from nontutorial/')

check(errors.length === 0, `no console/page errors (${errors.length})`)
if (errors.length) console.log('  errors:', errors.slice(0, 5))

await browser.close()
console.log(`\n${failed === 0 ? 'ALL PASSED' : failed + ' CHECK(S) FAILED'}`)
process.exit(failed === 0 ? 0 : 1)
