@swaglabsLoginTests
Feature: Swag Labs Login Test Cases

    @swagLabsLoginPlain
    Scenario Outline: Successful login with standard credentials hardcoded in steps
        Given the user is on the Swag Labs login page
        When the user enters username "standard_user" and password "secret_sauce"
        And the user clicks the login button
        Then the user should be redirected to the Products inventory page

    @swagLabsLoginDataTable
    Scenario Outline: Successful login with standard credentials from DataTable
        Given the user is on the Swag Labs login page
        When the user enters username "<username>" and password "<password>"
        And the user clicks the login button
        Then the user should be redirected to the Products inventory page
        Examples:
            | username      | password     |
            | standard_user | secret_sauce |

    @swagLabsLoginJson
    Scenario Outline: Successful login with standard credentials from Json file
        Given the user is on the Swag Labs login page
        When the user enters username "<username>" and password "<password>"
        And the user clicks the login button
        Then the user should be redirected to the Products inventory page
        Examples:
            | fileType | filePath       | fileName           |
            | JSON     | tests/testdata | swagLabsLogin.json |

    @swagLabsLoginCsv
    Scenario Outline: Successful login with standard credentials from CSV file
        Given the user is on the Swag Labs login page
        When the user enters username "<username>" and password "<password>"
        And the user clicks the login button
        Then the user should be redirected to the Products inventory page
        Examples:
            | fileType | filePath       | fileName          |
            | CSV      | tests/testdata | swagLabsLogin.csv |

    @swagLabsLoginExcelNew
    Scenario Outline: Successful login with standard credentials from Excel file new format
        Given the user is on the Swag Labs login page
        When the user enters username "<username>" and password "<password>"
        And the user clicks the login button
        Then the user should be redirected to the Products inventory page
        Examples:
            | fileType | filePath       | fileName           | sheetName |
            | Excel    | tests/testdata | swagLabsLogin.xlsx | Login     |

    @swagLabsLoginExcelOld
    Scenario Outline: Successful login with standard credentials from Excel file old format
        Given the user is on the Swag Labs login page
        When the user enters username "<username>" and password "<password>"
        And the user clicks the login button
        Then the user should be redirected to the Products inventory page
        Examples:
            | excelFile          | sheetName |
            | swagLabsLogin.xlsx | Login     |

    @swagLabsLoginExcelLeacy
    Scenario Outline: Successful login with standard credentials from Excel file legacy format
        Given the user is on the Swag Labs login page
        When the user enters username "<username>" and password "<password>"
        And the user clicks the login button
        Then the user should be redirected to the Products inventory page
        Examples:{'datafile': 'tests/testdata/swagLabsLogin.xlsx', 'sheetName': 'Login'}



# @swagLabsAddToCartAndCheckout
# Scenario Outline: User can add an item to the cart and complete checkout
#     Given the user is logged in and on the Products page
#     When the user adds "Sauce Labs Backpack" to the cart
#     And the user navigates to the shopping cart
#     And the user proceeds to checkout with details "John", "Doe", "12345"
#     Then the order should be successfully dispatched
#Examples: