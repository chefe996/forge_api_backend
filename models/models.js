require('dotenv').config()
const mongoose = require('mongoose')

main().catch(err => console.log(err))

async function main() {
    await mongoose.connect(process.env.MONGODB_URL)
}

const modelsSchema = new mongoose.Schema({
    name: String,
    urn: String,
    translated: Boolean
}, {
    timestamps: {
        createdAt: true,
        updatedAt: true
    }
})

const Models = mongoose.model('Models', modelsSchema)


const ModelTreesSchema = new mongoose.Schema({
    urn: String,
    tree: Object
}, {
    timestamps: {
        createdAt: true,
        updatedAt: true
    }
})

const ModelTrees = mongoose.model('ModelTrees', ModelTreesSchema)


const ModelPropsSchema = new mongoose.Schema({
    urn: String,
    dbId: Number,
    externalId: String,
    dir_ido: String,
    lvr_id: Number,
    dir_auto: Boolean,
    lvr_auto: Boolean,
    name: String,
    props: Object
}, {
    timestamps: {
        createdAt: true,
        updatedAt: true
    }
})

const ModelProps = mongoose.model('ModelProps', ModelPropsSchema)

module.exports = {
    Models: Models,
    ModelTrees: ModelTrees,
    ModelProps: ModelProps,
}
