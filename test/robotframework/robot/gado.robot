*** Settings ***
Documentation     A test suite for the GADO portion
...
...               This test has a workflow that is created using keywords in
...               the imported resource file.
Resource          resource.robot

*** Test Cases ***
Valid GADO Page
  Open Browser To Home Page
  Click GADO
  Input GADO
  Close Browser
