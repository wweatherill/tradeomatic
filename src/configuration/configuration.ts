//import config from '../../config.json'

export function get(propertyKey: string) : string {
    const propertyValue: string = process.env[propertyKey]

    if(propertyValue == null) {
        throw new Error('The propertyKey ${propertyKey} is not set')
    }

    return propertyValue
};