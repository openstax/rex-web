import faker from 'faker'
import { Page } from '@playwright/test'
import { checkRestmail, getPin } from './restmail'
import { closeExtras } from './utilities'

class Student {
  first: string
  last: string
  initials: string
  id: string
  username: string
  email: string
  password: string

  constructor(domain = 'restmail.net', log = false) {
    this.first = faker.name.firstName()
    this.last = faker.name.lastName()
    this.initials = `${this.first[0]}${this.last[0]}`
    this.id = this.genRandomHex(5)
    this.username = `${this.first}.${this.last}.${this.id}`.toLowerCase()
    this.email = `${this.username}@${domain}`
    this.password = this.genRandomHex(12)
    if (log) {
      console.log(`User: ${this.first} ${this.last} ${this.email} ${this.password}`)
    }
  }

  private genRandomHex = (size: number) =>
    [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')
}

async function accountsUserSignOut(page: Page, url = ''): Promise<void> {
  const browserAgent = await page.evaluate(() => navigator.userAgent)
  if (!browserAgent.includes('Firefox')) {
    try {
      await Promise.all([page.goto(`${url}/i/signout`, { timeout: 15000 }), page.waitForNavigation()])
    } catch (error) {
      // ignore WebKit nav interrupted error
    }
    await page.goto(`${url}/i/login`)
  } else {
    await page.goto(url)
    await Promise.all([page.click('text=Log out'), page.waitForNavigation()])
  }
  //await page.goto(url)
  //await Promise.all([page.click('text=Log out'), page.waitForNavigation()])
}

async function accountsUserSignup(page: Page, url = '', student: Student = new Student()): Promise<Student> {
  /* istanbul ignore else */
  if (url) {
    for (let load = 0; load < 4; load++) {
      try {
        await page.goto(url, { timeout: 15000 })
        break
      } catch (error) {}
    }
  }
  await page.click('text=Sign up')
  await page.click('text=Student')
  await page.fill('[placeholder="First name"]', student.first)
  await page.fill('[placeholder="Last name"]', student.last)
  await page.fill('[placeholder="me@myemail.com"]', student.email)
  await page.fill('[placeholder="Password"]', student.password)
  await page.evaluate("document.getElementById('signup_terms_accepted').click()")
  await page.evaluate("document.getElementById('signup_form_submit_button').click()")
  const messages = await checkRestmail(student.username)
  const pin = getPin(messages.pop())
  await page.fill('[placeholder="Enter 6-digit PIN here"]', pin)
  await page.evaluate("document.getElementsByClassName('primary')[0].click()")
  await page.click('text=Finish')
  return student
}

async function rexUserSignup(page: Page, url?: string, student: Student = new Student()): Promise<Student> {
  /* istanbul ignore else */
  if (url) await page.goto(url)
  await page.click('[data-testid="nav-login"]')
  await accountsUserSignup(page, null, student)
  await closeExtras(page)
}

async function rexUserSignout(page: Page) {
  await page.click('[data-testid="user-nav-toggle"]')
  await Promise.all([page.click('text=Log out'), page.waitForNavigation()])
}

async function userSignIn(page: Page, student: Student): Promise<Student> {
  await page.click('text=log in')
  await page.fill('[placeholder="me@myemail.com"]', student.email)
  await page.fill('[placeholder="Password"]', student.password)
  await Promise.all([page.waitForNavigation(), page.click('text=Continue')])
  return student
}

async function webUserSignup(
  page: Page,
  url: string,
  mobile = false,
  student: Student = new Student(),
): Promise<Student> {
  /* istanbul ignore else */
  if (url) {
    await page.goto(url)
    await closeExtras(page)
  }
  if (mobile) {
    await page.click('.expand')
    await Promise.all([page.waitForNavigation(), page.click('.mobile >> text=Log in')])
  } else {
    await Promise.all([page.waitForNavigation(), page.click('.desktop >> text=Log in')])
  }
  return accountsUserSignup(page, null, student)
}

export { Student, accountsUserSignOut, accountsUserSignup, rexUserSignup, userSignIn, webUserSignup, rexUserSignout }
