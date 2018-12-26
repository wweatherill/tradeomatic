import { Historical, Candlestick } from '../historical'
import params from 'commander'
import moment from 'moment'

const defaultStart: Date = moment().toDate()
const defaultEnd: Date = moment(defaultStart).subtract('1', 'days').toDate()

//moment(dateToStore,'YYYY-MM-DD HH:mm:ss')

// TODO - turn this into a bootstrapper - where to get config from though??

params
    .option('-i, --interval, Interval duration in seconds [interval]', params.parseInt, 300)
    .option('-s, --start, Historical data start date [start]', defaultStart.toISOString())
    .option('-e, --end, Historical data end date [end]', defaultEnd.toISOString())
    .option('-p, --product, Product identifier [product]', 'BTC-GBP')

async function main() {
    const {product, start, end, interval} = params
    const historical: Historical = new Historical();
    const productHistoricRates: Array<Candlestick> = await historical.getProductHistoricRates(product, 
                                                                                              moment(start).toDate(), 
                                                                                              moment(end).toDate(), 
                                                                                              <number>interval);
    console.log(productHistoricRates);
}    

main()