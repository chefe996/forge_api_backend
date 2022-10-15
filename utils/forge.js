const axios = require('axios');
const util = require('util')
const fs = require('fs');
const path = require('path');
require('dotenv').config()

const get_access_token = async () => {
    const params = new URLSearchParams()
    params.append('client_id', process.env.FORGE_CLIENT_ID)
    params.append('client_secret', process.env.FORGE_CLIENT_SECRET)
    params.append('grant_type', 'client_credentials')
    params.append('scope', 'data:read data:write data:create bucket:read bucket:create')

    const options = {
        url: util.format('%s/authentication/v1/authenticate', process.env.FORGE_API_URL),
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        },
        data: params
    };

    const response = await axios(options)
    return response.data.access_token
}

const create_bucket = async (access_token, bucket_name) => {
    const params = JSON.stringify({
        "bucketKey": bucket_name,
        "policyKey": "transient",
        "access": "full"
    });

    const options = {
        url: util.format('%s/oss/v2/buckets', process.env.FORGE_API_URL),
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'Authorization': util.format('Bearer %s', access_token)
        },
        data: params
    };

    const response = await axios(options)
    return response.data
}

const upload_file = async (access_token, file_path, bucket_name) => {
    const file_stream = await fs.readFile(file_path);
    const file_name = await path.basename(file_path)

    const options = {
        url: util.format('%s/oss/v2/buckets/%s/objects/%s', process.env.FORGE_API_URL, bucket_name, file_name),
        method: 'PUT',
        headers: {
            'Accept-Encoding': 'gzip, deflate',
            'Content-Type' : 'application/octet-stream',
            'Authorization': util.format('Bearer %s', access_token)
        },
        data: file_stream
    };

    const response = await axios(options)
    return response.data
}

const upload_file_raw = async (access_token, file, bucket_name) => {
    const options = {
        url: util.format('%s/oss/v2/buckets/%s/objects/%s', process.env.FORGE_API_URL, bucket_name, file.name),
        method: 'PUT',
        headers: {
            'Accept-Encoding': 'gzip, deflate',
            'Content-Type' : 'application/octet-stream',
            'Authorization': util.format('Bearer %s', access_token)
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        data: file.data
    };

    const response = await axios(options)
    return response.data
}

const translate = async (access_token, file_name, urn) => {
    const options = {
        url: util.format('%s/modelderivative/v2/designdata/job', process.env.FORGE_API_URL),
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
            'x-ads-force': 'true',
            'Authorization': util.format('Bearer %s', access_token)
        },
        data: JSON.stringify({
            "input": {
                "urn": urn,
                "rootFilename": file_name
            },
            "output": {
                "destination": {
                    "region": "us"
                },
                "formats": [
                    {
                        "type": "svf2",
                        "views": [
                            "2d",
                            "3d"
                        ]
                    }
                ]
            }
        })
    };

    const response = await axios(options)
    return response.data
}

const check_translate = async (access_token, urn) => {
    const options = {
        url: util.format('%s/modelderivative/v2/designdata/%s/manifest', process.env.FORGE_API_URL, urn),
        method: 'GET',
        headers: {
            'Content-Type' : 'application/json',
            'x-ads-force': 'true',
            'Authorization': util.format('Bearer %s', access_token)
        }
    };

    const response = await axios(options)
    return response.data
}

const get_pdf = async (access_token) => {
    const options = {
        url: util.format('%s/project/v1/hubs', process.env.FORGE_API_URL),
        method: 'GET',
        headers: {
            'Content-Type' : 'application/json',
            'x-ads-force': 'true',
            'Authorization': util.format('Bearer %s', access_token)
        }
    };

    const response = await axios(options)

    console.log(response.data.meta)

    return response.data
}

module.exports = {
    get_access_token: get_access_token,
    create_bucket: create_bucket,
    upload_file: upload_file,
    upload_file_raw: upload_file_raw,
    translate: translate,
    check_translate: check_translate,
    get_pdf: get_pdf,
}