import { SignUpController } from '@/presentation/controller/login/signUp/signUpController'
import { HttpRequest, AddAccount, AddAccountParams, AccountModel, Authenticate, AuthenticateParams } from '@/presentation/controller/login/signUp/signUpControllerProtocols'
import { MissingParamError, ServerError, EmailAlreadyTaken } from '@/presentation/errors'
import { badRequest, serverError, success, forbidden } from '@/presentation/helpers/http/httpHelpers'
import { Validator } from '@/validations/protocols/validator'

const newFakeRequest = (): HttpRequest => ({
    body: {
        name: 'anyName',
        email: 'any_email@email.com',
        password: 'anyPassword',
        confirmPassword: 'anyPassword'
    }
})

const newFakeAccount = (): AccountModel => ({
    id: 'anyId_valid',
    name: 'anyName_valid',
    email: 'any_valid@email.com',
    password: 'anyPassword_valid'
})

const newAddAccount = (): AddAccount => {
    class AddAccountStub implements AddAccount {
        async add (account: AddAccountParams): Promise<AccountModel> {
            return new Promise(resolve => resolve(newFakeAccount()))
        }
    }
    return new AddAccountStub()
}

const newValidator = (): Validator => {
    class ValidatorStub implements Validator {
        validate (input: any): Error | null {
            return null
        }
    }
    return new ValidatorStub()
}

const newAuthenticate = (): Authenticate => {
    class AuthenticateStub implements Authenticate {
        async auth (authenticate: AuthenticateParams): Promise<string> {
            return new Promise(resolve => resolve('any_token'))
        }
    }
    return new AuthenticateStub()
}

type SutTypes = {
    sut: SignUpController
    addAccountStub: AddAccount
    validatorStub: Validator
    authenticateStub: Authenticate
}

const newSut = (): SutTypes => {
    const addAccountStub = newAddAccount()
    const validatorStub = newValidator()
    const authenticateStub = newAuthenticate()
    const sut = new SignUpController(addAccountStub, validatorStub, authenticateStub)
    return {
        sut,
        addAccountStub,
        validatorStub,
        authenticateStub
    }
}

describe('SignUp Controller', () => {
    test('Should call AddAccount with correct values', async () => {
        const { sut, addAccountStub } = newSut()
        const addSpy = jest.spyOn(addAccountStub, 'add')
        await sut.handle(newFakeRequest())
        expect(addSpy).toHaveBeenCalledWith({
            name: 'anyName',
            email: 'any_email@email.com',
            password: 'anyPassword'
        })
    })

    test('Should return 500 if AddAccount throws', async () => {
        const { sut, addAccountStub } = newSut()
        jest.spyOn(addAccountStub, 'add').mockImplementationOnce(async () => {
            return new Promise((resolve, reject) => reject(new Error()))
        })
        const httpResponse = await sut.handle(newFakeRequest())
        expect(httpResponse).toEqual(serverError(new ServerError()))
    })

    test('Should return an access token if valid data is provider', async () => {
        const { sut } = newSut()
        const httpResponse = await sut.handle(newFakeRequest())
        expect(httpResponse).toEqual(success({ accessToken: 'any_token' }))
    })

    test('Should return 403 if AddAccount returns null', async () => {
        const { sut, addAccountStub } = newSut()
        jest.spyOn(addAccountStub, 'add').mockReturnValueOnce(new Promise(resolve => resolve(null)))
        const httpResponse = await sut.handle(newFakeRequest())
        expect(httpResponse).toEqual(forbidden(new EmailAlreadyTaken()))
    })

    test('Should call Validator with correct values', async () => {
        const { sut, validatorStub } = newSut()
        const validateSpyOn = jest.spyOn(validatorStub, 'validate')
        const httpRequest = newFakeRequest()
        await sut.handle(httpRequest)
        expect(validateSpyOn).toHaveBeenCalledWith(httpRequest.body)
    })

    test('Should return 400 if Validator return an error', async () => {
        const { sut, validatorStub } = newSut()
        jest.spyOn(validatorStub, 'validate').mockReturnValueOnce(new MissingParamError('any_value'))
        const httpRequest = await sut.handle(newFakeRequest())
        expect(httpRequest).toEqual(badRequest(new MissingParamError('any_value')))
    })

    test('Should call Authenticator with correct values', async () => {
        const { sut, authenticateStub } = newSut()
        const authSpyOn = jest.spyOn(authenticateStub, 'auth')
        await sut.handle(newFakeRequest())
        expect(authSpyOn).toHaveBeenCalledWith({
            email: 'any_email@email.com',
            password: 'anyPassword'
        })
    })

    test('Should return 500 if Authenticate throws', async () => {
        const { sut, authenticateStub } = newSut()
        jest.spyOn(authenticateStub, 'auth').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
        const httpResponse = await sut.handle(newFakeRequest())
        expect(httpResponse).toEqual(serverError(new ServerError()))
    })
})
