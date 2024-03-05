public with sharing class PlayerController {
    @AuraEnabled
    public static Map<String, Object> insertPlayer(
        String playerName,
        Integer points
    ) {
        Map<String, Object> result = new Map<String, Object>();
        try {
        Players__c player = new Players__c(
            Name = playerName,
            Points__c = points
        );
        upsert player Players__c.Fields.Name;
        ID playerID = player.Id;

        result.put('data', playerID);
        result.put('success', true);
        } catch (Exception e) {
            // Log the error or handle it appropriately
            System.debug('Error adding/updating player: ' + e.getMessage());
            result.put('success', false);
            result.put('error', e.getMessage());
        }
    
        return result;
    }

    @AuraEnabled
    public static Map<String, Object> updatePlayer(
        String playerName,
        Integer points
    ) {
        Map<String, Object> result = new Map<String, Object>();
        try {

            Players__c player = [SELECT Points__c FROM Players__c WHERE Name = :playerName Limit 1];
            player.Name=playerName;
            player.Points__c=points + player.Points__c;
            update player;

            ID playerID = player.Id;
            result.put('data', playerID);
            result.put('success', true);
        } catch (Exception e) {
            // Log the error or handle it appropriately
            System.debug('Error adding/updating player: ' + e.getMessage());
            result.put('success', false);
            result.put('error', e.getMessage());
        }
    
        return result;
    }

    @AuraEnabled(cacheable=true )
    public static Map<String, Object> findPlayer(String searchKey) {
        Map<String, Object> result = new Map<String, Object>();
        try {
        Players__c player =  [
            SELECT Id, Name, Points__c
            FROM Players__c
            WHERE Name = :searchKey
            Limit 1

        ];
        
        result.put('data', player);
        result.put('success', true);
        } catch (Exception e) {
            // Log the error or handle it appropriately
            System.debug('Error adding/updating player: ' + e.getMessage());
            result.put('success', false);
            result.put('error', e.getMessage());
        }

        return result;
    }

    @AuraEnabled(cacheable=true )
    public static  Map<String, Object> getLeaderboard() {
        Map<String, Object> result = new Map<String, Object>();
        try {
        List<Players__c> data =  [
            SELECT Id, Name, Points__c
            FROM Players__c
            WITH USER_MODE
            ORDER BY Points__c DESC

        ];
        
        result.put('data', data);
        result.put('success', true);

        } catch (Exception e) {
            // Log the error or handle it appropriately
            System.debug('Error adding/updating player: ' + e.getMessage());
            result.put('success', false);
            result.put('error', e.getMessage());
        }
    
        return result;
    }

}