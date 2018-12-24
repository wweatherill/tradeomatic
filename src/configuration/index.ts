import config from '../../config.json'

exports.get = (key: string) : any => {
    let config: any
    
    process.env[key] || config[key]
}