import { expect } from '@playwright/test'
import { Student, accountsUserSignup, rexUserSignup, userSignIn, webUserSignup } from '../../src/utilities/user'
import test from '../../src/fixtures/base'

test('generate new student information to use with Accounts', async () => {
  const defaultDomain = 'restmail.net'
  const student = new Student()
  const username = `${student.first}.${student.last}.${student.id}`.toLowerCase()
  expect(student.first.length).toBeGreaterThan(0)
  expect(student.last.length).toBeGreaterThan(0)
  expect(student.id).toHaveLength(5)
  expect(student.username.length).toBeGreaterThanOrEqual(9)
  expect(student.username).toBe(username)
  expect(student.email.length).toBeGreaterThanOrEqual(10 + defaultDomain.length)
  expect(student.email).toBe(`${username}@${defaultDomain}`)
  expect(student.password).toHaveLength(12)
})

test('generate new student information to use with Accounts and log it', async () => {
  const otherDomain = 'other.main.service'
  const student = new Student(otherDomain, true)
  const username = `${student.first}.${student.last}.${student.id}`.toLowerCase()
  expect(student.first.length).toBeGreaterThan(0)
  expect(student.last.length).toBeGreaterThan(0)
  expect(student.id).toHaveLength(5)
  expect(student.username.length).toBeGreaterThanOrEqual(9)
  expect(student.username).toBe(username)
  expect(student.email.length).toBeGreaterThanOrEqual(10 + otherDomain.length)
  expect(student.email).toBe(`${username}@${otherDomain}`)
  expect(student.password).toHaveLength(12)
})

test('student sign up from Accounts', async ({ accountsBaseURL, page }) => {
  const student = await accountsUserSignup(page, accountsBaseURL)
  const accountName = await page.textContent('#name')
  const email = await page.textContent('.verified .value')
  expect(page.url()).toBe(`${accountsBaseURL}/profile`)
  expect(accountName).toBe(`${student.first} ${student.last}`)
  expect(email).toBe(student.email)
})

test('student sign up from Web', async ({ webBaseURL, page, isMobile }) => {
  const student = await webUserSignup(page, webBaseURL, isMobile)
  const menuName = await page.textContent('[id^="menulabel-Hi "]')
  expect(page.url()).toBe(`${webBaseURL}/`)
  expect(menuName).toBe(`Hi ${student.first}`)
})

test('student sign up from REx', async ({ webBaseURL, page }) => {
  const collegeAlgebraURL = `${webBaseURL}/books/college-algebra/pages/1-introduction-to-prerequisites`
  const student = await rexUserSignup(page, collegeAlgebraURL)
  const menuName = await page.textContent('[data-testid=user-nav-toggle]')
  expect(page.url()).toBe(collegeAlgebraURL)
  expect(menuName).toBe(`${student.initials}`)
})

test('Accounts user sign in', async ({ accountsBaseURL, page }) => {
  await page.goto(accountsBaseURL)
  const student = await accountsUserSignup(page)
  await page.click('text=Log out')
  const returnedStudent = await userSignIn(page, student)
  expect(page.url()).toBe(`${accountsBaseURL}/profile`)
  expect(returnedStudent.username).toBe(student.username)
  const name = await page.locator('#name').textContent()
  expect(name).toBe(`${student.first} ${student.last}`)
})
