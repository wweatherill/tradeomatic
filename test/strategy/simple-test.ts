import { expect } from 'chai';
import sinon from 'sinon';
import moment from 'moment'

import { Candlestick } from '../../src/historical';
import { Simple } from '../../src/strategy';

// should have a way of running arbitrary dates to see what happens

describe('strategy/Simple.apply(historicalData)', () => {
    let simple: Simple
   
    let candlestick01: Candlestick
    let candlestick02: Candlestick
    let candlestick03: Candlestick
    let candlestick04: Candlestick

    let onBuy: ((historicalData: Array<Candlestick>) => void)
    let onSell: ((historicalData: Array<Candlestick>) => void)
    
    before(async () => {
        const start: Date = moment('2018-10-31T17:48:52Z').toDate()
        const startPlusOneMin: Date = moment(start).add(1, 'minute').toDate()

        // time, low, high, open, close, volume
        candlestick01 = new Candlestick(start, 10, 10, 10, 10, 1)
        
        // relative to candlestick01 - start is one minute after and close value is the same
        candlestick02 = new Candlestick(startPlusOneMin, 10, 10, 10, 10, 1)
        // relative to candlestick01 - start is one minute after and close value is higher
        candlestick03 = new Candlestick(startPlusOneMin, 10, 10, 10, 11, 1)
        // relative to candlestick01 - start is one minute after and close value is lower
        candlestick04 = new Candlestick(startPlusOneMin, 10, 10, 10, 9, 1)

        onBuy = sinon.spy()
        onSell = sinon.spy()
        simple = new Simple(onBuy, onSell)
    })

    afterEach(async () => {
        (onBuy as sinon.SinonSpy).resetHistory();
        (onSell as sinon.SinonSpy).resetHistory();
    })
    
    it('it should handle an empty input', async () => {
        simple.apply([])
        expect((onBuy as sinon.SinonSpy).notCalled).to.be.true
        expect((onSell as sinon.SinonSpy).notCalled).to.be.true
    })

    it('it should handle an input with one data point', async () => {
        simple.apply([candlestick01])
        expect((onBuy as sinon.SinonSpy).notCalled).to.be.true
        expect((onSell as sinon.SinonSpy).notCalled).to.be.true
    })    

    it('it should sell and not buy as first candlestick close equals second candlestick close', async () => {
        simple.apply([candlestick01, candlestick02])
        expect((onBuy as sinon.SinonSpy).notCalled).to.be.true
        expect((onSell as sinon.SinonSpy).calledOnce).to.be.true
    })

    it('it should sell and not buy  as first candlestick close is greater than second candlestick close', async () => {
        simple.apply([candlestick01, candlestick03])
        expect((onBuy as sinon.SinonSpy).notCalled).to.be.true
        expect((onSell as sinon.SinonSpy).calledOnce).to.be.true
    })

    it('it should buy and not sell  as first candlestick close is less than second candlestick close', async () => {
        simple.apply([candlestick01, candlestick04])
        expect((onBuy as sinon.SinonSpy).calledOnce).to.be.true
        expect((onSell as sinon.SinonSpy).notCalled).to.be.true      
    })
})