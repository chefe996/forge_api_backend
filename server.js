const moment = require('moment')
const fastify = require('fastify')({
    logger: true,
    bodyLimit: 10000 * 1048576
})
const fileUpload = require('fastify-file-upload')
const forge = require('./utils/forge')

fastify.register(fileUpload, {
    limits: {
        fileSize: 10000 * 1048576
    },
})
fastify.register(require('fastify-cors'), {
    origin: "*",
    methods: ["GET", "POST"]
})

require('dotenv').config()

const models = require('./models/models')

// надо вызвать перед первым использованием, чтобы создать корзину
fastify.get('/bucket_create', async (request, reply) => {
	const bucket_name = process.env.FORGE_BUCKET_NAME
	const access_token = await forge.get_access_token()
	await forge.create_bucket(access_token, bucket_name)
	return {
            'status': 'success',
            'bucket_name': bucket_name,
            'access_token': access_token
        }
})


fastify.post('/upload', async (request, reply) => {
    const bucket_name = process.env.FORGE_BUCKET_NAME
    const file = request.raw.files.file
    const access_token = await forge.get_access_token()

    const model = await models.Models.findOne({
        name: file.name
    })

    if (model) {
        const urn = model.urn

        console.log(model)

        return {
            'status': 'success',
            'urn': urn,
            'access_token': access_token
        }
    } else {
		 // await forge.create_bucket(access_token, bucket_name)
        const upload_file = await forge.upload_file_raw(access_token, file, bucket_name)
        const urn = Buffer.from(upload_file.objectId).toString('base64')
        const translate = await forge.translate(access_token, file.name, urn)

        console.log(file)
        console.log(upload_file)
        console.log(translate)

        const model = new models.Models({
            name: file.name,
            urn: urn
        })
        await model.save()

        return {
            'status': 'success',
            'urn': urn,
            'access_token': access_token
        }
    }
})

fastify.post('/check_translate', async (request, reply) => {
    const access_token = await forge.get_access_token()
    const urn = request.body.urn

    const model = await models.Models.findOne({
        urn: urn
    })

    if (model) {
        if (model.translated === true) {
            return {
                'check_translate': {
                    'status': 'success'
                }
            }
        } else {
            const check_translate = await forge.check_translate(access_token, urn)

            if (check_translate.status === 'success') {
                model.translated = true
                model.save()

                console.log(model)
            }

            return {
                'check_translate': check_translate
            }
        }
    } else {
        return {
            'status': 'Error',
            'message': 'Model not found'
        }
    }
})

fastify.post('/create_tree', async (request, reply) => {
    const urn = request.body.urn
    const tree = request.body.tree

    const modelTree = await models.ModelTrees.findOne({
        urn: urn
    })

    if (!modelTree) {
        const modelTree = new models.ModelTrees({
            urn: urn,
            tree: tree
        })

        await modelTree.save()

        return {
            'status': 'success',
            'urn': urn
        }
    } else {
        console.log(modelTree.root)

        return {
            'status': 'Error',
            'message': 'ModelTree exists'
        }
    }
})


fastify.post('/create_props', async (request, reply) => {
    const urn = request.body.urn
    const props = request.body.props

    const insertProps = []
    for (const key in props) {
        const prop = props[key]

        const modelProps = await models.ModelProps.findOne({
            urn: urn,
            dbId: prop.dbId
        })

        if (!modelProps) {
            insertProps.push({
                urn: urn,
                dbId: prop.dbId,
                externalId: prop.externalId,
                name: prop.name,
                dir_ido: '',
                lvr_id: 0,
                dir_auto: false,
                lvr_auto: false,
                props: prop.properties
            })
        }
    }

    await models.ModelProps.insertMany(insertProps)

    return {
        'status': 'success',
        'urn': urn
    }
})


fastify.post('/get_tree', async (request, reply) => {
    const dbModelTree = await models.ModelTrees.findOne({
        urn: request.body.urn
    })

    return {
        tree: dbModelTree.tree
    }
})


fastify.post('/get_props', async (request, reply) => {
    const dbModelProps = await models.ModelProps.findOne({
        urn: request.body.urn,
        dbId: request.body.dbId
    })

    return dbModelProps
})

fastify.get('/get_models', async (request, reply) => {
    const access_token = await forge.get_access_token()
    const dbModels = await models.Models.find().sort([['createdAt', -1]])

    console.log(dbModels)

    let responseModels = []
    for (const key in dbModels) {
        const dbModel = dbModels[key]

        responseModels.push({
            name: dbModel.name,
            urn: dbModel.urn,
            createdAt: moment(dbModel.createdAt, moment.HTML5_FMT.DATETIME_LOCAL_MS).format('YYYY-MM-DD HH:mm:ss')
        })
    }

    console.log(dbModels)

    return {
        access_token: access_token,
        models: responseModels
    }
})




// Run the server!
const start = async () => {
//	fastify.listen({ port: 3000 }, (err, address) => { /* stuff */ })
	
fastify.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err)
    fastify.log.error("####### !!!ERROR!!! ######## ######### ####")
    process.exit(1)
  }
})
	
//   try {
//       await fastify.listen({
//           port: 3000
//       })
//// возможно потребуется открыть порт sudo iptables -t filter -A INPUT -p tcp --dport 3000 -j ACCEPT
//
 //      // const access_token = await forge.get_access_token()
//       // await forge.get_pdf(access_token)
 //  } catch (err) {
 //      fastify.log.error(err)
 //      process.exit(1)
 //  }
}
start()