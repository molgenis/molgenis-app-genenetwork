This folder contains the Robot Framework tests that can and should be run after every merge with the master

Robot Framework is run using python, install the requirements using python pip -r requirements.txt
A webdriver is also required, and can be installed using webdrivermanager, for example with "webdrivermanager firefox chrome --linkpath /usr/local/bin"

The tests can be run against the live version of Gene Network by running "robot robot" from this directory
Variables in the resource.robot file can be overwritten by using the --variable command, so to run the tests agains your locally running Gene Network, use "robot --variable SERVER:localhost robot"
To run just one test file, specifiy the .robot file in the robot folder, for example "robot --variable SERVER:localhost robot/function_enrichment.robot"