*** Settings ***
Documentation     A test suite for the function enrichment input
...
...               This test has a workflow that is created using keywords in
...               the imported resource file.
Resource          resource.robot

*** Test Cases ***
Valid Function Enrichment
  Open Browser To Home Page
  Input Function Enrichment Single
  Input Function Enrichment Multiple
  Close Browser
