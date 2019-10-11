*** Settings ***
Documentation     A test suite with a single test.
...
...               This test has a workflow that is created using keywords in
...               the imported resource file.
Resource          resource.robot

*** Test Cases ***
Valid Home
    Open Browser To Home Page
    Close Browser
