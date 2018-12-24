import { Candlestick } from '../historical';

class Simple {
    onBuy: ((historicalData: Array<Candlestick>) => void)
    onSell: ((historicalData: Array<Candlestick>) => void)
    
    constructor(onBuy: ((historicalData: Array<Candlestick>) => void), 
                onSell: ((historicalData: Array<Candlestick>) => void)) {
        this.onBuy = onBuy
        this.onSell = onSell                
    }
   
    public async apply(historicalData: Array<Candlestick>) {
        const historicalDataCount = historicalData.length
        if(historicalDataCount > 1) {
            const latest = historicalData[historicalDataCount - 1]  
            const oneBeforeIt = historicalData[historicalDataCount - 2]  
           
            if(latest.closedLowerThan(oneBeforeIt)) {
                this.onBuy(historicalData)
            } 
            else {
               this.onSell(historicalData)
            }
        }
    }
}

export { Simple }