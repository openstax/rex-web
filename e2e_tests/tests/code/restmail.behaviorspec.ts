import { expect } from '@playwright/test'
import test from '../../src/fixtures/base'
import { Student } from '../../src/utilities/user'
import { EmailMessageData, checkRestmail, getPin } from '../../src/utilities/restmail'

function newId(length: number) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const options = characters.length
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.random() * options)
  }
  return result
}

const emptyData = {}
const completeHeaders = {
  'dkim-signature': [],
  date: 'Fri, 13 Aug 2021 15:31:07 +0000',
  from: 'noreply@openstax.org',
  to: 'anabel.kshlerin.5c46d@restmail.net',
  'message-id': '<0101017b4023697b-d11f6cd2-3f0e-4bfc-9a6c-036458b51d1c-000000@us-west-2.amazonses.com>',
  subject: '[OpenStax] Use PIN 849560 to confirm your email address',
  'mime-version': '1.0',
  'content-type': 'multipart/alternative; boundary="--==_mimepart_6116903ba4bdb_5f902aea4b4e595c11703f"; charset=UTF-8',
  'content-transfer-encoding': '7bit',
  'feedback-id': '1.us-west-2.oVlp8PEgkREbSg958fsBR0qgvE+aOYfJpj2ebF8cZ4I=:AmazonSES',
  'x-ses-outgoing': '2021.08.13-54.240.27.29',
}
const completeData = {
  date: '2021-08-13T15:31:07.000Z',
  from: [{ name: '', email: 'noreply@openstax.org' }],
  headers: completeHeaders,
  html:
    '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" "http://www.w3.org/TR/REC-html40/loose.dtd">\n' +
    '<html><body>\n' +
    '<p>Welcome!</p>\n' +
    '\n' +
    '  <p>Enter your 6-digit PIN in your browser to confirm your email address:</p>\n' +
    '\n' +
    '  <p>Your PIN: <b>849560</b></p>\n' +
    '\n' +
    '  <p>If you have any trouble using this PIN, you can also click the link below to confirm your email address:</p>\n' +
    '\n' +
    '<p><a href="https://accounts-dev.openstax.org/i/verify_email_by_code/7410a30af3cad2e4b3102f7143efe037049cee9a33755868965607ca36012f8d">https://accounts-dev.openstax.org/i/verify_email_by_code/7410a30af3cad2e4b3102f7143efe037049cee9a33755868965607ca36012f8d</a></p>\n' +
    '\n' +
    "<p>We sent this message because someone is trying to use 'anabel.kshlerin.5c46d@restmail.net' to create an OpenStax account.  If this wasn't you, please disregard this message.</p>\n" +
    '\n' +
    '\n' +
    '<p>Regards,<br>\n' +
    'The OpenStax Team</p>\n' +
    '\n' +
    '</body></html>\n',
  messageId: '<0101017b4023697b-d11f6cd2-3f0e-4bfc-9a6c-036458b51d1c-000000@us-west-2.amazonses.com>',
  priority: 'normal',
  receivedAt: '2021-08-13T15:31:08.677Z',
  subject: '[OpenStax] Use PIN 849560 to confirm your email address',
  text:
    'Welcome!\n' +
    '\n' +
    'Enter your 6-digit PIN in your browser to confirm your email\n' +
    'address:\n' +
    '\n' +
    'Your PIN: 849560\n' +
    'If you have any trouble using this PIN, you can also click the\n' +
    'link below to confirm your email address:\n' +
    '\n' +
    'https://accounts-dev.openstax.org/i/verify_email_by_code/7410a30af3cad2e4b3102f7143efe037049cee9a33755868965607ca36012f8d\n' +
    '\n' +
    'We sent this message because someone is trying to use\n' +
    "'anabel.kshlerin.5c46d@restmail.net' to create an OpenStax\n" +
    "account. If this wasn't you, please disregard this message.\n" +
    '\n' +
    'Regards,\n' +
    '\n' +
    'The OpenStax Team',
  to: [{ name: '', email: 'noreply@openstax.org' }],
}

test('email message data sent a blank object', async () => {
  const message = new EmailMessageData(emptyData)
  expect(message.date).toBe('')
  expect(message.from).toStrictEqual([])
  expect(message.headers).toBe(null)
  expect(message.html).toBe('')
  expect(message.messageId).toBe('')
  expect(message.priority).toBe('')
  expect(message.receivedAt).toBe('')
  expect(message.subject).toBe('')
  expect(message.text).toBe('')
  expect(message.to).toStrictEqual([])
})

test('email message data sent a complete object', async () => {
  const message = new EmailMessageData(completeData)
  expect(message.date).toBe(completeData.date)
  expect(message.from).toBe(completeData.from)
  expect(message.headers).toBe(completeData.headers)
  expect(message.html).toBe(completeData.html)
  expect(message.messageId).toBe(completeData.messageId)
  expect(message.priority).toBe(completeData.priority)
  expect(message.receivedAt).toBe(completeData.receivedAt)
  expect(message.subject).toBe(completeData.subject)
  expect(message.text).toBe(completeData.text)
  expect(message.to).toBe(completeData.to)
})

test('RestMail received mail from Accounts', async ({ accountsBaseURL, page }) => {
  const student = new Student()
  await page.goto(`${accountsBaseURL}/i/signup/student`)
  await page.fill('[placeholder="First name"]', student.first)
  await page.fill('[placeholder="Last name"]', student.last)
  await page.fill('[placeholder="me@myemail.com"]', student.email)
  await page.fill('[placeholder="Password"]', student.password)
  await page.check('#signup_terms_accepted')
  await page.click('text=Continue')
  expect(page.url()).toBe(`${accountsBaseURL}/signup/student/email_verification_form`)
  const messages = await checkRestmail(student.username)
  expect(messages).toHaveLength(1)
})

test('RestMail fails to receive a message in time', async () => {
  await expect(checkRestmail(`${newId(20)}`, 0, 4, 0.25)).rejects.toThrow(
    new Error(`Message not received in time (${4 * 0.25} seconds)`),
  )
})

test('found the pin in a standard Accounts confirmation email', async () => {
  const data = { subject: '[OpenStax] Use PIN 189845 to confirm your email address' }
  expect(getPin(data)).toBe('189845')
})

test('no pin in subject throws an error', async () => {
  const data = { subject: '[OpenStax] Use PIN  to confirm your email address' }
  expect(function () {
    getPin(data)
  }).toThrow(new Error('PIN not found'))
})
