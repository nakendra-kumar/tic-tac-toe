/**
 * This class contains unit tests for validating the behavior of Apex classes
 * and triggers.
 *
 * Unit tests are class methods that verify whether a particular piece
 * of code is working properly. Unit test methods take no arguments,
 * commit no data to the database, and are flagged with the testMethod
 * keyword in the method definition.
 *
 * All test methods in an org are executed whenever Apex code is deployed
 * to a production org to confirm correctness, ensure code
 * coverage, and prevent regressions. All Apex classes are
 * required to have at least 75% code coverage in order to be deployed
 * to a production org. In addition, all triggers must have some code coverage.
 * 
 * The @isTest class annotation indicates this class only contains test
 * methods. Classes defined with the @isTest annotation do not count against
 * the org size limit for all Apex scripts.
 *
 * See the Apex Language Reference for more information about Testing and Code Coverage.
 */
@isTest
private class TestPlayerController {

    @isTest
    static void updatePlayer() {
        PlayerController.insertPlayer('Name', 0);
        Players__c player = [SELECT Id, Name, Points__c FROM Players__c LIMIT 1];
        Integer points = 10;

        Test.startTest();
        PlayerController.updatePlayer(player.Name, points);
        Players__c updatedPlayer = [
            SELECT Id, Name, Points__c
            FROM Players__c
            WHERE Id = :player.Id
        ];
        Test.stopTest();

        Assert.areEqual(
            10,
            updatedPlayer.Points__c,
            'The player points should be increased by 10'
        );
    }

    @isTest
    static void findPlayer() {
        PlayerController.insertPlayer('Name0', 0);
       
        Test.startTest();
        Map<String, Object> player = new Map<String, Object>();
        player = PlayerController.findPlayer('Name 5');
        Test.stopTest();
    }

    @isTest
    static void getLeaderboard() {
        PlayerController.insertPlayer('Name1', 0);
        PlayerController.insertPlayer('Name2', 0);

        Test.startTest();
        Map<String, Object> players = new Map<String, Object>();
        players = PlayerController.getLeaderboard();
        Test.stopTest();
    }
}