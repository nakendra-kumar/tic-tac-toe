import { LightningElement, track, wire } from 'lwc';
import getLeaderboard from "@salesforce/apex/PlayerController.getLeaderboard";
import { subscribe, unsubscribe, MessageContext } from 'lightning/messageService';
import GAME_DETAILS_CHANNEL from '@salesforce/messageChannel/Game_Details__c';
import { refreshApex } from "@salesforce/apex";

const columns = [
    { label: 'Player Name', fieldName: 'Name', type: 'string',  sortable: true, cellAttributes: { alignment: 'middle' },},
    {
        label: 'Points',
        fieldName: 'Points__c',
        type: 'number',
        sortable: true,
        cellAttributes: { alignment: 'middle',  iconName:{fieldName:'iconName'}, iconPosition:'right' },
    },
];

const data = [
    { id: 1, Name: 'Billy Simonns', Points: 40, },
    { id: 2, Name: 'Kelsey Denesik', Points: 35,  },
    { id: 3, Name: 'Kyle Ruecker', Points: 50,},
    {
        id: 4,
        Name: 'Krystina Kerluke',
        Points: 37,
        
    },
];

export default class LeaderBoard extends LightningElement {

    subscription = null;
    @wire(MessageContext)
    messageContext;

    @track
    data = [];
    columns = columns;
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedBy;
    wiredResult;
    @track initialRecords;

    @wire(getLeaderboard)
    loadLeaderboard(result) {
      this.wiredResult = result;
      
      if (result?.data?.data.length > 0) {

        this.data = result?.data?.data.map((d, i) => {
            let iconName = null;
            if(i === 0) {
                iconName = "custom:custom43"
            } else if(i === 1) {
                iconName = "utility:opportunity"
            } else if(i === 2) {
                iconName = "utility:priority"
            }
            return {
                ...d,
                "iconName": iconName
            }
        })
        this.initialRecords = this.data;
      }
    }

    subscribeToMessageChannel() {
        
        this.subscription = subscribe(
          this.messageContext,
          GAME_DETAILS_CHANNEL,
          (message) => { 
            
            this.handleMessage(message);
             }
        );
      }



      handleMessage(message) {
        refreshApex(this.wiredResult);
        
      }

    get isAvailable() {
        return !!this.data.length>0;
    }

    // Used to sort the 'Age' column
    sortBy(field, reverse, primer) {
        const key = primer
            ? function (x) {
                  return primer(x[field]);
              }
            : function (x) {
                  return x[field];
              };

        return function (a, b) {
            a = key(a);
            b = key(b);
            return reverse * ((a > b) - (b > a));
        };
    }

    onHandleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.data];

        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.data = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }


    connectedCallback() {
       this.subscribeToMessageChannel();
    }
    
    disconnectedCallback() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    handleSearch(event) {
        const searchKey = event.target.value.toLowerCase();
 
        if (searchKey) {
            this.data = this.initialRecords;
 
            if (this.data) {
                let searchRecords = [];
 
                for (let record of this.data) {
                    let valuesArray = Object.values(record);
 
                    for (let val of valuesArray) {
                        let strVal = String(val);
 
                        if (strVal) {
 
                            if (strVal.toLowerCase().includes(searchKey)) {
                                searchRecords.push(record);
                                break;
                            }
                        }
                    }
                }
 
                this.data = searchRecords;
            }
        } else {
            this.data = this.initialRecords;
        }
    }
}