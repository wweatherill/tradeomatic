import { Candlestick } from '../historical';

class MACD {
    onBuy: ((historicalData: Array<Candlestick>) => void)
    onSell: ((historicalData: Array<Candlestick>) => void)
    
    constructor(onBuy: ((historicalData: Array<Candlestick>) => void), 
                onSell: ((historicalData: Array<Candlestick>) => void)) {
        this.onBuy = onBuy
        this.onSell = onSell                
    }
   
    public async apply(historicalData: Array<Candlestick>) {
        // TODO
    }
}

export { MACD }