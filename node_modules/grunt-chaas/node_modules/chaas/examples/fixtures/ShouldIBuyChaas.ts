class ShouldIBuyChaas {
    cashInWallet: number;
    creditCard: string;
    pintsOfChaasRemaining: number;
    constructor() {
        this.cashInWallet = 0;
        this.creditCard = "no";
        this.pintsOfChaasRemaining = 0;
    }
    goToStore() {
        return (this.pintsOfChaasRemaining == 0 && (this.cashInWallet > 2 || this.creditCard==='yes')) ? "yes" : "no";
    }
}
