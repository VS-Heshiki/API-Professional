import { EmailValidator } from '../protocols/emailValidator'
import { InvalidParamError } from '../errors/invalidParamError'
import { MissingParamError } from '../errors/missingParamError'
import { SignUpController } from './signup'
import { ServerError } from '../errors/serverError'

interface SutTypes {
    sut: SignUpController
    emailValidatorStub: EmailValidator
}

const newSut = (): SutTypes => {
    class EmailValidatorStub implements EmailValidator {
        isValid (email: string): boolean {
            return true
        }
    }
    const emailValidatorStub = new EmailValidatorStub()
    const sut = new SignUpController(emailValidatorStub)
    return {
        sut,
        emailValidatorStub
    }
}

describe('SignUp Controller', () => {
    test('Should return 400 if no name is provided', () => {
        const { sut } = newSut()
        const httpRequest = {
            body: {
                email: 'any@email.com',
                password: 'anyPassword',
                confirmPassword: 'anyPassword'
            }
        }
        const httpResponse = sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('name'))
    })

    test('Should return 400 if no email is provided', () => {
        const { sut } = newSut()
        const httpRequest = {
            body: {
                name: 'anyName',
                password: 'anyPassword',
                confirmPassword: 'anyPassword'
            }
        }
        const httpResponse = sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('email'))
    })

    test('Should return 400 if no password is provided', () => {
        const { sut } = newSut()
        const httpRequest = {
            body: {
                name: 'anyName',
                email: 'any@email.com',
                confirmPassword: 'anyPassword'
            }
        }
        const httpResponse = sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('password'))
    })

    test('Should return 400 if no password confirmation is provided', () => {
        const { sut } = newSut()
        const httpRequest = {
            body: {
                name: 'anyName',
                email: 'any@email.com',
                password: 'anyPassword'
            }
        }
        const httpResponse = sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('confirmPassword'))
    })

    test('Should return 400 if an invalid email is provided', () => {
        const { sut, emailValidatorStub } = newSut()
        jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)
        const httpRequest = {
            body: {
                name: 'anyName',
                email: 'invalid_email@email.com',
                password: 'anyPassword',
                confirmPassword: 'anyPassword'
            }
        }
        const httpResponse = sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new InvalidParamError('email'))
    })

    test('Should call EmailValidator with correct email', () => {
        const { sut, emailValidatorStub } = newSut()
        const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid')
        const httpRequest = {
            body: {
                name: 'anyName',
                email: 'any_email@email.com',
                password: 'anyPassword',
                confirmPassword: 'anyPassword'
            }
        }
        sut.handle(httpRequest)
        expect(isValidSpy).toHaveBeenCalledWith('any_email@email.com')
    })

    test('Should return 500 if EmailValidator throws', () => {
        class EmailValidatorStub implements EmailValidator {
            isValid (email: string): boolean {
                throw new Error()
            }
        }
        const emailValidatorStub = new EmailValidatorStub()
        const sut = new SignUpController(emailValidatorStub)
        const httpRequest = {
            body: {
                name: 'anyName',
                email: 'any_email@email.com',
                password: 'anyPassword',
                confirmPassword: 'anyPassword'
            }
        }
        const httpResponse = sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(500)
        expect(httpResponse.body).toEqual(new ServerError())
    })
})
