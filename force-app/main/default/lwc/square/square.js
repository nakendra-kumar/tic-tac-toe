import { LightningElement, api, track } from 'lwc';

export default class Square extends LightningElement {
    @api valuedata;
    @api squares;
    @api current;
    @api history;
    @api customclass;
    @api linesdata;
    @track content;
    @api
    set stepnumber(value) {
        this.current = this.history[value];
        this.content = this.history[value].squares[this.valuedata];
        this.onlyOnce = true;
        this.dispatchEvent(new CustomEvent('checkboard', { bubbles: true }));
    }
    get stepnumber() {
        return this.stepnumber;;
    }

    @api
    set winner(value) {
        if(this.linesdata.length > 0 && this.linesdata.includes(this.valuedata)) {
            const str = '[data-id="'+this.dataId+'"]'
            this.template.querySelector(str).classList.add('greenBck');
        } else {
            const str = '[data-id="'+this.dataId+'"]'
            this.template.querySelector(str)?.classList.remove('greenBck');
        }
        if(value !== ""){
            this.customclass = 'square';
        }
        
    }
    get winner() {
        return this.winner;
    }


    get dataId() {
        return this.valuedata + 'btn'
    }
    
    handlePlay(event) {
        
    event.preventDefault();
    this.dispatchEvent(new CustomEvent('squareclick', {
        detail: this.valuedata
      }));
    }
}