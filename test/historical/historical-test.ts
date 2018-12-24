import { expect } from 'chai';
import moment from 'moment'
import { Historical, Candlestick } from '../../src/historical';

describe('historical/Historical.getProductHistoricRates(product, start, end, interval)', () => {
    const oneMinute: number = 60
    const start: Date = moment('2018-10-31T17:48:52Z').toDate()
    const startPlusOneHour: Date = moment('2018-10-31T18:49:52Z').toDate()
    const startPlusOneDay: Date = moment('2018-11-01T18:49:52Z').toDate()
    
    let historical: Historical;

    before(async () => {
        historical = new Historical()
        expect(historical).to.not.be.null;

        // TODO - load some test data
        // TODO - replace GDAX URL with stub
    });
    
    // happy path (1 request)
    it('should return historic rates that cover the period defined by start and startPlusOneHour', async () => {
        const oneHourHistoricRates: Array<Candlestick> = await historical.getProductHistoricRates('BTC-GBP', start, startPlusOneHour, oneMinute);
        expect(oneHourHistoricRates).to.not.be.null
        expect(oneHourHistoricRates).to.not.be.empty

        const first: Candlestick = oneHourHistoricRates[0]
        //const firstTime = moment.unix(first[0]).toDate()
        expect(first.start).to.be.above(startPlusOneHour)

        const last: Candlestick = oneHourHistoricRates[oneHourHistoricRates.length - 1]
        //const lastTime = moment.unix(last[0]).toDate()
        expect(last.start).to.be.below(start)

        // size
        //content equality
        // start and end dates
        // spacing of intervals
    })

    // happy path - 2 requests
    it('should return historic rates that cover the period defined by start and startPlusOneDay', async () => {
        const oneDayHistoricRates: Array<Candlestick> = await historical.getProductHistoricRates('BTC-GBP', start, startPlusOneDay, oneMinute);
        expect(oneDayHistoricRates).to.not.be.null
        expect(oneDayHistoricRates).to.not.be.empty

        const first: Candlestick = oneDayHistoricRates[0]
        //const firstTime = moment.unix(first[0]).toDate()
        expect(first.start).to.be.above(startPlusOneDay)

        const last: Candlestick = oneDayHistoricRates[oneDayHistoricRates.length - 1]
        //const lastTime = moment.unix(last[0]).toDate()
        expect(last.start).to.be.below(start)

        // size
        //content equality
        // start and end dates
        // spacing of intervals
    })    

    // unknown product
    // start after end
    // missing args
    // invalid interval
    // interval exceeds window
})