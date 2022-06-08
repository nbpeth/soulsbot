# SoulsBot
Fine Work Skeleon!

Slack slash command to generate Dark Souls like template messages

https://user-images.githubusercontent.com/10249534/172015398-eab60088-149f-4c64-b236-042b5e32db45.mp4


# Configure for your Slack Workspace

* Clone / fork this repo and install it onto your webserver of choice
* Create a Slash Command application in your Slack workspace
  * [Slack Slash Commands](https://api.slack.com/interactivity/slash-commands)
* Required node environment variables
  * `DSC_AUTH_TOKEN`: The Slack auth token passed in on the request body.

# Usage
### Commands
* `/ds` initiates the tempalte form; once it is filled out completely, the "Send" button materializes and you can complete your message. All changes are ephemeral until "Send" is pressed, upon which the message is published publicly to the channel the command was executed it. Pressing "Cancel" will delete the slash command ephemeral form.

* `/ds help` an ephemeral message of encouragement to the user
