import { LightningElement, track, wire } from 'lwc';
import findPlayer from "@salesforce/apex/PlayerController.findPlayer";
import insertPlayer from "@salesforce/apex/PlayerController.insertPlayer";
import getLeaderboard from "@salesforce/apex/PlayerController.getLeaderboard";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { publish, MessageContext } from 'lightning/messageService';
import GAME_DETAILS_CHANNEL from '@salesforce/messageChannel/Game_Details__c';
import background_image_tictactoe from '@salesforce/resourceUrl/background_image_tictactoe';

export default class StartGame extends LightningElement {
  imageUrl = background_image_tictactoe;

  @wire(MessageContext)
  messageContext;
  secondPlayer = '';
  firstPlayer = '';
  firstPlayedReady = false;
  secondPlayerReady = false;
  @track
  status="INITIAL";
  @track
  errorMessagefirstPlayer=false;
  @track
  errorMessageSecondPlayer=false;
  @track
  isLoading = false;
    get startPlay() {
        return this.status === "INITIAL";
    }

    get registerPlayer() {
      return this.status === "REGISTER";
    }

    get playersList() {
      return this.status === "PLAYER_LIST";
    }

    get playGame() {
      return this.status === "PLAY_GAME";
    }

    startGame() {
      this.status = "REGISTER"
    }

    get getBackgroundImage(){
      return `background-image:url("${this.imageUrl}")`;
  }

    async showPlayers() {
      this.isLoading = true;
      await this.handleFirstPlayer();
      await this.handleSecondPlayer();
      this.isLoading = false;
      if(this.firstPlayedReady && this.secondPlayerReady) {
        const payload = { 
          firstplayer: this.firstplayer,
          secondplayer: this.secondplayer,
          winner: "",
      };
        publish(this.messageContext, GAME_DETAILS_CHANNEL, payload);
        this.dispatchEvent(
          new ShowToastEvent({
              title: 'Success',
              message: 'Players are Ready',
              variant: 'success'
          })
      );
        setTimeout(() => {
          this.status = "PLAY_GAME"
        }, 1000);
      }
      

    }

    handleStart() {
      this.status = "PLAY_GAME"
    }

    get saveButtonDisabled() {
      return this.firstPlayer === "" || this.secondPlayer === '';
    }

  handleFirstPlayerChange(event){
      this.firstPlayer = event.target.value.toUpperCase();
    } 

  handleSecondPlayerChange(event){
    this.secondPlayer = event.target.value.toUpperCase();
  } 

    async handleFirstPlayer() {
          const result1 = await getLeaderboard();
          

      try {
          this.errorMessagefirstPlayer=false;

          const playerName = this.firstPlayer;
          if(playerName !== ''){
           const player = await findPlayer({searchKey: playerName});
           
           if(player?.success) {
            this.firstPlayedReady = true;
           } else {
            const newPlayer = await insertPlayer({playerName: playerName, points: 0});
            
            if(newPlayer?.success) {
              this.firstPlayedReady = true;
            }
           }
          }
      } catch (error) {

      }
  }

  async handleSecondPlayer() {
    try {
        this.errorMessageSecondPlayer=false;

        const playerName = this.secondPlayer;
        if(playerName !== ''){
         const player = await findPlayer({searchKey: playerName});
         
         if(player?.success) {
          this.secondPlayerReady = true;
         } else {
          const newPlayer = await insertPlayer({playerName: playerName, points: 0});
          
          if(newPlayer?.success) {
            this.secondPlayerReady = true;
          }
         }
        }
    } catch (error) {}
}

}