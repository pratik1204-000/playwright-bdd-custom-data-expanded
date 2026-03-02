@Framework_sanity
Feature: Basic Framework Sanity

    @simple_arithmetic
    Scenario: Simple Arithmetic
        Given I have number 2
        When I add number 3
        Then the result should be 5

    @simple_arithmetic_dataTable
    Scenario Outline: Simple Arithmetic with Data Table
        Given I have number <a>
        When I add number <b>
        Then the result should be <sum>
        Examples:
            | a | b | sum |
            | 1 | 2 | 3   |
            | 3 | 4 | 7   |


