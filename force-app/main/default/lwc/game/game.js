import { LightningElement, track, api, wire } from 'lwc';
import updatePlayer from "@salesforce/apex/PlayerController.updatePlayer";
import { publish, MessageContext } from 'lightning/messageService';
import GAME_DETAILS_CHANNEL from '@salesforce/messageChannel/Game_Details__c';
import { refreshApex } from "@salesforce/apex";

export default class Game extends LightningElement {
    @track status = "";
    @track history = [];
    @track current = this.history[this.stepNumber];
    xIsNext= true;
    @track stepNumber= 0;
    @track winner = "";
    @api
    firstplayer;
    @api
    secondplayer;
    @track
    nextStep = false;
    @track isShowModal = false;
    @track customclass = 'squareX';
    @track linesData = [];
    @track count = 0;
    @wire(MessageContext)
    messageContext;

    showModalBox() {  
        this.isShowModal = true;
    }

    hideModalBox() {  
        this.isShowModal = false;
    }


    get hasWinner() {
        return this.winner !== "" || (this.count === 9 && this.winner === "");
    }

    get showModal() {
        return this.isShowModal;
    }

    get isFirst() {
        return this.xIsNext ?  false: true;
    }

    get isSecond() {
        return this.xIsNext ?  true: false;
    }

    get firstPlayerLabel() {
        return this.firstplayer+ '- X';
    }

    get secondPlayerLabel() {
        return this.secondplayer+ '- O';
    }

    handleClick(event) {
        const i = event.detail;
        const history = this.history.slice(0, this.stepNumber + 1);
        this.current = history[history.length - 1];
        const squares = this.current.squares.slice();
        const winner = this.calculateWinner(squares);
        if (winner || squares[i]) {
            return;
        }
        squares[i] = this.xIsNext ? 'X' : 'O';
        this.customclass = this.xIsNext ? 'squareO' : 'squareX'
            this.history = history.concat({
                squares: squares
            });
            this.xIsNext= !this.xIsNext;
            this.stepNumber= history.length;
            this.count++;
    }

    connectedCallback() {
       this.initializeData();
      }

    initializeData() {
        this.count = 0;
        this.history = [
            { squares: Array(9).fill(null) }
        ];
        this.stepNumber = 0;

        this.current = this.history[this.stepNumber];

        this.status = "";

        this.xIsNext = true;

        this.winner = "";

        this.linesData = [];

        this.nextStep = false;

        this.customclass = 'squareX';

        const winner = this.calculateWinner(this.current.squares);
        if (winner) {
            this.status = 'Winner is ' + winner;
        } else {
            this.status = 'Next Player is ' + (this.xIsNext ? 'X' : 'O');
        }

    }
    
      async checkForWinner() {
        this.current = this.history[this.stepNumber];
        const winner = this.calculateWinner(this.current.squares);
            if(winner === 'X') {
                this.winner = this.firstplayer;
                this.status = 'Winner is ' + this.winner;
            } else if(winner === 'O') {
                this.winner = this.secondplayer;
                this.status = 'Winner is ' + this.winner;
            } else if(this.count === 9 && winner === null) {
                this.winner = "";
                this.status = "Draw"
            } else {
                this.winner = "";
                this.status = 'Next Player is ' + (this.xIsNext ? 'X' : 'O');   
            }

            if(this.winner !== "" && !this.nextStep){
           await this.updatePoints(this.winner);
            }

        
    }

    async updatePoints(playerName) {
        
    this.nextStep = true;
    const updatedPlayer =  await updatePlayer({playerName: playerName, points: 100});
        
        if(updatedPlayer?.success) {
            const payload = { 
                firstplayer: this.firstplayer,
                secondplayer: this.secondplayer,
                winner: this.winner,
            };
            
            publish(this.messageContext, GAME_DETAILS_CHANNEL, payload);
        }
    }
    calculateWinner(squares) {
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];
        
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];

            if (squares[a] && squares[a] === squares[b] && squares[b] === squares[c]) {
                this.linesData = lines[i];
                
                return squares[a];
            }
        }
    
        return null;
    }

    resetGame() {
        this.initializeData();
    }
}