import { Collection, ObjectId } from 'mongodb'
import { MongoHelper } from '@/infra/db/mongodb/helper/mongoHelper'
import { SurveyResultMongoRepository } from '@/infra/db/mongodb/surveyResult/surveyResultMongoRepository'
import { AccountModel } from '@/domain/model/accountModel'
import { SurveyModel } from '@/domain/model/surveyModel'
import { mockAddAccountData, mockSurveyData } from '@/tests/mocks'

let surveyCollection: Collection
let surveyResultCollection: Collection
let accountCollection: Collection

const newSut = (): SurveyResultMongoRepository => {
    return new SurveyResultMongoRepository()
}

const mockingAccount = async (): Promise<AccountModel> => {
    const res = await accountCollection.insertOne(mockAddAccountData())
    const account = await accountCollection.findOne({ _id: res.insertedId })
    return MongoHelper.map(account)
}

const mockingSurvey = async (): Promise<SurveyModel> => {
    const res = await surveyCollection.insertOne(mockSurveyData())
    const survey = await surveyCollection.findOne({ _id: res.insertedId })
    return MongoHelper.map(survey)
}

describe('Survey Result MongoDB Repository', () => {
    beforeAll(async () => {
        await MongoHelper.connect(process.env.MONGO_URL)
    })

    afterAll(async () => {
        await MongoHelper.disconnect()
    })

    beforeEach(async () => {
        surveyCollection = await MongoHelper.getCollection('surveys')
        await surveyCollection.deleteMany({})

        surveyResultCollection = await MongoHelper.getCollection('surveyResults')
        await surveyResultCollection.deleteMany({})

        accountCollection = await MongoHelper.getCollection('accounts')
        await accountCollection.deleteMany({})
    })
    describe('Save Method tests', () => {
        test('Should save a result survey if its new', async () => {
            const account = await mockingAccount()
            const survey = await mockingSurvey()
            const sut = newSut()
            await sut.save({
                surveyId: survey.id,
                accountId: account.id,
                answer: survey.answers[0].answer,
                date: new Date()
            })
            const surveyResult = await surveyResultCollection.findOne({
                surveyId: new ObjectId(survey.id),
                accountId: new ObjectId(account.id)
            })
            expect(surveyResult).toBeTruthy()
        })

        test('Should update a result survey if already exists', async () => {
            const account = await mockingAccount()
            const survey = await mockingSurvey()
            await surveyResultCollection.insertOne({
                surveyId: new ObjectId(survey.id),
                accountId: new ObjectId(account.id),
                answer: survey.answers[0].answer,
                date: new Date()
            })
            const sut = newSut()
            await sut.save({
                surveyId: survey.id,
                accountId: account.id,
                answer: survey.answers[1].answer,
                date: new Date()
            })
            const surveyResult = await surveyResultCollection.find({
                surveyId: new ObjectId(survey.id),
                accountId: new ObjectId(account.id)
            }).toArray()
            expect(surveyResult).toBeTruthy()
            expect(surveyResult.length).toBe(1)
        })
    })

    describe('LoadBySurveyId Method tests', () => {
        test('Should load a survey result on success', async () => {
            const account = await mockingAccount()
            const account2 = await mockingAccount()
            const survey = await mockingSurvey()
            await surveyResultCollection.insertMany([{
                surveyId: new ObjectId(survey.id),
                accountId: new ObjectId(account.id),
                answer: survey.answers[0].answer,
                date: new Date()
            }, {
                surveyId: new ObjectId(survey.id),
                accountId: new ObjectId(account2.id),
                answer: survey.answers[0].answer,
                date: new Date()
            }])
            const sut = newSut()
            const surveyResult = await sut.loadBySurveyId(survey.id, account.id)
            expect(surveyResult).toBeTruthy()
            expect(surveyResult.surveyId).toEqual(survey.id)
            expect(surveyResult.answers[0].count).toBe(2)
            expect(surveyResult.answers[0].percent).toBe(100)
            expect(surveyResult.answers[0].isCurrentAnswer).toBeTruthy()
            expect(surveyResult.answers[1].count).toBe(0)
            expect(surveyResult.answers[1].percent).toBe(0)
            expect(surveyResult.answers[1].isCurrentAnswer).toBeFalsy()
        })

        test('Should load a survey result on success 2', async () => {
            const account = await mockingAccount()
            const account2 = await mockingAccount()
            const account3 = await mockingAccount()
            const survey = await mockingSurvey()
            await surveyResultCollection.insertMany([{
                surveyId: new ObjectId(survey.id),
                accountId: new ObjectId(account.id),
                answer: survey.answers[0].answer,
                date: new Date()
            }, {
                surveyId: new ObjectId(survey.id),
                accountId: new ObjectId(account2.id),
                answer: survey.answers[1].answer,
                date: new Date()
            }, {
                surveyId: new ObjectId(survey.id),
                accountId: new ObjectId(account3.id),
                answer: survey.answers[1].answer,
                date: new Date()
            }])
            const sut = newSut()
            const surveyResult = await sut.loadBySurveyId(survey.id, account2.id)
            expect(surveyResult).toBeTruthy()
            expect(surveyResult.surveyId).toEqual(survey.id)
            expect(surveyResult.answers[0].count).toBe(2)
            expect(surveyResult.answers[0].percent).toBe(67)
            expect(surveyResult.answers[0].isCurrentAnswer).toBeTruthy()
            expect(surveyResult.answers[1].count).toBe(1)
            expect(surveyResult.answers[1].percent).toBe(33)
            expect(surveyResult.answers[1].isCurrentAnswer).toBeFalsy()
        })

        test('Should load a survey result on success 3', async () => {
            const account = await mockingAccount()
            const account2 = await mockingAccount()
            const account3 = await mockingAccount()
            const survey = await mockingSurvey()
            await surveyResultCollection.insertMany([{
                surveyId: new ObjectId(survey.id),
                accountId: new ObjectId(account.id),
                answer: survey.answers[0].answer,
                date: new Date()
            }, {
                surveyId: new ObjectId(survey.id),
                accountId: new ObjectId(account2.id),
                answer: survey.answers[1].answer,
                date: new Date()
            }])
            const sut = newSut()
            const surveyResult = await sut.loadBySurveyId(survey.id, account3.id)
            expect(surveyResult).toBeTruthy()
            expect(surveyResult.surveyId).toEqual(survey.id)
            expect(surveyResult.answers[0].count).toBe(1)
            expect(surveyResult.answers[0].percent).toBe(50)
            expect(surveyResult.answers[0].isCurrentAnswer).toBeFalsy()
            expect(surveyResult.answers[1].count).toBe(1)
            expect(surveyResult.answers[1].percent).toBe(50)
            expect(surveyResult.answers[1].isCurrentAnswer).toBeFalsy()
        })

        test('Should return null if there is no survey result', async () => {
            const account = await mockingAccount()
            const survey = await mockingSurvey()
            const sut = newSut()
            const surveyResult = await sut.loadBySurveyId(survey.id, account.id)
            expect(surveyResult).toBeNull()
        })
    })
})
