Feature: Error state handling

  Scenario: API failure shown on load
    Given the backend returns an error
    When the user opens the quiz page
    Then the user sees "Hiba történt"
    And the user sees a "Próbáld újra" button
