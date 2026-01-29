Feature: Create quiz

  Scenario: Valid quiz creation
    Given the quiz list is empty
    When the user enters a title "Tesztem 1"
    And the user saves the quiz
    Then the quiz appears in the list
    And a success message "Sikeres mentés" is visible

  Scenario: Invalid quiz creation
    Given the quiz list is empty
    When the user leaves the title empty
    And the user tries to save
    Then an error message "A cím kötelező" is shown
