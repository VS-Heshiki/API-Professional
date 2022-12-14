import { DbCheckSurveyById } from '@/data/usecases/survey/checkSurveyById/dbCheckSurveyById'
import { CheckSurveyByIdRepositorySpy } from '@/tests/data/usecases/spy/dbSurveySpy'
import { mockDate, throwError } from '@/tests/mocks'
import { faker } from '@faker-js/faker'

let id: string

type SutTypes = {
    sut: DbCheckSurveyById
    checkSurveyByIdRepositorySpy: CheckSurveyByIdRepositorySpy
}

const newSut = (): SutTypes => {
    const checkSurveyByIdRepositorySpy = new CheckSurveyByIdRepositorySpy()
    const sut = new DbCheckSurveyById(checkSurveyByIdRepositorySpy)
    return {
        sut,
        checkSurveyByIdRepositorySpy
    }
}

describe('Database CheckSurveyById UseCase', () => {
    beforeAll(() => {
        id = faker.datatype.uuid()
    })

    mockDate()

    test('Should call CheckSurveyByIdRepository with correct Id', async () => {
        const { sut, checkSurveyByIdRepositorySpy } = newSut()
        await sut.checkById(id)
        expect(checkSurveyByIdRepositorySpy.id).toBe(id)
    })

    test('Should return true if CheckSurveyByIdRepository returns true', async () => {
        const { sut } = newSut()
        const check = await sut.checkById(id)
        expect(check).toBeTruthy()
    })

    test('Should return false if CheckSurveyByIdRepository returns false', async () => {
        const { sut, checkSurveyByIdRepositorySpy } = newSut()
        checkSurveyByIdRepositorySpy.result = false
        const check = await sut.checkById(id)
        expect(check).toBeFalsy()
    })

    test('Should throw if CheckSurveyByIdRepository throws', async () => {
        const { sut, checkSurveyByIdRepositorySpy } = newSut()
        jest.spyOn(checkSurveyByIdRepositorySpy, 'checkById').mockImplementationOnce(throwError)
        const check = sut.checkById(id)
        await expect(check).rejects.toThrow()
    })
})
