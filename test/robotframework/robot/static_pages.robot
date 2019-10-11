*** Settings ***
Documentation     A test suite for the static pages
...
...               This test has a workflow that is created using keywords in
...               the imported resource file.
Resource          resource.robot

*** Test Cases ***
Valid Statics
  Open Browser To Home Page
  Click FAQ
  Click API
  Close Browser
