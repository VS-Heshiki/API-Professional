import app from '@/main/config/app'
import { MongoHelper } from '@/infra/db/mongodb/helper/mongoHelper'
import { mockAccountRequest } from '@/tests/mocks'
import { Collection } from 'mongodb'
import bcrypt from 'bcrypt'
import request from 'supertest'

const { body } = mockAccountRequest()

const genSalt = async (): Promise<string> => {
    const saltRounds = 10
    const salt = await bcrypt.genSalt(saltRounds)
    return salt
}

let accountCollection: Collection

beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL)
})

afterAll(async () => {
    await MongoHelper.disconnect()
})

beforeEach(async () => {
    accountCollection = await MongoHelper.getCollection('accounts')
    await accountCollection.deleteMany({})
})

describe('SignUp/In/Out Routes', () => {
    describe('SignUp Route', () => {
        test('Should return 200 on signUp', async () => {
            await request(app)
                .post('/api/sign-up')
                .send(body)
                .expect(200)
        })
    })

    describe('SignIn Route', () => {
        test('Should return 200 on signIn', async () => {
            const password = await bcrypt.hash('any_password', await genSalt())
            await accountCollection.insertOne({
                name: 'Victor',
                email: 'victor.heshiki@gmail.com',
                password
            })
            await request(app)
                .post('/api/sign-in')
                .send({
                    email: 'victor.heshiki@gmail.com',
                    password: 'any_password'
                })
                .expect(200)
        })

        test('Should return 401 on signIn', async () => {
            await request(app)
                .post('/api/sign-in')
                .send({
                    email: 'victor.heshiki@gmail.com',
                    password: '123'
                })
                .expect(401)
        })
    })
})
