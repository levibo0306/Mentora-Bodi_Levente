Feature: Empty quiz state

  Scenario: No quizzes yet
    Given no quizzes exist
    When the user opens the quiz page
    Then the user sees "Nincs még kvízed"
    And the user sees a "Új kvíz létrehozása" button
