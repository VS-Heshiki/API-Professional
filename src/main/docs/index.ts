import paths from './paths'
import schemas from './schemas'
import components from './components'

export default {
    openapi: '3.0.3',
    info: {
        title: 'API Professional',
        description: 'API Rest based in Typescript, follow TDD design, SOLID principles and Clean Architecture',
        version: '1.0.0',
        contact: {
            email: 'victor.heshiki@gmail.com'
        },
        license: {
            name: 'GPL-3.0-only',
            url: 'https://www.gnu.org/licenses/gpl-3.0-standalone.html'
        }
    },
    servers: [{
        url: '/api'
    }],
    tags: [{
        name: 'Login',
        description: 'API to create and authenticate users'
    }, {
        name: 'Survey',
        description: 'API to create and list surveys'
    }],
    paths,
    schemas,
    components
}
