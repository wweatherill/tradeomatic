import { PublicClient } from 'gdax'
import moment from 'moment'

//const gdax = require('gdax')
//const moment = require('moment')
// const config = require('../configuration')

// const key = config.get('GDAX_API_KEY')
// const secret = config.get('GDAX_API_SECRET')
// const passphrase = config.get('GDAX_API_PASSPHRASE')
// const apiUrl = config.get('GDAX_API_URL')

const maxDataPoints = 300;

class Historical {
    publicClient: PublicClient;
    //authenticatedClient: any;

    constructor() {
        this.publicClient = new PublicClient()
        //this.authenticatedClient = new gdax.AuthenticatedClient(key, secret, passphrase, apiUrl)
    }

    public async getProductHistoricRates(product: string, start: Date, end: Date, interval: number): Promise<Array<Candlestick>> {
        // coinbase seems to round up to the nearest minute. To make
        // sure we get all the data we want (plus a little more) 
        // we'll roun down to the nearest minute
        const startRoundedDown: moment.Moment = moment(start).startOf('minute')
        const endRoundedUp: moment.Moment = moment(end).add(2, 'minute').startOf('minute')
        const windows: Array<Window> = this.getWidows(startRoundedDown, endRoundedUp, interval)
      
        const historicRates: any[][] = await this.getProductHistoricRatesForWindows(product, windows, interval)

        const candlesticks: Array<Candlestick> = historicRates.map(historicRate => {
            return this.toCandlestick(historicRate)
        })

        // sort by date descending then filter out duplicate dates
        candlesticks.sort((candlestickA: Candlestick, candlestickB: Candlestick) => {
            return candlestickB.start.getTime() - candlestickA.start.getTime();
        }).filter((candlestick: Candlestick, index: number, candlesticks: Array<Candlestick>) => {
            let remove = false
            if (index < candlesticks.length - 1) {
                remove = candlestick.start.getTime() === candlesticks[index + 1].start.getTime()
            }

            return remove
        })

        return candlesticks
    }

    private toCandlestick(historicRate: any[]): Candlestick {
        return new Candlestick(moment.unix(historicRate[0]).toDate(),
                               historicRate[1],
                               historicRate[2],
                               historicRate[3],
                               historicRate[4],
                               historicRate[5])
    }

    private async getProductHistoricRatesForWindows(product: string, windows: Array<Window>, interval: number): Promise<any[][]> {
        let allWindowHistoricRates: any[][];
        
        if(windows.length > 0) {
            const currentWindow: Window = windows[0]
            
            const currentWindowHistoricRates: any[][] = await this.getProductHistoricRatesForWindow(product, currentWindow, interval)
            
            if(windows.length > 1) {
                // need to put the brakes on here to avoid hitting the API's rate limit
                await this.sleep(400)
                const nextWindowHistoricRates: any[][] = await this.getProductHistoricRatesForWindows(product, windows.slice(1), interval)
                allWindowHistoricRates = currentWindowHistoricRates.concat(nextWindowHistoricRates)
                //TODO - remove duplicates by timestamp. Could do this at candlestick level 
                // allWindowHistoricRates.filter()
                // allWindowHistoricRates.sort((a,b) => {
                //     return a - b
                // })
            }
            else {
                allWindowHistoricRates = currentWindowHistoricRates;
            }
        }
      
        return allWindowHistoricRates
    }

    private async sleep(timeInMs: number) {
        return new Promise(done => setTimeout(done, timeInMs))
    }

    private async getProductHistoricRatesForWindow(product : string, window: Window, interval : number): Promise<any[][]> {
        let historicRates: any[][]
        
        try {
            historicRates = await this.publicClient.getProductHistoricRates(product, {
                start: window.start.toISOString(),
                end: window.end.toISOString(),
                granularity: interval
            })
        }
        catch(err) {
            console.log(`error getting historic rates from Coinbase Pro --> ${err}`)
        }

        return historicRates
    }

    private getWidows(start : moment.Moment, end : moment.Moment, intervalSecs : number): Array<Window> {        
        const totalDurationSecs: number = this.getDurationInSeconds(start, end)
        const windowCount: number = this.getWindowCount(totalDurationSecs, intervalSecs)
        const windowDurationSecs: number = this.getWindowDuration(totalDurationSecs, windowCount)

        let currentWindow: Window = this.getWindow(start, windowDurationSecs)
        let windows: Array<Window> = Array(currentWindow);

        if(windowCount > 1) {
            Array(windowCount).fill(0).map((element: Window, index : number) => {            
                currentWindow = this.getNextWindow(currentWindow, windowDurationSecs)
                windows.push(currentWindow)
            })
        }

        // TODO - should we check the end of the last window?

        return windows;
    }

    private getWindow(windowStart : moment.Moment, durationSecs : number): Window {
        const windowEnd: moment.Moment = windowStart.clone()
        windowEnd.add(durationSecs, 'seconds')

        return {'start': windowStart, 'end': windowEnd}
    }

    private getNextWindow(previousWindow: Window, durationSecs : number): Window {
        const nextWindowStart: moment.Moment = previousWindow.end.clone()
        nextWindowStart.add(1, 'seconds')

        return this.getWindow(nextWindowStart, durationSecs)
    }

    private getWindowDuration(totalDurationSecs : number, windowCount : number): number {
        return Math.ceil(totalDurationSecs / windowCount)
    }

    private getWindowCount(durationSecs : number, intervalSecs : number, dataPointsInWindow : number = maxDataPoints): number {
        const totalDataPoints: number = durationSecs / intervalSecs
        const requestCount: number = totalDataPoints / dataPointsInWindow

        return Math.ceil(requestCount)
    }

    private getDurationInSeconds(start : moment.Moment, end : moment.Moment): number {
        const duration: moment.Duration = moment.duration(end.diff(start));

        return duration.asSeconds()
    }
}

class Candlestick {

    constructor(public start: Date, 
                private low: number, 
                private high: number, 
                private open: number, 
                private close: number, 
                private volume: number) {}  
    
    public closedLowerThan(other: Candlestick): boolean {
        return this.close < other.close
    }

}

interface Window {
    start: moment.Moment
    end: moment.Moment
}

export { Historical, Candlestick }