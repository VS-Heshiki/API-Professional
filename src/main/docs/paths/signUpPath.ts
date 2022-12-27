export const signInPath = {
    post: {
        tags: ['SignIn'],
        summary: 'API login with a user',
        requestBody: {
            description: 'Requirements login user',
            content: {
                'application/json': {
                    schema: {
                        $ref: '#/schemas/signInParams'
                    }
                }
            }
        },
        responses: {
            200: {
                $ref: '#/components/success'
            },
            400: {
                $ref: '#/components/badRequest'
            },
            401: {
                $ref: '#/components/unauthorized'
            },
            500: {
                $ref: '#/components/serverError'
            }
        }
    }
}
