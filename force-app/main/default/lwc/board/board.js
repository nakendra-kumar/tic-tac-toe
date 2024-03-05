import { LightningElement, api } from 'lwc';

export default class Board extends LightningElement {
    rows =  [0,1,2,3,4,5,6,7,8]; 
    @api squares;
    @api current;
    @api history;
    @api stepnumber;
    @api customclass;
    @api linesdata;
    @api winner;

    handleBoardClick(event) {
        
        this.dispatchEvent(new CustomEvent('gameclick', {
            detail: event.detail
          }));
    }

    handleCheckWinner() {
        this.dispatchEvent(new CustomEvent('checkgame', { bubbles: true }));
    }
}